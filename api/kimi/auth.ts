import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import * as jose from "jose";
import * as cookie from "cookie";
import { env } from "../lib/env";
import { getSessionCookieOptions } from "../lib/cookies";
import { Session } from "@contracts/constants";
import { Errors } from "@contracts/errors";
import { signSessionToken, verifySessionToken } from "./session";
import { findUserByUnionId, upsertUser } from "../queries/users";
import type { TokenResponse } from "./types";

// DEV BYPASS: if DEV_USER_ID is set in env, all requests are auto-authenticated.
// Never active in production (NODE_ENV=production ignores this).
async function getDevUser() {
  if (env.isProduction || !env.devUserId) return null;
  await upsertUser({
    unionId: env.devUserId,
    name: "Dev Admin",
    lastSignInAt: new Date(),
  });
  return findUserByUnionId(env.devUserId);
}

async function exchangeAuthCode(code: string, redirectUri: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: env.appId,
    redirect_uri: redirectUri,
    client_secret: env.appSecret,
  });
  const resp = await fetch(`${env.kimiAuthUrl}/api/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Token exchange failed (${resp.status}): ${text}`);
  }
  return resp.json() as Promise<TokenResponse>;
}

// Lazy JWKS — only created when actually needed, prevents startup crash
const getJwks = (() => {
  let jwks: ReturnType<typeof jose.createRemoteJWKSet> | null = null;
  return () => {
    if (!jwks && env.kimiAuthUrl) {
      jwks = jose.createRemoteJWKSet(
        new URL(`${env.kimiAuthUrl}/api/.well-known/jwks.json`),
      );
    }
    return jwks;
  };
})();

async function verifyAccessToken(accessToken: string): Promise<{ userId: string; clientId: string }> {
  const jwks = getJwks();
  if (!jwks) throw new Error("KIMI_AUTH_URL not configured");
  const { payload } = await jose.jwtVerify(accessToken, jwks);
  const userId = payload.user_id as string;
  const clientId = payload.client_id as string;
  if (!userId) throw new Error("user_id missing from access token");
  return { userId, clientId };
}

export async function authenticateRequest(headers: Headers) {
  // Skips all OAuth/cookie checks in dev mode
  const devUser = await getDevUser();
  if (devUser) return devUser;

  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) throw Errors.forbidden("Invalid authentication token.");
  const claim = await verifySessionToken(token);
  if (!claim) throw Errors.forbidden("Invalid authentication token.");
  const user = await findUserByUnionId(claim.unionId);
  if (!user) throw Errors.forbidden("User not found. Please re-login.");
  return user;
}

export function createOAuthCallbackHandler() {
  return async (c: Context) => {
    const code = c.req.query("code");
    const state = c.req.query("state");
    const error = c.req.query("error");
    const errorDescription = c.req.query("error_description");

    if (error) {
      if (error === "access_denied") return c.redirect("/", 302);
      return c.json({ error, error_description: errorDescription }, 400);
    }
    if (!code || !state) return c.json({ error: "code and state are required" }, 400);

    try {
      const redirectUri = atob(state);
      const tokenResp = await exchangeAuthCode(code, redirectUri);
      const { userId } = await verifyAccessToken(tokenResp.access_token);
      let name = "User";
      let avatar: string | undefined;
      if (env.kimiOpenUrl) {
        const { users: kimiUsers } = await import("./platform");
        const userProfile = await kimiUsers.getProfile(tokenResp.access_token);
        if (userProfile) { name = userProfile.name; avatar = userProfile.avatar_url; }
      }
      await upsertUser({ unionId: userId, name, avatar, lastSignInAt: new Date() });
      const sessionToken = await signSessionToken({ unionId: userId, clientId: env.appId });
      const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
      setCookie(c, Session.cookieName, sessionToken, {
        ...cookieOpts,
        maxAge: Session.maxAgeMs / 1000,
      });
      return c.redirect("/", 302);
    } catch (err) {
      console.error("[OAuth] Callback failed", err);
      return c.json({ error: "OAuth callback failed" }, 500);
    }
  };
}

export { exchangeAuthCode, verifyAccessToken };
