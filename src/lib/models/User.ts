import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
  clerkId: string;
  email: string;
  name?: string;
  role: "patient" | "doctor";
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email:   { type: String, required: true },
    name:    { type: String, default: "" },
    // You can manually set this to "patient" or "doctor" in MongoDB Atlas
    role:    { type: String, enum: ["patient", "doctor"], default: "patient" },
  },
  { timestamps: true }
);

// Avoid model recompilation on hot-reload in Next.js dev mode
const User = models.User || model<IUser>("User", UserSchema);

export default User;
