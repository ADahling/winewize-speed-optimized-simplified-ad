// NOTE: All CORS logic is centralized in '../_shared/cors.ts'.
// Do NOT hardcode CORS headers in this file. Update allowed origins and CORS policy only in the shared file.
// This ensures all functions stay in sync with CORS changes.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { getCorsHeaders } from '../_shared/cors.ts';

interface EmailRequest {
  to: string;
  templateName: string;
  templateData: {
    name?: string;
    loginLink?: string;
    continueUrl?: string;
    [key: string]: any;
  };
}

// Email templates
const createWelcomeEmail = (name: string = 'Wine Enthusiast', loginLink?: string) => {
  return {
    subject: "Welcome to Wine Wize!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">Welcome to Wine Wize, ${name}!</h1>
        <p>We're excited to have you join our community of wine enthusiasts.</p>
        <p>With Wine Wize, you can:</p>
        <ul>
          <li>Get personalized wine pairings for your favorite dishes</li>
          <li>Discover new wines based on your preferences</li>
          <li>Build your personal wine library</li>
          <li>Access expert wine recommendations</li>
        </ul>
        ${loginLink ? `<p><a href="${loginLink}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Get Started</a></p>` : ''}
        <p>Cheers to great wine discoveries!</p>
        <p>The Wine Wize Team</p>
      </div>
    `,
    text: `Welcome to Wine Wize, ${name}! We're excited to have you join our community of wine enthusiasts. With Wine Wize, you can get personalized wine pairings, discover new wines, build your wine library, and access expert recommendations. ${loginLink ? `Get started: ${loginLink}` : ''} Cheers to great wine discoveries! The Wine Wize Team`
  };
};

const createMenuMatchWelcomeEmail = (name: string = 'Wine Enthusiast') => {
  return {
    subject: "Welcome to Menu Match—Here's How to Sip Smarter",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #7c3aed; margin-bottom: 20px;">🍷 Welcome to Menu Match by WINE WIZE!</h2>
        <p style="font-size: 16px; color: #374151;">Hi ${name},</p>
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
          Welcome to Menu Match by WINE WIZE! Ready to make wine pairing effortless? Here are a few tips to get started:
        </p>
        <div style="margin: 30px 0;">
          <div style="margin-bottom: 20px;">
            <h3 style="color: #7c3aed; margin-bottom: 8px;">🍽 Dine out often?</h3>
            <p style="color: #374151; margin: 0;">Add your favorite restaurants, menus, and wine lists to speed up your next pairing—and help fellow Menu Match users, too!</p>
          </div>
          <div style="margin-bottom: 20px;">
            <h3 style="color: #7c3aed; margin-bottom: 8px;">✈️ Traveling?</h3>
            <p style="color: #374151; margin: 0;">No problem—just skip the restaurant step and upload the menu and wine list for instant recommendations.</p>
          </div>
          <div style="margin-bottom: 20px;">
            <h3 style="color: #7c3aed; margin-bottom: 8px;">📚 Keep a wine memory bank.</h3>
            <p style="color: #374151; margin: 0;">Every time you try a recommended wine, add it to your Library so you never forget what you loved.</p>
          </div>
          <div style="margin-bottom: 20px;">
            <h3 style="color: #7c3aed; margin-bottom: 8px;">🌿 Tastes evolve.</h3>
            <p style="color: #374151; margin: 0;">Feel free to update your wine preferences anytime—just like the seasons, your palate can change!</p>
          </div>
        </div>
        <p style="font-size: 16px; color: #374151; margin-top: 30px;">
          Have questions? We're here for you.
        </p>
        <p style="font-size: 16px; color: #374151; margin-top: 20px;">
          Happy pairing,<br>
          The WINE WIZE Team
        </p>
      </div>
    `,
    text: `Hi ${name},

Welcome to Menu Match by WINE WIZE! Ready to make wine pairing effortless? Here are a few tips to get started:

🍽 Dine out often?
Add your favorite restaurants, menus, and wine lists to speed up your next pairing—and help fellow Menu Match users, too!

✈️ Traveling?
No problem—just skip the restaurant step and upload the menu and wine list for instant recommendations.

📚 Keep a wine memory bank.
Every time you try a recommended wine, add it to your Library so you never forget what you loved.

🌿 Tastes evolve.
Feel free to update your wine preferences anytime—just like the seasons, your palate can change!

Have questions? We're here for you.

Happy pairing,
The WINE WIZE Team`
  };
};

const createTrialReminderEmail = (name: string = 'Wine Enthusiast', continueUrl?: string) => {
  const defaultContinueUrl = continueUrl || 'https://preview--ww-menu-match-finalmvp-v1.lovable.app/subscription';
  return {
    subject: "Don't Miss Out—Keep Discovering Wines You'll Love",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #7c3aed; margin-bottom: 20px;">🍷 Don't Miss Out—Keep Discovering Wines You'll Love</h2>
        <p style="font-size: 16px; color: #374151;">Hi ${name},</p>
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
          <a href="${defaultContinueUrl}" 
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
    text: `Hi ${name},

Your free trial of Menu Match ends tomorrow—but there's still time to keep the magic going.

For less than the cost of a glass (or bottle!) of wine each month, you'll unlock:
✅ Unlimited perfect pairings—wherever you dine.
✅ A smart wine library to remember every favorite.
✅ The confidence to order wine like a pro.

Save even more with an annual subscription!

Don't miss a beat—or your next great bottle.

Continue Your Journey Here: ${defaultContinueUrl}

Cheers to discovering your next favorite wine,
The WINE WIZE Team`
  };
};

const createAdminNewUserNotificationEmail = (data: any) => {
  const { user_name, user_email, user_location, signup_date, signup_time, user_id } = data;
  return {
    subject: `🔥 New User Registration - ${user_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #7c3aed; margin-bottom: 20px;">🔥 New User Registration Alert</h2>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">User Details:</h3>
          <p style="margin: 8px 0; color: #374151;"><strong>Name:</strong> ${user_name}</p>
          <p style="margin: 8px 0; color: #374151;"><strong>Email:</strong> ${user_email}</p>
          <p style="margin: 8px 0; color: #374151;"><strong>Location:</strong> ${user_location}</p>
          <p style="margin: 8px 0; color: #374151;"><strong>Signup Date:</strong> ${signup_date}</p>
          <p style="margin: 8px 0; color: #374151;"><strong>Signup Time:</strong> ${signup_time}</p>
          <p style="margin: 8px 0; color: #374151;"><strong>User ID:</strong> ${user_id}</p>
        </div>
        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
          This is an automated notification from Wine Wize user registration system.
        </p>
      </div>
    `,
    text: `New User Registration Alert

User Details:
Name: ${user_name}
Email: ${user_email}
Location: ${user_location}
Signup Date: ${signup_date}
Signup Time: ${signup_time}
User ID: ${user_id}

This is an automated notification from Wine Wize user registration system.`
  };
};

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get('origin') || 'https://wine-wize.app';
  const headers = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...headers },
    });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "noreply@wine-wize.com";
    const { to, templateName, templateData }: EmailRequest = await req.json();

    if (!to) {
      return new Response(JSON.stringify({ error: 'Missing recipient email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...headers },
      });
    }

    let emailContent;
    switch (templateName) {
      case 'welcome':
        const { name, loginLink } = templateData || {};
        emailContent = createWelcomeEmail(name, loginLink);
        break;
      case 'menu-match-welcome':
        const welcomeName = templateData?.name;
        emailContent = createMenuMatchWelcomeEmail(welcomeName);
        break;
      case 'trial-reminder':
        const trialName = templateData?.name;
        const continueUrl = templateData?.continueUrl;
        emailContent = createTrialReminderEmail(trialName, continueUrl);
        break;
      case 'admin-new-user-notification':
        emailContent = createAdminNewUserNotificationEmail(templateData);
        break;
      default:
        return new Response(JSON.stringify({ error: `Unknown template: ${templateName}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...headers },
        });
    }

    console.log('Sending email to:', to, 'with template:', templateName);
    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });
    console.log('Email sent successfully:', emailResponse);
    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...headers },
    });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...headers },
    });
  }
};

serve(handler);