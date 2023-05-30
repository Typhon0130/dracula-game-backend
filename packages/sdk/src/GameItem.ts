import fetch from "node-fetch";
import { BN } from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  MetadataData,
  Metadata,
} from "@metaplex-foundation/mpl-token-metadata";

const KIND_MAPPING = {
  undefined: 0,
  O: 1,
  A: 2,
  B: 3,
};

export interface GameItemData {
  name: string;
  symbol: string;
  image: string;
  mint: string;
  kind: number;
  genIndex: number;
}

export interface StakedVampireData extends GameItemData {
  state: {
    rewardAmount: BN;
    minUnstakeAmount: BN;
    taxFee: number;
    lossChance: number;
  };
}

export interface StakedHumanData extends GameItemData {
  state: {
    rewardPerTick: number;
    tickDuration: number;
    rewardAmount: BN;
    minUnstakeAmount: BN;
    taxFee: number;
    lossChance: number;
  };
}

export default class GameItem {
  protected connection: Connection;

  /**
   * constructor
   *
   * @param connection
   */
  constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * load JSON metadata
   *
   * @param mint NFT mint address
   */
  public async fetchJsondata(mint: string, uri: string): Promise<GameItemData> {
    const jsondata = await (await fetch(uri)).json();

    const typeAttr = jsondata.attributes.find(
      (attr: { trait_type: string; value: string }) =>
        attr.trait_type === "Type"
    );
    const kind = KIND_MAPPING[typeAttr?.value];

    const genAttr = jsondata.attributes.find(
      (attr: { trait_type: string; value: string }) =>
        attr.trait_type === "Generation"
    );
    const genIndex = Number(genAttr?.value || 0);

    return {
      name: jsondata.name,
      symbol: jsondata.symbol,
      image: jsondata.image,
      mint,
      kind,
      genIndex,
    };
  }

  /**
   * @param mint NFT mint address
   */
  public async fetchMetadata(mint: PublicKey): Promise<MetadataData> {
    const metadataAccount = await Metadata.getPDA(mint);
    const info = await this.connection.getAccountInfo(metadataAccount);
    return MetadataData.deserialize(info.data);
  }
}
