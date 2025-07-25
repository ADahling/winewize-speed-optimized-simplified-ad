// NOTE: All CORS logic is centralized in '../_shared/cors.ts'.
// Do NOT hardcode CORS headers in this file. Use getCorsHeaders(origin) for all responses.
import '../_shared/deno-types.ts';
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://deno.land/x/supabase@1.0.0/mod.ts';
import { getCorsHeaders } from '../_shared/cors.ts';

interface RegistrationData {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  location: string;
}

serve(async (req) => {
  const origin = req.headers.get('origin') || 'http://localhost:3000';
  const headers = getCorsHeaders(origin);
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    console.log('Sync to Systeme.io function called');
    
    const { userId, email, firstName, lastName, location }: RegistrationData = await req.json();
    
    if (!userId || !email) {
      console.error('Missing required fields: userId or email');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId or email' }),
        { 
          status: 400, 
          headers: { ...headers, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing registration for user: ${email}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the Systeme.io webhook URL from secrets
    const systemeWebhookUrl = Deno.env.get('SYSTEME_IO_WEBHOOK_URL');
    
    if (!systemeWebhookUrl) {
      console.log('Systeme.io webhook URL not configured - skipping CRM sync');
      
      // Update user profile to mark as processed even without CRM sync
      await supabase
        .from('profiles')
        .update({ 
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'User registered successfully (CRM sync skipped - webhook not configured)' 
        }),
        { 
          status: 200, 
          headers: { ...headers, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare data for Systeme.io
    const systemeData = {
      email: email,
      first_name: firstName || '',
      last_name: lastName || '',
      location: location || '',
      source: 'wine-wize-registration',
      registration_date: new Date().toISOString(),
      trial_start: new Date().toISOString(),
      user_id: userId
    };

    console.log('Sending data to Systeme.io:', { email, firstName, lastName });

    // Send to Systeme.io webhook
    const systemeResponse = await fetch(systemeWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(systemeData),
    });

    if (!systemeResponse.ok) {
      console.error('Systeme.io webhook failed:', systemeResponse.status, systemeResponse.statusText);
      const errorText = await systemeResponse.text();
      console.error('Systeme.io error response:', errorText);
      
      // Still return success to user, but log the CRM sync failure
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'User registered successfully (CRM sync failed)',
          crmError: true
        }),
        { 
          status: 200, 
          headers: { ...headers, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Successfully synced to Systeme.io');

    // Update user profile to mark as synced
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user profile:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User registered and synced to CRM successfully' 
      }),
      { 
        status: 200, 
        headers: { ...headers, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in sync-to-systeme-io function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...headers, 'Content-Type': 'application/json' } 
      }
    );
  }
});
