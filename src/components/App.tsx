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

const BACKEND_URL = 'https://699633c1447197772d89cf45c0b36f77.serveo.net';

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

  // Добавим отладочный вывод для всех важных переменных
  useEffect(() => {
    console.log('Launch Params:', lp);
    console.log('Mini App:', miniApp);
    console.log('Theme Params:', themeParams);
    console.log('Viewport:', viewport);
    console.log('Routes:', routes);
  }, [lp, miniApp, themeParams, viewport]);

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
    console.log('Binding MiniApp CSS vars');
    return bindMiniAppCSSVars(miniApp, themeParams);
  }, [miniApp, themeParams]);

  useEffect(() => {
    console.log('Binding Theme Params CSS vars');
    return bindThemeParamsCSSVars(themeParams);
  }, [themeParams]);

  useEffect(() => {
    if (viewport) {
      console.log('Binding Viewport CSS vars');
      return bindViewportCSSVars(viewport);
    }
  }, [viewport]);

  const navigator = useMemo(() => {
    console.log('Initializing navigator');
    return initNavigator('app-navigation-state');
  }, []);

  const [location, reactNavigator] = useIntegration(navigator);

  useEffect(() => {
    console.log('Attaching navigator');
    navigator.attach();
    return () => {
      console.log('Detaching navigator');
      navigator.detach();
    };
  }, [navigator]);

  useEffect(() => {
    console.log('Checking routes:', routes);
    if (!Array.isArray(routes)) {
      console.error('Routes is not an array:', routes);
      setError('App configuration error. Please contact support.');
    }
  }, []);

  if (error) {
    console.error('Rendering error state:', error);
    return <div>Error: {error}</div>;
  }

  console.log('Rendering App component');
  return (
    <BalanceProvider>
      <AppRoot
        appearance={miniApp.isDark ? 'dark' : 'light'}
        platform={['macos', 'ios'].includes(lp.platform) ? 'ios' : 'base'}
      >
        <Router location={location} navigator={reactNavigator}>
          <Routes>
            {Array.isArray(routes) ? (
              routes.map((route) => {
                console.log('Rendering route:', route);
                return <Route key={route.path} {...route} />;
              })
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