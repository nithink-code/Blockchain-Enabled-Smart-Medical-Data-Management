import { ethers } from "ethers";
import contractData from "./contracts/TimeBasedHealthAccess.json";

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_HEALTH_ACCESS_CONTRACT_ADDRESS || contractData.address;
export const CONTRACT_ABI = contractData.abi;

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: string | null;
  error?: string;
}

export interface RequestAccessTxResult {
  txHash: string;
  requestId: number;
  hospitalAddress: string;
  patientAddress: string;
  durationInSeconds: number;
  blockNumber: number;
}

/**
 * Returns true if an Ethereum wallet provider (like MetaMask) is detected in the browser.
 */
export function isWalletAvailable(): boolean {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

/**
 * Get an Ethers BrowserProvider from window.ethereum.
 */
export function getBrowserProvider(): ethers.BrowserProvider | null {
  if (!isWalletAvailable()) return null;
  return new ethers.BrowserProvider(window.ethereum);
}

/**
 * Request account connection from the browser wallet.
 */
export async function connectWallet(): Promise<{ address: string; chainId: string }> {
  if (!isWalletAvailable()) {
    throw new Error("No Ethereum wallet found. Please install MetaMask or another Web3 wallet.");
  }

  const provider = getBrowserProvider();
  if (!provider) {
    throw new Error("Unable to initialize Web3 provider.");
  }

  // Request accounts
  const accounts = await provider.send("eth_requestAccounts", []);
  if (!accounts || accounts.length === 0) {
    throw new Error("No accounts found or connection was rejected by the user.");
  }

  const network = await provider.getNetwork();
  return {
    address: accounts[0],
    chainId: network.chainId.toString(),
  };
}

/**
 * Get currently active wallet address without prompting a connection pop-up.
 */
export async function getActiveWallet(): Promise<string | null> {
  if (!isWalletAvailable()) return null;
  try {
    const provider = getBrowserProvider();
    if (!provider) return null;
    const accounts: string[] = await provider.send("eth_accounts", []);
    return accounts && accounts.length > 0 ? accounts[0] : null;
  } catch {
    return null;
  }
}

/**
 * Instantiate the TimeBasedHealthAccess Contract.
 */
export function getHealthAccessContract(runner: ethers.ContractRunner) {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, runner);
}

/**
 * Calls requestAccess(address _patient, string calldata _recordHash, uint256 _durationInSeconds) on-chain.
 */
export async function callContractRequestAccess({
  patientAddress,
  recordHash,
  durationInSeconds,
  onStatusChange,
}: {
  patientAddress: string;
  recordHash: string;
  durationInSeconds: number;
  onStatusChange?: (status: "prompting" | "pending" | "confirmed") => void;
}): Promise<RequestAccessTxResult> {
  if (!isWalletAvailable()) {
    throw new Error("MetaMask or compatible Web3 wallet is not detected. Please install a wallet extension.");
  }

  if (!ethers.isAddress(patientAddress)) {
    throw new Error(`Invalid patient Ethereum address: "${patientAddress}". It must be a valid 42-character 0x... address.`);
  }

  if (!recordHash || recordHash.trim().length === 0) {
    throw new Error("Invalid record hash / CID.");
  }

  if (!durationInSeconds || durationInSeconds <= 0) {
    throw new Error("Duration must be greater than 0 seconds.");
  }

  const provider = getBrowserProvider()!;
  const signer = await provider.getSigner();
  const hospitalAddress = await signer.getAddress();

  const contract = getHealthAccessContract(signer);

  onStatusChange?.("prompting");

  // Call requestAccess
  const tx = await contract.requestAccess(
    patientAddress,
    recordHash.trim(),
    BigInt(durationInSeconds)
  );

  onStatusChange?.("pending");

  // Wait for 1 confirmation
  const receipt = await tx.wait(1);
  if (!receipt) {
    throw new Error("Transaction was sent but no receipt was returned.");
  }

  onStatusChange?.("confirmed");

  // Extract the requestId from AccessRequested event
  let requestId = 0;
  try {
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog({
          topics: [...log.topics],
          data: log.data,
        });
        if (parsed && parsed.name === "AccessRequested") {
          requestId = Number(parsed.args.requestId);
          break;
        }
      } catch {
        // Continue scanning other logs
      }
    }
  } catch (err) {
    console.warn("Could not parse AccessRequested event from receipt:", err);
  }

  // Fallback requestId if event parsing was not found
  if (!requestId) {
    requestId = Math.floor(Date.now() / 1000);
  }

  return {
    txHash: tx.hash,
    requestId,
    hospitalAddress,
    patientAddress,
    durationInSeconds,
    blockNumber: receipt.blockNumber,
  };
}

/**
 * Patient approves an access request on-chain.
 */
export async function callContractApproveAccess(requestId: number): Promise<{ txHash: string }> {
  if (!isWalletAvailable()) throw new Error("MetaMask not found.");
  const provider = getBrowserProvider()!;
  const signer = await provider.getSigner();
  const contract = getHealthAccessContract(signer);
  const tx = await contract.approveAccess(BigInt(requestId));
  await tx.wait(1);
  return { txHash: tx.hash };
}

/**
 * Patient rejects an access request on-chain.
 */
export async function callContractRejectAccess(requestId: number): Promise<{ txHash: string }> {
  if (!isWalletAvailable()) throw new Error("MetaMask not found.");
  const provider = getBrowserProvider()!;
  const signer = await provider.getSigner();
  const contract = getHealthAccessContract(signer);
  const tx = await contract.rejectAccess(BigInt(requestId));
  await tx.wait(1);
  return { txHash: tx.hash };
}

/**
 * Patient revokes an approved access request on-chain.
 */
export async function callContractRevokeAccess(requestId: number): Promise<{ txHash: string }> {
  if (!isWalletAvailable()) throw new Error("MetaMask not found.");
  const provider = getBrowserProvider()!;
  const signer = await provider.getSigner();
  const contract = getHealthAccessContract(signer);
  const tx = await contract.revokeAccess(BigInt(requestId));
  await tx.wait(1);
  return { txHash: tx.hash };
}

/**
 * Checks whether an access request is active on-chain.
 */
export async function checkContractAccessActive(requestId: number): Promise<boolean> {
  if (!isWalletAvailable()) return false;
  try {
    const provider = getBrowserProvider()!;
    const contract = getHealthAccessContract(provider);
    return await contract.isAccessActive(BigInt(requestId));
  } catch {
    return false;
  }
}

