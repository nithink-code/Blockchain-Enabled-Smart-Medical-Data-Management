import { DefaultSession } from "next-auth";
import { RoleType } from "@/lib/models/User";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: RoleType;
      hospitalName?: string;
      hospitalId?: string;
      patientId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: RoleType;
    hospitalName?: string;
    hospitalId?: string;
    patientId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: RoleType;
    hospitalName?: string;
    hospitalId?: string;
    patientId?: string;
  }
}
