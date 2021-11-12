import React, { useState } from 'react';
import { Switch, Route, useLocation } from 'react-router-dom';
import { Pane, Heading } from 'evergreen-ui';
import Sidebar from './components/Sidebar';
import AccountSelector from './components/AccountSelector';
import Loader from './components/Loader';
import ErrorMessage from './components/ErrorMessage';

import { useSubstrate } from './substrate-lib';

import routes from './routes';

const matchedRoute = path => {
  return routes.find(item => item.path === path);
};

export default function App() {
  const location = useLocation();
  const [accountAddress, setAccountAddress] = useState(null);
  const { apiState, keyring, keyringState, apiError } = useSubstrate();

  const accountPair =
    accountAddress &&
    keyringState === 'READY' &&
    keyring.getPair(accountAddress);

  if (apiState === 'ERROR') return <ErrorMessage message={apiError} />;

  if (keyringState !== 'READY' || apiState !== 'READY')
    return <Loader message="Connecting to the chain..." />;

  return (
    <Pane height="100vh" width="100%" maxWidth="1480px" display="flex">
      <Pane
        height="100%"
        background="tint"
        width={240}
        position="fixed"
        padding="16px"
        borderRight="solid 1px #E6E8F0"
      >
        <Sidebar items={routes} />
      </Pane>
      <Pane
        height="100%"
        width={window.innerWidth - 240}
        marginLeft={240}
        padding={32}
      >
        <Pane
          position="fixed"
          top="0"
          left="240px"
          width="calc(100% - 240px)"
          paddingX="48px"
          paddingY="16px"
          elevation={1}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Heading size={800}>
            {(matchedRoute(location.pathname) || {}).name}
          </Heading>
          <AccountSelector
            onAccountSelected={account => setAccountAddress(account.address)}
          />
        </Pane>
        <Pane marginTop="80px">
          <Switch>
            {routes.map(route => (
              <Route key={route.path} path={route.path} exact={route.exact}>
                <route.component accountPair={accountPair}></route.component>
              </Route>
            ))}
          </Switch>
        </Pane>
      </Pane>
    </Pane>
  );
}
