// src/App.tsx

import type { ReactNode } from 'react';
import { AuthCoreContextProvider, ConnectButton, useConnect, useAuthCore, useDisconnect } from '@particle-network/authkit';
import { mainnet, polygon } from 'viem/chains';
import { AuthType } from '@particle-network/auth-core';
import './App.css';
import xeroLogo from './assets/logo.png';

function ParticleProvider({ children }: { children: ReactNode }) {
  return (
    <AuthCoreContextProvider
      options={{
        projectId: '4fec5bff-a62c-484c-8ddc-fe5368af9cdf',
        clientKey: 'cnysS13OCJsTHZXupUvB4uFiI0d2CNvFsNVqtmG3',
        appId: 'd4c2607d-7e24-4ba1-879a-ffa5e4c2040a',
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
  const { connected } = useConnect();
  const { userInfo } = useAuthCore();
  const { disconnect } = useDisconnect();

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
      <ConnectButton />
      <p className="description">Connect with Telegram, Email, or Socials to control your Xero cross-chain account.</p>
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
