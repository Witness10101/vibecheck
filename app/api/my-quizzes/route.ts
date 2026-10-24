
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request) {
  try {
    // 1. Authenticate the caller using their Firebase ID token.
    const authorization = request.headers.get("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7).trim()
      : "";

    if (!token) {
      return jsonError("Authentication required.", 401);
    }

    let decodedToken;

    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return jsonError(
        "Your session is invalid. Please try again.",
        401
      );
    }

    // 2. Only retrieve quizzes belonging to the authenticated UID.
    const snapshot = await adminDb
      .collection("quizzes")
      .where("ownerId", "==", decodedToken.uid)
      .get();

    // 3. Retrieve response counts for the creator's quizzes.
    const quizzes = await Promise.all(
      snapshot.docs.map(async (quizDocument) => {
        const quiz = quizDocument.data();

        const responseCountSnapshot = await adminDb
          .collection("quizResponses")
          .where("quizId", "==", quizDocument.id)
          .count()
          .get();

        return {
          id: quizDocument.id,
          nickname:
            typeof quiz.nickname === "string"
              ? quiz.nickname
              : "Your quiz",
          category:
            typeof quiz.category === "string"
              ? quiz.category
              : "friendship",
          status:
            typeof quiz.status === "string"
              ? quiz.status
              : "unknown",
          questionCount: Array.isArray(quiz.questions)
            ? quiz.questions.length
            : 0,
          responseCount: responseCountSnapshot.data().count,
          createdAt:
            typeof quiz.createdAt?.toDate === "function"
              ? quiz.createdAt.toDate().toISOString()
              : null,
          quizUrl: `/q/${quizDocument.id}`,
          resultsUrl: `/results/${quizDocument.id}`,
        };
      })
    );

    // 4. Show the newest quizzes first.
    quizzes.sort((a, b) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;

      return b.createdAt.localeCompare(a.createdAt);
    });

    return NextResponse.json(
      { quizzes },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    console.error("My quizzes API failed:", error);

    return jsonError(
      "Unable to load your quizzes right now.",
      500
    );
  }
}
