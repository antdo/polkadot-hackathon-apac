import React from 'react';
import { Pane, Spinner, Text } from 'evergreen-ui';

export default function Loader(props = {}) {
  return (
    <Pane
      width="100vw"
      height="100vh"
      position="fixed"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Spinner size={24} marginRight="8px" />
      {props.message ? <Text>{props.message}</Text> : ''}
    </Pane>
  );
}
