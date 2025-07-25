import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://deno.land/x/supabase@1.0.0/mod.ts';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrialReminderData {
  id: string;
  email: string;
  first_name: string;
  trial_end_date: string;
}

const createTrialReminderEmail = (firstName: string, continueUrl: string) => {
  return {
    subject: "Don't Miss Out—Keep Discovering Wines You'll Love",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #7c3aed; margin-bottom: 20px;">🍷 Don't Miss Out—Keep Discovering Wines You'll Love</h2>
        
        <p style="font-size: 16px; color: #374151;">Hi ${firstName},</p>
        
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          Your free trial of Menu Match ends tomorrow—but there's still time to keep the magic going.
        </p>
        
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          For less than the cost of a glass (or bottle!) of wine each month, you'll unlock:
        </p>
        
        <div style="margin: 20px 0;">
          <p style="margin: 8px 0; color: #374151;">✅ Unlimited perfect pairings—wherever you dine.</p>
          <p style="margin: 8px 0; color: #374151;">✅ A smart wine library to remember every favorite.</p>
          <p style="margin: 8px 0; color: #374151;">✅ The confidence to order wine like a pro.</p>
        </div>
        
        <p style="font-size: 16px; color: #374151; font-weight: bold; margin: 20px 0;">
          Save even more with an annual subscription!
        </p>
        
        <p style="font-size: 16px; color: #374151; margin: 20px 0;">
          Don't miss a beat—or your next great bottle.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${continueUrl}" 
             style="background-color: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            👉 Continue Your Journey Here
          </a>
        </div>
        
        <p style="font-size: 16px; color: #374151; margin-top: 30px;">
          Cheers to discovering your next favorite wine,<br>
          The WINE WIZE Team
        </p>
      </div>
    `,
    text: `Hi ${firstName},

Your free trial of Menu Match ends tomorrow—but there's still time to keep the magic going.

For less than the cost of a glass (or bottle!) of wine each month, you'll unlock:
✅ Unlimited perfect pairings—wherever you dine.
✅ A smart wine library to remember every favorite.
✅ The confidence to order wine like a pro.

Save even more with an annual subscription!

Don't miss a beat—or your next great bottle.

Continue Your Journey Here: ${continueUrl}

Cheers to discovering your next favorite wine,
The WINE WIZE Team`
  };
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting trial reminder process...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "noreply@wine-wize.com";
    
    // Calculate 24 hours from now
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    const tomorrowEnd = new Date(tomorrowStart.getTime() + 24 * 60 * 60 * 1000);

    // Get users whose trial ends in 24 hours and haven't received a reminder yet
    const { data: usersToRemind, error: queryError } = await supabase
      .from('profiles')
      .select('id, email, first_name, trial_end_date')
      .gte('trial_end_date', tomorrowStart.toISOString())
      .lt('trial_end_date', tomorrowEnd.toISOString())
      .eq('subscription_status', 'trial')
      .not('id', 'in', `(
        SELECT user_id FROM trial_reminder_emails 
        WHERE trial_end_date >= '${tomorrowStart.toISOString()}'
        AND trial_end_date < '${tomorrowEnd.toISOString()}'
      )`);

    if (queryError) {
      console.error('Error fetching users for trial reminders:', queryError);
      throw queryError;
    }

    if (!usersToRemind || usersToRemind.length === 0) {
      console.log('No users found who need trial reminders');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No users need trial reminders',
        processed: 0 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log(`Found ${usersToRemind.length} users who need trial reminders`);

    let processedCount = 0;
    let errorCount = 0;

    // Get the frontend URL from environment variables
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://preview--ww-menu-match-finalmvp-v1.lovable.app';

    // Process each user
    for (const user of usersToRemind as TrialReminderData[]) {
      try {
        const firstName = user.first_name || 'Wine Enthusiast';
        const continueUrl = `${frontendUrl}/subscription`;

        const emailContent = createTrialReminderEmail(firstName, continueUrl);

        console.log(`Sending trial reminder email to ${user.email} for user: ${firstName}`);

        const emailResponse = await resend.emails.send({
          from: fromEmail,
          to: [user.email],
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });

        if (emailResponse.data?.id) {
          // Record that we sent this reminder
          await supabase
            .from('trial_reminder_emails')
            .insert({
              user_id: user.id,
              trial_end_date: user.trial_end_date
            });

          console.log(`Successfully sent trial reminder to ${user.email}, message ID: ${emailResponse.data.id}`);
          processedCount++;
        } else {
          console.error(`Failed to send email to ${user.email}:`, emailResponse.error);
          errorCount++;
        }

      } catch (error) {
        console.error(`Error processing trial reminder for user ${user.id}:`, error);
        errorCount++;
      }
    }

    console.log(`Processed ${processedCount} trial reminders, ${errorCount} errors`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Processed ${processedCount} trial reminders`,
      processed: processedCount,
      errors: errorCount
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in send-trial-reminders function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
