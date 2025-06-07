// src/App.tsx

import type { ReactNode } from 'react';
import { AuthCoreContextProvider, useConnect, useAuthCore, useDisconnect } from '@particle-network/authkit';
import { mainnet } from 'viem/chains';
import { useRawInitData } from '@telegram-apps/sdk-react'; // ★★★ The final typo fix is here ★★★
import axios from 'axios';
import './App.css';
import xeroLogo from './assets/logo.png';

const BACKEND_API_URL = 'https://consensus-shorter-hardware-hockey.trycloudflare.com'; // Using your latest tunnel URL

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

async function saveWalletToBackend(userId: number | undefined, address: string | undefined) {
    if (!userId || !address) {
        console.error("Missing userId or address, cannot save.");
        return;
    }
    try {
        await axios.post(`${BACKEND_API_URL}/save-wallet`, {
            userId: userId,
            address: address,
        });
        console.log('✅ Wallet info sent to backend successfully!');
        alert('Wallet saved to bot!');
    } catch (error) {
        console.error("🔴 FAILED TO SAVE WALLET:", error);
        alert("Error: Could not save wallet info to the bot.");
    }
}

function AuthComponent() {
  const { connect, disconnect, connected } = useConnect();
  const { userInfo } = useAuthCore();
  const rawInitData = useRawInitData(); // Using the correct hook
  
  const handleConnect = async () => {
    try {
      const connectedUserInfo = await connect();
      
      const evmWallet = connectedUserInfo?.wallets?.find((w: any) => w.chain_name === 'evm_chain')?.public_address;

      // Logic to parse the user ID from the rawInitData string
      let telegramUserId: number | undefined;
      if (rawInitData) {
        const params = new URLSearchParams(rawInitData);
        const userJson = params.get('user');
        if (userJson) {
            telegramUserId = JSON.parse(decodeURIComponent(userJson)).id;
        }
      }

      if (telegramUserId && evmWallet) {
