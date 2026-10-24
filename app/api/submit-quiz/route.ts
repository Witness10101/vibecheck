
import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

const MAX_BODY_BYTES = 32 * 1024;
const MAX_NAME_LENGTH = 30;
const MAX_TEXT_ANSWER_LENGTH = 2000;

type QuizQuestion = {
  id: string;
  answerMode: "multiple" | "text";
  options?: string[];
};

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  try {
    // 1. Require a Firebase ID token.
    const authorization = request.headers.get("authorization");
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7).trim()
      : "";

    if (!token) {
      return jsonError("Authentication required.", 401);
    }

    // Invalid or expired tokens must not reach submission logic.
    let decodedToken;

    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return jsonError(
        "Your session is invalid. Please try again.",
        401
      );
    }

    // 2. Reject obviously oversized requests.
    const contentLength = request.headers.get("content-length");

    if (
      contentLength !== null &&
      /^\d+$/.test(contentLength) &&
      Number(contentLength) > MAX_BODY_BYTES
    ) {
      return jsonError("Request body is too large.", 413);
    }

    // 3. Parse JSON safely.
    let rawBody: string;

    try {
      rawBody = await request.text();
    } catch {
      return jsonError("Unable to read request body.", 400);
    }

    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return jsonError("Request body is too large.", 413);
    }

    let body: unknown;

    try {
      body = JSON.parse(rawBody);
    } catch {
      return jsonError("Invalid JSON request body.", 400);
    }

    if (!isRecord(body)) {
      return jsonError("Invalid submission.", 400);
    }

    const { quizId, respondentName, answers } = body;

    if (
      typeof quizId !== "string" ||
      !/^[A-Za-z0-9_-]{1,128}$/.test(quizId) ||
      typeof respondentName !== "string" ||
      respondentName.trim().length < 1 ||
      respondentName.trim().length > MAX_NAME_LENGTH ||
      !isRecord(answers)
    ) {
      return jsonError("Invalid submission.", 400);
    }

    // 4. Load the quiz and require a published quiz.
    const quizSnapshot = await adminDb
      .collection("quizzes")
      .doc(quizId)
      .get();

    if (!quizSnapshot.exists) {
      return jsonError("Quiz not found.", 404);
    }

    const quiz = quizSnapshot.data();

    if (!quiz || quiz.status !== "published") {
      return jsonError("This quiz is not available.", 400);
    }

    // 5. Validate the stored question configuration.
    const rawQuestions: unknown = quiz.questions;

    if (
      !Array.isArray(rawQuestions) ||
      rawQuestions.length < 5 ||
      rawQuestions.length > 10
    ) {
      return jsonError(
        "Quiz configuration is invalid.",
        400
      );
    }

    const questions: QuizQuestion[] = [];

    for (const question of rawQuestions) {
      if (
        !isRecord(question) ||
        typeof question.id !== "string" ||
        !/^[A-Za-z0-9_-]{1,128}$/.test(question.id) ||
        (question.answerMode !== "multiple" &&
          question.answerMode !== "text")
      ) {
        return jsonError(
          "Quiz question configuration is invalid.",
          400
        );
      }

      if (question.answerMode === "multiple") {
        if (
          !Array.isArray(question.options) ||
          question.options.length === 0 ||
          !question.options.every(
            (option: unknown) =>
              typeof option === "string" &&
              option.trim().length > 0 &&
              option.length <= MAX_TEXT_ANSWER_LENGTH
          ) ||
          new Set(question.options).size !== question.options.length
        ) {
          return jsonError(
            "Quiz question options are invalid.",
            400
          );
        }
      }

      questions.push({
        id: question.id,
        answerMode: question.answerMode,
        ...(question.answerMode === "multiple"
          ? { options: question.options as string[] }
          : {}),
      });
    }

    const questionIds = questions.map((question) => question.id);

    if (new Set(questionIds).size !== questionIds.length) {
      return jsonError("Quiz question IDs are invalid.", 400);
    }

    // 6. Require exactly one answer per question.
    const answerKeys = Object.keys(answers);

    if (
      answerKeys.length !== questionIds.length ||
      !questionIds.every((id) =>
        Object.prototype.hasOwnProperty.call(answers, id)
      ) ||
      answerKeys.some((id) => !questionIds.includes(id))
    ) {
      return jsonError(
        "Please answer every question.",
        400
      );
    }

    // 7. Validate and normalize answers on the server.
    const cleanAnswers: Record<string, string> = {};

    for (const question of questions) {
      const answer = answers[question.id];

      if (
        typeof answer !== "string" ||
        answer.trim().length === 0
      ) {
        return jsonError(
          "One or more answers are invalid.",
          400
        );
      }

      if (question.answerMode === "multiple") {
        if (!question.options!.includes(answer)) {
          return jsonError(
            "A selected option is invalid.",
            400
          );
        }
      } else if (answer.length > MAX_TEXT_ANSWER_LENGTH) {
        return jsonError("An answer is too long.", 400);
      }

      cleanAnswers[question.id] = answer.trim();
    }

    // 8. Save through Firebase Admin.
    // Firestore Security Rules do not apply to Admin SDK writes.
    
    const responseRef = adminDb
      .collection("quizResponses")
      .doc();

    const rateLimitRef = adminDb
      .collection("submissionRateLimits")
      .doc(decodedToken.uid);

    const WINDOW_MS = 10 * 60 * 1000;
    const MAX_SUBMISSIONS = 5;

    const now = Date.now();
    const windowStartMs =
      Math.floor(now / WINDOW_MS) * WINDOW_MS;

    const rateLimited = await adminDb.runTransaction(
      async (transaction) => {
        const rateLimitSnapshot =
          await transaction.get(rateLimitRef);

        const savedWindowStart = rateLimitSnapshot.exists
          ? rateLimitSnapshot.get("windowStartMs")
          : null;

        const savedCount = rateLimitSnapshot.exists
          ? rateLimitSnapshot.get("count")
          : 0;

        const currentCount =
          savedWindowStart === windowStartMs
            ? savedCount
            : 0;

        if (
          typeof currentCount !== "number" ||
          !Number.isInteger(currentCount) ||
          currentCount < 0
        ) {
          throw new Error("Invalid rate-limit record.");
        }

        if (currentCount >= MAX_SUBMISSIONS) {
          return true;
        }

        // Atomically save the counter and the response.
        transaction.set(rateLimitRef, {
          windowStartMs,
          count: currentCount + 1,
          updatedAt: FieldValue.serverTimestamp(),
        });

        transaction.create(responseRef, {
          quizId,
          respondentName: respondentName.trim(),
          answers: cleanAnswers,
          createdAt: FieldValue.serverTimestamp(),
          respondentUid: decodedToken.uid,
        });

        return false;
      }
    );

    if (rateLimited) {
      return NextResponse.json(
        {
          error:
            "You've reached the submission limit. Please try again in a few minutes.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.max(
                1,
                Math.ceil(
                  (windowStartMs + WINDOW_MS - Date.now()) /
                    1000
                )
              )
            ),
          },
        }
      );
    }

    return NextResponse.json(
      { success: true, responseId: responseRef.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Quiz submission failed:", error);

    return jsonError(
      "Unable to submit your quiz right now.",
      500
    );
  }
}
