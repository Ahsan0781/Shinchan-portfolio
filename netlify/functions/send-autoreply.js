// Netlify serverless function: sends a branded auto-reply email
// to whoever just submitted the contact form.
//
// SETUP REQUIRED (see README-BACKEND.md for full steps):
// 1. Create a free account at https://resend.com
// 2. Get an API key from the Resend dashboard
// 3. In Netlify: Site settings -> Environment variables, add:
//      RESEND_API_KEY = your_resend_api_key
//      FROM_EMAIL     = "Sheikh Ahsan <hello@yourdomain.com>"
//    (Until you verify your own domain in Resend, you can use
//     "onboarding@resend.dev" as a temporary FROM_EMAIL for testing.)

exports.handler = async (event) => {
  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let name, email, projectType;
  try {
    const data = JSON.parse(event.body || '{}');
    name = (data.name || '').trim();
    email = (data.email || '').trim();
    projectType = (data.project_type || '').trim();
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing recipient email' }) };
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const FROM_EMAIL = process.env.FROM_EMAIL || 'Sheikh Ahsan <onboarding@resend.dev>';

  if (!RESEND_API_KEY) {
    // Fails quietly from the visitor's point of view (their form still
    // submitted successfully via Netlify Forms) but logs clearly for you.
    console.error('RESEND_API_KEY is not set in Netlify environment variables.');
    return { statusCode: 500, body: JSON.stringify({ error: 'Email service not configured' }) };
  }

  const firstName = name ? name.split(' ')[0] : 'there';

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#0a0a0c;color:#f5f5f7;border-radius:12px;">
    <p style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#8b8bf5;margin:0 0 16px;">Sheikh Ahsan &mdash; Design &amp; Documents</p>
    <h2 style="font-size:20px;margin:0 0 16px;color:#ffffff;">Thanks for reaching out, ${firstName}.</h2>
    <p style="font-size:14.5px;line-height:1.6;color:#c8c8cf;margin:0 0 12px;">
      I've received your message${projectType ? ` about <strong>${projectType}</strong>` : ''} and will personally reply within 24 hours with next steps.
    </p>
    <p style="font-size:14.5px;line-height:1.6;color:#c8c8cf;margin:0 0 24px;">
      In the meantime, feel free to reply directly to this email if you'd like to add any details about your project, timeline, or budget.
    </p>
    <p style="font-size:14px;color:#a1a1aa;margin:0;">&mdash; Sheikh Ahsan</p>
  </div>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject: "Thanks for reaching out — I'll be in touch soon",
        html
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend API error:', errorText);
      return { statusCode: 502, body: JSON.stringify({ error: 'Failed to send email' }) };
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error('Send auto-reply error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
