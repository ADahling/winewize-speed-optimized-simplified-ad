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
    console.log('📊 Starting daily signups export...')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all users who signed up in the last 24 hours
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const { data: newUsers, error: usersError } = await supabaseClient
      .from('profiles')
      .select(`
        id,
        email,
        first_name,
        last_name,
        location,
        created_at,
        subscription_tier,
        subscription_status
      `)
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false })

    if (usersError) {
      console.error('❌ Error fetching new users:', usersError)
      throw usersError
    }

    console.log(`📈 Found ${newUsers?.length || 0} new users in the last 24 hours`)

    if (!newUsers || newUsers.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No new users in the last 24 hours',
          count: 0 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Enrich user data with usage stats
    const enrichedUsers = await Promise.all(
      newUsers.map(async (user) => {
        // Get user's menu analysis count
        const { data: analysisCount } = await supabaseClient
          .from('restaurants')
          .select('id', { count: 'exact' })
          .eq('user_id', user.id)

        // Get user's wine preferences
        const { data: winePrefs } = await supabaseClient
          .from('wine_preferences')
          .select('budget_max, preferred_styles')
          .eq('user_id', user.id)
          .single()

        // Calculate trial day
        const signupDate = new Date(user.created_at)
        const now = new Date()
        const trialDay = Math.floor((now.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

        return {
          user_id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          full_name: `${user.first_name} ${user.last_name}`,
          location: user.location,
          signup_date: signupDate.toISOString().split('T')[0],
          signup_time: signupDate.toLocaleTimeString(),
          trial_day: trialDay,
          menus_analyzed: analysisCount?.count || 0,
          wine_budget: winePrefs?.budget_max || 'Not set',
          wine_preferences: winePrefs?.preferred_styles?.join(', ') || 'Not set',
          subscription_tier: user.subscription_tier || 'trial',
          subscription_status: user.subscription_status || 'trial',
          engagement_score: this.calculateEngagementScore(analysisCount?.count || 0, !!winePrefs, trialDay)
        }
      })
    )

    // Format for CSV export (useful for Zapier/Make)
    const csvData = enrichedUsers.map(user => ({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      location: user.location,
      signup_date: user.signup_date,
      trial_day: user.trial_day,
      menus_analyzed: user.menus_analyzed,
      engagement_score: user.engagement_score,
      wine_budget: user.wine_budget
    }))

    // Send summary email to admin
    const { error: emailError } = await supabaseClient.functions.invoke('send-email', {
      body: {
        to: 'admin@wine-wize.com',
        templateName: 'admin-daily-signups-summary',
        templateData: {
          date: new Date().toLocaleDateString(),
          user_count: enrichedUsers.length,
          users_summary: enrichedUsers.map(u => 
            `${u.full_name} (${u.email}) - Day ${u.trial_day}, ${u.menus_analyzed} menus, ${u.engagement_score}/10 engagement`
          ).join('\n'),
          high_engagement_users: enrichedUsers.filter(u => u.engagement_score >= 7).length,
          low_engagement_users: enrichedUsers.filter(u => u.engagement_score <= 3).length
        }
      },
    })

    if (emailError) {
      console.error('❌ Failed to send daily summary email:', emailError)
    }

    console.log('✅ Daily signups export completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Daily signups exported successfully',
        count: enrichedUsers.length,
        users: enrichedUsers,
        csv_data: csvData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('💥 Error in export-daily-signups:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

function calculateEngagementScore(menusAnalyzed: number, hasWinePrefs: boolean, trialDay: number): number {
  let score = 0
  
  // Menu analysis points (0-5 points)
  if (menusAnalyzed >= 3) score += 5
  else if (menusAnalyzed >= 2) score += 3
  else if (menusAnalyzed >= 1) score += 2
  
  // Wine preferences points (0-3 points)
  if (hasWinePrefs) score += 3
  
  // Early engagement bonus (0-2 points)
  if (trialDay <= 1 && menusAnalyzed >= 1) score += 2
  else if (trialDay <= 2 && menusAnalyzed >= 1) score += 1
  
  return Math.min(score, 10) // Cap at 10
}