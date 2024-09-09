import { FC } from 'react';
import { Link } from '@/components/Link/Link';

export const NavigationBar: FC = () => {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'space-around',
      padding: '10px',
      background: '#f0f0f0',
      borderTop: '1px solid #ccc'
    }}>
      <Link to="/">Home</Link>
      <Link to="/leaderboard">Leaderboard</Link>
      <Link to="/friends">Friends</Link>
    </div>
  );
};