
# Project Libra


## Intro 

**Polkadot Hackathon:** APAC Edition
**Challange:** Build a Blockchain

**Project title:** Libra - Decentralized Payment Network

**Project description:**   
Blockchain is revolutionizing eCommerce, making payment safer and faster while bringing greater access to global consumers.
Due to the nature of digital currency protocols, transactions cannot be canceled or altered once they are initiated. However, global eCommerce data shows that at least 30% of all products ordered online are returned.

How can we adopt blockchain to eCommerce with such a barrier?

Libra was born to tackle this problem and help facilitate blockchain adoption in the eCommerce industry.  
Libra is a decentralized payment network. Through its SDK, Libra allows sellers to accept cryptocurrency payments in minutes.  
Libra includes a Lock and Release Payment (LRP) Protocol and Resolvers Network at its core.  
LRP Protocol helps the buyer to purchase with confidence. It also helps the seller to increase conversion and do proper order handling.  
Resolvers Network leverages the power of blockchain and the community to resolve transaction conflict in a quick and efficient method without involving any financial institution.  

Libra bridges the gap between blockchain and eCommerce to enable all people to exchange value and transact globally, securely, at significantly lower cost, and more inclusively than traditional financial systems allow.

## Submissions 
- Pitch Video: https://youtu.be/pR4_2nrrJQQ
- Demo Screencast: https://youtu.be/cR7gKSzVoAY
- Live Webapp running substrate chain: https://app.libra.atscale.xyz
- Pitch Deck: https://docs.google.com/presentation/d/1Bz5XrE3a2AwFM9w1aMa1ozCS1K0ivSAQLhD3AyWoSmc/edit?usp=sharing

## Techstack
- Substrate 
- ReactJS 
- Deployment: AWS and Netlify

## How to access live application 

The live running web application endpoint: https://app.libra.atscale.xyz

The wss enpoint: wss://rpc.libra.atscale.xyz

The explorer endpoint: https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc.libra.atscale.xyz#/explorer

### Create a testnet account

You need to create at least one buyer account and one seller account to test the transaction. 

- To create a testnet account, please go to https://polkadot.js.org/extension/ and install PolkadotJs extension

- Go to the faucet page at https://app.libra.atscale.xyz/faucet to get the Libra tokens 

### Complete your first payment
- Go to https://app.libra.atscale.xyz/
- Click at `Create payment`
- Copy your payment URL and send it to your buyer
- Ask your buyer to deposit the libra tokens
- Once you delivered your order, ask your buyer to release the tokens to you
- If there are any conflicts, please create a dispute with your evidence
- An random resolver will be assigned to resolve your dispute

### How to become a resolver

- Go to https://app.libra.atscale.xyz/resolvers
- Click at `Apply to be resolver`
- Input your application and submit
- Resolver require to stake 100 0000 Libra and nomination 100 0000 Libra from the community to become an active resolver

Note: Resolver is randomly pick from the resolvers network. When you test the dispute process, your resolver may not be assigned. 

## Development Setup

### Setup and build

```bash
sudo apt update && sudo apt install -y git clang curl libssl-dev llvm libudev-dev
curl https://sh.rustup.rs -sSf | sh
source ~/.cargo/env
rustup default stable
rustup update
rustup update nightly
rustup target add wasm32-unknown-unknown --toolchain nightly


cd polkadot-hackathon-apac/libra-node
cargo build --release

```

### Run local chain
Single node development chain with tmp data storage

```bash
./target/release/hydra-dx --dev --tmp
```

### Testnet node
Runing a node of testnet
```
./target/release/node-template \
--chain="./specs/testnet-raw.json" \
--port 30333 \
--ws-port 9944 \
--rpc-port 9933 \
--rpc-cors all \
--rpc-methods Unsafe \
--name Yourname

```

### Webapp Development
Start development webapp connect to `ws://127.0.0.1:9944`

```js
cd frontend 
yarn && yarn start
```

### Staging
Staging environment which is connected to `wss://rpc.libra.atscale.xyz`

```js
cd frontend 

yarn && yarn build

serve build
```

## Copyright and license
Code released under the [MIT License](https://en.wikipedia.org/wiki/MIT_License).
