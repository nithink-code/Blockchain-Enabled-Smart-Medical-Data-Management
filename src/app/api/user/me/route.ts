import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

/**
 * GET /api/user/me
 * Returns the current signed-in user's role and details from MongoDB.
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

  return NextResponse.json({ 
    id: (user as any)._id?.toString(),
    role: user.role, 
    email: user.email, 
    name: user.name,
    hospitalName: user.hospitalName,
    hospitalId: user.hospitalId,
    patientId: user.patientId,
    licenseNumber: user.licenseNumber,
    department: user.department,
    speciality: user.speciality,
  });
}
