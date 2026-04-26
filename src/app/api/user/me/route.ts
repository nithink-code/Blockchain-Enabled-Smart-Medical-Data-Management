import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

/**
 * GET /api/user/me
 * Returns the current signed-in user's role from MongoDB.
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

  return NextResponse.json({ role: user.role, email: user.email, name: user.name });
}
