import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, template, data } = await req.json()

    // Email templates
    const templates = {
      booking_confirmation: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6, #22c55e); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SportBook</h1>
            <p style="color: white; margin: 5px 0;">Booking Confirmation</p>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b;">🎉 Your booking is confirmed!</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #3b82f6; margin-top: 0;">Booking Details</h3>
              <p><strong>Ground:</strong> ${data.groundName}</p>
              <p><strong>Date:</strong> ${data.date}</p>
              <p><strong>Time:</strong> ${data.time}</p>
              <p><strong>Duration:</strong> ${data.duration} hours</p>
              <p><strong>Amount Paid:</strong> PKR ${data.amount}</p>
              <p><strong>Booking ID:</strong> ${data.id}</p>
            </div>
            
            <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #1e40af; margin-top: 0;">Important Information</h4>
              <ul style="color: #1e40af;">
                <li>Please arrive 10 minutes before your booking time</li>
                <li>Bring valid ID for verification</li>
                <li>Cancellations must be made 2 hours in advance</li>
                <li>Contact us at +92-XXX-XXXXXXX for any queries</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://sportbook.com/my-bookings" 
                 style="background: linear-gradient(135deg, #3b82f6, #22c55e); 
                        color: white; padding: 12px 24px; text-decoration: none; 
                        border-radius: 6px; display: inline-block;">
                View My Bookings
              </a>
            </div>
          </div>
          
          <div style="background: #1e293b; padding: 20px; text-align: center; color: white;">
            <p>Thank you for choosing SportBook!</p>
            <p style="font-size: 12px; opacity: 0.8;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
      
      promotional_offer: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b, #ef4444); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🔥 Special Offer!</h1>
            <p style="color: white; margin: 5px 0;">Limited Time Deal</p>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b;">Don't miss out on this amazing deal!</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h3 style="color: #ef4444; font-size: 36px; margin: 0;">${data.discount}% OFF</h3>
              <p style="color: #64748b;">on your next booking</p>
              <p style="color: #1e293b; font-size: 18px; margin: 20px 0;">
                Use code: <strong style="color: #ef4444;">${data.promoCode}</strong>
              </p>
              <p style="color: #64748b;">Valid until ${data.validUntil}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://sportbook.com/booking" 
                 style="background: linear-gradient(135deg, #ef4444, #f59e0b); 
                        color: white; padding: 15px 30px; text-decoration: none; 
                        border-radius: 6px; display: inline-block; font-size: 18px;">
                Book Now & Save!
              </a>
            </div>
          </div>
        </div>
      `
    }

    // Simulate email sending (replace with actual email service like SendGrid, Mailgun, etc.)
    const emailContent = templates[template as keyof typeof templates] || `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>${subject}</h2>
        <p>Email content would be rendered here.</p>
      </div>
    `

    // In production, you would use a real email service here
    console.log(`Sending email to: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`Template: ${template}`)
    console.log(`Data:`, data)

    // Simulate successful email sending
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        emailId: `email_${Date.now()}`
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 400 
      }
    )
  }
})