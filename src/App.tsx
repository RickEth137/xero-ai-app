// src/App.tsx

import { useState, type ReactNode } from 'react';
import { AuthCoreContextProvider, useConnect, useAuthCore } from '@particle-network/authkit';
import { mainnet } from 'viem/chains';
import { AuthType } from '@particle-network/auth-core'; // Ensure this is imported
import { useRawInitData } from '@telegram-apps/sdk-react';
import axios from 'axios';
import './App.css';
import xeroLogo from './assets/logo.png';

const BACKEND_API_URL = 'https://partly-saving-rachel-ind.trycloudflare.com'; // Use your latest backend URL

function ParticleProvider({ children }: { children: ReactNode }) {
  return (
    <AuthCoreContextProvider
      options={{
        projectId: '4fec5bff-a62c-484c-8ddc-fe5368af9cdf',
        clientKey: 'cnysS13OCJsTHZXupUvB4uFiI0d2CNvFsNVqtmG3',
        appId: 'd4c2607d-7e24-4ba1-879a-ffa5e4c2040a',
        chains: [mainnet],
        // ***** FIX 1: Set authTypes to only allow Email *****
        authTypes: [AuthType.email], // This line is now corrected
        wallet: { visible: true },
      }}
    >
      {children}
    </AuthCoreContextProvider>
  );
}

async function saveWalletToBackend(initDataRaw: string | undefined, address: string | undefined) {
    if (!initDataRaw ||!address) {
        console.error('Missing initDataRaw or address, cannot save.');
        return;
    }
    try {
        await axios.post(`${BACKEND_API_URL}/save-wallet`, {
            initDataRaw: initDataRaw,
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
  const rawInitData = useRawInitData();

  const handleGenerateWallet = async () => {
    try {
      // When connect() is called without arguments, it uses the authTypes from ParticleProvider
      const connectedUserInfo = await connect();
      // Let TypeScript infer the type of 'w' or use the SDK's provided type if known.
      // The 'wallets' array elements are likely of a type like 'WalletInfo' from Particle SDK.
      // If 'w.public_address' can be undefined, ensure your logic handles that.
      const evmWallet = connectedUserInfo?.wallets?.find(w => w.chain_name === 'evm_chain')?.public_address;
      await saveWalletToBackend(rawInitData, evmWallet);
    } catch (error) {
      console.error("Connect Error:", error);
    }
  };

  const evmWallet = userInfo?.wallets?.find(w => w.chain_name === 'evm_chain')?.public_address;

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
    <>
      <div className="action-section">
        <h3>Create a new wallet</h3>
        <button onClick={handleGenerateWallet} disabled={!rawInitData}>GENERATE WALLET</button>
        <p className="description">Generate a wallet to control a new Xero cross-chain account.</p>
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