import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sendEnquiryMail } from './enquiry-mail.mjs';

await test('Enquiry mail uses a fixed recipient, safe plain text and provider idempotency', async () => {
  const env = {
    RESEND_API_KEY: 'test-key',
    ENQUIRY_FROM_EMAIL: 'Site <site@example.com>',
  };
  let payload;
  const result = await sendEnquiryMail(
    env,
    'test-id',
    {
      name: '<script>visitor</script>',
      phone: '123456789',
      question: 'Test message',
      birthPlace: 'Surat',
      to: 'attacker@example.com',
    },
    async (url, options) => {
      assert.equal(url, 'https://api.resend.com/emails');
      assert.equal(options.headers['Idempotency-Key'], 'enquiry/test-id');
      payload = JSON.parse(options.body);
      return Response.json({ id: 'email-id' });
    },
  );
  assert.equal(result, 'Accepted by email provider');
  assert.deepEqual(payload.to, ['dev01.zerodimensions@gmail.com']);
  assert.equal(payload.html, undefined);
  assert.match(payload.text, /Birth place: Surat/);
  assert.equal(await sendEnquiryMail({}, 'id', {}), 'Not configured');
  assert.equal(
    await sendEnquiryMail(
      env,
      'id',
      {},
      async () => new Response('', { status: 403 }),
    ),
    'Delivery failed',
  );
  assert.equal(
    await sendEnquiryMail(env, 'id', {}, async () => {
      throw Error('timeout');
    }),
    'Delivery failed',
  );
});
