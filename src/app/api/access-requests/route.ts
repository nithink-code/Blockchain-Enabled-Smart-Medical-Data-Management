import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User, { isHospitalRole } from "@/lib/models/User";
import AccessRequest from "@/lib/models/AccessRequest";

/**
 * GET /api/access-requests
 * Hospitals/doctors get the requests they created; patients get all pending/decided requests.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email.toLowerCase().trim() }).lean();
  if (!user) {
    return NextResponse.json({ error: "User not found in DB" }, { status: 404 });
  }

  const userIdStr = (user as any)._id?.toString();
  const query = isHospitalRole(user.role)
    ? {
        $or: [
          { doctorEmail: user.email },
          { doctorId: userIdStr },
          { doctorClerkId: userIdStr },
        ],
      }
    : {};

  const requests = await AccessRequest.find(query).sort({ createdAt: -1 }).lean();

  return NextResponse.json({ requests });
}

/**
 * POST /api/access-requests
 * Doctor / Hospital requests access to a patient record.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email.toLowerCase().trim() }).lean();
  if (!user) {
    return NextResponse.json({ error: "User not found in DB" }, { status: 404 });
  }
  if (!isHospitalRole(user.role)) {
    return NextResponse.json({ error: "Only hospitals/doctors can request access" }, { status: 403 });
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
    requestedDuration,
    durationInSeconds,
    blockchainRequestId,
    txHash,
    patientWalletAddress,
    hospitalWalletAddress,
  } = body;

  if (!recordId || !patientName || !reportTitle || !reason) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const effectiveHospital = hospitalName?.trim() || user.hospitalName || "Hospital Facility";
  const userIdStr = (user as any)._id?.toString();

  const created = await AccessRequest.create({
    doctorId: userIdStr,
    doctorClerkId: userIdStr,
    doctorEmail: user.email,
    doctorName: user.name || effectiveHospital,
    hospitalName: effectiveHospital,
    speciality: user.speciality || "General Medicine",
    patientName,
    patientInfo: patientInfo ?? "",
    recordId,
    cid: cid ?? "Pending",
    reportTitle,
    reportType: reportType ?? "Report",
    reason: String(reason).trim(),
    requestedDuration: requestedDuration ?? "24 hours",
    durationInSeconds: typeof durationInSeconds === "number" ? durationInSeconds : undefined,
    blockchainRequestId: typeof blockchainRequestId === "number" ? blockchainRequestId : undefined,
    txHash: txHash ? String(txHash) : undefined,
    patientWalletAddress: patientWalletAddress ? String(patientWalletAddress) : undefined,
    hospitalWalletAddress: hospitalWalletAddress ? String(hospitalWalletAddress) : undefined,
    status: "pending",
  });

  return NextResponse.json({ request: created }, { status: 201 });
}
