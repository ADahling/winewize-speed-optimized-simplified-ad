import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import AdminDashboard from '@/components/admin/AdminDashboard';
import Copyright from '@/components/Copyright';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { isAdminUser } from '@/utils/adminUtils';
import { Mail, Wine } from 'lucide-react';

const Admin = () => {
  const { user } = useAuth();

  // Fetch user profile to check role - now supports both admin and site_admin
  const { data: profile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      try {
        logger.info('Fetching profile for admin access check', { 
          userId: user.id, 
          userEmail: user.email
        });
        
        // Use maybeSingle() to prevent 400 errors
        const { data, error } = await supabase
          .from('profiles')
          .select('role, email')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) {
          logger.error('Error fetching profile, using hardcoded fallback', { 
            error, 
            userId: user.id, 
            userEmail: user.email 
          });
          // Return hardcoded admin status if profile fetch fails
          return { role: isAdminUser(user) ? 'site_admin' : 'subscriber', email: user.email };
        }
        
        if (!data) {
          logger.warn('No profile data found, using hardcoded fallback', { 
            userId: user.id, 
            userEmail: user.email 
          });
          // Return hardcoded admin status if no profile found
          return { role: isAdminUser(user) ? 'site_admin' : 'subscriber', email: user.email };
        }
        
        logger.info('Profile fetched successfully', { 
          userId: user.id, 
          userEmail: user.email, 
          profileRole: data.role,
          profileEmail: data.email
        });
        return data;
      } catch (error) {
        logger.error('Profile fetch exception, using hardcoded fallback', { 
          error, 
          userId: user.id, 
          userEmail: user.email 
        });
        // Return hardcoded admin status on exception
        return { role: isAdminUser(user) ? 'site_admin' : 'subscriber', email: user.email };
      }
    },
    enabled: !!user?.id,
    retry: false,
  });

  // Determine admin status using centralized utility
  const isAdmin = isAdminUser(user, profile?.role);

  // New state for email testing
  const [testEmail, setTestEmail] = useState('');
  const [testName, setTestName] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailResult, setEmailResult] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('menu-match-welcome');

  // New state for rating reminders
  const [sendingReminders, setSendingReminders] = useState(false);
  const [reminderResult, setReminderResult] = useState(null);

  // New state for trial reminders
  const [sendingTrialReminders, setSendingTrialReminders] = useState(false);
  const [trialReminderResult, setTrialReminderResult] = useState(null);

  // Function to send test email
  const sendTestEmail = async () => {
    if (!testEmail) {
      setEmailResult({ success: false, message: 'Please enter an email address' });
      return;
    }

    try {
      setSendingEmail(true);
      setEmailResult(null);
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: testEmail,
          templateName: selectedTemplate,
          templateData: {
            name: testName || 'Wine Enthusiast',
          }
        },
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        setEmailResult({ success: false, message: error.message || 'Failed to send email' });
      } else if (data.success) {
        setEmailResult({ success: true, message: 'Email sent successfully!' });
      } else {
        setEmailResult({ success: false, message: data.error || 'Failed to send email' });
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      setEmailResult({ success: false, message: 'Error sending email. Check console for details.' });
    } finally {
      setSendingEmail(false);
    }
  };

  // Function to trigger rating reminders manually
  const triggerRatingReminders = async () => {
    try {
      setSendingReminders(true);
      setReminderResult(null);
      
      const { data, error } = await supabase.functions.invoke('send-rating-reminders', {
        body: {}
      });
      
      if (error) {
        console.error('Error triggering rating reminders:', error);
        setReminderResult({ success: false, message: error.message || 'Failed to trigger reminders' });
      } else if (data.success) {
        setReminderResult({ 
          success: true, 
          message: `Successfully processed ${data.processed} reminders${data.errors > 0 ? ` (${data.errors} errors)` : ''}` 
        });
      } else {
        setReminderResult({ success: false, message: data.error || 'Failed to trigger reminders' });
      }
    } catch (error) {
      console.error('Error triggering rating reminders:', error);
      setReminderResult({ success: false, message: 'Error triggering reminders. Check console for details.' });
    } finally {
      setSendingReminders(false);
    }
  };

  // Function to trigger trial reminders manually
  const triggerTrialReminders = async () => {
    try {
      setSendingTrialReminders(true);
      setTrialReminderResult(null);
      
      const { data, error } = await supabase.functions.invoke('send-trial-reminders', {
        body: {}
      });
      
      if (error) {
        console.error('Error triggering trial reminders:', error);
        setTrialReminderResult({ success: false, message: error.message || 'Failed to trigger trial reminders' });
      } else if (data.success) {
        setTrialReminderResult({ 
          success: true, 
          message: `Successfully processed ${data.processed} trial reminders${data.errors > 0 ? ` (${data.errors} errors)` : ''}` 
        });
      } else {
        setTrialReminderResult({ success: false, message: data.error || 'Failed to trigger trial reminders' });
      }
    } catch (error) {
      console.error('Error triggering trial reminders:', error);
      setTrialReminderResult({ success: false, message: 'Error triggering trial reminders. Check console for details.' });
    } finally {
      setSendingTrialReminders(false);
    }
  };

  logger.info('Admin access check complete', {
    userEmail: user?.email,
    userId: user?.id,
    profileRole: profile?.role || 'unknown',
    profileEmail: profile?.email || 'unknown',
    finalIsAdmin: isAdmin,
    profileLoading,
    profileError: profileError?.message || 'none'
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-32 md:pb-8">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-20 text-center">
          <p className="text-slate-600">Please log in to access the admin dashboard.</p>
        </div>
        <Copyright />
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-32 md:pb-8">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-20 text-center">
          <p className="text-slate-600">Loading admin access (checking for admin/site_admin roles)...</p>
        </div>
        <Copyright />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-32 md:pb-8">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-20 text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Access Denied</h1>
          <p className="text-slate-600">You don't have permission to access the admin dashboard.</p>
          <div className="mt-4 text-sm text-slate-500">
            <p>User: {user.email}</p>
            <p>User ID: {user.id}</p>
            <p>Role: {profile?.role || 'unknown'}</p>
            <p>Admin Status: {isAdmin ? 'Yes' : 'No'}</p>
            {profileError && (
              <p className="text-red-500 mt-2">Profile fetch error: {profileError.message}</p>
            )}
          </div>
        </div>
        <Copyright />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-32 md:pb-8">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="w-full">
          <AdminDashboard />
          
          {/* Email Testing Section */}
          <div className="mt-8 p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-slate-800">Email Testing</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="menu-match-welcome">Menu Match Welcome</option>
                  <option value="welcome">Basic Welcome</option>
                  <option value="trial-reminder">Trial Reminder</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="Wine Enthusiast"
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              
              <button 
                onClick={sendTestEmail}
                disabled={sendingEmail}
                className="w-full py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
              >
                {sendingEmail ? 'Sending...' : 'Send Test Email'}
              </button>
              
              {emailResult && (
                <div className={`p-3 rounded ${emailResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {emailResult.message}
                </div>
              )}
            </div>
          </div>

          {/* Wine Rating Reminders Section */}
          <div className="mt-8 p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Wine className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-slate-800">Wine Rating Reminders</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Manually trigger wine rating reminder emails for all pending reminders.
              </p>
              
              <button 
                onClick={triggerRatingReminders}
                disabled={sendingReminders}
                className="w-full py-2 px-4 bg-amber-600 text-white rounded hover:bg-amber-700 disabled:opacity-50"
              >
                {sendingReminders ? 'Processing...' : 'Send Rating Reminders'}
              </button>
              
              {reminderResult && (
                <div className={`p-3 rounded ${reminderResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {reminderResult.message}
                </div>
              )}
            </div>
          </div>

          {/* Trial Reminders Section */}
          <div className="mt-8 p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <Wine className="w-5 h-5 text-amber-600" />
              <h2 className="text-xl font-bold text-slate-800">Trial Reminders</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Manually trigger trial reminder emails for users whose trial ends in 24 hours.
              </p>
              
              <button 
                onClick={triggerTrialReminders}
                disabled={sendingTrialReminders}
                className="w-full py-2 px-4 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
              >
                {sendingTrialReminders ? 'Processing...' : 'Send Trial Reminders'}
              </button>
              
              {trialReminderResult && (
                <div className={`p-3 rounded ${trialReminderResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {trialReminderResult.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Copyright />
    </div>
  );
};

export default Admin;
