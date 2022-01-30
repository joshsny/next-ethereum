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

const domain = process.env.NEXT_PUBLIC_DOMAIN

const origin = process.env.NEXT_PUBLIC_BASE_URL

async function signInWithEthereum() {
  const signer = await connect()
  const message = await createSiweMessage(
    await signer.getAddress(),
    'Sign in with Ethereum to the app.'
  )

  const signature = await signer.signMessage(message)

  const verified = await sendForVerification(message, signature)

  const { ensName, ensAvatarUrl } = await getENSData(await signer.getAddress())

  return { verified, ensName, ensAvatarUrl }
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

  if (res.status !== 200) {
    alert('There was an issue verifying your signature. Please try again.')
    return false
  }

  const response = await res.json()

  if (!response.valid) {
    alert('There was an issue verifying your signature. Please try again.')
    return false
  }

  return true
}

async function getENSData(address: string) {
  const provider = new ethers.providers.EtherscanProvider()
  const ensName = await provider.lookupAddress(address)
  if (ensName) {
    const ensAvatarUrl = await provider.getAvatar(ensName)
    return { ensName, ensAvatarUrl }
  }
  return { ensName, ensAvatarUrl: null }
}

const LoginPage = () => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false)
  const [ensData, setENSData] = React.useState<{
    ensName: string | null
    ensAvatarUrl: string | null
  }>({
    ensName: null,
    ensAvatarUrl: null,
  })
  useEffect(() => {
    connect()
  }, [])

  return (
    <div className="flex h-screen items-center justify-center">
      {isLoggedIn && (
        <div className="text-center">
          <h1 className="text-3xl">
            Hi{ensData.ensName ? ` ${ensData.ensName}` : ''}, You are logged in
            with Ethereum!
          </h1>
        </div>
      )}
      {!isLoggedIn && (
        <button
          className="rounded-md bg-indigo-500 from-indigo-400 to-indigo-800 px-4 py-2 font-bold text-white"
          onClick={() =>
            signInWithEthereum().then((res) => {
              setIsLoggedIn(res.verified)

              if (res.verified) {
                setENSData({
                  ensName: res.ensName,
                  ensAvatarUrl: res.ensAvatarUrl,
                })
              }
            })
          }
        >
          Sign-In with Ethereum
        </button>
      )}
    </div>
  )
}

export default LoginPage
