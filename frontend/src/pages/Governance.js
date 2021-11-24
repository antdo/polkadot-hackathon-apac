import React, { useState, useEffect } from 'react';
import { Pane, Button, Dialog, Card, Text } from 'evergreen-ui';
import ResolverApplicationForm from './ResolverApplicationForm';
import ResolverDeletatingConfirmation from './ResolverDeletatingConfirmation';
import ResolverStatus from '../components/ResolverStatus';

import { useSubstrate } from '../substrate-lib';

import Resolver from '../utils/models/Resolver';

export default function Governance(props) {
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

  return (
    <Pane>
      <Pane display="flex" justifyContent="flex-end" padding={16}>
        <Pane>
          <Button
            appearance="primary"
            onClick={() => setHasApplicationForm(true)}
          >
            Apply to be a resolver
          </Button>
        </Pane>
      </Pane>

      <Pane marginTop={32} display='grid' gridTemplateColumns="1fr 1fr 1fr 1fr">
        {resolvers.map(resolver => (
          <Card maxWidth="480px" elevation="1" padding={16} margin={8}>
            <Pane>
              <Text fontWeight={700}>Name: </Text>
              <Text marginRight={8}>{resolver.name}</Text>
              <ResolverStatus status={resolver.status}></ResolverStatus>
            </Pane>

            <Pane marginTop={8}>
              <Text fontWeight={700}>Address: </Text>
              <Text>{shortedAddress(resolver.account)}</Text>
            </Pane>

            <Pane marginTop={8}>
              <Text fontWeight={700}>Application: </Text>
              <Text>{resolver.application}</Text>
            </Pane>

            <Pane marginTop={8}>
              <Text fontWeight={700}>Staked: </Text>
              <Text>{resolver.staked} libra</Text>
            </Pane>

            <Pane marginTop="16px" display="flex" justifyContent="flex-end">
              <Button onClick={() => { setSelectedResolver(resolver) }} appearance="primary">Delegate</Button>
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
          selectedResolver && 
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
        title="Create Payment"
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
