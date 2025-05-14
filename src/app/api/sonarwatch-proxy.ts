// pages/api/sonarwatch-proxy.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address } = req.query;
  
  if (!address) {
    return res.status(400).json({ error: 'Missing wallet address' });
  }
  
  try {
    const response = await fetch(`http://localhost:4000/api/fetch-wallet?address=${address}`);
    const data = await response.json();
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error proxying to Sonarwatch:', error);
    res.status(500).json({ error: 'Failed to fetch from Sonarwatch' });
  }
}