import React from 'react';
import { Pane, Text, Heading } from 'evergreen-ui';
import { Link, useLocation } from 'react-router-dom';
import Balance from './Balance';

export default function Sidebar(props) {
  const { items, accountPair } = props;
  const location = useLocation();

  return (
    <Pane display="flex" flexDirection="column">
      <Heading paddingX="24px" paddingY="16px" is="h3">
        @Scale
      </Heading>
      <Pane paddingTop="32px">
        {items.map(item =>
          !item.sidebarExcluded ? (
            <Link to={item.path} key={item.path}>
              <Pane
                display="flex"
                paddingX="24px"
                paddingY="8px"
                alignItems="center"
                borderLeft={
                  location.pathname === item.path ? 'solid 2px #3366FF' : 'none'
                }
              >
                <item.icon
                  marginRight="8px"
                  color={
                    location.pathname === item.path ? 'selected' : 'gray800'
                  }
                />
                <Text
                  color={
                    location.pathname === item.path ? 'selected' : 'gray800'
                  }
                >
                  {item.name}
                </Text>
              </Pane>
            </Link>
          ) : (
            ''
          )
        )}
      </Pane>
      <Pane marginY={32}>
        <Balance accountPair={accountPair}></Balance>
      </Pane>
    </Pane>
  );
}
