import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User, { isUserRole } from "@/lib/models/User";
import AccessRequest from "@/lib/models/AccessRequest";

const ALLOWED_STATUSES = ["approved", "denied", "expired"];

/**
 * PATCH /api/access-requests/:id
 * Patient approves, denies, or revokes (expires) an access request.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email.toLowerCase().trim() }).lean();
  if (!user) {
    return NextResponse.json({ error: "User not found in DB" }, { status: 404 });
  }
  if (!isUserRole(user.role)) {
    return NextResponse.json({ error: "Only patients/users can update access requests" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status;

  if (!status || !ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const existing = await AccessRequest.findById(id);
  if (!existing) {
    return NextResponse.json({ error: "Access request not found" }, { status: 404 });
  }

  const userIdStr = (user as any)._id?.toString();
  existing.status = status;
  existing.patientId = existing.patientId ?? userIdStr;
  existing.patientEmail = existing.patientEmail ?? user.email;
  existing.patientClerkId = existing.patientClerkId ?? userIdStr;

  if (status === "approved") {
    existing.approvedAt = new Date();
    // Use durationInSeconds from the request (set by the hospital at request time)
    // Fall back to parsing the duration label, then default to 24 hours
    let durationSec: number;
    if (typeof existing.durationInSeconds === "number" && existing.durationInSeconds > 0) {
      durationSec = existing.durationInSeconds;
    } else {
      const parsed = parseInt(existing.requestedDuration);
      durationSec = Number.isNaN(parsed) || parsed <= 0 ? 86400 : parsed * 3600;
    }
    existing.expiresAt = new Date(Date.now() + durationSec * 1000);
  }
  if (status === "expired") {
    existing.expiresAt = undefined;
  }

  await existing.save();

  return NextResponse.json({ request: existing });
}
