
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const snapshot = await adminDb
      .collection("challenges")
      .where("status", "==", "published")
      .get();

    const challenges = snapshot.docs.map((document) => {
      const data = document.data();

      // Only return public fields. Never expose answer keys.
      return {
        id: document.id,
        title: typeof data.title === "string" ? data.title : "",
        description:
          typeof data.description === "string" ? data.description : "",
        category:
          typeof data.category === "string" ? data.category : "General",
        emoji: typeof data.emoji === "string" ? data.emoji : "⚡",
        color: typeof data.color === "string" ? data.color : "#D0FF72",
        badge: typeof data.badge === "string" ? data.badge : "NEW CHALLENGE",
        image: typeof data.image === "string" ? data.image : "",
        difficulty:
          typeof data.difficulty === "string" ? data.difficulty : "Easy",
        playCount:
          typeof data.playCount === "number" ? data.playCount : 0,
      };
    });

    challenges.sort((a, b) => a.title.localeCompare(b.title));

    return NextResponse.json(
      { challenges },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Challenges API failed:", error);

    return NextResponse.json(
      { error: "Unable to load challenges right now." },
      { status: 500 }
    );
  }
}
