import { SignJWT, jwtVerify } from "jose";

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  "open4cs-prototype-secure-jwt-session-secret-key-2026";

const secretKey = new TextEncoder().encode(SESSION_SECRET);

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
