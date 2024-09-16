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

const utils = initUtils();
const BACKEND_URL = 'https://79f02e792c66f7fd08a2110f608af4e8.serveo.net';
const BOT_USERNAME = 'testonefornew_bot';

export const FriendsPage: FC = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const lp = useLaunchParams();

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
    if (!lp.initData?.user?.id || !token) {
      console.warn('User ID or token not available');
      showPopup('Error', 'User ID or token not available');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(`${BACKEND_URL}/users/${lp.initData.user.id}/referrals`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (Array.isArray(response.data)) {
        setReferrals(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        showPopup('Error', 'Unexpected data format received');
      }
    } catch (err) {
      console.error('Error fetching referrals:', err);
      showPopup('Error', 'Failed to load referrals. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [lp.initData?.user?.id, token, showPopup]);

  useEffect(() => {
  const saveTelegramUser = async () => {
    if (lp.initDataRaw) {
      try {
        const response = await axios.post(`${BACKEND_URL}/users/save-telegram-user`, {
          initData: lp.initDataRaw,
          startapp: lp.startParam || new URLSearchParams(window.location.search).get('startapp')
        });
        setToken(response.data.token);
        localStorage.setItem('jwtToken', response.data.token);
      } catch (error) {
        console.error('Error saving user data:', error);
        showPopup('Error', 'Failed to save user data');
      }
    }
  };

  saveTelegramUser();
}, [lp.initDataRaw, lp.startParam, showPopup]);

  useEffect(() => {
    if (token) {
      fetchReferrals();
    }
  }, [fetchReferrals, token]);

  const generateInviteLink = useCallback(async () => {
    if (!lp.initData?.user?.id) {
      console.error('User ID not available');
      showPopup('Error', 'Unable to generate invite link. User ID not available.');
      return null;
    }
    
    try {
      const response = await axios.post(`${BACKEND_URL}/api/generate-referral-code`, 
        { userId: lp.initData.user.id.toString() },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const referralCode = response.data.code;
      const inviteLink = `https://t.me/${BOT_USERNAME}?startapp=${referralCode}`;
      console.log('Generated invite link:', inviteLink);
      return inviteLink;
    } catch (error) {
      console.error('Error generating referral code:', error);
      showPopup('Error', 'Failed to generate invite link. Please try again.');
      return null;
    }
  }, [lp.initData?.user?.id, token, showPopup]);

  const shareInviteLink = useCallback(async () => {
    const inviteLink = await generateInviteLink();
    if (inviteLink) {
      utils.shareURL(inviteLink, 'Join me in BallCry and get more rewards!');
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

  const renderReferralsList = useCallback(() => {
    if (referrals.length === 0) {
      return <p>No referrals yet. Invite your friends!</p>;
    }
    
    return (
      <ol style={{ textAlign: 'left', paddingLeft: '20px' }}>
        {referrals.map((referral, index) => (
          <li key={referral.id || index}>
            {referral.firstName || ''} {referral.lastName || ''} 
            {referral.username ? `(@${referral.username})` : ''}
          </li>
        ))}
      </ol>
    );
  }, [referrals]);

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
        renderReferralsList()
      )}

      <NavigationBar />
    </div>
  );
};

export default FriendsPage;