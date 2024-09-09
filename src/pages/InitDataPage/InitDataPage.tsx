import { type FC, useMemo, useEffect } from 'react';
import { useInitData, useLaunchParams, type User } from '@telegram-apps/sdk-react';
import { List, Placeholder } from '@telegram-apps/telegram-ui';
import axios, { AxiosError } from 'axios';

import { DisplayData, type DisplayDataRow } from '@/components/DisplayData/DisplayData.tsx';

function getUserRows(user: User): DisplayDataRow[] {
  return [
    { title: 'id', value: user.id.toString() },
    { title: 'username', value: user.username },
    { title: 'last_name', value: user.lastName },
    { title: 'first_name', value: user.firstName },
    { title: 'is_bot', value: user.isBot },
    { title: 'is_premium', value: user.isPremium },
    { title: 'language_code', value: user.languageCode },
    { title: 'allows_to_write_to_pm', value: user.allowsWriteToPm },
    { title: 'added_to_attachment_menu', value: user.addedToAttachmentMenu },
  ];
}

async function saveTelegramUser(initData: string) {
  try {
    console.log('Sending init data to backend:', initData);
    const response = await axios.post('https://fb70-78-84-19-24.ngrok-free.app/users/save-telegram-user', { initData });
    console.log('User data saved successfully:', response.data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
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
        .catch((error: unknown) => {
          if (error instanceof AxiosError) {
            console.error('Failed to save user data (Axios error):', error.message);
          } else if (error instanceof Error) {
            console.error('Failed to save user data:', error.message);
          } else {
            console.error('Failed to save user data:', error);
          }
        });
    }
  }, [initDataRaw]);


  const initDataRows = useMemo<DisplayDataRow[] | undefined>(() => {
    if (!initData || !initDataRaw) {
      return;
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
      { title: 'auth_date (raw)', value: authDate.getTime() / 1000 },
      { title: 'hash', value: hash },
      { title: 'can_send_after', value: canSendAfterDate?.toISOString() },
      { title: 'can_send_after (raw)', value: canSendAfter },
      { title: 'query_id', value: queryId },
      { title: 'start_param', value: startParam },
      { title: 'chat_type', value: chatType },
      { title: 'chat_instance', value: chatInstance },
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
      return;
    }
    const { id, title, type, username, photoUrl } = initData.chat;

    return [
      { title: 'id', value: id.toString() },
      { title: 'title', value: title },
      { title: 'type', value: type },
      { title: 'username', value: username },
      { title: 'photo_url', value: photoUrl },
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
