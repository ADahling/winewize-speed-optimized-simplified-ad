import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, LogOut, Crown, BarChart3 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const UserProfileDropdown = () => {
  const { user, signOut, subscriptionInfo } = useAuth();

  // Return early if user data isn't available
  if (!user) return null;

  // Memoize the initials to prevent recalculation on every render
  const initials = useMemo(() => {
    const firstName = user.user_metadata?.first_name || '';
    const lastName = user.user_metadata?.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  }, [user.user_metadata?.first_name, user.user_metadata?.last_name]);

  // Memoize the user display name to prevent recalculation
  const displayName = useMemo(() => {
    return `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim();
  }, [user.user_metadata?.first_name, user.user_metadata?.last_name]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-lg p-0">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white text-sm font-medium shadow-sm">
            {initials}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium text-sm">{displayName}</p>
            <p className="w-[200px] truncate text-xs text-muted-foreground">
              {user.email}
            </p>
            {subscriptionInfo?.subscribed && (
              <div className="flex items-center gap-1 text-xs text-purple-600">
                <Crown className="w-3 h-3" />
                <span>{subscriptionInfo.subscription_tier}</span>
              </div>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="cursor-pointer">
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Analytics</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/subscription" className="cursor-pointer">
            <Crown className="mr-2 h-4 w-4" />
            <span>Subscription</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/wine-preferences" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Wine Preferences</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onSelect={(e) => {
            e.preventDefault();
            signOut();
          }} 
          className="cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default React.memo(UserProfileDropdown);
