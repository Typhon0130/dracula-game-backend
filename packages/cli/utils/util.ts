import { PublicKey } from "@solana/web3.js";
import log from "loglevel";
import { GameItem } from "../../sdk";

export async function sleep(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export async function loadNFT(nftAdapter: GameItem, address: string) {
  try {
    const mint = new PublicKey(address);
    const metadata = await nftAdapter.fetchMetadata(mint);
    const { kind, genIndex } = await nftAdapter.fetchJsondata(
      address,
      metadata.data.uri
    );
    log.info(`Loading NFT: ${address}`);
    return { mint, kind, genIndex };
  } catch (err) {
    log.info(`Failed to load NFT: ${address}`);
    log.info("Retrying in 5 seconds...");
    await sleep(5);
    return loadNFT(nftAdapter, address);
  }
}
