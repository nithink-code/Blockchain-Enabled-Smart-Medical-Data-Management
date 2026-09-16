"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Hourglass,
  Lock,
  ShieldCheck,
  Sparkles,
  User,
  X,
  Wallet,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCode,
} from "lucide-react";
import { loadRecentActivity, parseProviderLabel, type RecentActivityRecord } from "@/lib/recent-activity";
import {
  loadAccessRequests,
  createAccessRequest,
  getAccessRequestEventName,
  type AccessRequest,
} from "@/lib/access-requests";
import {
  CONTRACT_ADDRESS,
  isWalletAvailable,
  getActiveWallet,
  connectWallet,
  callContractRequestAccess,
} from "@/lib/web3";
import { showToast } from "@/components/toast";
import { ethers } from "ethers";

const ACCESS_REQUESTS_POLL_MS = 8000;

// Default demo Ethereum address (Hardhat Account #1)
const DEFAULT_PATIENT_WALLET = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

const DURATION_OPTIONS = [
  { label: "1 Hour", seconds: 3600 },
  { label: "12 Hours", seconds: 43200 },
  { label: "24 Hours (Default)", seconds: 86400 },
  { label: "48 Hours", seconds: 172800 },
  { label: "7 Days", seconds: 604800 },
];

type RecordView = RecentActivityRecord & {
  patientLabel: string;
  ageGender: string;
  statusClass: string;
};

function toRecordView(record: RecentActivityRecord): RecordView {
  const parsed = parseProviderLabel(record.provider);
  const ageGender = [parsed.age, parsed.gender].filter(Boolean).join(" ");
  const patientLabel = parsed.name || "Patient";
  const confidence =
    typeof record.confidence === "number" ? record.confidence : null;
  const statusClass =
    record.status === "Processing"
      ? "text-orange-300 bg-orange-500/10 border-orange-500/10"
      : confidence !== null && confidence >= 80
        ? "text-emerald-300 bg-emerald-500/10 border-emerald-500/10"
        : "text-blue-300 bg-blue-500/10 border-blue-500/10";

  return {
    ...record,
    patientLabel,
    ageGender,
    statusClass,
  };
}

export default function HospitalDashboard() {
  const [records, setRecords] = useState<RecordView[]>([]);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [doctorName, setDoctorName] = useState("Doctor");
  const [requestModalRecord, setRequestModalRecord] = useState<RecordView | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const syncRecords = () => {
      const next = loadRecentActivity().map(toRecordView);
      setRecords(next);
    };
    const syncRequests = () => {
      loadAccessRequests().then(setRequests);
    };

    syncRecords();
    syncRequests();

    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => setDoctorName(data.name || "Doctor"))
      .catch(() => setDoctorName("Doctor"));

    // Check active wallet
    getActiveWallet().then((addr) => {
      if (addr) setConnectedWallet(addr);
    });

    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        setConnectedWallet(accounts.length > 0 ? accounts[0] : null);
      };
      window.ethereum.on?.("accountsChanged", handleAccountsChanged);
      return () => {
        window.ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      };
    }

    const eventName = getAccessRequestEventName();
    window.addEventListener("storage", syncRecords);
    window.addEventListener("medchain:recent-activity-updated", syncRecords as EventListener);
    window.addEventListener(eventName, syncRequests as EventListener);
    window.addEventListener("focus", syncRequests);

    const pollId = window.setInterval(syncRequests, ACCESS_REQUESTS_POLL_MS);

    return () => {
      window.removeEventListener("storage", syncRecords);
      window.removeEventListener("medchain:recent-activity-updated", syncRecords as EventListener);
      window.removeEventListener(eventName, syncRequests as EventListener);
      window.removeEventListener("focus", syncRequests);
      window.clearInterval(pollId);
    };
  }, []);

  const latestStatusByRecordId = useMemo(() => {
    const map = new Map<string, AccessRequest>();
    for (const req of requests) {
      const existing = map.get(req.recordId);
      if (!existing || req.requestedAt >= existing.requestedAt) {
        map.set(req.recordId, req);
      }
    }
    return map;
  }, [requests]);

  async function handleConnectWallet() {
    try {
      const { address } = await connectWallet();
      setConnectedWallet(address);
      showToast(`Connected wallet: ${address.slice(0, 6)}...${address.slice(-4)}`, "success");
    } catch (err: any) {
      showToast(err?.message || "Failed to connect wallet", "error");
    }
  }

  async function handleSubmitRequest({
    reason,
    hospitalName,
    patientAddress,
    durationInSeconds,
    durationLabel,
    skipBlockchain,
  }: {
    reason: string;
    hospitalName: string;
    patientAddress: string;
    durationInSeconds: number;
    durationLabel: string;
    skipBlockchain?: boolean;
  }) {
    if (!requestModalRecord) return;

    let blockchainRequestId: number | undefined = undefined;
    let txHash: string | undefined = undefined;
    let hospitalWalletAddress: string | undefined = connectedWallet ?? undefined;

    // Ensure valid recordHash / CID
    const effectiveRecordHash =
      requestModalRecord.cid && requestModalRecord.cid !== "Pending"
        ? requestModalRecord.cid
        : "Qm" + ethers.keccak256(ethers.toUtf8Bytes(requestModalRecord.id)).slice(2, 46);

    // Call blockchain smart contract if not skipped
    if (!skipBlockchain) {
      const txResult = await callContractRequestAccess({
        patientAddress,
        recordHash: effectiveRecordHash,
        durationInSeconds,
      });
      blockchainRequestId = txResult.requestId;
      txHash = txResult.txHash;
      hospitalWalletAddress = txResult.hospitalAddress;
      setConnectedWallet(txResult.hospitalAddress);
    }

    // Save to Database
    const created = await createAccessRequest({
      recordId: requestModalRecord.id,
      cid: effectiveRecordHash,
      patientName: requestModalRecord.patientLabel,
      patientInfo: requestModalRecord.ageGender,
      reportTitle: requestModalRecord.title,
      reportType: requestModalRecord.type,
      hospitalName: hospitalName.trim() || "Unspecified Hospital",
      reason: reason.trim(),
      requestedDuration: durationLabel,
      durationInSeconds,
      blockchainRequestId,
      txHash,
      patientWalletAddress: patientAddress,
      hospitalWalletAddress,
    });

    if (!created) {
      showToast("Access request created on-chain but failed to sync to database", "error");
      return;
    }

    setRequests((prev) => [created, ...prev]);
    setRequestModalRecord(null);

    if (txHash) {
      showToast(
        `On-Chain Request #${blockchainRequestId} confirmed! Tx: ${txHash.slice(0, 8)}...`,
        "success"
      );
    } else {
      showToast("Access request sent to patient", "success");
    }
  }

  return (
    <div className="space-y-8 pb-10 animate-fade-in mt-20!">
      <div className="space-y-2 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400 mb-10!">
          Medical dashboard
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Recent Patient Records
        </h1>
        <p className="mx-auto max-w-3xl text-base text-zinc-400 sm:text-lg mt-5! ml-60! mb-8!">
          Patient records appear here immediately after upload and are secured by the
          TimeBasedHealthAccess smart contract.
        </p>

        {/* Contract & Wallet Status Bar */}
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-4 pt-2">
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-mono text-emerald-300">
            <FileCode size={13} />
            <span>Contract:</span>
            <span className="font-bold">{CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}</span>
          </div>

          {connectedWallet ? (
            <div className="flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-xs font-mono text-blue-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Wallet:</span>
              <span className="font-bold">{connectedWallet.slice(0, 6)}...{connectedWallet.slice(-4)}</span>
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              className="flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold text-orange-300 transition-all hover:bg-orange-500/20 active:scale-95 cursor-pointer"
            >
              <Wallet size={13} />
              <span>Connect Web3 Wallet</span>
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1120px] space-y-4">
        <div className="flex items-end justify-between gap-4 px-1 ml-10! mb-8!">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 ml-130! mb-10! mt-6!">
              Patient Reports
            </p>
            <h2 className="ml-6! text-2xl font-bold tracking-tight text-white">
              Uploaded patient Reports
            </h2>
          </div>
        </div>

        {records.length === 0 ? (
          <div className="flex min-h-[300px] w-full flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
            <Sparkles size={28} className="text-zinc-500" />
            <h3 className="mt-4 text-xl font-bold text-white">No patient records yet</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
              Upload a medical report from the patient dashboard and the latest record card
              will show up here automatically.
            </p>
          </div>
        ) : (
          <div className="grid w-full auto-rows-fr gap-8 sm:grid-cols-2 justify-items-stretch lg:translate-x-8 xl:translate-x-12">
            {records.map((record) => (
              <PatientRecordCard
                key={record.id}
                record={record}
                accessRequest={latestStatusByRecordId.get(record.id) ?? null}
                onRequestAccess={() => setRequestModalRecord(record)}
                onViewDetails={() => router.push(`/hospital/records/${record.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {requestModalRecord && (
        <RequestAccessModal
          record={requestModalRecord}
          doctorName={doctorName}
          connectedWallet={connectedWallet}
          onConnectWallet={handleConnectWallet}
          onClose={() => setRequestModalRecord(null)}
          onSubmit={handleSubmitRequest}
        />
      )}
    </div>
  );
}

function PatientRecordCard({
  record,
  accessRequest,
  onRequestAccess,
  onViewDetails,
}: {
  record: RecordView;
  accessRequest: AccessRequest | null;
  onRequestAccess: () => void;
  onViewDetails: () => void;
}) {
  const status = accessRequest?.status ?? "none";
  const requestStatusLabel =
    status === "approved"
      ? "Approved"
      : status === "pending"
        ? "Pending"
        : status === "denied"
          ? "Denied"
          : "Not Requested";
  const requestStatusClass =
    status === "approved"
      ? "text-emerald-400"
      : status === "pending"
        ? "text-orange-300"
        : status === "denied"
          ? "text-red-400"
          : "text-zinc-500";

  return (
    <div className="glass-card flex h-full min-h-[440px]! w-full flex-col rounded-[28px] border border-white/5 px-16! pb-5! pt-20! transition-all duration-300 hover:border-white/10">
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0 space-y-2 pr-4!">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
            {record.type}
          </p>
          <h3 className="text-lg font-bold tracking-tight text-white line-clamp-1 md:text-xl">
            {record.title}
          </h3>
        </div>

        <span className={`shrink-0 pl-4! text-[10px] font-bold uppercase tracking-widest ${requestStatusClass}`}>
          {requestStatusLabel}
        </span>
      </div>

      {/* Blockchain Badge if recorded on-chain */}
      {accessRequest?.txHash && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-[11px] font-mono text-emerald-400">
          <CheckCircle2 size={12} className="shrink-0 text-emerald-400" />
          <span className="truncate">
            On-Chain Req #{accessRequest.blockchainRequestId ?? 1}: {accessRequest.txHash.slice(0, 10)}...
          </span>
        </div>
      )}

      <div className="mt-6! flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
        <User size={14} className="text-blue-400" />
        Basic details
      </div>

      <div className="mt-6 flex flex-col gap-5">
        <DetailRow plain label="Patient" value={record.patientLabel} />
        <DetailRow plain label="Age" value={record.ageGender || "Not provided"} />
        <DetailRow plain label="Report" value={record.title} />
        <DetailRow plain label="Storage CID" value={record.cid} mono />
        <DetailRow plain label="Uploaded" value={record.date} />
      </div>

      <div className="mt-10! flex justify-center">
        {status === "approved" ? (
          <button
            onClick={onViewDetails}
            className="flex h-11 w-48 items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-500/10 transition-all hover:scale-[1.02] hover:bg-emerald-500 active:scale-[0.98]"
          >
            <ShieldCheck size={16} /> View Full Details
          </button>
        ) : status === "pending" ? (
          <button
            disabled
            className="flex h-11 w-48 cursor-not-allowed items-center justify-center gap-2 rounded-2xl border border-orange-500/10 bg-orange-500/5 text-sm font-bold text-orange-300"
          >
            <Hourglass size={16} /> Request Pending
          </button>
        ) : (
          <button
            onClick={onRequestAccess}
            className="flex h-11 w-48 items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-500/10 transition-all hover:scale-[1.02] hover:bg-emerald-500 active:scale-[0.98]"
          >
            <Lock size={16} /> {status === "denied" ? "Request Again" : "Request Access"}
          </button>
        )}
      </div>
    </div>
  );
}

function RequestAccessModal({
  record,
  doctorName,
  connectedWallet,
  onConnectWallet,
  onClose,
  onSubmit,
}: {
  record: RecordView;
  doctorName: string;
  connectedWallet: string | null;
  onConnectWallet: () => Promise<void>;
  onClose: () => void;
  onSubmit: (params: {
    reason: string;
    hospitalName: string;
    patientAddress: string;
    durationInSeconds: number;
    durationLabel: string;
    skipBlockchain?: boolean;
  }) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [patientAddress, setPatientAddress] = useState(DEFAULT_PATIENT_WALLET);
  const [durationSeconds, setDurationSeconds] = useState(86400); // 24 hours default
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txStep, setTxStep] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasWalletExtension = isWalletAvailable();
  const isAddressValid = ethers.isAddress(patientAddress.trim());
  const canSubmit =
    reason.trim().length > 0 &&
    hospitalName.trim().length > 0 &&
    isAddressValid &&
    !isSubmitting;

  const currentDurationOption =
    DURATION_OPTIONS.find((opt) => opt.seconds === durationSeconds) || DURATION_OPTIONS[2];

  async function handleFormSubmit(skipBlockchain = false) {
    if (!canSubmit && !skipBlockchain) return;
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (!skipBlockchain) {
        setTxStep("Connecting to Web3 wallet...");
        if (!connectedWallet) {
          await onConnectWallet();
        }
        setTxStep("Prompting MetaMask: Please sign the requestAccess transaction...");
      } else {
        setTxStep("Saving access request...");
      }

      await onSubmit({
        reason: reason.trim(),
        hospitalName: hospitalName.trim(),
        patientAddress: patientAddress.trim(),
        durationInSeconds: durationSeconds,
        durationLabel: currentDurationOption.label,
        skipBlockchain,
      });
    } catch (err: any) {
      console.error("Smart contract execution error:", err);
      const msg =
        err?.reason ||
        err?.data?.message ||
        err?.message ||
        "Transaction failed on blockchain. Please verify your wallet connection and gas.";
      setErrorMessage(msg);
      setIsSubmitting(false);
      setTxStep(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg my-8 rounded-[28px] border border-white/10 bg-zinc-950 shadow-2xl shadow-black/80 px-8 py-6 sm:px-12 sm:py-8">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400">
                On-Chain Request
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-mono text-emerald-300 border border-emerald-500/20">
                TimeBasedHealthAccess
              </span>
            </div>
            <h3 className="mt-1 text-xl font-bold text-white">{record.patientLabel}</h3>
            <p className="text-xs text-zinc-400 font-mono truncate max-w-sm">{record.title}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
            className="rounded-full p-2 text-zinc-500 transition-colors hover:text-white disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contract Info Banner */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Smart Contract</span>
            <p className="font-mono text-zinc-300">{CONTRACT_ADDRESS}</p>
          </div>
          {connectedWallet ? (
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>{connectedWallet.slice(0, 6)}...{connectedWallet.slice(-4)}</span>
            </div>
          ) : (
            <button
              onClick={onConnectWallet}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600/80 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              <Wallet size={12} />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>

        <div className="mt-4 space-y-3.5">
          <div className="space-y-2 rounded-2xl border border-white/5 bg-black/20 p-3.5">
            <DetailRow plain label="Patient" value={record.patientLabel} />
            <DetailRow plain label="Record Hash (CID)" value={record.cid} mono />
            <DetailRow plain label="Requesting Doctor" value={doctorName} />
          </div>

          {/* Patient Ethereum Address */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                Patient Wallet Address (address _patient)
              </label>
              {!isAddressValid && (
                <span className="text-[10px] text-red-400">Invalid Ethereum address</span>
              )}
            </div>
            <input
              type="text"
              value={patientAddress}
              onChange={(e) => setPatientAddress(e.target.value.trim())}
              placeholder="0x..."
              disabled={isSubmitting}
              className={`w-full rounded-xl border px-4 py-2.5 font-mono text-xs text-white placeholder:text-zinc-600 outline-none transition-colors ${
                isAddressValid
                  ? "border-white/10 bg-black/40 focus:border-emerald-500/50"
                  : "border-red-500/50 bg-red-950/10 focus:border-red-500"
              }`}
            />
          </div>

          {/* Access Duration Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <Clock size={12} className="text-emerald-400" />
              Duration (_durationInSeconds)
            </label>
            <select
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(Number(e.target.value))}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-xs text-white outline-none transition-colors focus:border-emerald-500/50 cursor-pointer"
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.seconds} value={opt.seconds} className="bg-zinc-900 text-white">
                  {opt.label} ({opt.seconds.toLocaleString()}s)
                </option>
              ))}
            </select>
          </div>

          {/* Hospital / Clinic Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
              Hospital / Clinic Name
            </label>
            <input
              type="text"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              placeholder="e.g. Apollo Hospitals"
              disabled={isSubmitting}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-xs text-white placeholder:text-zinc-600 outline-none transition-colors focus:border-emerald-500/50"
            />
          </div>

          {/* Reason for Access */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
              Clinical Justification (Reason)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why clinical access is required..."
              rows={2}
              disabled={isSubmitting}
              className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-xs text-white placeholder:text-zinc-600 outline-none transition-colors focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Progress or Error Feedback */}
        {txStep && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-300 animate-pulse">
            <Loader2 size={16} className="animate-spin shrink-0 text-blue-400" />
            <span>{txStep}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            <AlertCircle size={16} className="shrink-0 text-red-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Blockchain Call Failed</p>
              <p className="text-[11px] text-red-400/90 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-28 h-10 rounded-xl border border-white/10 bg-white/[0.02] text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          {!hasWalletExtension && (
            <button
              type="button"
              disabled={!canSubmit || isSubmitting}
              onClick={() => handleFormSubmit(true)}
              className="w-full sm:w-auto px-4 h-10 rounded-xl border border-orange-500/30 bg-orange-500/10 text-xs font-semibold text-orange-300 hover:bg-orange-500/20 transition-colors"
              title="Save to database without on-chain signature"
            >
              Simulate Request (No Wallet)
            </button>
          )}

          <button
            type="button"
            disabled={!canSubmit || isSubmitting}
            onClick={() => handleFormSubmit(false)}
            className="w-full sm:w-auto px-6 h-10 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Calling Blockchain...</span>
              </>
            ) : (
              <>
                <Lock size={14} />
                <span>Submit & Call Smart Contract</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono = false,
  plain = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  plain?: boolean;
}) {
  if (plain) {
    return (
      <div className="flex items-center justify-between gap-5">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</p>
        <p className={`max-w-[58%] truncate text-sm font-semibold text-zinc-200 ${mono ? "font-mono text-[11px]" : ""}`}>
          {value}
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-5 rounded-2xl border border-white/5 bg-black/20 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</p>
      <p className={`max-w-[58%] truncate text-sm font-semibold text-zinc-200 ${mono ? "font-mono text-[11px]" : ""}`}>
        {value}
      </p>
    </div>
  );
}
