import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Link2 } from "lucide-react";
import { AuthSplitLayout } from "./AuthSplitLayout";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "./AuthProvider";
import { getSlugHint, isSlugValid, normalizeSlug } from "../lib/slug";
import { trackEvent } from "../lib/analytics";

const inputCls =
  "h-14 rounded-[1.2rem] border border-black/[0.08] bg-[#f4f1ea] px-4 text-[15px] text-[#171512] shadow-none placeholder:text-[#8a8276] focus-visible:border-black/25 focus-visible:bg-white focus-visible:ring-0";
const labelCls = "block text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#777062]";

export const SignupPage: React.FC = () => {
  const { currentUser, loading, signup, isSlugAvailable } = useAuth();
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [slugInput, setSlugInput] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugCheckFailed, setSlugCheckFailed] = useState(false);

  const withTimeout = async <T,>(promise: Promise<T>, ms = 15000): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        reject(new Error("Se agotó el tiempo de registro. Inténtalo de nuevo."));
      }, ms);
      promise
        .then((value) => {
          window.clearTimeout(timeoutId);
          resolve(value);
        })
        .catch((err) => {
          window.clearTimeout(timeoutId);
          reject(err);
        });
    });

  const normalizedSlug = normalizeSlug(slugInput);
  const slugValid = isSlugValid(normalizedSlug);
  const slugHint = getSlugHint(normalizedSlug);

  useEffect(() => {
    if (!slugTouched) {
      setSlugInput(normalizeSlug(businessName));
    }
  }, [businessName, slugTouched]);

  useEffect(() => {
    if (!slugValid) {
      setSlugAvailable(false);
      setSlugChecking(false);
      setSlugCheckFailed(false);
      return;
    }
    let cancelled = false;
    setSlugChecking(true);
    const timer = setTimeout(async () => {
      try {
        const available = await isSlugAvailable(normalizedSlug);
        if (!cancelled) {
          setSlugAvailable(available);
          setSlugCheckFailed(false);
          setSlugChecking(false);
        }
      } catch {
        if (!cancelled) {
          setSlugAvailable(false);
          setSlugCheckFailed(true);
          setSlugChecking(false);
        }
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      setSlugChecking(false);
    };
  }, [normalizedSlug, slugValid, isSlugAvailable]);

  const slugStatusLabel = !normalizedSlug
    ? ""
    : !slugValid
    ? "Inválido"
    : slugChecking
    ? "Verificando..."
    : slugCheckFailed
    ? "Error de verificación"
    : slugAvailable
    ? "Disponible"
    : "No disponible";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!slugValid) {
      setError("Tu URL pública es inválida. Usa solo letras minúsculas, números y guiones.");
      return;
    }
    if (!slugAvailable && !slugCheckFailed) {
      setError("Esa URL pública ya está en uso.");
      return;
    }
    setBusy(true);
    trackEvent("Signup Submitted", { slug: normalizedSlug });
    try {
      const result = await withTimeout(signup({ businessName, email, password, slug: normalizedSlug }));
      if (!result.ok) {
        setError(result.error);
        return;
      }
      trackEvent("Signup Success", { slug: normalizedSlug });
      if (result.message) {
        navigate("/signup-confirmation", {
          replace: true,
          state: { email: email.trim().toLowerCase() },
        });
      }
    } catch {
      setError("No se puede crear la cuenta ahora. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  if (!loading && currentUser) {
    return <Navigate to={currentUser.role === "staff" ? "/issued-cards" : "/dashboard"} replace />;
  }

  const isSubmitting = busy;
  const isDisabled = slugChecking || (!slugAvailable && !slugCheckFailed) || !slugValid || busy || loading;

  return (
    <AuthSplitLayout
      title="Crea tu espacio de trabajo"
      subtitle="Configura tu marca, publica tu enlace de tarjeta pública y lanza la fidelidad digital en minutos."
      badge="Comenzar"
      mode="signup"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <p className="text-sm leading-6 text-[#6d6658]">Gratis para empezar, sin tarjeta de crédito.</p>

        <div className="space-y-1.5">
          <label className={labelCls}>Nombre del negocio</label>
          <Input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="The Daily Brew"
            className={inputCls}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelCls}>Correo electrónico</label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@brand.com"
            className={inputCls}
            type="email"
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelCls}>Contraseña</label>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            className={inputCls}
            type="password"
            autoComplete="new-password"
            required
          />
        </div>

        <div className="space-y-3 rounded-[1.35rem] border border-black/[0.08] bg-[#f5f1e8] p-4">
          <div className="flex items-center justify-between gap-3">
            <label className={labelCls}>Tu URL pública</label>
            {normalizedSlug && (
              <span
                className={`text-[11px] font-semibold ${
                  slugAvailable
                    ? "text-emerald-600"
                    : slugCheckFailed
                    ? "text-amber-600"
                    : "text-red-500"
                }`}
              >
                {slugStatusLabel}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 rounded-[1.2rem] border border-black/[0.08] bg-white px-4 py-3.5 focus-within:border-black/25">
            <Link2 className="h-4 w-4 shrink-0 text-[#777062]" />
            <span className="shrink-0 text-sm font-medium text-[#777062]">stampee.co/</span>
            <input
              value={normalizedSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlugInput(e.target.value);
              }}
              className="min-w-0 flex-1 bg-transparent font-mono text-sm text-[#171512] outline-none placeholder:text-[#8a8276]"
              placeholder="yourbrand"
              required
            />
          </div>

          <p className="text-xs leading-6 text-[#6d6658]">
            {slugHint} Solo letras minúsculas, números y guiones.
          </p>
          {slugCheckFailed && (
            <p className="text-xs leading-6 text-amber-700">
              No se pudo verificar la disponibilidad de la URL. Puedes continuar de todas formas.
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-[1.2rem] border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <Button
          type="submit"
          disabled={isDisabled}
          className="h-14 w-full rounded-[1.2rem] bg-[#1b1813] text-base font-semibold text-white shadow-none hover:bg-[#11100d] disabled:opacity-40"
        >
          {isSubmitting ? "Creando..." : "Crear espacio"}
          {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
        {loading && !busy && (
          <p className="text-center text-xs text-[#777062]">Verificando sesión existente...</p>
        )}

        <p className="text-center text-sm text-[#6d6658]">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login" className="font-semibold text-[#171512] underline-offset-2 hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </form>
    </AuthSplitLayout>
  );
};
