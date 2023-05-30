# dracula-game

## Addresses

- Program: DraGHJgLfwuJBvUx4vDtsEits7gveFzUvBR1h1osEEjk
- Fee Payer: BLAAD4qhaVZ5fuGE2DYdhdUH8ivJFfNPadTx1LgrZnKR
- Lottery Vault: 7qHgYMqiMmftq61xV4wYU16YbJNeHmWCFZafQFG5fNQo

### Devnet

- BLOOD Mint: BLAADw6DuDtat8f3y3dTJDtwxnfUnQMq5NX9LuoPodSb
- BLOOD Vault: 76a4JE6o3ipizJEUtoQ9ak2PCrcTVaZU1TsvoT577A4r
- Vault Authority: nhMnirnRDrQbtEEHCT33bp1hxQvYorVdWVEMVj6SaxB
- Bot: BLAAD2p7s5CUMdZfz5a3xE3Z3dwach1cLU8fiwN7i3AE

### Mainnet-beta

- BLOOD Mint: BLAAD2QLUgRSbQ9AB9jqAoHh55cGVcSBaCH9JGBh2zDX
- BLOOD Vault: Afm1tP4Vgfx4ctSzQLsC3Anwwdb7MfsFuoeskxmqUR82
- Vault Authority: BJEEsaTHvA5SFruZ935WXP9gQWeH53a6cvzZYA81bNuk
- Bot: BLAADC4hbt9Fuscs2c5JZYyiqNJZ8BpY3TP7bWTWN3Yc


## Upgrade program

```bash
anchor upgrade --provider.cluster devnet \
    --program-id DraGHJgLfwuJBvUx4vDtsEits7gveFzUvBR1h1osEEjk \
    --provider.wallet ~/.config/solana/JBxidGWnhtPTGg8xw7sFT9tF4cfGtHnjYNp5GDJvGveh.json \
    ./target/deploy/dracula_game.so
```

## CLI

```bash
# initialize game
ts-node packages/cli create-game \
    -k ~/workspace/Dracula/Keypairs/fee-payer.json \
    -ak ~/.config/solana/JBxidGWnhtPTGg8xw7sFT9tF4cfGtHnjYNp5GDJvGveh.json \
    -ma BLAADw6DuDtat8f3y3dTJDtwxnfUnQMq5NX9LuoPodSb \
    -ba BLAAD2p7s5CUMdZfz5a3xE3Z3dwach1cLU8fiwN7i3AE

# mint 100M $BLOOD to vault
spl-token mint -u devnet \
    --mint-authority ~/.config/solana/JBxidGWnhtPTGg8xw7sFT9tF4cfGtHnjYNp5GDJvGveh.json \
    BLAADw6DuDtat8f3y3dTJDtwxnfUnQMq5NX9LuoPodSb \
    100000000 \
    Afm1tP4Vgfx4ctSzQLsC3Anwwdb7MfsFuoeskxmqUR82

# create merkle root for Gen
ts-node packages/cli create-gen \
    -k ~/workspace/Dracula/Keypairs/fee-payer.json \
    -ak ~/.config/solana/JBxidGWnhtPTGg8xw7sFT9tF4cfGtHnjYNp5GDJvGveh.json \
    --index 0 \
    --path ~/workspace/Dracula/Gen0/GEN0_E6pEsN3uoSn5icDNNC8Vi5SER3BEvj8AS3ECXpCYbp8Q.txt \
    --tree-only \
    --create-flag

# create lottery pool
ts-node packages/cli create-lottery-pool \
    -k ~/workspace/Dracula/Keypairs/fee-payer.json \
    -ak ~/.config/solana/JBxidGWnhtPTGg8xw7sFT9tF4cfGtHnjYNp5GDJvGveh.json \
    -ma BLAADw6DuDtat8f3y3dTJDtwxnfUnQMq5NX9LuoPodSb \
    -ba BLAAD2p7s5CUMdZfz5a3xE3Z3dwach1cLU8fiwN7i3AE

# refresh lottery pool
ts-node packages/cli refresh-lottery-pool \
    -k ~/workspace/Dracula/Keypairs/fee-payer.json \
    -bk ~/workspace/Dracula/Keypairs/bot-devnet.json \
    --start-time 2022-03-23T22:00:00.000Z \
    --end-time 2022-03-24T22:00:00.000Z

# distribute rewards to vampires
ts-node packages/cli refresh-vampires \
    -k ~/workspace/Dracula/Keypairs/fee-payer.json \
    -bk ~/workspace/Dracula/Keypairs/bot-devnet.json

# inspect human
ts-node packages/cli inspect-human \
    -k ~/workspace/Dracula/Keypairs/fee-payer.json \
    -ma 5hXQtvpYDYgKh3zyaiF2Wq1Gcyf2epDhkjsvpZDkdXr6

# inspect vampire
ts-node packages/cli inspect-vampire \
    -k ~/workspace/Dracula/Keypairs/fee-payer.json \
    -ma 5hXQtvpYDYgKh3zyaiF2Wq1Gcyf2epDhkjsvpZDkdXr6
```
