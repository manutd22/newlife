import { type FC, useMemo, useEffect } from 'react';
import { useInitData, useLaunchParams, type User } from '@telegram-apps/sdk-react';
import { List, Placeholder } from '@telegram-apps/telegram-ui';
import axios from 'axios';

import { DisplayData, type DisplayDataRow } from '@/components/DisplayData/DisplayData';

function getUserRows(user: User): DisplayDataRow[] {
  return [
    { title: 'id', value: user.id.toString() },
    { title: 'username', value: user.username },
    { title: 'last_name', value: user.lastName },
    { title: 'first_name', value: user.firstName },
    { title: 'is_bot', value: user.isBot ? 'true' : 'false' },
    { title: 'is_premium', value: user.isPremium ? 'true' : 'false' },
    { title: 'language_code', value: user.languageCode },
    { title: 'allows_to_write_to_pm', value: user.allowsWriteToPm ? 'true' : 'false' },
    { title: 'added_to_attachment_menu', value: user.addedToAttachmentMenu ? 'true' : 'false' },
  ];
}

async function saveTelegramUser(initData: string) {
  console.log('Attempting to save user data:', initData);
  try {
    const response = await axios.post('https://fb70-78-84-19-24.ngrok-free.app/users/save-telegram-user', { initData });
    console.log('User data saved successfully:', response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.message);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}

export const InitDataPage: FC = () => {
  const { initDataRaw } = useLaunchParams();
  const initData = useInitData();

  useEffect(() => {
    if (initDataRaw) {
      console.log('InitData received:', initDataRaw);
      saveTelegramUser(initDataRaw)
        .then(() => console.log('User data saved successfully'))
        .catch((error) => {
          console.error('Failed to save user data:', error);
        });
    } else {
      console.warn('No initDataRaw available');
    }
  }, [initDataRaw]);

  const initDataRows = useMemo<DisplayDataRow[] | undefined>(() => {
    if (!initData || !initDataRaw) {
      return undefined;
    }
    const {
      hash,
      queryId,
      chatType,
      chatInstance,
      authDate,
      startParam,
      canSendAfter,
      canSendAfterDate,
    } = initData;
    return [
      { title: 'raw', value: initDataRaw },
      { title: 'auth_date', value: authDate.toLocaleString() },
      { title: 'auth_date (raw)', value: (authDate.getTime() / 1000).toString() },
      { title: 'hash', value: hash },
      { title: 'can_send_after', value: canSendAfterDate?.toISOString() || 'N/A' },
      { title: 'can_send_after (raw)', value: canSendAfter?.toString() || 'N/A' },
      { title: 'query_id', value: queryId || 'N/A' },
      { title: 'start_param', value: startParam || 'N/A' },
      { title: 'chat_type', value: chatType || 'N/A' },
      { title: 'chat_instance', value: chatInstance || 'N/A' },
    ];
  }, [initData, initDataRaw]);

  const userRows = useMemo<DisplayDataRow[] | undefined>(() => {
    return initData && initData.user ? getUserRows(initData.user) : undefined;
  }, [initData]);

  const receiverRows = useMemo<DisplayDataRow[] | undefined>(() => {
    return initData && initData.receiver ? getUserRows(initData.receiver) : undefined;
  }, [initData]);

  const chatRows = useMemo<DisplayDataRow[] | undefined>(() => {
    if (!initData?.chat) {
      return undefined;
    }
    const { id, title, type, username, photoUrl } = initData.chat;

    return [
      { title: 'id', value: id.toString() },
      { title: 'title', value: title },
      { title: 'type', value: type },
      { title: 'username', value: username || 'N/A' },
      { title: 'photo_url', value: photoUrl || 'N/A' },
    ];
  }, [initData]);

  if (!initDataRows) {
    return (
      <Placeholder
        header="Oops"
        description="Application was launched with missing init data"
      >
        <img
          alt="Telegram sticker"
          src="https://xelene.me/telegram.gif"
          style={{ display: 'block', width: '144px', height: '144px' }}
        />
      </Placeholder>
    );
  }

  return (
    <List>
      <DisplayData header={'Init Data'} rows={initDataRows}/>
      {userRows && <DisplayData header={'User'} rows={userRows}/>}
      {receiverRows && <DisplayData header={'Receiver'} rows={receiverRows}/>}
      {chatRows && <DisplayData header={'Chat'} rows={chatRows}/>}
    </List>
  );
};
