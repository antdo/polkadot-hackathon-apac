import React, { useState, useEffect } from 'react';
import { Pane, Button, Dialog, Card,   Tablist, Tab, Badge, Heading } from 'evergreen-ui';
import CopyableText from '../components/CopyableText';
import { useSubstrate } from '../substrate-lib';

import Dispute from '../utils/models/Dispute';
import DisputeDetail from './DisputeDetail';

const INVOLVED_DISPUTES = 'Involved Disputes';
const ASIGNED_DISPUTES = 'Assigned Disputes';

function DisputeStatus({ status }) {
  console.log(status)
  if (status === 'Resolved') {
    return <Badge color="green">Resolved</Badge>;
  }

  return <Badge color="blue">Processinng</Badge>;
}

export default function Disputes(props) {
  const [disputeIds, setDisputeIds] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [involvedDisputeIds, setInvolvedDisputeIds] = useState([]);
  const [involvedDisputes, setInvolvedDisputes] = useState([]);
  const [selectedTab, setSelectedTab] = useState(ASIGNED_DISPUTES);
  const [selectedDispute, setSelectedDispute] = useState(null);

  const { api } = useSubstrate();

  const { accountPair } = props;

  const subscribeDisputeIds = () => {
    let unsub = null;

    const asyncFetch = async () => {
      unsub = await api.query.p2pPayment.assignedDisputes(accountPair.address, ids => {
        setDisputeIds(ids.toJSON());
      });
    };

    if (accountPair) {
      asyncFetch();
    }

    return () => {
      unsub && unsub();
    };
  };

  const subscribeDisputes = () => {
    let unsub = null;

    const asyncFetch = async () => {
      unsub = await api.query.p2pPayment.disputes.multi(disputeIds, (items) => {
        setDisputes(items.map((dispute, index) => {
          return Dispute(disputeIds[index], dispute.value);
        }));
      });
    };

    asyncFetch();

    return () => {
      unsub && unsub();
    };
  };

  const subscribeInvolvedDisputeIds = () => {
    let unsub = null;

    const asyncFetch = async () => {
      unsub = await api.query.p2pPayment.involvedDisputes(accountPair.address, ids => {
        setInvolvedDisputeIds(ids.toJSON());
      });
    };

    if (accountPair) {
      asyncFetch();
    }

    return () => {
      unsub && unsub();
    };
  };

  const subscribeInvolvedDisputes = () => {
    let unsub = null;

    const asyncFetch = async () => {
      unsub = await api.query.p2pPayment.disputes.multi(involvedDisputeIds, (items) => {
        setInvolvedDisputes(items.map((dispute, index) => {
          return Dispute(involvedDisputeIds[index], dispute.value);
        }));
      });
    };

    asyncFetch();

    return () => {
      unsub && unsub();
    };
  };

  useEffect(subscribeDisputeIds, [accountPair]);
  useEffect(subscribeDisputes, [disputeIds]);
  useEffect(subscribeInvolvedDisputeIds, [accountPair]);
  useEffect(subscribeInvolvedDisputes, [disputeIds]);

  const renderedDisputes = selectedTab === ASIGNED_DISPUTES ? disputes : involvedDisputes;

  return (
    <Pane>
      <Tablist marginBottom={16} flexBasis={240} marginRight={24}>
        <Tab
          key={ASIGNED_DISPUTES}
          id={ASIGNED_DISPUTES}
          onSelect={() => setSelectedTab(ASIGNED_DISPUTES)}
          isSelected={selectedTab === ASIGNED_DISPUTES}
          aria-controls={ASIGNED_DISPUTES}
        >
          {ASIGNED_DISPUTES}
        </Tab>
         <Tab
            key={INVOLVED_DISPUTES}
            id={INVOLVED_DISPUTES}
            onSelect={() => setSelectedTab(INVOLVED_DISPUTES)}
            isSelected={selectedTab === INVOLVED_DISPUTES}
            aria-controls={INVOLVED_DISPUTES}
          >
            {INVOLVED_DISPUTES}
          </Tab>
      </Tablist>
      <Pane marginTop={32} display="grid" gridTemplateColumns="1fr 1fr 1fr">
        {renderedDisputes.map((dispute, index) => (
          <Card minWidth="440px" elevation={1} key={index} padding={16} margin={8}>
            <Pane display='flex' alignItems='center' flexWrap='wrap'>
              <Heading marginRight={8} size={500}>{ dispute.reason }</Heading>
              <DisputeStatus status={dispute.status}/>
            </Pane>

            <Pane display='flex' marginTop='24px' alignItems='center'>
              <Pane flex='1 0 0'>
                <Heading size={400}>Payment URL: </Heading>
              </Pane>
              <Pane flex='3 0 0'>
                <CopyableText content={`${window.location.origin}/payments/${dispute.paymentId}`}/>
              </Pane>
            </Pane>

            <Pane display='flex' marginTop='8px' alignItems='center'>
              <Pane flex='1 0 0'>
                <Heading size={400}>Created by: </Heading>
              </Pane>
              <Pane flex='3 0 0'>
                <CopyableText content={dispute.issuer}/>
              </Pane>
            </Pane>

            <Pane display='flex' marginTop='16px' justifyContent='flex-end' alignItems='center'>
              <Button onClick={() => setSelectedDispute(dispute)}>View detail</Button>
            </Pane>
          </Card>
        ))}
      </Pane>
      <Dialog
        isShown={!!selectedDispute}
        title="Process dispute"
        hasFooter={false}
        onCloseComplete={() => setSelectedDispute(null)}
        shouldCloseOnOverlayClick={false}
        width='800px'
      >
        <DisputeDetail accountPair={accountPair} disputeId={(selectedDispute || {}).id}></DisputeDetail>
      </Dialog>
    </Pane>
  );
}
