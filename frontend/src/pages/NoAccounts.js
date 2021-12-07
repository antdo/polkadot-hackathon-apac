import React from 'react';
import { Pane, Button, Card, Heading, Text } from 'evergreen-ui';


export default function NoAccounts(props) {
  return (
    <Pane
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Card elevation={2} padding={32} width={480}>
        <Heading size={600}>There is no any account found</Heading>
        <Pane marginTop={16} marginBottom={8}>
          <Text>Sorry! We can not detect any account on your browser.</Text>
        </Pane>
        <Pane>
          <Text>If you don't have the PolkadotJs extension on your browser, please install it before using the app.</Text>
        </Pane>
        <Pane paddingTop={16} display='flex' justifyContent='center'>
          <Button appearance='primary' onClick={() => { window.location = 'https://polkadot.js.org/extension/'}}>Install extension</Button>
        </Pane>
      </Card>
    </Pane>
  );
}
