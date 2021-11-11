import React from 'react';
import {
  Container,
  Grid,
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

import { SubstrateContextProvider } from '../substrate-lib';
import { DeveloperConsole } from '../substrate-lib/components';

import Balances from '../components/Balances';
import BlockNumber from '../components/BlockNumber';
import Events from '../components/Events';
import Interactor from '../components/Interactor';
import Metadata from '../components/Metadata';
import NodeInfo from '../components/NodeInfo';
import TemplateModule from '../components/TemplateModule';
import Transfer from '../components/Transfer';
import Upgrade from '../components/Upgrade';

function Main(props) {
  const { accountPair } = props;

  return (
    <div>
      <Container>
        <Grid stackable columns="equal">
          <Grid.Row stretched>
            <NodeInfo />
            <Metadata />
            <BlockNumber />
            <BlockNumber finalized />
          </Grid.Row>
          <Grid.Row stretched>
            <Balances />
          </Grid.Row>
          <Grid.Row>
            <Transfer accountPair={accountPair} />
            <Upgrade accountPair={accountPair} />
          </Grid.Row>
          <Grid.Row>
            <Interactor accountPair={accountPair} />
            <Events />
          </Grid.Row>
          <Grid.Row>
            <TemplateModule accountPair={accountPair} />
          </Grid.Row>
        </Grid>
      </Container>
      <DeveloperConsole />
    </div>
  );
}

export default function ChainState(props) {
  return (
    <SubstrateContextProvider>
      <Main {...props} />
    </SubstrateContextProvider>
  );
}
