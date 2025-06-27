export interface EmailTemplate {
  subject: string;
  htmlBody: string;
  textBody: string;
}

export const createOrderApprovedEmail = (orderName: string, brandName: string): EmailTemplate => ({
  subject: `✅ Your order "${orderName}" has been approved`,
  htmlBody: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Approved</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Order Approved!</h1>
        </div>
        <div class="content">
          <h2>Great news!</h2>
          <p>Your advertising order "<strong>${orderName}</strong>" for <strong>${brandName}</strong> has been approved and is now ready to go live.</p>
          
          <p>Your campaign will begin running according to the schedule you specified. You can monitor its performance in real-time through your SpotGrid dashboard.</p>
          
          <a href="${process.env.VITE_APP_URL || 'https://spotgrid.com'}/campaigns" class="button">
            View Campaign Performance
          </a>
          
          <p>If you have any questions or need assistance, our support team is here to help.</p>
          
          <p>Best regards,<br>The SpotGrid Team</p>
        </div>
        <div class="footer">
          <p>© 2024 SpotGrid. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,
  textBody: `
Order Approved!

Great news! Your advertising order "${orderName}" for ${brandName} has been approved and is now ready to go live.

Your campaign will begin running according to the schedule you specified. You can monitor its performance in real-time through your SpotGrid dashboard.

Visit: ${process.env.VITE_APP_URL || 'https://spotgrid.com'}/campaigns

If you have any questions or need assistance, our support team is here to help.

Best regards,
The SpotGrid Team
  `
});

export const createOrderRejectedEmail = (orderName: string, brandName: string, reason: string): EmailTemplate => ({
  subject: `❌ Your order "${orderName}" requires attention`,
  htmlBody: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Requires Attention</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .reason-box { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Requires Attention</h1>
        </div>
        <div class="content">
          <h2>Action Required</h2>
          <p>Your advertising order "<strong>${orderName}</strong>" for <strong>${brandName}</strong> needs some adjustments before it can be approved.</p>
          
          <div class="reason-box">
            <h3>Reason for rejection:</h3>
            <p>${reason}</p>
          </div>
          
          <p>Please review the feedback above and make the necessary changes to your order. Once updated, you can resubmit it for approval.</p>
          
          <a href="${process.env.VITE_APP_URL || 'https://spotgrid.com'}/orders" class="button">
            Edit Your Order
          </a>
          
          <p>If you have any questions about the required changes, please don't hesitate to contact our support team.</p>
          
          <p>Best regards,<br>The SpotGrid Team</p>
        </div>
        <div class="footer">
          <p>© 2024 SpotGrid. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,
  textBody: `
Order Requires Attention

Your advertising order "${orderName}" for ${brandName} needs some adjustments before it can be approved.

Reason for rejection:
${reason}

Please review the feedback above and make the necessary changes to your order. Once updated, you can resubmit it for approval.

Visit: ${process.env.VITE_APP_URL || 'https://spotgrid.com'}/orders

If you have any questions about the required changes, please don't hesitate to contact our support team.

Best regards,
The SpotGrid Team
  `
});

export const createMediaApprovedEmail = (mediaName: string, isciCode: string, brandName: string): EmailTemplate => ({
  subject: `✅ Media asset "${mediaName}" has been approved`,
  htmlBody: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Media Approved</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎬 Media Approved!</h1>
        </div>
        <div class="content">
          <h2>Your media is ready to use!</h2>
          <p>Your media asset "<strong>${mediaName}</strong>" (ISCI: ${isciCode}) for <strong>${brandName}</strong> has been approved and is now available for use in your advertising campaigns.</p>
          
          <p>You can now select this media when creating new orders or add it to existing campaigns.</p>
          
          <a href="${process.env.VITE_APP_URL || 'https://spotgrid.com'}/media" class="button">
            View Your Media Assets
          </a>
          
          <p>Ready to create a new campaign with this media? Start building your next advertising order today.</p>
          
          <p>Best regards,<br>The SpotGrid Team</p>
        </div>
        <div class="footer">
          <p>© 2024 SpotGrid. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,
  textBody: `
Media Approved!

Your media asset "${mediaName}" (ISCI: ${isciCode}) for ${brandName} has been approved and is now available for use in your advertising campaigns.

You can now select this media when creating new orders or add it to existing campaigns.

Visit: ${process.env.VITE_APP_URL || 'https://spotgrid.com'}/media

Ready to create a new campaign with this media? Start building your next advertising order today.

Best regards,
The SpotGrid Team
  `
});

export const createMediaRejectedEmail = (mediaName: string, isciCode: string, brandName: string): EmailTemplate => ({
  subject: `❌ Media asset "${mediaName}" requires attention`,
  htmlBody: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Media Requires Attention</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Media Requires Attention</h1>
        </div>
        <div class="content">
          <h2>Media asset needs review</h2>
          <p>Your media asset "<strong>${mediaName}</strong>" (ISCI: ${isciCode}) for <strong>${brandName}</strong> did not meet our quality standards and cannot be approved at this time.</p>
          
          <p>Common reasons for media rejection include:</p>
          <ul>
            <li>Technical quality issues (resolution, audio levels, etc.)</li>
            <li>Content that doesn't meet broadcast standards</li>
            <li>Missing or incorrect metadata</li>
            <li>File format compatibility issues</li>
          </ul>
          
          <p>Please review your media file and upload a corrected version when ready.</p>
          
          <a href="${process.env.VITE_APP_URL || 'https://spotgrid.com'}/media" class="button">
            Upload New Media
          </a>
          
          <p>If you need assistance or have questions about the rejection, please contact our support team.</p>
          
          <p>Best regards,<br>The SpotGrid Team</p>
        </div>
        <div class="footer">
          <p>© 2024 SpotGrid. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,
  textBody: `
Media Requires Attention

Your media asset "${mediaName}" (ISCI: ${isciCode}) for ${brandName} did not meet our quality standards and cannot be approved at this time.

Common reasons for media rejection include:
- Technical quality issues (resolution, audio levels, etc.)
- Content that doesn't meet broadcast standards
- Missing or incorrect metadata
- File format compatibility issues

Please review your media file and upload a corrected version when ready.

Visit: ${process.env.VITE_APP_URL || 'https://spotgrid.com'}/media

If you need assistance or have questions about the rejection, please contact our support team.

Best regards,
The SpotGrid Team
  `
});

export const createWelcomeEmail = (firstName: string, lastName: string, companyName: string): EmailTemplate => ({
  subject: `🎉 Welcome to SpotGrid, ${firstName}!`,
  htmlBody: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to SpotGrid</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .feature-list { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to SpotGrid!</h1>
        </div>
        <div class="content">
          <h2>Hi ${firstName},</h2>
          <p>Welcome to SpotGrid! We're excited to have ${companyName} join our platform for TV advertising campaign management.</p>
          
          <p>Your account has been successfully created and you're ready to start building powerful TV advertising campaigns.</p>
          
          <div class="feature-list">
            <h3>Here's what you can do with SpotGrid:</h3>
            <ul>
              <li>📺 Create and manage TV advertising campaigns</li>
              <li>📊 Track real-time performance analytics</li>
              <li>🎯 Advanced targeting and scheduling options</li>
              <li>💰 Budget management and optimization tools</li>
              <li>📈 Comprehensive reporting dashboard</li>
              <li>🎬 Media asset management and approval workflow</li>
            </ul>
          </div>
          
          <a href="${process.env.VITE_APP_URL || 'https://spotgrid.com'}/dashboard" class="button">
            Get Started Now
          </a>
          
          <p>Need help getting started? Check out our <a href="${process.env.VITE_APP_URL || 'https://spotgrid.com'}/help">help center</a> or contact our support team at <a href="mailto:support@spotgrid.com">support@spotgrid.com</a>.</p>
          
          <p>We're here to help you succeed with your TV advertising campaigns!</p>
          
          <p>Best regards,<br>The SpotGrid Team</p>
        </div>
        <div class="footer">
          <p>© 2024 SpotGrid. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,
  textBody: `
Welcome to SpotGrid!

Hi ${firstName},

Welcome to SpotGrid! We're excited to have ${companyName} join our platform for TV advertising campaign management.

Your account has been successfully created and you're ready to start building powerful TV advertising campaigns.

Here's what you can do with SpotGrid:
- Create and manage TV advertising campaigns
- Track real-time performance analytics
- Advanced targeting and scheduling options
- Budget management and optimization tools
- Comprehensive reporting dashboard
- Media asset management and approval workflow

Get started: ${process.env.VITE_APP_URL || 'https://spotgrid.com'}/dashboard

Need help getting started? Check out our help center or contact our support team at support@spotgrid.com.

We're here to help you succeed with your TV advertising campaigns!

Best regards,
The SpotGrid Team
  `
});