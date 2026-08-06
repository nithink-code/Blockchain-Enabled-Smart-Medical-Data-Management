import { Schema, model, models } from "mongoose";

export type AccessRequestStatus = "pending" | "approved" | "denied" | "expired";

export interface IAccessRequest {
  doctorClerkId: string;
  doctorName: string;
  hospitalName: string;
  speciality: string;
  patientClerkId?: string;
  patientName: string;
  patientInfo: string;
  recordId: string;
  cid: string;
  reportTitle: string;
  reportType: string;
  reason: string;
  requestedDuration: string;
  status: AccessRequestStatus;
  approvedAt?: Date;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const AccessRequestSchema = new Schema<IAccessRequest>(
  {
    doctorClerkId: { type: String, required: true, index: true },
    doctorName:    { type: String, required: true },
    hospitalName:  { type: String, required: true },
    speciality:    { type: String, default: "General Medicine" },
    patientClerkId: { type: String, index: true },
    patientName:   { type: String, required: true },
    patientInfo:   { type: String, default: "" },
    recordId:      { type: String, required: true, index: true },
    cid:           { type: String, default: "Pending" },
    reportTitle:   { type: String, required: true },
    reportType:    { type: String, default: "Report" },
    reason:        { type: String, default: "" },
    requestedDuration: { type: String, default: "24 hours" },
    status:        { type: String, enum: ["pending", "approved", "denied", "expired"], default: "pending", index: true },
    approvedAt:    { type: Date },
    expiresAt:     { type: Date },
  },
  { timestamps: true }
);

// Avoid model recompilation on hot-reload in Next.js dev mode
const AccessRequest = models.AccessRequest || model<IAccessRequest>("AccessRequest", AccessRequestSchema);

export default AccessRequest;
