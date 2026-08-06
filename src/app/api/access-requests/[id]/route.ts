import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
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
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ clerkId: userId }).lean();
  if (!user) {
    return NextResponse.json({ error: "User not found in DB" }, { status: 404 });
  }
  if (user.role !== "patient") {
    return NextResponse.json({ error: "Only patients can update access requests" }, { status: 403 });
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

  existing.status = status;
  existing.patientClerkId = existing.patientClerkId ?? userId;

  if (status === "approved") {
    const hours = parseInt(existing.requestedDuration) || 24;
    existing.approvedAt = new Date();
    existing.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  }
  if (status === "expired") {
    existing.expiresAt = undefined;
  }

  await existing.save();

  return NextResponse.json({ request: existing });
}
