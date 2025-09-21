import { supabase } from '@/integrations/supabase/client';
import { TablesInsert } from '@/integrations/supabase/types';

export interface FIRData {
  name: string;
  address: string;
  contact: string;
  incident: string;
  date: string;
  location: string;
  language: string;
}

export interface FIRSubmissionResult {
  success: boolean;
  firId?: string;
  firNumber?: string;
  error?: string;
}

export const firService = {
  async submitFIR(data: FIRData, userId?: string): Promise<FIRSubmissionResult> {
    try {
      // Debug: Check authentication state
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('🔍 Auth Debug:', {
        providedUserId: userId,
        actualAuthUser: user?.id,
        isAuthenticated: !!user,
        authError: authError?.message
      });

      // Prepare the data for database insertion
      const firData: TablesInsert<'fir_reports'> = {
        name: data.name,
        address: data.address,
        contact: data.contact,
        incident_date: data.date,
        incident_location: data.location,
        incident_description: data.incident,
        language: data.language,
        status: 'pending',
        user_id: userId || null,
        anonymous_session: !userId ? crypto.randomUUID() : null,
      };

      // Debug: Log the data being inserted
      console.log('📝 FIR Data being inserted:', {
        ...firData,
        user_id: firData.user_id,
        isAnonymous: !firData.user_id
      });

      // Insert the FIR into the database
      const { data: result, error } = await supabase
        .from('fir_reports')
        .insert(firData)
        .select('id, created_at')
        .single();

      if (error) {
        console.error('❌ Database Error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return {
          success: false,
          error: error.message || 'Failed to submit FIR'
        };
      }

      console.log('✅ FIR inserted successfully:', result);

      // Generate a FIR number (you can customize this format)
      const firNumber = `FIR-${new Date().getFullYear()}-${String(result.id).slice(-8).toUpperCase()}`;

      console.log('🔢 Generated FIR number:', firNumber);

      // Update the FIR with the generated number
      const { error: updateError } = await supabase
        .from('fir_reports')
        .update({ fir_number: firNumber })
        .eq('id', result.id);

      if (updateError) {
        console.error('Error updating FIR number:', updateError);
        // Don't fail the submission if we can't update the number
      }

      return {
        success: true,
        firId: result.id,
        firNumber: firNumber
      };

    } catch (error) {
      console.error('Unexpected error submitting FIR:', error);
      return {
        success: false,
        error: 'An unexpected error occurred while submitting the FIR'
      };
    }
  },

  async getUserFIRs(userId: string) {
    try {
      const { data, error } = await supabase
        .from('fir_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user FIRs:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Unexpected error fetching FIRs:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  async getFIRById(firId: string) {
    try {
      const { data, error } = await supabase
        .from('fir_reports')
        .select('*')
        .eq('id', firId)
        .single();

      if (error) {
        console.error('Error fetching FIR:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Unexpected error fetching FIR:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
};
