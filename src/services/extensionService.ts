import { supabase } from '@/integrations/supabase/client';
import { paymentService } from './paymentService';

export interface ExtensionLicense {
  user_id: string;
  extension_id: string;
  license_key: string;
  status: 'active' | 'inactive' | 'expired';
  expires_at: string;
  subscription_id: string;
}

class ExtensionService {
  private extensionId = 'cybercop-fraud-detector'; // Your extension identifier

  /**
   * Generate a unique license key for the user
   */
  private generateLicenseKey(userId: string): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substr(2, 9);
    const userPart = userId.substr(0, 8);
    return `CC-${userPart}-${timestamp}-${randomPart}`.toUpperCase();
  }

  /**
   * Create or update extension license when user subscribes to Pro
   */
  async activateExtensionLicense(userId: string, subscriptionId: string): Promise<{ success: boolean; licenseKey?: string; error?: string }> {
    try {
      // Check if user has Pro subscription
      const subscription = await paymentService.getUserCurrentSubscription(userId);
      
      if (!subscription || !subscription.subscription_plans) {
        return { success: false, error: 'No active subscription found' };
      }

      const planName = subscription.subscription_plans.name;
      if (planName === 'Free') {
        return { success: false, error: 'Extension access requires Pro or Enterprise subscription' };
      }

      // Generate license key
      const licenseKey = this.generateLicenseKey(userId);

      // Calculate expiry based on subscription
      const expiryDate = subscription.ends_at;

      // Store license in database
      const { data, error } = await supabase
        .from('extension_licenses')
        .upsert({
          user_id: userId,
          extension_id: this.extensionId,
          license_key: licenseKey,
          status: 'active',
          expires_at: expiryDate,
          subscription_id: subscriptionId,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,extension_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating extension license:', error);
        return { success: false, error: 'Failed to create extension license' };
      }

      return { success: true, licenseKey };

    } catch (error) {
      console.error('Extension license activation error:', error);
      return { success: false, error: 'Failed to activate extension license' };
    }
  }

  /**
   * Verify extension license (called by Chrome extension)
   */
  async verifyLicense(licenseKey: string): Promise<{ valid: boolean; userInfo?: any; error?: string }> {
    try {
      // Find license in database
      const { data: license, error: licenseError } = await supabase
        .from('extension_licenses')
        .select(`
          *,
          user_subscriptions!inner(
            status,
            ends_at,
            subscription_plans(name, features)
          )
        `)
        .eq('license_key', licenseKey)
        .eq('status', 'active')
        .single();

      if (licenseError || !license) {
        return { valid: false, error: 'Invalid license key' };
      }

      // Check if license has expired
      if (new Date(license.expires_at) < new Date()) {
        // Deactivate expired license
        await supabase
          .from('extension_licenses')
          .update({ status: 'expired' })
          .eq('id', license.id);

        return { valid: false, error: 'License has expired' };
      }

      // Check if subscription is still active
      const subscription = license.user_subscriptions;
      if (subscription.status !== 'active' || new Date(subscription.ends_at) < new Date()) {
        return { valid: false, error: 'Subscription is no longer active' };
      }

      return { 
        valid: true, 
        userInfo: {
          userId: license.user_id,
          plan: subscription.subscription_plans.name,
          features: subscription.subscription_plans.features,
          expiresAt: license.expires_at
        }
      };

    } catch (error) {
      console.error('License verification error:', error);
      return { valid: false, error: 'Failed to verify license' };
    }
  }

  /**
   * Get extension download link and setup instructions
   */
  getExtensionInfo() {
    return {
      name: 'CyberCop Fraud Detector',
      description: 'Advanced fraud detection for websites and online shopping',
      downloadUrl: 'https://chrome.google.com/webstore/detail/your-extension-id', // Replace with actual URL
      features: [
        'Real-time website safety analysis',
        'Phishing detection on web pages',
        'Shopping safety alerts',
        'Suspicious link warnings',
        'Email fraud detection',
        'Social media scam alerts'
      ],
      requirements: ['Pro or Enterprise subscription', 'Chrome browser', 'Internet connection'],
      setupInstructions: [
        'Download extension from Chrome Web Store',
        'Install and pin to toolbar',
        'Enter your license key when prompted',
        'Extension will automatically verify your subscription',
        'Start browsing safely with real-time protection'
      ]
    };
  }

  /**
   * Deactivate extension license (when subscription is cancelled)
   */
  async deactivateExtensionLicense(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('extension_licenses')
        .update({ 
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('extension_id', this.extensionId);

      if (error) {
        console.error('Error deactivating extension license:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Extension license deactivation error:', error);
      return false;
    }
  }

  /**
   * Get user's extension license status
   */
  async getUserExtensionStatus(userId: string): Promise<{ hasAccess: boolean; licenseKey?: string; status?: string; expiresAt?: string }> {
    try {
      const { data, error } = await supabase
        .from('extension_licenses')
        .select('*')
        .eq('user_id', userId)
        .eq('extension_id', this.extensionId)
        .single();

      if (error || !data) {
        return { hasAccess: false };
      }

      const isExpired = new Date(data.expires_at) < new Date();
      const hasAccess = data.status === 'active' && !isExpired;

      return {
        hasAccess,
        licenseKey: data.license_key,
        status: data.status,
        expiresAt: data.expires_at
      };

    } catch (error) {
      console.error('Error getting extension status:', error);
      return { hasAccess: false };
    }
  }
}

export const extensionService = new ExtensionService();
