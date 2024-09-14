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
const BACKEND_URL = 'https://1249ae7f153cefa5586023774510ebbb.serveo.net';
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

  const generateReferralCode = useCallback(async () => {
    if (!lp.initData?.user?.id) {
      console.warn('User ID not available');
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/users/generate-referral-code`, {
        userId: lp.initData.user.id
      });
      setReferralCode(response.data.code);
    } catch (err) {
      console.error('Error generating referral code:', err);
    }
  }, [lp.initData?.user?.id]);

  const initializeUser = useCallback(async () => {
    if (!lp.initData) {
      console.warn('Init data not available');
      return;
    }

    const storedReferralCode = localStorage.getItem('referralCode');
    
    try {
      const response = await axios.post(`${BACKEND_URL}/users/save-telegram-user`, {
        initData: lp.initData,
        referralCode: storedReferralCode
      });
      console.log('User initialized:', response.data);
      localStorage.removeItem('referralCode');
    } catch (err) {
      console.error('Error initializing user:', err);
    }
  }, [lp.initData]);

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
    const initApp = async () => {
      await initializeUser();
      await generateReferralCode();
      fetchReferrals();
    };

    initApp();

    // Check if there's a referral code in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlReferralCode = urlParams.get('ref');
    if (urlReferralCode) {
      localStorage.setItem('referralCode', urlReferralCode);
    }
  }, [initializeUser, generateReferralCode, fetchReferrals]);

  const generateInviteLink = useCallback(() => {
    if (!referralCode) {
      console.error('Referral code not available');
      return null;
    }
    return `https://t.me/${BOT_USERNAME}?startapp=${referralCode}`;
  }, [referralCode]);

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