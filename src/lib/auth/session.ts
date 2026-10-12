import { SignJWT, jwtVerify } from "jose";

const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error(
    "Please define SESSION_SECRET in .env.local"
  );
}

const secretKey = new TextEncoder().encode(SESSION_SECRET);

export type SessionPayload = {
  userId: string;
  role: "USER" | "CAGS_ADMIN";
};

export async function createSessionToken(
  payload: SessionPayload
) {
  return new SignJWT({
    userId: payload.userId,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      secretKey
    );

    if (
      typeof payload.userId !== "string" ||
      (payload.role !== "USER" &&
        payload.role !== "CAGS_ADMIN")
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
