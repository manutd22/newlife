import { useIntegration } from '@telegram-apps/react-router-integration';
import {
  bindMiniAppCSSVars,
  bindThemeParamsCSSVars,
  bindViewportCSSVars,
  initNavigator, useLaunchParams,
  useMiniApp,
  useThemeParams,
  useViewport,
  useInitData,
} from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { type FC, useEffect, useMemo } from 'react';
import {
  Navigate,
  Route,
  Router,
  Routes,
} from 'react-router-dom';
import axios from 'axios';

import { routes } from '@/navigation/routes.tsx';

const saveTelegramUser = async (initData: string) => {
  console.log('Attempting to save user data:', initData);
  try {
    const response = await axios.post('https://fb70-78-84-19-24.ngrok-free.app/users/save-telegram-user', { initData });
    console.log('User data saved successfully:', response.data);
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
  const initData = useInitData();

  useEffect(() => {
    return bindMiniAppCSSVars(miniApp, themeParams);
  }, [miniApp, themeParams]);

  useEffect(() => {
    return bindThemeParamsCSSVars(themeParams);
  }, [themeParams]);

  useEffect(() => {
    return viewport && bindViewportCSSVars(viewport);
  }, [viewport]);

  useEffect(() => {
    if (initData) {
      const initDataString = JSON.stringify(initData);
      console.log('InitData received:', initDataString);
      saveTelegramUser(initDataString)
        .then(() => console.log('User data saved successfully'))
        .catch((error) => console.error('Error saving user data:', error));
    } else {
      console.warn('InitData is empty or undefined');
    }
  }, [initData]);

  // Create a new application navigator and attach it to the browser history, so it could modify
  // it and listen to its changes.
  const navigator = useMemo(() => initNavigator('app-navigation-state'), []);
  const [location, reactNavigator] = useIntegration(navigator);

  // Don't forget to attach the navigator to allow it to control the BackButton state as well
  // as browser history.
  useEffect(() => {
    navigator.attach();
    return () => navigator.detach();
  }, [navigator]);

  return (
    <AppRoot
      appearance={miniApp.isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.platform) ? 'ios' : 'base'}
    >
      <Router location={location} navigator={reactNavigator}>
        <Routes>
          {routes.map((route) => <Route key={route.path} {...route} />)}
          <Route path='*' element={<Navigate to='/'/>}/>
        </Routes>
      </Router>
    </AppRoot>
  );
};