import Head from 'next/head'
import Image from 'next/image'
import{ useState, useEffect, useRef} from 'react'
import {providers, Contract, ethers, Signer} from 'ethers'
import Web3Modal from 'web3modal';
import {contractAddress, abi} from '../constants'
import { get } from 'http';

const Home = () => {
  const [hasMetamask, setHasMetamask] = useState(false)
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [joindedWhitelist, setJoinedWhitelist] = useState(false)
  const [loading, setLoading] = useState(false)
  const [whitelistCount, setWhitelistCount] = useState(0);

   useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setHasMetamask(true);
    }
  },[]);

  const web3modalRef = useRef();

  const getProviderOrSigner = async(needSigner = false) => {
    const provider = await web3modalRef.current.connect()
    const web3Provider = new providers.Web3Provider(provider)

    if(needSigner) {
      const Signer = web3Provider.getSigner()
      return Signer;
    }
  }

  const addAddressToWhitelist = async() => {
    try {
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(contractAddress, abi, signer)
      
      const tx = await whitelistContract.whitelistAddress()
      setLoading(true)
      await tx.wait()
      setLoading(false) 
      
      //await getWhitelistedNumber()
      setJoinedWhitelist(true);
    } catch (error) {
      console.log(error)
    }
  }

  const getWhitelistedNumber = async() => {
    try {
      const provider = await getProviderOrSigner()
      const whitelistContract = new Contract(contractAddress, abi, provider)

      const addressCount = await whitelistContract.numAddressesWhitelisted();
      setWhitelistCount(addressCount);      
    } catch (error) {
      console.log(error)
    }
  }

  const checkIfAddressIsWhitelisted = async() => {
    try {
    const signer = await getProviderOrSigner(true)
    const whitelistContract = new Contract(contractAddress, abi, signer)
    const signerAddress = await signer.getAddress()
    const checkWhiteListing = await whitelistContract.whitelistedAddresses(signerAddress)
    setJoinedWhitelist(checkWhiteListing);
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async() => {
    try {
      await getProviderOrSigner();
      setIsWalletConnected(true);

      checkIfAddressIsWhitelisted();
      getWhitelistedNumber();
    } catch (error) {
      console.log(error)
    }
  }

  const renderButton = () => {
    if (isWalletConnected) {
      if (joindedWhitelist) {
        return (
          <div className='border-4 border-purple-600 p-3 font-bold rounded-md bg-purple-600 text-purple-100 shadow-md'>
            Thanks for joining the Whitelist!
          </div>
        );
      } else if (loading) {
        return <button className='border-4 border-purple-600 p-3 font-bold rounded-md bg-purple-600 text-purple-100 shadow-md'>Loading...</button>;
      } else {
        return (
          <button onClick={addAddressToWhitelist} className='border-4 border-purple-600 p-3 font-bold rounded-md bg-purple-600 text-purple-100 shadow-md'>
            Join the whitelist
          </button>
        );
      }
    } else {
      return (
        <button onClick={connectWallet} className='border-4 border-purple-600 p-3 font-bold rounded-md bg-purple-600 text-purple-100 shadow-md'>
          Connect your wallet
        </button>
      );
    }
  };

  useEffect(() => {
    if(!isWalletConnected){
      web3modalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: [],
        disableInjectedProvider: false
      })

      connectWallet();
    }
  },[isWalletConnected])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className='text-4xl text-purple-800 w-3/5 mx-auto text-center my-6'>
        Join the whitelist for web3 devs exclusive NFT collection
      </h1>
      {renderButton()}
    </div>
  )
}

export default Home
