import React from 'react';

import { IRoute, Router } from '@kibalabs/core-react';
import { Head, KibaApp } from '@kibalabs/ui-react';
import 'react-toastify/dist/ReactToastify.css';

import { AccountControlProvider } from './AccountContext';
import { GlobalsProvider, IGlobals } from './globalsContext';
import { HomePage } from './pages/HomePage';
import { buildAppTheme } from './theme';

const theme = buildAppTheme();
// const tracker = new EveryviewTracker('8d6b7f803294435881c5e70ef9783011', true);

const globals: IGlobals = {
};

export const App = (): React.ReactElement => {
  // useInitialization((): void => {
  //   tracker.trackApplicationOpen();
  // });

  const routes: IRoute[] = [
    { path: '/', page: HomePage },
  ];

  return (
    <KibaApp theme={theme} background={{ linearGradient: 'rgb(0, 0, 0), rgb(25, 24, 37)' }}>
      <Head headId='app'>
        <title>On-Chain Monsters</title>
      </Head>
      <AccountControlProvider>
        <GlobalsProvider globals={globals}>
          <Router routes={routes} />
        </GlobalsProvider>
      </AccountControlProvider>
    </KibaApp>
  );
};
