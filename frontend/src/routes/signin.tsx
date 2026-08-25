import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Scales } from "@/components/legal/Scales";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/signin")({
  validateSearch: (search: Record<string, unknown>): { expired?: boolean } => ({
    ...(search["expired"] ? { expired: true } : {}),
  }),
  component: SignInPage,
});

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("gsi-load-failed")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("gsi-load-failed"));
    document.head.appendChild(script);
  });
}

function SignInPage() {
  const { t, lang, dir } = useLang();
  const { user, initializing, signInWithGoogleCredential } = useAuth();
  const navigate = useNavigate();
  const { expired: isExpired } = Route.useSearch();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const clientId = import.meta.env["VITE_GOOGLE_CLIENT_ID"] as string | undefined;

  // Already signed in? Straight to the chat.
  useEffect(() => {
    if (!initializing && user) navigate({ to: "/", replace: true });
  }, [initializing, user, navigate]);

  useEffect(() => {
    if (!clientId || user || initializing) return;
    let cancelled = false;

    loadGsiScript()
      .then(() => {
        if (cancelled || !window.google || !buttonRef.current) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            setError(null);
            setLoading(true);
            try {
              await signInWithGoogleCredential(response.credential);
              navigate({ to: "/", replace: true });
            } catch (err) {
              const msg =
                err instanceof Error && err.message !== "Failed to fetch"
                  ? err.message
                  : t.signinError;
              setError(msg);
              toast.error(t.signinError, { description: msg });
            } finally {
              setLoading(false);
            }
          },
        });
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: lang === "ar" ? "signin_with" : "continue_with",
          locale: lang === "ar" ? "ar" : "en",
          width: 280,
        });
      })
      .catch(() => {
        if (!cancelled) setError(t.signinError);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, lang, user, initializing]);

  return (
    <div
      className="paper flex min-h-screen items-center justify-center bg-background px-4"
      dir={dir}
    >
      <div className="rise-in w-full max-w-sm rounded-2xl border border-hairline bg-card p-8 text-center shadow-lifted sm:p-10">
        {/* Logo mark */}
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-soft">
          <Scales className="size-9" />
        </div>
        <h1 className="mt-5 text-xl font-semibold tracking-tight text-primary">{t.appName}</h1>
        <p className="mt-1 text-xs font-light text-muted-foreground">{t.appTagline}</p>

        <p className="mt-6 text-[13px] font-light leading-relaxed text-foreground">{t.signinSub}</p>

        {/* Session-expired notice */}
        {isExpired && !error && (
          <div className="mt-5 rounded-lg border border-gold/40 bg-gold-soft/30 px-3 py-2 text-[12px] font-medium text-gold">
            {t.signinExpired}
          </div>
        )}

        {/* Google button / loading state */}
        <div className="mt-6 flex min-h-[44px] items-center justify-center">
          {loading ? (
            <button
              disabled
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary/90 text-sm font-medium text-primary-foreground"
            >
              <Loader2 className="size-4 animate-spin" />
              {t.signinWorking}
            </button>
          ) : (
            <div ref={buttonRef} className="flex w-full justify-center" />
          )}
        </div>

        {/* Inline auth error */}
        {error && !loading && (
          <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
            {error}
          </p>
        )}

        <p className="mt-7 text-[11px] font-light leading-relaxed text-muted-foreground">
          🔒 {t.signinTrust}
        </p>

        <p className="mt-4 text-[10px] font-light text-muted-foreground/70">
          {dir === "rtl"
            ? "بالمتابعة أنت توافق على الشروط وسياسة الخصوصية"
            : "By continuing you agree to the Terms and Privacy Policy"}
        </p>
      </div>
    </div>
  );
}
