import { supabase } from './supabase';
import { 
  createOrderApprovedEmail, 
  createOrderRejectedEmail, 
  createMediaApprovedEmail, 
  createMediaRejectedEmail, 
  createWelcomeEmail,
  EmailTemplate 
} from './emailTemplates';

interface SendEmailParams {
  to: string;
  template: EmailTemplate;
  from?: string;
}

export const sendEmail = async ({ to, template, from }: SendEmailParams): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      console.error('No authentication session found');
      return false;
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject: template.subject,
        htmlBody: template.htmlBody,
        textBody: template.textBody,
        from,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Email sending failed:', errorData);
      return false;
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Convenience functions for specific email types
export const sendOrderApprovedEmail = async (
  userEmail: string, 
  orderName: string, 
  brandName: string
): Promise<boolean> => {
  const template = createOrderApprovedEmail(orderName, brandName);
  return sendEmail({ to: userEmail, template });
};

export const sendOrderRejectedEmail = async (
  userEmail: string, 
  orderName: string, 
  brandName: string, 
  reason: string
): Promise<boolean> => {
  const template = createOrderRejectedEmail(orderName, brandName, reason);
  return sendEmail({ to: userEmail, template });
};

export const sendMediaApprovedEmail = async (
  userEmail: string, 
  mediaName: string, 
  isciCode: string, 
  brandName: string
): Promise<boolean> => {
  const template = createMediaApprovedEmail(mediaName, isciCode, brandName);
  return sendEmail({ to: userEmail, template });
};

export const sendMediaRejectedEmail = async (
  userEmail: string, 
  mediaName: string, 
  isciCode: string, 
  brandName: string
): Promise<boolean> => {
  const template = createMediaRejectedEmail(mediaName, isciCode, brandName);
  return sendEmail({ to: userEmail, template });
};

export const sendWelcomeEmail = async (
  userEmail: string, 
  firstName: string, 
  lastName: string, 
  companyName: string
): Promise<boolean> => {
  const template = createWelcomeEmail(firstName, lastName, companyName);
  return sendEmail({ to: userEmail, template });
};