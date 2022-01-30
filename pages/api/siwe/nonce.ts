import { NextApiRequest, NextApiResponse } from 'next'
import { generateNonce } from 'siwe'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    res.status(200).json({ nonce: generateNonce() })
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
  return
}

export default handler
