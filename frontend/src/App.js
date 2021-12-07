import React, { useState } from 'react';
import { Switch, Route, useLocation, matchPath } from 'react-router-dom';
import { Pane, Heading } from 'evergreen-ui';
import Sidebar from './components/Sidebar';
import AccountSelector from './components/AccountSelector';
import Loader from './components/Loader';
import ErrorMessage from './components/ErrorMessage';
import NoAccounts from './pages/NoAccounts';

import { useSubstrate } from './substrate-lib';

import routes from './routes';

const getMatchedRoute = path => {
  return routes.find(item => matchPath(path, item));
};

export default function App() {
  const location = useLocation();
  const [accountAddress, setAccountAddress] = useState(null);
  const { apiState, keyring, keyringState, apiError } = useSubstrate();

  if (apiState === 'ERROR') {
    return <ErrorMessage message={apiError} />;
  }

  if (keyringState !== 'READY' || apiState !== 'READY') {
    return <Loader message="Connecting to the chain..." />;
  }

  const accounts = keyring.getPairs();

  if (accounts.length === 0) {
    return <NoAccounts></NoAccounts>
  }

  const accountPair =
  accountAddress &&
  keyringState === 'READY' &&
  keyring.getPair(accountAddress);

  const matchedRoute = getMatchedRoute(location.pathname) || {};

  return (
    <Pane height="100vh" width="100%" maxWidth="1800px" display="flex">
      {!matchedRoute.noSidebar && (
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
      )}

      <Pane
        height="100%"
        width={window.innerWidth - 240}
        marginLeft={!matchedRoute.noSidebar ? 240 : 0}
        padding={32}
      >
        {!matchedRoute.noTopbar && (
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
            background="white"
            zIndex="2"
          >
            <Heading size={800}>{matchedRoute.name}</Heading>
            <AccountSelector
              onAccountSelected={account => setAccountAddress(account.address)}
            />
          </Pane>
        )}

        <Pane width="100%" marginTop="80px">
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
