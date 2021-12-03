./target/release/node-p2p_payment key insert \
--chain="./specs/stagingRaw.json" \
--base-path=$BASE_PATH \
--suri $SEED_KEY \
--key-type aura

./target/release/node-p2p_payment key insert \
--chain="./specs/stagingRaw.json" \
--base-path=$BASE_PATH \
--suri $SEED_KEY \
--key-type gran

./target/release/node-p2p_payment \
--chain="./specs/stagingRaw.json" \
--name $NODE_NAME \
--port 30333 \
--ws-port 9944 \
--rpc-port 9933 \
--rpc-cors all \
--rpc-methods Unsafe \
--validator \
--base-path=$BASE_PATH \
--bootnodes $BOOT_NODES