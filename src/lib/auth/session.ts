import { SignJWT, jwtVerify } from "jose";

function getSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;

  if (process.env.NODE_ENV === "production") {
    if (!secret || secret.length < 32) {
      throw new Error(
        "CRITICAL SECURITY CONFIGURATION ERROR: SESSION_SECRET must be defined in production environment and be at least 32 characters long."
      );
    }
    return new TextEncoder().encode(secret);
  }

  // Development and test fallback with audit warning
  if (!secret) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        "[SECURITY WARNING]: SESSION_SECRET is not set in .env.local. Using ephemeral development key. Set SESSION_SECRET before deploying."
      );
    }
    return new TextEncoder().encode("open4cs-local-dev-session-secret-key-32chars-min");
  }

  return new TextEncoder().encode(secret);
}

const secretKey = getSessionSecret();

export type SessionPayload = {
  userId: string;
  role: "USER" | "CAGS_ADMIN";
};

export async function createSessionToken(
  payload: SessionPayload
) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);

    if (
      !payload ||
      typeof payload.userId !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }

    if (
      payload.role !== "USER" &&
      payload.role !== "CAGS_ADMIN"
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      role: payload.role as "USER" | "CAGS_ADMIN",
    };
  } catch {
    return null;
  }
}
