import { useState } from "react";
import { User, LogOut, Settings, Crown, FileText, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from '@/lib/hooks';
import { useNavigate } from "react-router-dom";
import { Badge, useAuth, useSubscription } from '@/lib/hooks';
import { AuthModal } from './AuthModal';

export const UserMenu = () => {
  const { user, loading, signOut } = useAuth();
  const { getCurrentPlan } = useSubscription();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');

  const handleSignOut = async () => {
    await signOut();
  };

  const openAuthModal = (tab: 'signin' | 'signup') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => openAuthModal('signin')}
          >
            Sign In
          </Button>
          <Button 
            size="sm"
            onClick={() => openAuthModal('signup')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            Sign Up
          </Button>
        </div>
        
        <AuthModal 
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          defaultTab={authModalTab}
        />
      </>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const userName = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const userEmail = user.email || '';
  const avatarUrl = user.user_metadata?.avatar_url;
  const currentPlan = getCurrentPlan();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} alt={userName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Pro Dashboard for Pro users */}
        {currentPlan && currentPlan.name !== 'Free' && (
          <DropdownMenuItem asChild>
            <Link to="/pro-dashboard" className="flex items-center">
              <Crown className="mr-2 h-4 w-4 text-yellow-500" />
              <span>Pro Dashboard</span>
              <Badge className="ml-auto text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                ✨ Pro
              </Badge>
            </Link>
          </DropdownMenuItem>
        )}

        {/* Subscription Status */}
        <DropdownMenuItem asChild>
          <Link to="/subscription" className="flex items-center">
            <Crown className="mr-2 h-4 w-4" />
            <span>Subscription</span>
            <Badge 
              variant={currentPlan?.name === 'Free' ? "secondary" : "default"} 
              className={`ml-auto text-xs ${
                currentPlan?.name === 'Pro' ? 'bg-blue-500 text-white' :
                currentPlan?.name === 'Enterprise' ? 'bg-purple-500 text-white' : ''
              }`}
            >
              {currentPlan?.name || 'Free'}
            </Badge>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Navigation Items */}
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/fir-generator" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            <span>My FIRs</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          className="flex items-center cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
