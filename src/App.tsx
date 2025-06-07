// src/App.tsx

import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { AuthCoreContextProvider, useConnect, useAuthCore, useDisconnect } from '@particle-network/authkit';
import { mainnet } from 'viem/chains';
import { AuthType } from '@particle-network/auth-core';
import { useInitData } from '@telegram-apps/sdk-react';
import axios from 'axios';
import './App.css';
import xeroLogo from './assets/logo.png';

// This should be the public URL for your backend's tunnel
const BACKEND_API_URL = 'https://consensus-shorter-hardware-hockey.trycloudflare.com';

function ParticleProvider({ children }: { children: ReactNode }) {
  return (
    <AuthCoreContextProvider
      options={{
        projectId: '4fec5bff-a62c-484c-8ddc-fe5368af9cdf',
        clientKey: 'cnysS13OCJsTHZXupUvB4uFiI0d2CNvFsNVqtmG3',
        appId: 'd4c2607d-7e24-4ba1-879a-ffa5e4c2040a',
        chains: [mainnet],
        // Add privateKey to the list of auth types
        authTypes: [AuthType.email, AuthType.google, AuthType.twitter, AuthType.privateKey],
        wallet: { visible: true },
      }}
    >
      {children}
    </AuthCoreContextProvider>
  );
}

// Sends wallet data to our backend bot
async function saveWalletToBackend(userId: number | undefined, address: string | undefined) {
    if (!userId || !address) { return; }
    try {
        await axios.post(`${BACKEND_API_URL}/save-wallet`, {
            userId: userId,
            address: address,
        });
        console.log('✅ Wallet info sent to backend successfully!');
    } catch (error) {
        console.error("🔴 FAILED TO SAVE WALLET:", error);
    }
}


function AuthComponent() {
  const { connect, disconnect, connected } = useConnect();
  const { userInfo } = useAuthCore();
  const initData = useInitData();
  const [privateKey, setPrivateKey] = useState('');
  
  // This function opens the Particle modal for Email/Socials
  const handleGenerateWallet = async () => {
    try {
      const connectedUserInfo = await connect();
      const evmWallet = connectedUserInfo?.wallets?.find((w: any) => w.chain_name === 'evm_chain')?.public_address;
      await saveWalletToBackend(initData?.user?.id, evmWallet);
    } catch (error) {
      console.error("Connect Error:", error);
    }
  };

  // This function connects directly using a private key
  const handleImportWallet = async () => {
    if (!privateKey) {
      alert('Please enter a private key.');
      return;
    }
    try {
      const connectedUserInfo = await connect({
        authType: AuthType.privateKey,
        key: privateKey,
      });
      const evmWallet = connectedUserInfo?.wallets?.find((w: any) => w.chain_name === 'evm_chain')?.public_address;
      await saveWalletToBackend(initData?.user?.id, evmWallet);
    } catch (error) {
      alert("Import failed. Please check the private key and try again.");
      console.error("Private Key Import Error:", error);
    }
  };
  
  const evmWallet = userInfo?.wallets?.find((w: any) => w.chain_name === 'evm_chain')?.public_address;

  if (connected) {
    return (
      <div className="card">
        <h3>✅ Wallet Connected</h3>
        <p><strong>Address:</strong> {evmWallet || 'n/a'}</p>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    );
  }

  // This JSX now matches your two-button design mockup
  return (
    <>
      <div className="action-section">
        <h3>Create a new wallet</h3>
        <button onClick={handleGenerateWallet}>GENERATE WALLET</button>
        <p className="description">Generate a wallet to control a new Xero cross-chain account.</p>
      </div>

      <div className="action-section">
        <h3>Import your wallet</h3>
        <form onSubmit={(e) => { e.preventDefault(); handleImportWallet(); }}>
          <input
            type="password"
            className="pk-input"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder="Import with Private Key"
          />
          <button type="submit">IMPORT WALLET</button>
        </form>
        <p className="description">Import a private key to control your Xero cross-chain account.</p>
      </div>
    </>
  );
}

export default function App() {
  return (
    <ParticleProvider>
      <div className="app-container">
        <img src={xeroLogo} className="main-logo" alt="Xero Ai Logo" />
        <h1 className="main-title">Xero Ai</h1>
        <AuthComponent />
        <footer className="footer">
          Powered By PARTICLE NETWORK
        </footer>
      </div>
    </ParticleProvider>
  );
}
