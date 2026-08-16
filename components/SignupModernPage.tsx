import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowRight, Link2 } from "lucide-react";
import { AuthSplitLayout } from "./AuthSplitLayout";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "./AuthProvider";
import { getSlugHint, isSlugValid, normalizeSlug } from "../lib/slug";

const inputCls =
  "h-13 rounded-2xl border-black/[0.06] bg-[#f4f3ee] px-5 text-[1.05rem] text-[#111111] placeholder:text-[#6f7066] focus-visible:border-black/[0.12] focus-visible:ring-0";
const labelCls = "block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6e6e73]";

export const SignupModernPage: React.FC = () => {
  const { currentUser, loading, signup, isSlugAvailable } = useAuth();
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [slugInput, setSlugInput] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
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
    setInfo("");

    if (!slugValid) {
      setError("Tu URL pública es inválida. Usa solo letras minúsculas, números y guiones.");
      return;
    }

    if (!slugAvailable && !slugCheckFailed) {
      setError("Esa URL pública ya está en uso.");
      return;
    }

    setBusy(true);
    try {
      const result = await withTimeout(signup({ businessName, email, password, slug: normalizedSlug }));
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.message) setInfo(result.message);
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
      mode="signup"
      titleClassName="whitespace-nowrap text-[clamp(2rem,4vw,3.2rem)]"
    >
      <form className="space-y-3.5" onSubmit={handleSubmit}>
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

        <div className="space-y-2 rounded-[1.7rem] border border-black/[0.07] bg-white/40 p-3.5">
          <div className="flex items-center justify-between">
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

          <div className="flex items-center gap-2 rounded-2xl border border-black/[0.08] bg-white px-4 py-3.5 focus-within:border-black/[0.14]">
            <Link2 className="h-4 w-4 shrink-0 text-[#6e6e73]" />
            <span className="shrink-0 text-sm font-medium text-[#6e6e73]">stampee.co/</span>
            <input
              value={normalizedSlug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlugInput(e.target.value);
              }}
              className="min-w-0 flex-1 bg-transparent font-mono text-base text-[#1d1d1f] outline-none placeholder:text-[#6e6e73]/50"
              placeholder="yourbrand"
              required
            />
          </div>

          <p className="text-xs text-[#6e6e73]">
            {slugHint} Solo letras minúsculas, números y guiones.
          </p>
          {slugCheckFailed && (
            <p className="text-xs text-amber-700">
              No se pudo verificar la disponibilidad de la URL. Puedes continuar de todas formas.
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {info && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {info}
          </div>
        )}

        <Button
          type="submit"
          disabled={isDisabled}
          className="h-14 w-full rounded-2xl bg-[#cccec2] text-base font-semibold text-[#111111] shadow-none hover:bg-[#c3c5b8] disabled:opacity-60"
        >
          {isSubmitting ? "Creando..." : "Crear espacio"}
          {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
        {loading && !busy && (
          <p className="text-center text-xs text-[#6e6e73]">Verificando sesión existente...</p>
        )}

        <p className="text-center text-sm text-[#6e6e73]">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/login" className="font-semibold text-[#1d1d1f] underline-offset-2 hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </form>
    </AuthSplitLayout>
  );
};
