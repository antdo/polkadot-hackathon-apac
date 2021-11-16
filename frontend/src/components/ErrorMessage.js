import React from 'react';
import { Pane, Text, ErrorIcon } from 'evergreen-ui';

export default function ErrorMessage(props = {}) {
  return (
    <Pane
      width="100vw"
      height="100vh"
      position="fixed"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <ErrorIcon color='danger' size={24} marginRight='8px'/>
      <Text size="600" color="danger">
        {props.message}
      </Text>
    </Pane>
  );
}
