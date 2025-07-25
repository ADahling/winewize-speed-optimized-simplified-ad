import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://deno.land/x/supabase@1.0.0/mod.ts';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReminderData {
  id: string;
  user_id: string;
  wine_library_id: string;
  scheduled_for: string;
  sent: boolean;
  user_wine_library: {
    wine_name: string;
    dish_paired_with: string;
    wine_style: string;
  };
  profiles: {
    first_name: string;
    email: string;
  };
}

const createWineRatingReminderEmail = (firstName: string, wineName: string, dishName: string, rateUrl: string) => {
  return {
    subject: "Did you love it? Let's find out!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #7c3aed; margin-bottom: 20px;">🍷 Time to Rate Your Wine!</h2>
        
        <p style="font-size: 16px; color: #374151;">Hi ${firstName},</p>
        
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          You've just added <strong>${wineName}</strong> (paired with ${dishName}) to your library—great move! But you haven't rated it yet.
        </p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 10px;"><strong>Why rate?</strong></p>
          <p style="margin: 8px 0; color: #374151;">✅ Get smarter, more personalized pairing recommendations.</p>
          <p style="margin: 8px 0; color: #374151;">✅ Build your own go-to list of wines you love (and skip the ones you don't).</p>
          <p style="margin: 8px 0; color: #374151;">✅ Make every wine selection easier—anywhere, anytime.</p>
        </div>
        
        <p style="font-size: 16px; color: #374151; margin: 20px 0;">
          It only takes a second. Ready to rate your wine?
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${rateUrl}" 
             style="background-color: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            👉 Rate Your Wine Now
          </a>
        </div>
        
        <p style="font-size: 16px; color: #374151; margin-top: 30px;">
          Cheers to discovering your perfect pour,<br>
          The WINE WIZE Team
        </p>
      </div>
    `,
    text: `Hi ${firstName},

You've just added ${wineName} (paired with ${dishName}) to your library—great move! But you haven't rated it yet.

Why rate?
✅ Get smarter, more personalized pairing recommendations.
✅ Build your own go-to list of wines you love (and skip the ones you don't).
✅ Make every wine selection easier—anywhere, anytime.

It only takes a second. Ready to rate your wine?

Rate Your Wine Now: ${rateUrl}

Cheers to discovering your perfect pour,
The WINE WIZE Team`
  };
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting wine rating reminder process...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "admin@wine-wize.com";
    
    // Get all pending reminders that are due and haven't been sent
    const { data: reminders, error: remindersError } = await supabase
      .from('wine_rating_reminders')
      .select(`
        id,
        user_id,
        wine_library_id,
        scheduled_for,
        sent,
        user_wine_library:wine_library_id (
          wine_name,
          dish_paired_with,
          wine_style,
          rating
        ),
        profiles:user_id (
          first_name,
          email
        )
      `)
      .eq('sent', false)
      .lte('scheduled_for', new Date().toISOString())
      .not('user_wine_library.rating', 'is', null);

    if (remindersError) {
      console.error('Error fetching reminders:', remindersError);
      throw remindersError;
    }

    if (!reminders || reminders.length === 0) {
      console.log('No pending reminders found');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No pending reminders found',
        processed: 0 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log(`Found ${reminders.length} pending reminders`);

    let processedCount = 0;
    let errorCount = 0;

    // Get the frontend URL from environment variables with fallback
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://preview--ww-menu-match-finalmvp-v1.lovable.app';

    // Process each reminder
    for (const reminder of reminders as ReminderData[]) {
      try {
        // Skip if wine is already rated
        if (reminder.user_wine_library?.rating) {
          console.log(`Skipping reminder ${reminder.id} - wine already rated`);
          continue;
        }

        const firstName = reminder.profiles?.first_name || 'Wine Enthusiast';
        const email = reminder.profiles?.email;
        const wineName = reminder.user_wine_library?.wine_name || 'Your Wine';
        const dishName = reminder.user_wine_library?.dish_paired_with || 'your dish';
        
        if (!email) {
          console.error(`No email found for user ${reminder.user_id}`);
          continue;
        }

        // Create the rating URL using the environment variable
        const rateUrl = `${frontendUrl}/library`;

        const emailContent = createWineRatingReminderEmail(firstName, wineName, dishName, rateUrl);

        console.log(`Sending reminder email to ${email} for wine: ${wineName}`);

        const emailResponse = await resend.emails.send({
          from: fromEmail,
          to: [email],
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        });

        if (emailResponse.data?.id) {
          // Mark reminder as sent
          await supabase
            .from('wine_rating_reminders')
            .update({ sent: true })
            .eq('id', reminder.id);

          console.log(`Successfully sent reminder to ${email}, message ID: ${emailResponse.data.id}`);
          processedCount++;
        } else {
          console.error(`Failed to send email to ${email}:`, emailResponse.error);
          errorCount++;
        }

      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error);
        errorCount++;
      }
    }

    console.log(`Processed ${processedCount} reminders, ${errorCount} errors`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Processed ${processedCount} reminders`,
      processed: processedCount,
      errors: errorCount
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in send-rating-reminders function:', error);
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
