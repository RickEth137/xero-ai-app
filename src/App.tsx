// src/App.tsx

import type { ReactNode } from 'react';
import { useState } from 'react';
import { AuthCoreContextProvider, useConnect, useAuthCore } from '@particle-network/authkit';
import { mainnet } from 'viem/chains';
import { useInitData } from '@telegram-apps/sdk-react'; // This was the source of many errors
import axios from 'axios';
import './App.css';
import xeroLogo from './assets/logo.png';

const BACKEND_API_URL = 'https://recipient-kong-d-somewhere.trycloudflare.com';

function ParticleProvider({ children }: { children: ReactNode }) {
  return (
    <AuthCoreContextProvider
      options={{
        projectId: '4fec5bff-a62c-484c-8ddc-fe5368af9cdf',
        clientKey: 'cnysS13OCJsTHZXupUvB4uFiI0d2CNvFsNVqtmG3',
        appId: 'd4c2607d-7e24-4ba1-879a-ffa5e4c2040a',
        chains: [mainnet],
        wallet: { visible: true },
      }}
    >
      {children}
    </AuthCoreContextProvider>
  );
}

// ★★★ FIX: Added correct types for userId and address ★★★
async function saveWalletToBackend(userId: number, address: string) {
    try {
        console.log(`Sending wallet to backend: User ${userId}, Address ${address}`);
        await axios.post(`${BACKEND_API_URL}/save-wallet`, {
            userId: userId,
            address: address,
        });
        console.log('Successfully saved wallet to backend.');
        alert('Wallet saved to bot!');
    } catch (error) {
        console.error("Failed to save wallet to backend:", error);
        alert("Could not save wallet info to the bot. Please try reconnecting.");
    }
}


function AuthComponent() {
  const { connect, disconnect, connected } = useConnect();
  const { userInfo } = useAuthCore();
  
  // ★★★ FIX: Changed from useInitData to useInitData (which is an object) ★★★
  const initData = useInitData();
  
  const handleConnect = async () => {
    try {
      const connectedUserInfo = await connect();
      
      const telegramUser = initData?.user;
      const evmWallet = connectedUserInfo?.wallets?.find((w: any) => w.chain_name === 'evm_chain')?.public_address;

      if (telegramUser?.id && evmWallet) {
        await saveWalletToBackend(telegramUser.id, evmWallet);
      }

    } catch (error) {
      console.error("Connect Error:", error);
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

  return (
    <div className="action-section">
      <h3>Create or Connect Wallet</h3>
      <button onClick={handleConnect} disabled={!initData}>
        CONNECT / LOGIN
      </button>
      <p className="description">Connect with Email or Socials to control your Xero cross-chain account.</p>
    </div>
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
