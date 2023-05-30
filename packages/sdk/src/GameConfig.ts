import { PublicKey } from "@solana/web3.js";

export default interface GameConfig {
  mint: PublicKey;
  apiEndpoint: string;
}
