import { ethers } from 'ethers'
import React, { useEffect } from 'react'
import { SiweMessage } from 'siwe'
import Web3Modal from 'web3modal'

const connect = async () => {
  const providerOptions = {
    /* See Provider Options Section */
  }

  const web3Modal = new Web3Modal({
    network: 'mainnet', // optional
    cacheProvider: true, // optional
    providerOptions, // required
  })

  const instance = await web3Modal.connect()
  const provider = new ethers.providers.Web3Provider(instance)
  const signer = provider.getSigner()

  return signer
}

const domain = 'localhost'

const origin = `${process.env.NEXT_PUBLIC_BASE_URL}/login`

async function signInWithEthereum() {
  const signer = await connect()
  const message = await createSiweMessage(
    await signer.getAddress(),
    'Sign in with Ethereum to the app.'
  )

  const signature = await signer.signMessage(message)

  await sendForVerification(message, signature)
}

async function createSiweMessage(address: string, statement: string) {
  const res = await fetch(`/api/siwe/nonce`).then((res) => res.json())
  const message = new SiweMessage({
    domain,
    address,
    statement,
    uri: origin,
    version: '1',
    chainId: '1',
    nonce: res.nonce,
  })
  return message.prepareMessage()
}

async function sendForVerification(message: string, signature: string) {
  const res = await fetch('/api/siwe/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, signature }),
  })
  console.log('Is Valid? ', await res.text())
}

const LoginPage = () => {
  const providerOptions = {
    /* See Provider Options Section */
  }

  useEffect(() => {
    connect()
  }, [])

  return <div onClick={() => signInWithEthereum()}>Sign-In with Ethereum</div>
}

export default LoginPage
