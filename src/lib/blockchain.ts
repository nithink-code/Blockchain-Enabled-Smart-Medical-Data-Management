import CryptoJS from 'crypto-js';

export interface BlockchainBlock {
  index: number;
  timestamp: number;
  data: any;
  previousHash: string;
  hash: string;
}

export class MedicalBlockchain {
  private chain: BlockchainBlock[];

  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  private createGenesisBlock(): BlockchainBlock {
    const timestamp = Date.now();
    const data = { message: "Genesis Block - MedChain Initialized" };
    return {
      index: 0,
      timestamp,
      data,
      previousHash: "0",
      hash: this.calculateHash(0, "0", timestamp, data)
    };
  }

  private calculateHash(index: number, previousHash: string, timestamp: number, data: any): string {
    return CryptoJS.SHA256(index + previousHash + timestamp + JSON.stringify(data)).toString();
  }

  getLatestBlock(): BlockchainBlock {
    return this.chain[this.chain.length - 1];
  }

  addBlock(data: any): BlockchainBlock {
    const previousBlock = this.getLatestBlock();
    const index = previousBlock.index + 1;
    const timestamp = Date.now();
    const previousHash = previousBlock.hash;
    const hash = this.calculateHash(index, previousHash, timestamp, data);
    
    const newBlock: BlockchainBlock = {
      index,
      timestamp,
      data,
      previousHash,
      hash
    };
    
    this.chain.push(newBlock);
    return newBlock;
  }

  getChain(): BlockchainBlock[] {
    return this.chain;
  }

  isValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== this.calculateHash(currentBlock.index, currentBlock.previousHash, currentBlock.timestamp, currentBlock.data)) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

// Singleton instance for the demo (normally this would be a real distributed ledger or persistent DB)
let blockchainInstance: MedicalBlockchain;

export function getBlockchain() {
  if (!blockchainInstance) {
    blockchainInstance = new MedicalBlockchain();
    // Add some sample data
    blockchainInstance.addBlock({ action: "UPLOAD", file: "Blood_Test_Dec.pdf", user: "self" });
    blockchainInstance.addBlock({ action: "GRANT", doctor: "Dr. Sarah Johnson", duration: "48h", purpose: "Emergency Cardiology Consult" });
  }
  return blockchainInstance;
}
