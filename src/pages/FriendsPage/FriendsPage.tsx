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
const BACKEND_URL = 'https://f1c4cbcf009a73679a825cf45b4ae539.serveo.net';
const BOT_USERNAME = 'testonefornew_bot';

export const FriendsPage: FC = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [referralCode, setReferralCode] = useState<string | null>(null);
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

  const initializeUser = useCallback(async () => {
    if (!lp.initData) {
      console.warn('Init data not available');
      showPopup('Error', 'Unable to initialize user: Init data not available');
      return;
    }

    try {
      // Убедимся, что initData - это строка
      const initDataString = typeof lp.initData === 'string' ? lp.initData : JSON.stringify(lp.initData);
      console.log('Sending initData:', initDataString);
      
      const response = await axios.post(`${BACKEND_URL}/users/save-telegram-user`, {
        initData: initDataString
      });
      console.log('User initialized:', response.data);

      return response.data;
    } catch (err) {
      console.error('Error initializing user:', err);
      showPopup('Error', 'Failed to initialize user. Please try again.');
    }
  }, [lp.initData, showPopup]);

  const fetchReferrals = useCallback(async (userId: string) => {
    console.log('Fetching referrals...');
    try {
      setIsLoading(true);
      const response = await axios.get(`${BACKEND_URL}/users/${userId}/referrals`);
      console.log('Referrals response:', response.data);

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
  }, [showPopup]);

  const generateReferralCode = useCallback(async (userId: string) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/users/generate-referral-code`, { userId });
      console.log('Generated referral code:', response.data);
      setReferralCode(response.data.code);
    } catch (err) {
      console.error('Error generating referral code:', err);
      showPopup('Error', 'Failed to generate referral code. Please try again.');
    }
  }, [showPopup]);

  const useReferralCode = useCallback(async (userId: string, code: string) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/users/use-referral-code`, { userId, referralCode: code });
      console.log('Used referral code:', response.data);
      showPopup('Success', 'Referral code applied successfully!');
    } catch (err) {
      console.error('Error using referral code:', err);
      showPopup('Error', 'Failed to use referral code. Please try again.');
    }
  }, [showPopup]);

  useEffect(() => {
    const initApp = async () => {
      const user = await initializeUser();
      if (user) {
        await fetchReferrals(user.telegramId);
        await generateReferralCode(user.telegramId);

        const storedReferralCode = localStorage.getItem('referralCode');
        if (storedReferralCode) {
          await useReferralCode(user.telegramId, storedReferralCode);
          localStorage.removeItem('referralCode');
        }
      }
    };

    initApp();

    // Check if there's a referral code in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlReferralCode = urlParams.get('ref');
    if (urlReferralCode) {
      localStorage.setItem('referralCode', urlReferralCode);
    }
  }, [initializeUser, fetchReferrals, generateReferralCode, useReferralCode]);

  const generateInviteLink = useCallback(() => {
    if (!referralCode) {
      console.error('Referral code not available');
      return null;
    }
    return `https://t.me/${BOT_USERNAME}?startapp=ref_${referralCode}`;
  }, [referralCode]);

  const shareInviteLink = useCallback(() => {
    const inviteLink = generateInviteLink();
    if (inviteLink) {
      console.log('Sharing invite link:', inviteLink);
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

  console.log('Rendering FriendsPage. State:', { isLoading, referralsLength: referrals.length, referralCode });

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