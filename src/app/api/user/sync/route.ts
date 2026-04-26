import { NextResponse } from "next/server";
import { auth, currentUser, createClerkClient } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

/**
 * POST /api/user/sync
 * Called on first load after login. Upserts the Clerk user into MongoDB.
 * Role defaults to "patient" — you can manually change it to "doctor" in Atlas.
 */
export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.error("Sync API: No userId found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let clerkUser = await currentUser();
    
    // Fallback to clerkClient if currentUser() is null (common in some environments)
    if (!clerkUser) {
      console.log("Sync API: currentUser() was null, trying clerkClient...");
      clerkUser = await clerkClient.users.getUser(userId);
    }

    if (!clerkUser) {
      console.error("Sync API: Could not fetch Clerk user for ID:", userId);
      return NextResponse.json({ error: "Could not fetch Clerk user" }, { status: 500 });
    }

    await connectDB();

    const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? "";
    const name  = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();

    console.log("Syncing user to MongoDB:", { userId, email, name });

    // upsert: create if new, update email/name if existing — preserve existing role
    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      {
        $setOnInsert: { role: "patient" }, // default role only on first creation
        $set: { email, name },
      },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );

    console.log("User synced successfully:", user.clerkId);
    return NextResponse.json({ 
      role: user.role, 
      email: user.email, 
      name: user.name,
      success: true 
    });
  } catch (error: any) {
    console.error("Critical error in Sync API:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message,
      success: false 
    }, { status: 500 });
  }
}
