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
const BACKEND_URL = 'https://92d97c9b97bb009de5ff1d4990c51c3b.serveo.net';
const BOT_USERNAME = 'testonefornew_bot';

export const FriendsPage: FC = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    console.log('Fetching referrals...');
    if (!lp.initData?.user?.id) {
      console.warn('User ID not available');
      showPopup('Error', 'User ID not available');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(`${BACKEND_URL}/users/${lp.initData.user.id}/referrals`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      console.log('Referrals response:', response);

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
  }, [lp.initData?.user?.id, showPopup]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const generateInviteLink = useCallback(() => {
    if (!lp.initData?.user?.id) {
      console.error('User ID not available');
      return null;
    }
    // Исправленный формат ссылки
    return `https://t.me/${BOT_USERNAME}/ballcry?startapp=invite_${lp.initData.user.id}`;
  }, [lp.initData?.user?.id]);


  const shareInviteLink = useCallback(() => {
    const inviteLink = generateInviteLink();
    if (inviteLink) {
      console.log('Generated invite link:', inviteLink);
      utils.shareURL(inviteLink, 'Join me in BallCry and get more rewards!');
    } else {
      showPopup('Error', 'Unable to create invite link. Please try again later.');
    }
  }, [generateInviteLink, showPopup]);

  const copyInviteLink = useCallback(() => {
    const inviteLink = generateInviteLink();
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

  useEffect(() => {
    const handleReferral = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const startApp = urlParams.get('startapp');
      if (startApp && startApp.startsWith('invite_') && lp.initData?.user?.id) {
        const referrerId = startApp.split('_')[1];
        try {
          await axios.post(`${BACKEND_URL}/users/${lp.initData.user.id}/referrer`, {
            referrerId: referrerId
          });
          showPopup('Success', 'You have been successfully referred!');
        } catch (error) {
          console.error('Error setting referrer:', error);
          showPopup('Error', 'Failed to process referral. Please try again later.');
        }
      }
    };

    handleReferral();
  }, [lp.initData?.user?.id, showPopup]);


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

  console.log('Rendering FriendsPage. State:', { isLoading, referralsLength: referrals.length });

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