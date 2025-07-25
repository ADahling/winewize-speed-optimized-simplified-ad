import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id, email, first_name, last_name, location } = await req.json()

    console.log('📧 Admin notification triggered for new user:', { user_id, email, first_name, last_name, location })

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Send admin notification email
    const { error: emailError } = await supabaseClient.functions.invoke('send-email', {
      body: {
        to: 'admin@wine-wize.com',
        templateName: 'admin-new-user-notification',
        templateData: {
          user_name: `${first_name} ${last_name}`,
          user_email: email,
          user_location: location || 'Not provided',
          signup_date: new Date().toLocaleDateString(),
          signup_time: new Date().toLocaleTimeString(),
          user_id: user_id
        }
      },
    })

    if (emailError) {
      console.error('❌ Failed to send admin notification:', emailError)
      throw emailError
    }

    console.log('✅ Admin notification sent successfully for user:', email)

    return new Response(
      JSON.stringify({ success: true, message: 'Admin notification sent' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('💥 Error in notify-admin-new-user:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})