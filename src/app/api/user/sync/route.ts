import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { generatePatientHID } from "@/lib/auth-utils";

/**
 * POST /api/user/sync
 * Called on load or session sync. Upserts the authenticated user into MongoDB.
 */
export async function POST() {
  try {
    const session = await auth();
    const email = session?.user?.email?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    let existingUser = await User.findOne({ email });

    if (!existingUser) {
      existingUser = await User.create({
        email,
        name: session?.user.name || email.split("@")[0],
        image: session?.user.image || "",
        role: session?.user.role || "user",
        patientId: generatePatientHID(),
      });
    }

    return NextResponse.json({
      role: existingUser.role,
      email: existingUser.email,
      name: existingUser.name,
      hospitalName: existingUser.hospitalName,
      hospitalId: existingUser.hospitalId,
      patientId: existingUser.patientId,
      success: true,
    });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : "Unknown error";
    console.error("Critical error in Sync API:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details, success: false },
      { status: 500 }
    );
  }
}
