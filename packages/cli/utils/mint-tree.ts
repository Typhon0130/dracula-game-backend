import { BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { keccak_256 } from "js-sha3";

import { MerkleTree } from "./merkle-tree";

type uint8 = number;

export class MintTree {
  private readonly _tree: MerkleTree;

  constructor(mints: { mint: string; kind: uint8; genIndex: uint8 }[]) {
    this._tree = new MerkleTree(
      mints.map(({ mint, kind, genIndex }, index) => {
        return MintTree.toNode(index, new PublicKey(mint), kind, genIndex);
      })
    );
  }

  static verifyProof(
    index: number,
    mint: string,
    kind: uint8,
    genIndex: uint8,
    proof: Buffer[],
    root: Buffer
  ): boolean {
    let pair = MintTree.toNode(index, new PublicKey(mint), kind, genIndex);
    for (const item of proof) {
      pair = MerkleTree.combinedHash(pair, item);
    }

    return pair.equals(root);
  }

  // keccak256(abi.encode(index, mint, kind, genIndex))
  static toNode(
    index: number,
    mint: PublicKey,
    kind: uint8,
    genIndex: uint8
  ): Buffer {
    const buf = Buffer.concat([
      new BN(index).toArrayLike(Buffer, "le", 8),
      mint.toBuffer(),
      new Uint8Array([kind]),
      new Uint8Array([genIndex]),
    ]);
    return Buffer.from(keccak_256(buf), "hex");
  }

  // returns the hex bytes32 values of the root
  getHexRoot(): string {
    return this._tree.getHexRoot();
  }

  // returns the hex bytes32 values of the proof
  getHexProof(
    index: number,
    mint: string,
    kind: uint8,
    genIndex: uint8
  ): string[] {
    return this._tree.getHexProof(
      MintTree.toNode(index, new PublicKey(mint), kind, genIndex)
    );
  }

  getRoot(): uint8[] {
    return [...this._tree.getRoot()];
  }

  getProof(
    index: number,
    mint: string,
    kind: uint8,
    genIndex: uint8
  ): uint8[][] {
    return this._tree
      .getProof(MintTree.toNode(index, new PublicKey(mint), kind, genIndex))
      .map((it) => [...it]);
  }
}
