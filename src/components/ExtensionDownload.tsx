import { useState, useEffect } from "react";
import { Download, Chrome, Key, Shield, CheckCircle, Copy, ExternalLink, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Alert, AlertDescription, useAuth, useSubscription, useToast } from '@/lib/hooks';
import { extensionService } from '@/services/extensionService';

export const ExtensionDownload = () => {
  const { user } = useAuth();
  const { getCurrentPlan, hasFeatureAccess } = useSubscription();
  const { toast } = useToast();
  
  const [extensionStatus, setExtensionStatus] = useState<{
    hasAccess: boolean;
    licenseKey?: string;
    status?: string;
    expiresAt?: string;
  }>({ hasAccess: false });
  
  const [isLoading, setIsLoading] = useState(true);

  const currentPlan = getCurrentPlan();
  const hasExtensionAccess = hasFeatureAccess('chrome_extension');

  useEffect(() => {
    const checkExtensionStatus = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const status = await extensionService.getUserExtensionStatus(user.id);
        setExtensionStatus(status);
      } catch (error) {
        console.error('Error checking extension status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkExtensionStatus();
  }, [user?.id, currentPlan]);

  const copyLicenseKey = () => {
    if (extensionStatus.licenseKey) {
      navigator.clipboard.writeText(extensionStatus.licenseKey);
      toast({
        title: "License Key Copied!",
        description: "Your license key has been copied to clipboard.",
      });
    }
  };

  const extensionInfo = extensionService.getExtensionInfo();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Checking extension access...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-blue-100">
            <Chrome className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              {extensionInfo.name}
              {hasExtensionAccess && (
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Available
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{extensionInfo.description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!user ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please sign in to access the Chrome extension.
            </AlertDescription>
          </Alert>
        ) : !hasExtensionAccess ? (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Pro/Enterprise Required:</strong> The Chrome extension is available for Pro and Enterprise subscribers only.
              <Button variant="link" className="p-0 ml-2" asChild>
                <a href="/subscription">Upgrade Now</a>
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {/* License Key Section */}
            {extensionStatus.hasAccess && extensionStatus.licenseKey && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-primary" />
                  <span className="font-medium">Your License Key</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <code className="flex-1 text-sm font-mono bg-background px-2 py-1 rounded">
                    {extensionStatus.licenseKey}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyLicenseKey}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Expires: {extensionStatus.expiresAt ? new Date(extensionStatus.expiresAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            )}

            {/* Download Button */}
            <Button
              className="w-full"
              onClick={() => window.open(extensionInfo.downloadUrl, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Chrome Extension
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>

            <Separator />

            {/* Features List */}
            <div>
              <h4 className="font-medium mb-3">Extension Features:</h4>
              <ul className="space-y-2">
                {extensionInfo.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            {/* Setup Instructions */}
            <div>
              <h4 className="font-medium mb-3">Setup Instructions:</h4>
              <ol className="space-y-2">
                {extensionInfo.setupInstructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <Badge variant="outline" className="min-w-[24px] h-6 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            <Separator />

            {/* Requirements */}
            <div>
              <h4 className="font-medium mb-3">Requirements:</h4>
              <ul className="space-y-1">
                {extensionInfo.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Support Note */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Need Help?</strong> If you encounter any issues with the extension, 
            contact our support team with your license key for quick assistance.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
