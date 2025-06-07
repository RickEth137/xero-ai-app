// src/App.tsx

import type { ReactNode } from 'react';
import React, { useState } from 'react';
import { AuthCoreContextProvider, useConnect, useAuthCore, useDisconnect } from '@particle-network/authkit';
import { mainnet, polygon } from 'viem/chains';
import { AuthType } from '@particle-network/auth-core';
import { useInitData } from '@telegram-apps/sdk-react';
import axios from 'axios';
import './App.css';
import xeroLogo from './assets/logo.png';

// ★★★ This MUST be the live public URL for your backend's tunnel ★★★
const BACKEND_API_URL = 'https://consensus-shorter-hardware-hockey.trycloudflare.com';

function ParticleProvider({ children }: { children: ReactNode }) {
  return (
    <AuthCoreContextProvider
      options={{
        projectId: '4fec5bff-a62c-484c-8ddc-fe5368af9cdf',
        clientKey: 'cnysS13OCJsTHZXupUvB4uFiI0d2CNvFsNVqtmG3',
        appId: 'd4c2607d-7e24-4ba1-879a-ffa5e4c2040a',
        chains: [mainnet],
        // Add privateKey to the list of auth types so the SDK knows to allow it
        authTypes: [AuthType.email, AuthType.google, AuthType.twitter, AuthType.privateKey],
        wallet: { visible: true },
      }}
    >
      {children}
    </AuthCoreContextProvider>
  );
}

// This function sends the wallet data to our backend bot
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
        alert('Wallet synced with bot!');
    } catch (error) {
        console.error("🔴 FAILED TO SAVE WALLET:", error);
        alert("Error: Could not sync wallet with the bot.");
    }
}


function AuthComponent() {
  const { connect, disconnect, connected } = useConnect();
  const { userInfo } = useAuthCore();
  const initData = useInitData();
  const [privateKey, setPrivateKey] = useState('');
  
  // This function is now shared by both login methods
  const onLoginSuccess = async (connectedUserInfo) => {
      const evmWallet = connectedUserInfo?.wallets?.find((w: any) => w.chain_name === 'evm_chain')?.public_address;
      const telegramUser = initData?.user;
      if (telegramUser?.id && evmWallet) {
        await saveWalletToBackend(telegramUser.id, evmWallet);
      }
  };

  const handleGenerateWallet = async () => {
    try {
      const info = await connect(); // Opens the modal
      if(info) await onLoginSuccess(info);
    } catch (error) {
      console.error("Connect Error:", error);
    }
