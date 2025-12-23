import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { uuid, nick, token } = req.body;

  if (!uuid || !nick || !token) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  await kv.set(`player:${uuid}`, {
    uuid,
    nick,
    token,
    lastSeen: Date.now()
  });

  await kv.set(`queue:${uuid}`, []);

  return res.status(200).json({ success: true });
}
