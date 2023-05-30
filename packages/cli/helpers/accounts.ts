import fs from "fs";
import log from "loglevel";

import { Wallet, Provider, Program, Idl } from "@project-serum/anchor";
import { Keypair, Connection, Cluster, clusterApiUrl } from "@solana/web3.js";
import * as constant from "../../sdk/helpers/constant";
import { DraculaGame } from "../../../target/types/dracula_game";
import * as idl from "../../../target/idl/dracula_game.json";

export function loadWalletKey(keypair: string): Keypair {
  if (!keypair || keypair === "") {
    throw new Error("Keypair is required!");
  }
  const loaded = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(keypair).toString()))
  );
  log.info(`wallet public key: ${loaded.publicKey}`);
  return loaded;
}

export function loadDraculaGameProgram(
  walletKeyPair: Keypair,
  env: string,
  customRpcUrl?: string
): Program<DraculaGame> {
  if (customRpcUrl) {
    log.info("USING CUSTOM URL", customRpcUrl);
  }

  const connection = new Connection(
    customRpcUrl || clusterApiUrl(env as Cluster)
  );

  const wallet = new Wallet(walletKeyPair);
  const provider = new Provider(connection, wallet, {
    preflightCommitment: "max",
  });

  return new Program(
    idl as Idl,
    constant.PROGRAM_ID,
    provider
  ) as Program<DraculaGame>;
}
