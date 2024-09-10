import { FC, useState, useEffect } from 'react';
import { Button, Image } from '@telegram-apps/telegram-ui';
import { NavigationBar } from '@/components/NavigationBar/NavigationBar';
import { initUtils } from '@telegram-apps/sdk-react';

import ball1 from '../../../assets/ball1.png';

interface Friend {
  id: number;
  name: string;
}

const utils = initUtils();

export const FriendsPage: FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  
  useEffect(() => {
    // Здесь должна быть логика загрузки списка друзей
    // Для примера используем моковые данные
    setFriends([
      { id: 1, name: 'Друг 1' },
      { id: 2, name: 'Друг 2' },
      { id: 3, name: 'Друг 3' },
    ]);
  }, []);

  const shareInviteLink = () => {
    const botUsername = 'testonefornew'; // Замените на имя вашего бота
    const appName = 'BallCry'; // Замените на название вашего приложения
    const startParam = `invite_${Date.now()}`;
    const inviteLink = `https://t.me/${botUsername}/${appName}?startapp=${startParam}`;
    utils.shareURL(inviteLink, 'Join me in BallCry and get more rewards!');
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center', paddingBottom: '60px' }}>
      <h2>Invite Friends and get more BallCry</h2>
      
      <div style={{ margin: '20px 0' }}>
        <Image src={ball1} alt="BallCry" style={{ width: '100px', height: '100px', margin: '0 auto' }} />
      </div>

      <Button onClick={shareInviteLink} style={{ marginBottom: '20px' }}>Invite Friends</Button>

      <div style={{ marginBottom: '20px' }}>
        <h3>{friends.length} Friends</h3>
      </div>

      <ol style={{ textAlign: 'left', paddingLeft: '20px' }}>
        {friends.map(friend => (
          <li key={friend.id}>{friend.name}</li>
        ))}
      </ol>

      <NavigationBar />
    </div>
  );
};