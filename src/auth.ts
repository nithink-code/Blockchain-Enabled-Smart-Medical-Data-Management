import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { connectDB } from "@/lib/mongodb";
import User, { isHospitalRole, RoleType } from "@/lib/models/User";
import { verifyPassword, generatePatientHID, generateHospitalId, hashPassword } from "@/lib/auth-utils";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        await connectDB();
        const email = String(credentials.email).toLowerCase().trim();
        let user = await User.findOne({ email });

        // Auto-provision demo hospitals for instant testing
        if (!user && (email === "apollo@medchain.io" || email === "aiims@medchain.io" || email === "fortis@medchain.io")) {
          if (String(credentials.password) === "hospital123") {
            const hospitalNames: Record<string, string> = {
              "apollo@medchain.io": "Apollo Hospitals",
              "aiims@medchain.io": "AIIMS New Delhi",
              "fortis@medchain.io": "Fortis Healthcare",
            };
            const hName = hospitalNames[email] || "Apollo Hospitals";
            user = await User.create({
              email,
              name: hName,
              hospitalName: hName,
              hospitalId: generateHospitalId(hName),
              licenseNumber: "MED-LIC-2026-X88",
              role: "hospital",
              password: hashPassword("hospital123"),
              department: "General Medicine & Surgery",
              speciality: "Multispeciality Care",
            });
          }
        }

        if (!user) {
          throw new Error("No account found with this email");
        }

        if (!user.password) {
          throw new Error("Account was registered using Google. Please sign in with Google.");
        }

        const isValid = verifyPassword(String(credentials.password), user.password);
        if (!isValid) {
          throw new Error("Invalid password credentials");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name || (isHospitalRole(user.role) ? user.hospitalName : "User"),
          image: user.image || "",
          role: user.role,
          hospitalName: user.hospitalName,
          hospitalId: user.hospitalId,
          patientId: user.patientId,
        };
      },
    }),
  ],
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await connectDB();
          const email = user.email?.toLowerCase().trim();
          if (!email) return false;

          let dbUser = await User.findOne({ email });

          if (!dbUser) {
            // New user signed in with Google
            const patientHID = generatePatientHID();
            dbUser = await User.create({
              email,
              name: user.name || email.split("@")[0],
              image: user.image || "",
              googleId: account.providerAccountId,
              authId: account.providerAccountId,
              role: "user",
              patientId: patientHID,
            });
          } else {
            if (!dbUser.googleId) {
              dbUser.googleId = account.providerAccountId;
            }
            if (user.image && !dbUser.image) {
              dbUser.image = user.image;
            }
            await dbUser.save();
          }

          user.id = dbUser._id.toString();
          user.role = dbUser.role;
          user.hospitalName = dbUser.hospitalName;
          user.hospitalId = dbUser.hospitalId;
          user.patientId = dbUser.patientId;

          return true;
        } catch (err) {
          console.error("Error in Google NextAuth signIn callback:", err);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "user";
        token.hospitalName = user.hospitalName || "";
        token.hospitalId = user.hospitalId || "";
        token.patientId = user.patientId || "";
      }

      if (trigger === "update" && session) {
        if (session.role) token.role = session.role;
        if (session.hospitalName) token.hospitalName = session.hospitalName;
        if (session.hospitalId) token.hospitalId = session.hospitalId;
        if (session.patientId) token.patientId = session.patientId;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string);
        session.user.role = (token.role as RoleType) || "user";
        session.user.hospitalName = token.hospitalName as string | undefined;
        session.user.hospitalId = token.hospitalId as string | undefined;
        session.user.patientId = token.patientId as string | undefined;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "medchain-secret-encryption-key-2026",
});
