import React, { useEffect, useState } from "react";
import './styles/App.css';
import { ethers } from "ethers";
// contract abi
import myEpicNft from './utils/MyEpicNFT.json';

// Constants
const CONTRACT_ADDRESS = "0x6bc3b446bFf046b665150892e7f406570Bc00C30";
const TWITTER_HANDLE = 'difool0x';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const RARIBLE_COLLECTION_LINK = `https://rinkeby.rarible.com/collection/${CONTRACT_ADDRESS}`;
const RARIBLE_TOKEN_LINK = `https://rinkeby.rarible.com/token/${CONTRACT_ADDRESS}`;
const TOTAL_SUPPLY = 50;
const CHAIN_ID = "0x4";


const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [totalNFTsMinted, setTotalNFTsMinted] = useState(null);
  const [mining, setMining] = useState(true);
  const [isNftMinted, setIsNftMinted] = useState(false);
  const [tokenId, setTokenId] = useState(null);

  // check for rinkeby chain id
  const checkChainId = async () => {
    const {ethereum} = window;
    let currentChainId = await ethereum.request({method: "eth_chainId"});
    if (currentChainId === CHAIN_ID) {
      return true;
    } else {
      alert("You are not connected to the Rinkeby Test Network!");
      return false;
    }
  }

  // check for wallet connection
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have MetaMask!");
      return;
    } else {
      console.log("Ethereum object found!", ethereum);
    }

    // check for correct network
    checkChainId();

    // get connected accounts, returns array. method specific to MetaMask
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    // set current account to index 0 if any exist
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found authorized account:", account);
      setCurrentAccount(account);
      setupEventListener();
    } else {
      console.log("No authorized account");
    }
  }

  const connectWallet = async () => {
    const { ethereum } = window;

    try {
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      // check for rinkeby network
      checkChainId();

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  const setupEventListener = async () => {
    const { ethereum } = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

    try {
      if (ethereum) {
        connectedContract.on("MintedNewEpicNFT", (from, tokenId) => {
          setTokenId(tokenId.toNumber());
        });

      } else {
        console.log("Ethereum object does not exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateNumberOfTotalNFTsMinted = async () => {
    const {ethereum} = window;
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer =  provider.getSigner();
    const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);
    let numberOfTotalNFTsMinted = await connectedContract.getTotalNFTsMinted();
    console.log("A total of %d NFTs have been minted!", numberOfTotalNFTsMinted.toNumber());
    setTotalNFTsMinted(numberOfTotalNFTsMinted.toNumber());
    return numberOfTotalNFTsMinted;
  }

  const askContractToMintNft = async () => {
    setMining(true);
    setIsNftMinted(false);
    const { ethereum } = window;
    let currentChainId = await ethereum.request({method: "eth_chainId"});
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

    try {
      if (ethereum && currentChainId === CHAIN_ID) {
        console.log("Open sesame ⛽");
        let nftTxn = await connectedContract.makeAnEpicNFT();
        console.log("Mining NFT ⛏️");
        await nftTxn.wait();
        console.log(`Mined NFT 💎 HUZZAH! See transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
        setMining(false);
        setIsNftMinted(true);
        updateNumberOfTotalNFTsMinted();
      } else {
        alert("You are not connected to the Rinkeby Test Network!");
      }

    } catch (error) {
      console.log(error);
    }
  };

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderNftMintedContainer = () => (
    <div className="mint-container">
      <p className="sub-text">HUZZAH!</p>
      <p className="sub-text">Your NFT has been minted!</p>
      <button
        className="cta-button connect-wallet-button"
        onClick={() => {
          window.open(`${RARIBLE_TOKEN_LINK}:${tokenId}`, '_blank');
        }}>View NFT</button>
    </div>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
    updateNumberOfTotalNFTsMinted();
    // eslint-disable-next-line
  },[]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My D&D NFT</p>
          <p className="sub-text">
            A collection of D&D 5E characters based on randomly generated race, class, and background.
          </p>
          <a className="collection-link" href={RARIBLE_COLLECTION_LINK} target="_blank" rel="noreferrer">View Collection on Rarible</a>
          {currentAccount === "" ? renderNotConnectedContainer() : (
            <div>
              <h2>{totalNFTsMinted} / {TOTAL_SUPPLY} Minted</h2>
              <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
                Mint NFT
              </button>
            </div>
          )}
          {isNftMinted ? renderNftMintedContainer() : null}
        </div>
        <footer className="footer-container">
          <p className="footer-text">Built with <span>♥️</span> by <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >@DiFool0x</a></p>
        </footer>
      </div>
    </div>
  );
};

export default App;
