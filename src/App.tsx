// src/App.tsx

import type { ReactNode } from 'react';
import { AuthCoreContextProvider, useConnect, useAuthCore } from '@particle-network/authkit';
import { mainnet } from 'viem/chains';
import { useRawInitData } from '@telegram-apps/sdk-react'; // Using the correct hook
import axios from 'axios';
import './App.css';
import xeroLogo from './assets/logo.png';

// This MUST be the live public URL for your backend server's tunnel
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

// This function sends the wallet data to our backend bot
async function saveWalletToBackend(userId: number, address: string) {
    if (!userId || !address) return;
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
  const rawInitData = useRawInitData(); // Using the correct hook name
  
  const handleConnect = async () => {
    try {
      const connectedUserInfo = await connect();
      
      const evmWallet = connectedUserInfo?.wallets?.find((w: any) => w.chain_name === 'evm_chain')?.public_address;

      // This logic now correctly gets the user ID from the raw data string
      let telegramUserId: number | undefined;
      if (rawInitData) {
        const params = new URLSearchParams(rawInitData);
        const userJson = params.get('user');
        if (userJson) {
            telegramUserId = JSON.parse(userJson).id;
        }
      }

      // And now we send it to the backend
      if (telegramUserId && evmWallet) {
        await saveWalletToBackend(telegramUserI
