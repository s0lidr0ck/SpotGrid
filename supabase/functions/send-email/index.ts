import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { SESClient, SendEmailCommand } from 'npm:@aws-sdk/client-ses@3.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Initialize SES client
const sesClient = new SESClient({
  region: Deno.env.get('AWS_REGION') || 'us-east-1',
  credentials: {
    accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID')!,
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!,
  },
})

interface EmailRequest {
  to: string
  subject: string
  htmlBody: string
  textBody?: string
  from?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    const { to, subject, htmlBody, textBody, from }: EmailRequest = await req.json()

    // Validate required fields
    if (!to || !subject || !htmlBody) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: to, subject, htmlBody' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Use default from address if not provided
    const fromAddress = from || Deno.env.get('DEFAULT_FROM_EMAIL') || 'noreply@spotgrid.com'

    const sendEmailCommand = new SendEmailCommand({
      Destination: {
        ToAddresses: [to],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: htmlBody,
          },
          ...(textBody && {
            Text: {
              Charset: 'UTF-8',
              Data: textBody,
            },
          }),
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject,
        },
      },
      Source: fromAddress,
    })

    await sesClient.send(sendEmailCommand)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully' 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error: any) {
    console.error('Error sending email:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})