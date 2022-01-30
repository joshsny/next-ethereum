import { NextApiRequest, NextApiResponse } from 'next'
import { generateNonce, SiweMessage } from 'siwe'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { message, signature } = req.body
    const siweMessage = new SiweMessage(message)
    try {
      await siweMessage.validate(signature)
      res.send(true)
    } catch {
      res.send(false)
    }
    return
  }

  res.status(405).json({ error: 'Method not allowed' })
}

export default handler
