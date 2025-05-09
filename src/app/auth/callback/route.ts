import { createClient } from "@/src/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  console.log("AUTH CALLBACK RECEIVED. CODE:", !!code, "REDIRECT_TO:", redirectTo);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("Error exchanging code for session:", error);
    } else {
      console.log("Successfully exchanged code for session");
    }
  }

  if (redirectTo) {
    console.log("Redirecting to:", `${origin}${redirectTo}`);
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  console.log("No redirectTo, redirecting to root");
  // Redirect ke root alih-alih /protected
  return NextResponse.redirect(`${origin}/`);
}
