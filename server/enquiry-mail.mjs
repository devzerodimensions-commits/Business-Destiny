const labels = {
  name: 'Name',
  phone: 'Contact number',
  email: 'Email',
  birthDate: 'Date of birth',
  birthPlace: 'Birth place',
  birthTime: 'Birth time',
  company: 'Company',
  industry: 'Industry',
  city: 'City',
  service: 'Service',
  question: 'Message',
};

// The destination and credentials are server-owned, never taken from form input.
export async function sendEnquiryMail(env, id, data, fetcher = fetch) {
  if (!env.RESEND_API_KEY || !env.ENQUIRY_FROM_EMAIL) return 'Not configured';
  try {
    const response = await fetcher('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `enquiry/${id}`,
      },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        from: env.ENQUIRY_FROM_EMAIL,
        to: [env.ENQUIRY_TO_EMAIL || 'dev01.zerodimensions@gmail.com'],
        subject: 'New Business Destiny consultation enquiry',
        ...(data.email ? { reply_to: data.email } : {}),
        text:
          `Consultation enquiry ${id}\n\n` +
          Object.entries(labels)
            .map(([key, label]) => `${label}: ${data[key] || 'Not provided'}`)
            .join('\n\n'),
      }),
    });
    if (!response.ok) return 'Delivery failed';
    const result = await response.json();
    return typeof result.id === 'string'
      ? 'Accepted by email provider'
      : 'Delivery failed';
  } catch {
    return 'Delivery failed';
  }
}
