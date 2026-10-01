import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import MedicalRecord from "@/lib/models/MedicalRecord";

/**
 * GET /api/medical-records
 * Patients get their own records; hospitals get all records.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const records = await MedicalRecord.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ records });
}

/**
 * POST /api/medical-records
 * Create a new medical record after upload/analysis.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const {
    patientId,
    patientName,
    title,
    type,
    cid,
    extractedContent,
    aiSummary,
    prediction,
    probability,
    explanation,
    conditions,
    confidence,
    reportDate,
  } = body;

  if (!patientId || !title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  await connectDB();

  const created = await MedicalRecord.create({
    patientId,
    patientName: patientName || "Patient",
    patientEmail: session.user.email,
    title,
    type: type || "Report",
    cid: cid || "Pending",
    extractedContent: extractedContent || "",
    aiSummary: aiSummary || "",
    prediction: prediction || "Unknown",
    probability: probability || { benign: 0, malignant: 0 },
    explanation: explanation || { lime_local_impact: [], shap_global_contribution: {} },
    conditions: conditions || [],
    confidence: confidence || 0,
    reportDate: reportDate ? new Date(reportDate) : new Date(),
  });

  return NextResponse.json({ record: created }, { status: 201 });
}
