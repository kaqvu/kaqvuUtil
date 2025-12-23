import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { uuid, token } = req.query;

  if (!uuid || !token) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const player = await kv.get(`player:${uuid}`);
  
  if (!player || (player as any).token !== token) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  await kv.set(`player:${uuid}`, {
    ...(player as any),
    lastSeen: Date.now()
  });

  const queue = await kv.get(`queue:${uuid}`) || [];
  await kv.set(`queue:${uuid}`, []);

  return res.status(200).json({ commands: queue });
}
