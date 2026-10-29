import { NextResponse } from "next/server";
import { COOKIE_NAME, getCurrentUser, revokeUserSessions } from "@/lib/auth";

export async function POST() {
  try {
    const user = await getCurrentUser(false);
    if (user?.id) {
      // Invalidate active JWTs in the database
      await revokeUserSessions(user.id);
    }
  } catch (err) {
    console.warn("Error revoking session on logout:", err);
  }

  const response = NextResponse.json({ success: true, message: "Logged out successfully" });

  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });

  return response;
}
