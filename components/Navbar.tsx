'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Navbar() {
  return (
    <nav className='flex justify-between p-4 border-b'>
      <h1 className='text-xl font-bold'>Little Genius</h1>
      <ConnectButton />
    </nav>
  );
}

