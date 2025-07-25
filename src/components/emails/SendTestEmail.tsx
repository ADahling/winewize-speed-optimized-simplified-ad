
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function SendTestEmail() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [template, setTemplate] = useState('menu-match-welcome');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  
  const sendTestEmail = async () => {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setSending(true);
      
      const templateData: any = {
        name: name || 'Wine Enthusiast',
      };

      // Add continueUrl for trial reminder template
      if (template === 'trial-reminder') {
        templateData.continueUrl = window.location.origin + '/subscription';
      }
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          templateName: template,
          templateData
        },
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        toast({
          title: 'Failed to send email',
          description: error.message || 'Unknown error occurred',
          variant: 'destructive'
        });
      } else if (data.success) {
        toast({
          title: 'Success!',
          description: 'Test email sent successfully',
        });
      } else {
        toast({
          title: 'Failed to send email',
          description: data.error || 'Unknown error occurred',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send email',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };
  
  return (
    <div className="p-4 border rounded-lg space-y-4">
      <h2 className="text-lg font-semibold">Send Test Email</h2>
      
      <div className="space-y-2">
        <label className="block text-sm">Email Template</label>
        <Select value={template} onValueChange={setTemplate}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="menu-match-welcome">Menu Match Welcome</SelectItem>
            <SelectItem value="welcome">Basic Welcome</SelectItem>
            <SelectItem value="trial-reminder">Trial Reminder</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm">Email Address</label>
        <Input
          type="email"
          placeholder="test@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm">Recipient Name</label>
        <Input
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      
      <Button 
        onClick={sendTestEmail} 
        disabled={sending}
        className="w-full"
      >
        {sending ? 'Sending...' : 'Send Test Email'}
      </Button>
    </div>
  );
}
