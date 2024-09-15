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
const BACKEND_URL = 'https://e95eef8375dc9c3be0e3aaaf5fb76235.serveo.net';
const BOT_USERNAME = 'testonefornew_bot';

export const FriendsPage: FC = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
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
      setDebugInfo(prev => `${prev}\nUser ID or token not available`);
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
        setDebugInfo(prev => `${prev}\nReferrals fetched: ${response.data.length}`);
      } else {
        setDebugInfo(prev => `${prev}\nUnexpected referrals data format`);
        showPopup('Error', 'Unexpected data format received');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setDebugInfo(prev => `${prev}\nAxios error fetching referrals: ${error.message}`);
        showPopup('Error', `Failed to load referrals: ${error.message}`);
      } else {
        setDebugInfo(prev => `${prev}\nUnknown error fetching referrals`);
        showPopup('Error', 'An unknown error occurred while loading referrals');
      }
    } finally {
      setIsLoading(false);
    }
  }, [lp.initData?.user?.id, token, showPopup]);

  useEffect(() => {
    const saveTelegramUser = async () => {
      if (lp.initDataRaw) {
        try {
          const parsedInitData = JSON.parse(decodeURIComponent(lp.initDataRaw));
          setDebugInfo(`InitData received. StartParam: ${lp.initData?.startParam || 'None'}, ParsedStartParam: ${parsedInitData.start_param || 'None'}`);
          
          const response = await axios.post(`${BACKEND_URL}/users/save-telegram-user`, {
            initData: lp.initDataRaw,
            startParam: lp.initData?.startParam || parsedInitData.start_param
          });
          
          if (response.data.token) {
            setToken(response.data.token);
            localStorage.setItem('jwtToken', response.data.token);
            setDebugInfo(prev => `${prev}\nToken received and saved`);
          } else {
            setDebugInfo(prev => `${prev}\nNo token received from server`);
          }

          if (response.data.debug) {
            setDebugInfo(prev => `${prev}\nServer debug: ${response.data.debug}`);
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            setDebugInfo(prev => `${prev}\nAxios error saving user data: ${error.message}`);
            showPopup('Error', `Failed to save user data: ${error.message}`);
          } else {
            setDebugInfo(prev => `${prev}\nUnknown error saving user data`);
            showPopup('Error', 'An unknown error occurred while saving user data');
          }
        }
      } else {
        setDebugInfo('No initDataRaw available');
      }
    };

    saveTelegramUser();
  }, [lp.initDataRaw, lp.initData?.startParam, showPopup]);

  useEffect(() => {
    if (token) {
      fetchReferrals();
    }
  }, [fetchReferrals, token]);

  const generateInviteLink = useCallback(() => {
    if (!lp.initData?.user?.id) {
      setDebugInfo(prev => `${prev}\nUnable to generate invite link: User ID not available`);
      return null;
    }
    return `https://t.me/${BOT_USERNAME}?startapp=invite_${lp.initData.user.id}`;
  }, [lp.initData?.user?.id]);

  const shareInviteLink = useCallback(() => {
    const inviteLink = generateInviteLink();
    if (inviteLink) {
      setDebugInfo(prev => `${prev}\nInvite link generated: ${inviteLink}`);
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
          setDebugInfo(prev => `${prev}\nInvite link copied to clipboard`);
          showPopup('Success', 'Invite link copied to clipboard!');
        })
        .catch(() => {
          setDebugInfo(prev => `${prev}\nFailed to copy invite link`);
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
      
      <div style={{ backgroundColor: '#f0f0f0', padding: '10px', margin: '10px 0', fontSize: '12px', textAlign: 'left', whiteSpace: 'pre-wrap' }}>
        Debug Info: {debugInfo}
      </div>

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