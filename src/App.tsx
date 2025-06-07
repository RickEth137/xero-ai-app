// src/App.tsx

import type { ReactNode } from 'react';
import { AuthCoreContextProvider, useConnect, useAuthCore, useDisconnect } from '@particle-network/authkit';
import { mainnet } from 'viem/chains';
import { useRawInitData } from '@telegram-apps/sdk-react';
import axios from 'axios';
import './App.css';
import xeroLogo from './assets/logo.png';

// ★★★ This link MUST point to your LIVE cloudflared tunnel ★★★
const BACKEND_API_URL = 'https://consensus-shorter-hardware-hockey.trycloudflare.com';

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

// Sends the data to our backend bot
async function saveWalletToBackend(initDataRaw: string | undefined, address: string | undefined) {
    if (!initDataRaw || !address) {
        alert("Missing user or wallet data. Cannot save.");
        return;
    }
    try {
        await axios.post(`${BACKEND_API_URL}/save-wallet`, {
            initDataRaw: initDataRaw,
            address: address,
        });
        alert('Wallet info sent to bot successfully!');
    } catch (error) {
        console.error("🔴 FAILED TO SAVE WALLET:", error);
        alert("Error: Could not save wallet to the bot.");
    }
}

function AuthComponent() {
  const { connect, disconnect, connected } = useConnect();
  const { userInfo } = useAuthCore();
  const rawInitData = useRawInitData();
  
  const handleConnect = async () => {
    try {
      const connectedUserInfo = await connect();
      const evmWallet = connectedUserInfo?.wallets?.find((w: any) => w.chain_name === 'evm_chain')?.public_address;

      // After connecting, send the info to our backend
      await saveWalletToBackend(rawInitData, evmWallet);

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
      <button onClick={handleConnect} disabled={!rawInitData}>
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
