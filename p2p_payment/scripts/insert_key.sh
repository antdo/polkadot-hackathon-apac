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
