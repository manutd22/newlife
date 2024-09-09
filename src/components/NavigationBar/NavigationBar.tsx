import { FC } from 'react';
import { Link } from '@/components/Link/Link';
import { AiOutlineHome, AiOutlineTrophy, AiOutlineUser } from 'react-icons/ai';

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
      <Link to="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <AiOutlineHome size={24} />
        <span>Home</span>
      </Link>
      <Link to="/leaderboard" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <AiOutlineTrophy size={24} />
        <span>Leaderboard</span>
      </Link>
      <Link to="/friends" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <AiOutlineUser size={24} />
        <span>Friends</span>
      </Link>
    </div>
  );
};