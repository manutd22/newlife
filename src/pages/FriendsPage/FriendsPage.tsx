import { FC } from 'react';
import { NavigationBar } from '@/components/NavigationBar/NavigationBar';

export const FriendsPage: FC = () => {
  return (
    <div style={{ padding: '20px', paddingBottom: '60px' }}>
      <h2>Friends</h2>
      <p>Здесь будет отображаться список друзей и социальные функции.</p>
      <NavigationBar />
    </div>
  );
};