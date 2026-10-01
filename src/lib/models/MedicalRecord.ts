import { Schema, model, models } from "mongoose";

export interface IMedicalRecord {
  patientId: string;
  patientName: string;
  patientEmail: string;
  title: string;
  type: string;
  cid: string;
  extractedContent: string;
  aiSummary: string;
  prediction: string;
  probability: {
    benign: number;
    malignant: number;
  };
  explanation: {
    lime_local_impact: [string, number][];
    shap_global_contribution: Record<string, number>;
  };
  conditions: string[];
  confidence: number;
  reportDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MedicalRecordSchema = new Schema<IMedicalRecord>(
  {
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    patientEmail: { type: String, required: true, index: true },
    title: { type: String, required: true },
    type: { type: String, default: "Report" },
    cid: { type: String, default: "Pending" },
    extractedContent: { type: String, default: "" },
    aiSummary: { type: String, default: "" },
    prediction: { type: String, default: "Unknown" },
    probability: {
      benign: { type: Number, default: 0 },
      malignant: { type: Number, default: 0 },
    },
    explanation: {
      lime_local_impact: { type: [[Schema.Types.Mixed]], default: [] },
      shap_global_contribution: { type: Map, of: Number, default: {} },
    },
    conditions: { type: [String], default: [] },
    confidence: { type: Number, default: 0 },
    reportDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const MedicalRecord = models.MedicalRecord || model<IMedicalRecord>("MedicalRecord", MedicalRecordSchema);

export default MedicalRecord;
