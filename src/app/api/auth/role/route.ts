import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { generateHospitalId, generatePatientHID } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body?.role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    const { role, hospitalName, licenseNumber, department, speciality } = body;
    await connectDB();

    const user = await User.findOne({ email: session.user.email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.role = role === "hospital" ? "hospital" : "user";
    if (user.role === "hospital") {
      user.hospitalName = hospitalName?.trim() || user.hospitalName || user.name || "Hospital Facility";
      user.hospitalId = user.hospitalId || generateHospitalId(user.hospitalName);
      if (licenseNumber) user.licenseNumber = licenseNumber.trim();
      if (department) user.department = department.trim();
      if (speciality) user.speciality = speciality.trim();
    } else {
      if (!user.patientId) {
        user.patientId = generatePatientHID();
      }
    }

    await user.save();

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        hospitalName: user.hospitalName,
        hospitalId: user.hospitalId,
        patientId: user.patientId,
      },
    });
  } catch (error: any) {
    console.error("Role update error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update role" }, { status: 500 });
  }
}
