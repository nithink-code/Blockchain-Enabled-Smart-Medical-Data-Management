import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User, { isHospitalRole } from "@/lib/models/User";
import { hashPassword, generatePatientHID, generateHospitalId } from "@/lib/auth-utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const {
      role, // "user" | "hospital"
      email,
      password,
      name,
      // Hospital fields
      hospitalName,
      hospitalId,
      licenseNumber,
      department,
      speciality,
      // User fields
      phone,
      gender,
    } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    await connectDB();
    const cleanEmail = String(email).toLowerCase().trim();

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const hashedPassword = hashPassword(password);
    const targetRole = role === "hospital" ? "hospital" : "user";

    let newUserDoc: any = {
      email: cleanEmail,
      password: hashedPassword,
      role: targetRole,
    };

    if (targetRole === "hospital") {
      const finalHospitalName = hospitalName?.trim() || name?.trim() || "Healthcare Facility";
      newUserDoc.hospitalName = finalHospitalName;
      newUserDoc.name = finalHospitalName;
      newUserDoc.hospitalId = hospitalId?.trim() || generateHospitalId(finalHospitalName);
      newUserDoc.licenseNumber = licenseNumber?.trim() || `LIC-${Date.now().toString(36).toUpperCase()}`;
      newUserDoc.department = department?.trim() || "General Medicine";
      newUserDoc.speciality = speciality?.trim() || "Multi-speciality";
    } else {
      newUserDoc.name = name?.trim() || cleanEmail.split("@")[0];
      newUserDoc.patientId = generatePatientHID();
      if (phone) newUserDoc.phone = phone.trim();
      if (gender) newUserDoc.gender = gender.trim();
    }

    const createdUser = await User.create(newUserDoc);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: createdUser._id.toString(),
          email: createdUser.email,
          name: createdUser.name,
          role: createdUser.role,
          hospitalName: createdUser.hospitalName,
          hospitalId: createdUser.hospitalId,
          patientId: createdUser.patientId,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error occurred during registration" },
      { status: 500 }
    );
  }
}
