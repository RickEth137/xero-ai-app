// src/App.tsx

import type { ReactNode } from 'react';
import { AuthCoreContextProvider, useConnect, useAuthCore, useDisconnect } from '@particle-network/authkit';
import { mainnet, polygon } from 'viem/chains';
import { useInitData } from '@telegram-apps/sdk-react';
import { AuthType } from '@particle-network/auth-core';
import React, { useState } from 'react';
import './App.css';
import xeroLogo from './assets/logo.png';

function ParticleProvider({ children }: { children: ReactNode }) {
  return (
    <AuthCoreContextProvider
      options={{
        projectId: '4fec5bff-a62c-484c-8ddc-fe5368af9cdf',
        clientKey: 'cnysS13OCJsTHZXupUvB4uFiI0d2CNvFsNVqtmG3',
        appId: 'd4c2607d-7e24-4ba1-879a-ffa5e4c2040a',
        // We declare all the auth types we intend to use
        authTypes: [AuthType.email, AuthType.google, AuthType.twitter, AuthType.telegram],
        themeType: 'dark',
        chains: [mainnet, polygon],
        wallet: { visible: true },
        appearance: {
          logo: 'https://i.imgur.com/XqY2vj3.png',
          projectName: 'Xero Ai',
          description: 'Connect to the Xero ecosystem.'
        }
      }}
    >
      {children}
    </AuthCoreContextProvider>
  );
}

function AuthComponent() {
  const { connect, disconnect, connected } = useConnect();
  const { userInfo } = useAuthCore();
  const [privateKey, setPrivateKey] = useState('');
  const initData = useInitData();
  
  // This function correctly handles the Telegram-based wallet generation
  const handleGenerateWallet = async () => {
    if (initData?.initDataRaw) {
      await connect({
        socialType: AuthType.JWT,
        jwt: initData.initDataRaw,
      });
    } else {
      alert('This must be run inside Telegram to generate a wallet.');
    }
  };

  // This function correctly handles importing from a private key
  const handleImportWallet = async () => {
    if (!privateKey) {
      alert('Please enter a private key.');
      return;
    }
    await connect({
      authType: AuthType.privateKey,
      key: privateKey,
    });
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

  // This JSX now matches your design mockup
  return (
    <>
      <div className="action-section">
        <h3>Create a new wallet</h3>
        <button onClick={handleGenerateWallet} disabled={!initData}>GENERATE WALLET</button>
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
            placeholder="Import a seed phrase or private key"
          />
          <button type="submit">IMPORT WALLET</button>
        </form>
        <p className="description">Import a seed phrase or private key to control your Xero cross-chain account.</p>
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
