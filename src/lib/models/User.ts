import mongoose, { Schema, model, models } from "mongoose";

export type RoleType = "user" | "patient" | "hospital" | "doctor";

export interface IUser {
  email: string;
  name?: string;
  password?: string; // Hashed with SHA256 for form-based credentials
  image?: string;
  role: RoleType;
  authId?: string;
  googleId?: string;
  clerkId?: string; // legacy compatibility

  // Hospital-specific details
  hospitalName?: string;
  hospitalId?: string; // e.g. HOSP-APL-7B3C-2F9A
  licenseNumber?: string;
  department?: string;
  speciality?: string;

  // Patient / User-specific details
  patientId?: string; // e.g. MED-4F2A-9C1B-E37D
  phone?: string;
  gender?: string;
  dateOfBirth?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    name: { type: String, default: "" },
    password: { type: String }, // Hashed password
    image: { type: String, default: "" },
    role: {
      type: String,
      enum: ["user", "patient", "hospital", "doctor"],
      default: "user",
      index: true,
    },
    authId: { type: String, index: true },
    googleId: { type: String, index: true },
    clerkId: { type: String, index: true },

    // Hospital fields
    hospitalName: { type: String, default: "" },
    hospitalId: { type: String, default: "" },
    licenseNumber: { type: String, default: "" },
    department: { type: String, default: "" },
    speciality: { type: String, default: "General Medicine" },

    // Patient fields
    patientId: { type: String, default: "" },
    phone: { type: String, default: "" },
    gender: { type: String, default: "" },
    dateOfBirth: { type: String, default: "" },
  },
  { timestamps: true }
);

export function isHospitalRole(role?: string | null): boolean {
  return role === "hospital" || role === "doctor";
}

export function isUserRole(role?: string | null): boolean {
  return role === "user" || role === "patient";
}

// Avoid model recompilation on hot-reload in Next.js dev mode
const User = models.User || model<IUser>("User", UserSchema);

export default User;
