import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { uuid, type, content } = req.body;

  if (!uuid || !type || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (type !== 'message' && type !== 'command') {
    return res.status(400).json({ error: 'Invalid type' });
  }

  const queue = await kv.get(`queue:${uuid}`) || [];
  
  (queue as any[]).push({
    type,
    content,
    timestamp: Date.now()
  });

  await kv.set(`queue:${uuid}`, queue);

  return res.status(200).json({ success: true });
}
