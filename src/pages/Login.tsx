import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);
  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);
  return url.toString();
}

const isDevMode = import.meta.env.DEV && !import.meta.env.VITE_KIMI_AUTH_URL;

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center space-y-1">
          <div className="w-12 h-12 bg-black rounded flex items-center justify-center mx-auto mb-2">
            <span className="text-amber-400 font-bold text-xl">K</span>
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your Karimi Garments account</CardDescription>
        </CardHeader>
        <CardContent>
          {isDevMode ? (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
              <p className="font-semibold mb-1">🛠 Dev Mode — Auth Skipped</p>
              <p>You are automatically logged in as admin via <code className="bg-amber-100 px-1 rounded">DEV_USER_ID</code>.</p>
            </div>
          ) : (
            <Button
              className="w-full bg-black hover:bg-gray-800 text-white"
              size="lg"
              onClick={() => { window.location.href = getOAuthUrl(); }}
            >
              Sign in with Kimi
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
