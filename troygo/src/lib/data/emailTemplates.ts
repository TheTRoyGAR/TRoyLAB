// TRoyGO™ Email Templates Data

export type EmailCategory =
  | 'inquiry'
  | 'quote'
  | 'confirmation'
  | 'follow_up'
  | 'reminder';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: EmailCategory;
  variables: string[];
}

export const emailTemplates: EmailTemplate[] = [
  // 1. Inquiry Acknowledgment
  {
    id: 'et001',
    name: 'Inquiry Acknowledgment',
    category: 'inquiry',
    subject: 'Thank you for your inquiry, {{firstName}}! 🌍',
    variables: ['{{firstName}}', '{{destination}}', '{{agentName}}', '{{responseTime}}'],
    body: `<div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; color: #0A1628;">
  <div style="background: linear-gradient(135deg, #0A1628 0%, #152D55 100%); padding: 40px; text-align: center;">
    <h1 style="color: #FFD700; font-size: 28px; margin: 0;">TRoyGO™</h1>
    <p style="color: #00B4D8; margin: 8px 0 0;">Your World, Your Journey</p>
  </div>
  <div style="padding: 40px; background: #ffffff; border: 1px solid #e5e7eb;">
    <p style="font-size: 18px; font-weight: 600;">Hi {{firstName}},</p>
    <p>Thank you so much for reaching out to TRoyGO™! We've received your inquiry about <strong>{{destination}}</strong> and we're absolutely thrilled to help you plan your perfect journey.</p>
    <p>Your request has been personally received by our team and <strong>{{agentName}}</strong> will be in touch with you within <strong>{{responseTime}}</strong> with a tailored response.</p>
    <div style="background: #f0f9ff; border-left: 4px solid #00B4D8; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; font-weight: 600; color: #0A1628;">What happens next?</p>
      <ul style="margin: 8px 0 0; padding-left: 20px; color: #374151;">
        <li>Our expert will review your travel preferences</li>
        <li>We'll craft a personalized itinerary for you</li>
        <li>You'll receive a detailed quote within {{responseTime}}</li>
      </ul>
    </div>
    <p>In the meantime, feel free to browse our <a href="https://troygo.com/packages" style="color: #00B4D8;">featured packages</a> for inspiration.</p>
    <p style="margin-top: 32px;">Warmly,<br/><strong>{{agentName}}</strong><br/><span style="color: #6b7280;">TRoyGO™ Travel Specialist</span></p>
  </div>
  <div style="background: #0A1628; padding: 24px; text-align: center;">
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2026 TRoyGO™ by TRoy Travel Agency™ | <a href="#" style="color: #00B4D8;">Unsubscribe</a></p>
  </div>
</div>`,
  },

  // 2. Quote Ready
  {
    id: 'et002',
    name: 'Quote Ready',
    category: 'quote',
    subject: 'Your personalized {{destination}} quote is ready, {{firstName}}!',
    variables: ['{{firstName}}', '{{destination}}', '{{quoteAmount}}', '{{departureDate}}', '{{expiryDate}}', '{{agentName}}', '{{packageName}}'],
    body: `<div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; color: #0A1628;">
  <div style="background: linear-gradient(135deg, #0A1628 0%, #152D55 100%); padding: 40px; text-align: center;">
    <h1 style="color: #FFD700; font-size: 28px; margin: 0;">TRoyGO™</h1>
    <p style="color: #00B4D8; margin: 8px 0 0;">Your Personalized Travel Quote</p>
  </div>
  <div style="padding: 40px; background: #ffffff; border: 1px solid #e5e7eb;">
    <p style="font-size: 18px; font-weight: 600;">Hi {{firstName}},</p>
    <p>Wonderful news — your personalized quote for <strong>{{packageName}}</strong> to <strong>{{destination}}</strong> is ready!</p>
    <div style="background: linear-gradient(135deg, #0A1628, #152D55); border-radius: 12px; padding: 32px; text-align: center; margin: 24px 0;">
      <p style="color: #9ca3af; margin: 0 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Total Investment</p>
      <p style="color: #FFD700; font-size: 42px; font-weight: 700; margin: 0;">{{quoteAmount}}</p>
      <p style="color: #00B4D8; margin: 8px 0 0;">Departure: {{departureDate}}</p>
    </div>
    <p>This exclusive quote includes everything we discussed — flights, accommodations, transfers, and curated experiences tailored just for you.</p>
    <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="margin: 0; color: #c2410c; font-weight: 600; font-size: 14px;">⏰ Quote expires: {{expiryDate}}</p>
      <p style="margin: 4px 0 0; color: #7c3aed; font-size: 13px;">Prices and availability are subject to change after this date.</p>
    </div>
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://troygo.com/booking" style="background: #FFD700; color: #0A1628; font-weight: 700; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-size: 16px; display: inline-block;">Accept Quote & Book Now</a>
    </div>
    <p>Questions? Reply to this email or call us directly. I'm here to make this dream trip a reality.</p>
    <p style="margin-top: 32px;">With excitement,<br/><strong>{{agentName}}</strong><br/><span style="color: #6b7280;">TRoyGO™ Travel Specialist</span></p>
  </div>
  <div style="background: #0A1628; padding: 24px; text-align: center;">
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2026 TRoyGO™ by TRoy Travel Agency™ | <a href="#" style="color: #00B4D8;">Unsubscribe</a></p>
  </div>
</div>`,
  },

  // 3. Booking Confirmation
  {
    id: 'et003',
    name: 'Booking Confirmation',
    category: 'confirmation',
    subject: '🎉 Your {{destination}} booking is confirmed! Booking #{{bookingId}}',
    variables: ['{{firstName}}', '{{destination}}', '{{departureDate}}', '{{returnDate}}', '{{bookingId}}', '{{packageName}}', '{{travelers}}', '{{totalAmount}}', '{{agentName}}'],
    body: `<div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; color: #0A1628;">
  <div style="background: linear-gradient(135deg, #0A1628 0%, #152D55 100%); padding: 40px; text-align: center;">
    <h1 style="color: #FFD700; font-size: 28px; margin: 0;">TRoyGO™</h1>
    <p style="color: #00B4D8; margin: 8px 0 0;">Booking Confirmed!</p>
  </div>
  <div style="background: #f0fdf4; padding: 24px; text-align: center; border-bottom: 2px solid #22c55e;">
    <p style="color: #16a34a; font-size: 24px; font-weight: 700; margin: 0;">✅ You're Going to {{destination}}!</p>
    <p style="color: #374151; margin: 8px 0 0;">Booking Reference: <strong style="color: #0A1628;">#{{bookingId}}</strong></p>
  </div>
  <div style="padding: 40px; background: #ffffff; border: 1px solid #e5e7eb;">
    <p style="font-size: 18px; font-weight: 600;">Dear {{firstName}},</p>
    <p>It's officially official! Your booking for <strong>{{packageName}}</strong> has been confirmed. Get ready for an incredible adventure!</p>
    <table style="width: 100%; border-collapse: collapse; margin: 24px 0; border-radius: 8px; overflow: hidden;">
      <tr style="background: #0A1628;">
        <th colspan="2" style="color: #FFD700; padding: 12px 16px; text-align: left; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Booking Summary</th>
      </tr>
      <tr style="background: #f9fafb;"><td style="padding: 12px 16px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Package</td><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">{{packageName}}</td></tr>
      <tr><td style="padding: 12px 16px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Destination</td><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">{{destination}}</td></tr>
      <tr style="background: #f9fafb;"><td style="padding: 12px 16px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Departure</td><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">{{departureDate}}</td></tr>
      <tr><td style="padding: 12px 16px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Return</td><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">{{returnDate}}</td></tr>
      <tr style="background: #f9fafb;"><td style="padding: 12px 16px; font-weight: 600; border-bottom: 1px solid #e5e7eb;">Travelers</td><td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">{{travelers}}</td></tr>
      <tr style="background: #fefce8;"><td style="padding: 12px 16px; font-weight: 700; color: #0A1628;">Total Amount</td><td style="padding: 12px 16px; font-weight: 700; color: #FFD700; font-size: 18px;">{{totalAmount}}</td></tr>
    </table>
    <p>Your detailed itinerary, travel documents, and pre-trip guide will be sent separately. Stay tuned!</p>
    <p style="margin-top: 32px;">Can't wait for you to have an amazing time,<br/><strong>{{agentName}}</strong><br/><span style="color: #6b7280;">TRoyGO™ Travel Specialist</span></p>
  </div>
  <div style="background: #0A1628; padding: 24px; text-align: center;">
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2026 TRoyGO™ by TRoy Travel Agency™ | <a href="#" style="color: #00B4D8;">Unsubscribe</a></p>
  </div>
</div>`,
  },

  // 4. Payment Reminder
  {
    id: 'et004',
    name: 'Payment Reminder',
    category: 'reminder',
    subject: 'Action Required: Payment due for your {{destination}} trip, {{firstName}}',
    variables: ['{{firstName}}', '{{destination}}', '{{dueDate}}', '{{amountDue}}', '{{bookingId}}', '{{agentName}}'],
    body: `<div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; color: #0A1628;">
  <div style="background: linear-gradient(135deg, #0A1628 0%, #152D55 100%); padding: 40px; text-align: center;">
    <h1 style="color: #FFD700; font-size: 28px; margin: 0;">TRoyGO™</h1>
    <p style="color: #00B4D8; margin: 8px 0 0;">Payment Reminder</p>
  </div>
  <div style="background: #fff7ed; padding: 20px; text-align: center; border-bottom: 2px solid #f97316;">
    <p style="color: #ea580c; font-size: 18px; font-weight: 700; margin: 0;">⏰ Payment Due: {{dueDate}}</p>
  </div>
  <div style="padding: 40px; background: #ffffff; border: 1px solid #e5e7eb;">
    <p style="font-size: 18px; font-weight: 600;">Hi {{firstName}},</p>
    <p>This is a friendly reminder that a payment of <strong style="color: #0A1628; font-size: 20px;">{{amountDue}}</strong> is due for your upcoming <strong>{{destination}}</strong> trip (Booking #{{bookingId}}).</p>
    <p>Please complete your payment by <strong>{{dueDate}}</strong> to secure your booking and avoid any cancellation.</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://troygo.com/payment" style="background: #0A1628; color: #FFD700; font-weight: 700; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-size: 16px; display: inline-block;">Complete Payment Now</a>
    </div>
    <p>If you have any questions about your payment or need to discuss alternatives, please don't hesitate to reach out to me directly.</p>
    <p style="margin-top: 32px;">Best regards,<br/><strong>{{agentName}}</strong><br/><span style="color: #6b7280;">TRoyGO™ Travel Specialist</span></p>
  </div>
  <div style="background: #0A1628; padding: 24px; text-align: center;">
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2026 TRoyGO™ by TRoy Travel Agency™ | <a href="#" style="color: #00B4D8;">Unsubscribe</a></p>
  </div>
</div>`,
  },

  // 5. Pre-Trip Checklist
  {
    id: 'et005',
    name: 'Pre-Trip Checklist',
    category: 'reminder',
    subject: '7 Days to Go, {{firstName}}! Your {{destination}} Pre-Trip Checklist',
    variables: ['{{firstName}}', '{{destination}}', '{{departureDate}}', '{{flightDetails}}', '{{hotelName}}', '{{agentName}}', '{{emergencyContact}}'],
    body: `<div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; color: #0A1628;">
  <div style="background: linear-gradient(135deg, #0A1628 0%, #152D55 100%); padding: 40px; text-align: center;">
    <h1 style="color: #FFD700; font-size: 28px; margin: 0;">TRoyGO™</h1>
    <p style="color: #00B4D8; margin: 8px 0 0;">7 Days to Departure!</p>
  </div>
  <div style="background: #f0fdf4; padding: 20px; text-align: center; border-bottom: 2px solid #22c55e;">
    <p style="color: #16a34a; font-size: 22px; font-weight: 700; margin: 0;">🌟 {{destination}} is Almost Here, {{firstName}}!</p>
    <p style="margin: 8px 0 0; color: #374151;">Departure: <strong>{{departureDate}}</strong></p>
  </div>
  <div style="padding: 40px; background: #ffffff; border: 1px solid #e5e7eb;">
    <p>With just 7 days to go, here's your essential pre-trip checklist to make sure everything is perfect:</p>
    <div style="margin: 24px 0;">
      <h3 style="color: #0A1628; border-bottom: 2px solid #00B4D8; padding-bottom: 8px;">📋 Documents & Travel Essentials</h3>
      <ul style="list-style: none; padding: 0;">
        <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">☐ Passport valid for 6+ months beyond return date</li>
        <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">☐ Visa documents (if required)</li>
        <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">☐ Travel insurance documents printed</li>
        <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">☐ Flight tickets: {{flightDetails}}</li>
        <li style="padding: 8px 0;">☐ Hotel confirmation: {{hotelName}}</li>
      </ul>
    </div>
    <div style="margin: 24px 0;">
      <h3 style="color: #0A1628; border-bottom: 2px solid #00B4D8; padding-bottom: 8px;">💳 Money & Communications</h3>
      <ul style="list-style: none; padding: 0;">
        <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">☐ Notify your bank of travel dates</li>
        <li style="padding: 8px 0; border-bottom: 1px solid #f3f4f6;">☐ Local currency or international cards ready</li>
        <li style="padding: 8px 0;">☐ Download offline maps for {{destination}}</li>
      </ul>
    </div>
    <div style="background: #0A1628; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
      <p style="color: #9ca3af; font-size: 13px; margin: 0 0 4px;">24/7 Emergency Contact</p>
      <p style="color: #FFD700; font-size: 18px; font-weight: 700; margin: 0;">{{emergencyContact}}</p>
    </div>
    <p>Have an absolutely wonderful trip, {{firstName}}! We can't wait to hear about your adventure.</p>
    <p style="margin-top: 32px;">Bon Voyage! ✈️<br/><strong>{{agentName}}</strong><br/><span style="color: #6b7280;">TRoyGO™ Travel Specialist</span></p>
  </div>
  <div style="background: #0A1628; padding: 24px; text-align: center;">
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2026 TRoyGO™ by TRoy Travel Agency™ | <a href="#" style="color: #00B4D8;">Unsubscribe</a></p>
  </div>
</div>`,
  },

  // 6. Thank You (Post-Trip)
  {
    id: 'et006',
    name: 'Post-Trip Thank You',
    category: 'follow_up',
    subject: 'Welcome home, {{firstName}}! How was {{destination}}? 🌍',
    variables: ['{{firstName}}', '{{destination}}', '{{agentName}}', '{{nextDestination}}'],
    body: `<div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; color: #0A1628;">
  <div style="background: linear-gradient(135deg, #0A1628 0%, #152D55 100%); padding: 40px; text-align: center;">
    <h1 style="color: #FFD700; font-size: 28px; margin: 0;">TRoyGO™</h1>
    <p style="color: #00B4D8; margin: 8px 0 0;">Welcome Home!</p>
  </div>
  <div style="padding: 40px; background: #ffffff; border: 1px solid #e5e7eb;">
    <p style="font-size: 18px; font-weight: 600;">Welcome back, {{firstName}}! 🎉</p>
    <p>We hope your {{destination}} adventure was everything you dreamed of and more. It was our absolute pleasure to be part of your journey.</p>
    <p>We'd love to hear about your experience — the highlights, the memories, and anything we can improve to make your next trip even more incredible.</p>
    <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
      <p style="font-weight: 600; color: #0A1628; margin: 0 0 8px;">Already dreaming of your next adventure?</p>
      <p style="color: #6b7280; margin: 0 0 16px;">How about <strong>{{nextDestination}}</strong>? We have some amazing packages just for you.</p>
      <a href="https://troygo.com/packages" style="background: #00B4D8; color: #ffffff; font-weight: 600; padding: 12px 32px; border-radius: 8px; text-decoration: none; display: inline-block;">Explore Next Adventure</a>
    </div>
    <p style="margin-top: 32px;">Until next time,<br/><strong>{{agentName}}</strong><br/><span style="color: #6b7280;">TRoyGO™ Travel Specialist</span></p>
  </div>
  <div style="background: #0A1628; padding: 24px; text-align: center;">
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2026 TRoyGO™ by TRoy Travel Agency™ | <a href="#" style="color: #00B4D8;">Unsubscribe</a></p>
  </div>
</div>`,
  },

  // 7. Review Request
  {
    id: 'et007',
    name: 'Review Request',
    category: 'follow_up',
    subject: '⭐ {{firstName}}, would you share your {{destination}} experience?',
    variables: ['{{firstName}}', '{{destination}}', '{{agentName}}', '{{reviewLink}}'],
    body: `<div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; color: #0A1628;">
  <div style="background: linear-gradient(135deg, #0A1628 0%, #152D55 100%); padding: 40px; text-align: center;">
    <h1 style="color: #FFD700; font-size: 28px; margin: 0;">TRoyGO™</h1>
    <p style="color: #00B4D8; margin: 8px 0 0;">Share Your Story</p>
  </div>
  <div style="padding: 40px; background: #ffffff; border: 1px solid #e5e7eb; text-align: center;">
    <div style="font-size: 48px; margin-bottom: 16px;">⭐⭐⭐⭐⭐</div>
    <p style="font-size: 18px; font-weight: 600;">Hi {{firstName}},</p>
    <p>We hope your {{destination}} trip created memories that will last a lifetime! Your experience matters deeply to us and to future travelers.</p>
    <p>Would you take 2 minutes to share your honest review? Your words help other travelers discover their perfect journey.</p>
    <div style="margin: 32px 0;">
      <a href="{{reviewLink}}" style="background: #FFD700; color: #0A1628; font-weight: 700; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-size: 16px; display: inline-block;">Leave a Review</a>
    </div>
    <p style="color: #6b7280; font-size: 14px;">Takes less than 2 minutes • Your feedback shapes future adventures</p>
    <p style="margin-top: 32px;">With gratitude,<br/><strong>{{agentName}}</strong><br/><span style="color: #6b7280;">TRoyGO™ Travel Specialist</span></p>
  </div>
  <div style="background: #0A1628; padding: 24px; text-align: center;">
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2026 TRoyGO™ by TRoy Travel Agency™ | <a href="#" style="color: #00B4D8;">Unsubscribe</a></p>
  </div>
</div>`,
  },

  // 8. Newsletter
  {
    id: 'et008',
    name: 'Monthly Newsletter',
    category: 'follow_up',
    subject: '🌍 TRoyGO™ Travel Digest | {{month}} Deals & Destinations',
    variables: ['{{firstName}}', '{{month}}', '{{deal1Destination}}', '{{deal1Price}}', '{{deal2Destination}}', '{{deal2Price}}', '{{agentName}}'],
    body: `<div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; color: #0A1628;">
  <div style="background: linear-gradient(135deg, #0A1628 0%, #152D55 100%); padding: 40px; text-align: center;">
    <h1 style="color: #FFD700; font-size: 28px; margin: 0;">TRoyGO™</h1>
    <p style="color: #00B4D8; margin: 8px 0 0;">{{month}} Travel Digest</p>
  </div>
  <div style="padding: 40px; background: #ffffff; border: 1px solid #e5e7eb;">
    <p style="font-size: 18px; font-weight: 600;">Hello {{firstName}},</p>
    <p>The world is calling — and this month, we've found some extraordinary opportunities to answer. Here's what's hot in {{month}}:</p>
    <h3 style="color: #0A1628; border-bottom: 2px solid #FFD700; padding-bottom: 8px; margin-top: 32px;">🔥 Featured Deals This Month</h3>
    <div style="background: linear-gradient(135deg, #0A1628, #152D55); border-radius: 12px; padding: 24px; margin: 16px 0; color: #fff;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <p style="color: #00B4D8; margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Featured Destination</p>
          <p style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0;">{{deal1Destination}}</p>
        </div>
        <div style="text-align: right;">
          <p style="color: #9ca3af; margin: 0 0 4px; font-size: 12px;">From</p>
          <p style="color: #FFD700; font-size: 28px; font-weight: 700; margin: 0;">{{deal1Price}}</p>
        </div>
      </div>
      <a href="https://troygo.com/packages" style="display: block; background: #FFD700; color: #0A1628; font-weight: 700; padding: 10px; border-radius: 6px; text-decoration: none; text-align: center; margin-top: 16px;">View Package</a>
    </div>
    <div style="background: linear-gradient(135deg, #0A1628, #152D55); border-radius: 12px; padding: 24px; margin: 16px 0; color: #fff;">
      <div>
        <p style="color: #00B4D8; margin: 0 0 4px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Also Trending</p>
        <p style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0;">{{deal2Destination}}</p>
        <p style="color: #FFD700; font-size: 24px; font-weight: 700; margin: 8px 0 0;">{{deal2Price}}</p>
      </div>
      <a href="https://troygo.com/packages" style="display: block; background: #00B4D8; color: #ffffff; font-weight: 700; padding: 10px; border-radius: 6px; text-decoration: none; text-align: center; margin-top: 16px;">Explore Now</a>
    </div>
    <div style="text-align: center; margin: 32px 0;">
      <a href="https://troygo.com/packages" style="background: #0A1628; color: #FFD700; font-weight: 700; padding: 14px 36px; border-radius: 8px; text-decoration: none; display: inline-block;">View All {{month}} Deals</a>
    </div>
    <p style="margin-top: 32px; color: #6b7280; font-size: 14px;">Safe travels and big dreams,<br/><strong>{{agentName}}</strong><br/><span>TRoyGO™ Travel Specialist</span></p>
  </div>
  <div style="background: #0A1628; padding: 24px; text-align: center;">
    <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2026 TRoyGO™ by TRoy Travel Agency™ | <a href="#" style="color: #00B4D8;">Unsubscribe</a> | <a href="#" style="color: #00B4D8;">Preferences</a></p>
  </div>
</div>`,
  },
];

// Helper: get template by id
export function getTemplateById(id: string): EmailTemplate | undefined {
  return emailTemplates.find((t) => t.id === id);
}

// Helper: get templates by category
export function getTemplatesByCategory(category: EmailCategory): EmailTemplate[] {
  return emailTemplates.filter((t) => t.category === category);
}
