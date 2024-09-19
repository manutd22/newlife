import { FC, useState, useEffect, useCallback } from 'react';
import { Button, Image } from '@telegram-apps/telegram-ui';
import { NavigationBar } from '@/components/NavigationBar/NavigationBar';
import { initUtils, useLaunchParams } from '@telegram-apps/sdk-react';
import axios from 'axios';

import ball1 from '../../../assets/ball1.png';

interface Referral {
  id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
}

// Расширенное определение типа для Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initDataUnsafe?: {
          startParam?: string;
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
        };
        showPopup: (params: { title: string; message: string; buttons: Array<{ type: string }> }) => void;
        shareUrl: (url: string) => void;
        close: () => void;
      };
    };
  }
}

const utils = initUtils();
const BACKEND_URL = 'https://c331ae4fb852b2a6b9b4ba1ca55d1099.serveo.net';
const BOT_USERNAME = 'testonefornew_bot';

export const FriendsPage: FC = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lp = useLaunchParams();
  
  // Получаем startParam
  const startParam: string | null = lp.initData?.startParam || window.Telegram?.WebApp?.initDataUnsafe?.startParam || null;

  useEffect(() => {
    // Проверяем и используем startParam
    if (startParam) {
      console.log('Start parameter found:', startParam);
      // Можно добавить логику для отправки startParam на сервер или использования его в бизнес-логике
    } else {
      console.log('No start parameter');
    }
  }, [startParam]);
  
  const showPopup = useCallback((title: string, message: string) => {
    if (window.Telegram?.WebApp?.showPopup) {
      window.Telegram.WebApp.showPopup({
        title,
        message,
        buttons: [{ type: 'ok' }]
      });
    } else {
      console.warn('Telegram WebApp API is not available');
      alert(`${title}: ${message}`);
    }
  }, []);

  const fetchReferrals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        throw new Error('JWT token not found');
      }

      const userId = lp.initData?.user?.id || window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
      if (!userId) {
        throw new Error('User ID not available');
      }

      const response = await axios.get<Referral[]>(`${BACKEND_URL}/users/${userId}/referrals`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      setReferrals(response.data);
    } catch (err) {
      console.error('Error fetching referrals:', err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
      showPopup('Error', 'Failed to load referrals. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [lp.initData?.user?.id, showPopup]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const generateInviteLink = useCallback(async () => {
    const userId = lp.initData?.user?.id || window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    if (!userId) {
      console.error('User ID not available');
      showPopup('Error', 'Unable to generate invite link. User ID not available.');
      return null;
    }
    
    try {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        throw new Error('JWT token not found');
      }

      const response = await axios.post<{ code: string }>(`${BACKEND_URL}/users/generate-referral-code`, 
        { userId: userId.toString() },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const referralCode = response.data.code;
      return `https://t.me/${BOT_USERNAME}?startapp=${referralCode}`;
    } catch (error) {
      console.error('Error generating referral code:', error);
      showPopup('Error', 'Failed to generate invite link. Please try again.');
      return null;
    }
  }, [lp.initData?.user?.id, showPopup]);

  const shareInviteLink = useCallback(async () => {
    const inviteLink = await generateInviteLink();
    if (inviteLink) {
      if (window.Telegram?.WebApp?.shareUrl) {
        window.Telegram.WebApp.shareUrl(inviteLink);
      } else {
        utils.shareURL(inviteLink, 'Join me in BallCry and get more rewards!');
      }
    } else {
      showPopup('Error', 'Unable to create invite link. Please try again later.');
    }
  }, [generateInviteLink, showPopup, utils]);

  const copyInviteLink = useCallback(async () => {
    const inviteLink = await generateInviteLink();
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
        .then(() => {
          showPopup('Success', 'Invite link copied to clipboard!');
        })
        .catch(() => {
          showPopup('Error', 'Failed to copy invite link. Please try again.');
        });
    } else {
      showPopup('Error', 'Unable to create invite link. Please try again later.');
    }
  }, [generateInviteLink, showPopup]);

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Error loading referrals</h2>
        <p>{error}</p>
        <Button onClick={fetchReferrals}>Try Again</Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center', paddingBottom: '60px' }}>
      <h2>Invite Friends and get more BallCry</h2>
      
      <div style={{ margin: '20px 0' }}>
        <Image src={ball1} alt="BallCry" style={{ width: '100px', height: '100px', margin: '0 auto' }} />
      </div>

      <Button onClick={shareInviteLink} style={{ marginBottom: '10px' }}>Share Invite Link</Button>
      <Button onClick={copyInviteLink} style={{ marginBottom: '20px' }}>Copy Invite Link</Button>

      <div style={{ marginBottom: '20px' }}>
        <h3>{referrals.length} Friends</h3>
      </div>

      {isLoading ? (
        <p>Loading referrals...</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {referrals.map((referral, index) => (
            <li key={referral.id || index} style={{ marginBottom: '10px' }}>
              {referral.firstName || ''} {referral.lastName || ''} 
              {referral.username ? `(@${referral.username})` : ''}
            </li>
          ))}
        </ul>
      )}

      <NavigationBar />
    </div>
  );
};

export default FriendsPage;
