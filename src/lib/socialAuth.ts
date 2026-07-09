import { api, setAccountToken } from "@/lib/api";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const APPLE_SERVICES_ID = import.meta.env.VITE_APPLE_SERVICES_ID as string | undefined;

const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const APPLE_SCRIPT_SRC = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    document.head.appendChild(script);
  });
}

// Call once when the login page mounts so the button click doesn't have to
// wait on the script — Safari/Apple's popup flow can get blocked if too much
// async work happens between the click and opening the popup.
export function preloadSocialAuthScripts() {
  if (GOOGLE_CLIENT_ID) loadScript(GOOGLE_SCRIPT_SRC).catch(() => {});
  if (APPLE_SERVICES_ID) loadScript(APPLE_SCRIPT_SRC).catch(() => {});
}

async function exchangeCredential(provider: "google" | "apple", credential: string, name?: string | null) {
  const { token } = await api.socialLogin(provider, credential, name);
  setAccountToken(token);
}

export async function signInWithGoogle(): Promise<void> {
  if (!GOOGLE_CLIENT_ID) throw new Error("Google login no está configurado (falta VITE_GOOGLE_CLIENT_ID)");
  await loadScript(GOOGLE_SCRIPT_SRC);

  return new Promise<void>((resolve, reject) => {
    // @ts-expect-error - injected globally by Google's gsi/client script
    const client = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "email profile",
      callback: async (response: { access_token?: string; error?: string }) => {
        if (!response.access_token) {
          reject(new Error(response.error || "Google no devolvió un token de acceso"));
          return;
        }
        try {
          await exchangeCredential("google", response.access_token);
          resolve();
        } catch (err) {
          reject(err);
        }
      },
    });
    client.requestAccessToken();
  });
}

export async function signInWithApple(): Promise<void> {
  if (!APPLE_SERVICES_ID) throw new Error("Apple login no está configurado (falta VITE_APPLE_SERVICES_ID)");
  await loadScript(APPLE_SCRIPT_SRC);

  // @ts-expect-error - injected globally by Apple's appleid.auth.js script
  AppleID.auth.init({
    clientId: APPLE_SERVICES_ID,
    scope: "name email",
    redirectURI: window.location.origin,
    usePopup: true,
  });

  // @ts-expect-error - injected globally by Apple's appleid.auth.js script
  const data = await AppleID.auth.signIn();
  const name = data.user?.name
    ? `${data.user.name.firstName ?? ""} ${data.user.name.lastName ?? ""}`.trim() || null
    : null;

  await exchangeCredential("apple", data.authorization.id_token, name);
}
