import { FC } from 'react';
import { NavigationBar } from '@/components/NavigationBar/NavigationBar';

export const LeaderboardPage: FC = () => {
  return (
    <div style={{ padding: '20px', paddingBottom: '60px' }}>
      <h2>Leaderboard</h2>
      <p>Здесь будет отображаться таблица лидеров.</p>
      <NavigationBar />
    </div>
  );
};