import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import AccessRequest from "@/lib/models/AccessRequest";

/**
 * GET /api/access-requests
 * Doctors get the requests they created; patients get all pending/decided requests.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ clerkId: userId }).lean();
  if (!user) {
    return NextResponse.json({ error: "User not found in DB" }, { status: 404 });
  }

  const query = user.role === "doctor" ? { doctorClerkId: userId } : {};
  const requests = await AccessRequest.find(query).sort({ createdAt: -1 }).lean();

  return NextResponse.json({ requests });
}

/**
 * POST /api/access-requests
 * Doctor requests access to a patient record.
 */
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ clerkId: userId }).lean();
  if (!user) {
    return NextResponse.json({ error: "User not found in DB" }, { status: 404 });
  }
  if (user.role !== "doctor") {
    return NextResponse.json({ error: "Only doctors can request access" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const {
    recordId,
    cid,
    patientName,
    patientInfo,
    reportTitle,
    reportType,
    hospitalName,
    reason,
  } = body;

  if (!recordId || !patientName || !reportTitle || !hospitalName || !reason) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const created = await AccessRequest.create({
    doctorClerkId: userId,
    doctorName: user.name || "Doctor",
    hospitalName: String(hospitalName).trim(),
    patientName,
    patientInfo: patientInfo ?? "",
    recordId,
    cid: cid ?? "Pending",
    reportTitle,
    reportType: reportType ?? "Report",
    reason: String(reason).trim(),
    status: "pending",
  });

  return NextResponse.json({ request: created }, { status: 201 });
}
