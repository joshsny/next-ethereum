import { NextApiRequest, NextApiResponse } from 'next'
import { SiweMessage } from 'siwe'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { message, signature } = req.body
    const siweMessage = new SiweMessage(message)
    try {
      await siweMessage.validate(signature)
      res.status(200).json({ valid: true })
      return
    } catch {
      res.status(200).json({ valid: false })
      return
    }
  }

  res.status(405).json({ error: 'Method not allowed' })
  return
}

export default handler
