import React, { useEffect, useState } from 'react'
import { Form, Grid } from 'semantic-ui-react'

import { useSubstrate } from './substrate-lib'
import { TxButton } from './substrate-lib/components'

import KittyCards from './KittyCards'

// Construct a Kitty ID from storage key
const convertToKittyHash = entry => `0x${entry[0].toJSON().slice(-64)}`

// Construct a Kitty object
const constructKitty = (hash, { dna, price, gender, owner }) => ({
  id: hash,
  dna,
  price: price.toJSON(),
  gender: gender.toJSON(),
  owner: owner.toJSON(),
})

// Use React hooks
export default function Kitties(props) {
  const { api, keyring } = useSubstrate()
  const { accountPair } = props

  const [kittyHashes, setKittyHashes] = useState([])
  const [kitties, setKitties] = useState([])
  const [status, setStatus] = useState('')

  // Subscription function for setting Kitty IDs
  const subscribeKittyCnt = () => {
    let unsub = null

    const asyncFetch = async () => {
      // Query KittyCnt from runtime
      unsub = await api.query.substrateKitties.kittyCnt(async cnt => {
        // Fetch all Kitty objects using entries()
        const entries = await api.query.substrateKitties.kitties.entries()
        // Retrieve only the Kitty ID and set to state
        const hashes = entries.map(convertToKittyHash)
        setKittyHashes(hashes)
      })
    }

    asyncFetch()

    // return the unsubscription cleanup function
    return () => {
      unsub && unsub()
    }
  }

  const subscribeKitties = () => {
    let unsub = null

    const asyncFetch = async () => {
      unsub = await api.query.substrateKitties.kitties.multi(kittyHashes, kitties => {
        const kittyArr = kitties
          .map((kitty, ind) => constructKitty(kittyHashes[ind], kitty.value));
        setKitties(kittyArr);
      });
    };

    asyncFetch()

    // return the unsubscription cleanup function
    return () => {
      unsub && unsub()
    }
  }

  useEffect(subscribeKittyCnt, [api, keyring])
  useEffect(subscribeKitties, [api, kittyHashes])
  console.log(kitties);

  return (
    <Grid.Column width={16}>
      <h1>Kitties</h1>
      <KittyCards
        kitties={kitties}
        accountPair={accountPair}
        setStatus={setStatus}
      />
      <Form style={{ margin: '1em 0' }}>
        <Form.Field style={{ textAlign: 'center' }}>
          <TxButton
            accountPair={accountPair}
            label="Create Kitty"
            type="SIGNED-TX"
            setStatus={setStatus}
            attrs={{
              palletRpc: 'substrateKitties',
              callable: 'createKitty',
              inputParams: [],
              paramFields: [],
            }}
          />
        </Form.Field>
      </Form>
      <div style={{ overflowWrap: 'break-word' }}>{status}</div>
    </Grid.Column>
  )
}
