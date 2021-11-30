import React, { useState } from 'react';
import {
  Pane,
  Code,
  Tooltip,
  IconButton,
  DuplicateIcon,
} from 'evergreen-ui';

import shortenStr from '../utils/shortenStr';
import copyToClipBoard from '../utils/copyToClipboard';

export default function PaymentForm(props) {
  const { content } = props;

  const [isCopied, setIsCopied] = useState(true);

  return (
    <Pane onMouseLeave={() => setIsCopied(false) }>
      <Code display='flex' justifyContent='space-between'>
        <Pane display='flex' alignItems='center'>
          { shortenStr(content) }
        </Pane>
        <Tooltip content={isCopied ? 'Copied' : 'Copy' }>
          <IconButton
            size="small"
            onClick={() => {
              copyToClipBoard(content);
              setIsCopied(true);
            }}
            marginLeft={16}
            icon={<DuplicateIcon size={12} />}
          />
        </Tooltip>
      </Code>
      
    </Pane>
  );
}
