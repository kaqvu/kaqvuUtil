import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const keys = await kv.keys('player:*');
  const players = [];

  for (const key of keys) {
    const player = await kv.get(key);
    if (player && typeof player === 'object') {
      const lastSeen = (player as any).lastSeen || 0;
      if (Date.now() - lastSeen < 30000) {
        players.push(player);
      }
    }
  }

  return res.status(200).json({ players });
}
