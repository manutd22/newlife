import { FC, useEffect, useMemo, useState, useCallback } from 'react';
import { useIntegration } from '@telegram-apps/react-router-integration';
import {
  bindMiniAppCSSVars,
  bindThemeParamsCSSVars,
  bindViewportCSSVars,
  initNavigator,
  useLaunchParams,
  useMiniApp,
  useThemeParams,
  useViewport,
} from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { Navigate, Route, Router, Routes } from 'react-router-dom';
import axios from 'axios';
import { BalanceProvider } from '../contexts/balanceContext';

import { routes } from '@/navigation/routes';

const BACKEND_URL = 'https://d5f8-78-84-0-200.ngrok-free.app';

const saveTelegramUser = async (initData: string, startParam: string | undefined | null) => {
  console.log('Attempting to save user data:');
  console.log('initData:', initData);
  console.log('start_param before sending:', startParam);

  try {
    const response = await axios.post(`${BACKEND_URL}/users/save-telegram-user`, { 
      initData, 
      startParam: startParam || null 
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to save user data:', error);
    throw error;
  }
};

export const App: FC = () => {
  const lp = useLaunchParams();
  const miniApp = useMiniApp();
  const themeParams = useThemeParams();
  const viewport = useViewport();
  const [isDataSaved, setIsDataSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveUserData = useCallback(async () => {
    if (lp.initDataRaw && !isDataSaved) {
      try {
        console.log('Launch params:', lp);
        console.log('startParam from launch params:', lp.startParam);
        console.log('startParam from WebApp:', window.Telegram?.WebApp?.initDataUnsafe?.start_param);
        
        const start_param = lp.startParam || window.Telegram?.WebApp?.initDataUnsafe?.start_param;

        if (start_param) {
          console.log('Final startParam used:', start_param);
        } else {
          console.warn('No valid startParam found');
        }

        await saveTelegramUser(lp.initDataRaw, start_param);
        setIsDataSaved(true);
        console.log('User data saved successfully');
      } catch (error) {
        console.error('Error saving user data:', error);
        setError('Failed to save user data. Please try again.');
      }
    } else if (!lp.initDataRaw) {
      console.warn('initDataRaw is empty or undefined');
      setError('Unable to initialize user data. Please reload the app.');
    }
  }, [lp, isDataSaved]);

  useEffect(() => {
    saveUserData();
  }, [saveUserData]);

  useEffect(() => {
    return bindMiniAppCSSVars(miniApp, themeParams);
  }, [miniApp, themeParams]);

  useEffect(() => {
    return bindThemeParamsCSSVars(themeParams);
  }, [themeParams]);

  useEffect(() => {
    return viewport && bindViewportCSSVars(viewport);
  }, [viewport]);

  const navigator = useMemo(() => initNavigator('app-navigation-state'), []);
  const [location, reactNavigator] = useIntegration(navigator);

  useEffect(() => {
    navigator.attach();
    return () => navigator.detach();
  }, [navigator]);

  useEffect(() => {
    console.log('Routes:', routes);
    if (!Array.isArray(routes)) {
      console.error('Routes is not an array:', routes);
      setError('App configuration error. Please contact support.');
    }
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <BalanceProvider>
      <AppRoot
        appearance={miniApp.isDark ? 'dark' : 'light'}
        platform={['macos', 'ios'].includes(lp.platform) ? 'ios' : 'base'}
      >
        <Router location={location} navigator={reactNavigator}>
          <Routes>
            {Array.isArray(routes) ? (
              routes.map((route) => <Route key={route.path} {...route} />)
            ) : (
              <Route path='*' element={<div>Error: Invalid route configuration</div>} />
            )}
            <Route path='*' element={<Navigate to='/'/>}/>
          </Routes>
        </Router>
      </AppRoot>
    </BalanceProvider>
  );
};