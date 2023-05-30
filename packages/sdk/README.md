# dracula-game-sdk

## Installation

```bash
npm install dracula-game-sdk
```

## Load Dracula Game adapter

```typescript
const { connection } = useConnection();
const { publicKey, sendTransaction } = useWallet();

const provider = new Provider(connection, useWallet() as any, {
  preflightCommitment: "confirmed",
});

const config: GameConfig = {
  mint: new PublicKey(process.env.MINT_PUBKEY)
}

// initialize Game adapter
const adapter = new GameAdapter(provider, config);
await adapter.build();

// initialize player
const player = new Player(adapter);
const playerState = await player.getState();
const gameItems = await player.getGameItems();
```

## Sign & send transaction w/ connected wallet

```typescript
try {
  const tx = await player.stakeHuman(mint);
  let signature = await sendTransaction(tx, connection);
  await connection.confirmTransaction(signature, "confirmed");
} catch (err) {
  // handle custom program error code
}
```

## Player APIs

```typescript
await player.stakeHuman(mint);
await player.unstakeHuman(mint);
await player.gambleHuman(mint);
await player.harvestHuman(mint);
await player.stakeVampire(mint);
await player.unstakeVampire(mint);
await player.gambleVampire(mint);
await player.harvestVampire(mint);
await player.claimRewards();
```
