
"use client";

import { useState } from "react";
import { ensureAnonymousUser } from "@/lib/firebase";

export default function FirebaseTestPage() {
  const [status, setStatus] = useState("Not tested");
  const [uid, setUid] = useState("");

  async function testGuestLogin() {
    setStatus("Connecting to Firebase...");
    setUid("");

    try {
      const user = await ensureAnonymousUser();
      setUid(user.uid);
      setStatus(
        user.isAnonymous
          ? "Anonymous authentication successful!"
          : "Signed in, but this user is not anonymous.",
      );
    } catch (error) {
      console.error(error);
      setStatus("Authentication failed. Check the browser console.");
    }
  }

  return (
    <main className="min-h-screen bg-[#09090D] p-6 text-white">
      <div className="mx-auto max-w-xl pt-16">
        <p className="text-sm font-bold uppercase tracking-widest text-[#D0FF72]">
          VibeCheck · Setup
        </p>
        <h1 className="mt-4 text-4xl font-black">Guest login test</h1>
        <p className="mt-3 text-white/60">
          Verify that Firebase can create a guest session.
        </p>

        <button
          onClick={testGuestLogin}
          className="mt-8 rounded-full bg-[#D0FF72] px-6 py-4 font-bold text-black"
        >
          Test anonymous login
        </button>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p>{status}</p>
          {uid && (
            <p className="mt-3 break-all text-sm text-white/60">
              Guest UID: {uid}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
