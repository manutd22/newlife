import { Button, Image } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { Link } from '@/components/Link/Link';
import { useTonWallet } from '@tonconnect/ui-react';
import { QuestsComponent } from '@/components/QuestsComponent/QuestsComponent';
import { NavigationBar } from '@/components/NavigationBar/NavigationBar';

import ball1 from '../../../assets/ball1.png';

export const IndexPage: FC = () => {
  const wallet = useTonWallet();

  return (
    <div style={{ padding: '20px', textAlign: 'center', paddingBottom: '60px' }}>
      <h2>BallCry: {/* Здесь должна быть логика подсчета общего количества монет */}</h2>
      
      {wallet ? (
        <div style={{ 
          background: '#f0f0f0', 
          borderRadius: '20px', 
          padding: '10px', 
          display: 'inline-block',
          marginBottom: '20px'
        }}>
          {wallet.account.address.slice(0, 6)}...{wallet.account.address.slice(-4)}
        </div>
      ) : (
        <Link to="/ton-connect">
          <Button style={{ marginBottom: '20px' }}>Connect Wallet</Button>
        </Link>
      )}

      <div style={{ marginBottom: '20px' }}>
        <Image src={ball1} alt="BallCry" style={{ width: '100px', height: '100px' }} />
      </div>

      <QuestsComponent />
      <NavigationBar />
    </div>
  );
};