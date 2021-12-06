import React, { useState, useEffect } from 'react';
import { Pane, Button, Dialog, Card, Text, Heading, Code } from 'evergreen-ui';
import ResolverApplicationForm from './ResolverApplicationForm';
import ResolverDeletatingConfirmation from './ResolverDeletatingConfirmation';
import ResolverStatus from '../components/ResolverStatus';
import CopyableText from '../components/CopyableText';

import { useSubstrate } from '../substrate-lib';

import Resolver from '../utils/models/Resolver';

export default function Resolvers(props) {
  const [resolverIds, setResolverIds] = useState([]);
  const [resolvers, setResolvers] = useState([]);
  const [hasApplicationForm, setHasApplicationForm] = useState(false);
  const [selectedResolver, setSelectedResolver] = useState(null);

  const { api } = useSubstrate();

  const { accountPair } = props;

  const subscribeAllResolverIds = () => {
    let unsub = null;

    const asyncFetch = async () => {
      unsub = await api.query.p2PPayment.allResolvers(ids => {
        setResolverIds(ids.toJSON());
      });
    };

    asyncFetch();

    return () => {
      unsub && unsub();
    };
  };

  const subscribeAllResolvers = () => {
    let unsub = null;

    const asyncFetch = async () => {
      unsub = await api.query.p2PPayment.resolvers.multi(resolverIds, items => {
        const resolversArr = items.map(resolver => {
          return Resolver(resolver.value);
        });
        setResolvers(resolversArr);
      });
    };

    asyncFetch();

    return () => {
      unsub && unsub();
    };
  };

  useEffect(subscribeAllResolverIds, []);
  useEffect(subscribeAllResolvers, [resolverIds]);

  const shortedAddress = address => {
    if (address) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    return '';
  };

  const isResolver = !!resolverIds.find(id => accountPair.address === id);

  return (
    <Pane>
      <Pane display="flex" justifyContent="flex-end" padding={16}>
        {!isResolver && (
          <Pane>
            <Button
              appearance="primary"
              onClick={() => setHasApplicationForm(true)}
            >
              Apply to be a resolver
            </Button>
          </Pane>
        )}
      </Pane>

      <Pane marginTop={16} display="grid" gridTemplateColumns="1fr 1fr 1fr">
        {resolvers.map(resolver => (
          <Card maxWidth="480px" elevation="1" padding={32} margin={8}>
            <Pane display="flex" alignItems="center">
              <Heading marginRight={8}>{resolver.name}</Heading>
              <ResolverStatus status={resolver.status}></ResolverStatus>
            </Pane>

            <Pane display='flex' marginTop='16px' alignItems='center'>
              <Pane flex='1 0 0'>
                <Heading size={400}>Address: </Heading>
              </Pane>
              <Pane flex='4 0 0' marginLeft={16}>
                <CopyableText content={resolver.account}/>
              </Pane>
            </Pane>

            <Pane display='flex' marginTop='16px' alignItems='center'>
              <Pane flex='1 0 0'>
                <Heading size={400}>Staked: </Heading>
              </Pane>
              <Pane flex='4 0 0' marginLeft={8}>
                <Text size={400}>{resolver.staked} <b>Libra</b></Text>
              </Pane>
            </Pane>

            <Pane marginTop={16} borderBottom="solid 1px #E6E8F0" width="100%"></Pane>

            <Pane marginTop={16}>
              <Heading size={500} marginBottom={8}>About resolver</Heading>
              <Code background='none' boxShadow='none' whiteSpace='pre-line' padding={0} >{resolver.application}</Code>
            </Pane>
            <Pane marginTop="16px" display="flex" justifyContent="flex-end">
              {resolver.account !== accountPair.address && (
                <Button
                  onClick={() => {
                    setSelectedResolver(resolver);
                  }}
                  appearance="primary"
                >
                  Delegate
                </Button>
              )}
            </Pane>
          </Card>
        ))}
      </Pane>

      <Dialog
        isShown={!!selectedResolver}
        title="Delegate libra to resolver"
        hasFooter={false}
        onCloseComplete={() => setSelectedResolver(null)}
        shouldCloseOnOverlayClick={false}
      >
        {
          <ResolverDeletatingConfirmation
            accountPair={accountPair}
            resolver={selectedResolver}
            onFormClosed={() => {
              setSelectedResolver(null);
            }}
          />
        }
      </Dialog>

      <Dialog
        isShown={hasApplicationForm}
        title="Resolver Application"
        hasFooter={false}
        onCloseComplete={() => setHasApplicationForm(false)}
        shouldCloseOnOverlayClick={false}
      >
        <ResolverApplicationForm
          accountPair={accountPair}
          onFormClosed={() => {
            setHasApplicationForm(false);
          }}
        />
      </Dialog>
    </Pane>
  );
}
