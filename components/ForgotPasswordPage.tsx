import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "./AuthProvider";

const inputCls =
  "h-12 rounded-xl border-black/[0.1] bg-[#f5f5f7] text-[#1d1d1f] placeholder:text-[#6e6e73]/50 focus-visible:border-[#1d1d1f] focus-visible:ring-0";
const labelCls = "block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6e6e73]";

export const ForgotPasswordPage: React.FC = () => {
  const { currentUser, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  if (currentUser) {
    return <Navigate to="/settings" replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Por favor ingresa tu dirección de correo electrónico.");
      return;
    }
    setBusy(true);
    const result = await resetPassword(email.trim());
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <AuthLayout
        title="Revisa tu bandeja de entrada."
        subtitle="Enviamos un enlace de restablecimiento de contraseña a tu correo."
        badge="Listo"
        theme="login"
      >
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <CheckCircle2 className="h-14 w-14 text-green-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[#1d1d1f]">¡Enlace enviado!</h2>
            <p className="mt-1 text-sm text-[#6e6e73]">
              Revisa <span className="font-medium text-[#1d1d1f]">{email}</span> para encontrar el enlace de restablecimiento.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#1d1d1f] text-base font-medium text-white shadow-sm hover:bg-black/80"
          >
            Volver al inicio de sesión
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="¿Olvidaste tu contraseña?"
      subtitle="Ingresa el correo de tu cuenta y te enviaremos un enlace de restablecimiento."
      badge="Restablecer contraseña"
      theme="login"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="mb-2">
          <h2 className="text-xl font-semibold text-[#1d1d1f]">Encuentra tu cuenta</h2>
          <p className="mt-1 text-sm text-[#6e6e73]">Ingresa el correo que usaste para registrarte.</p>
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

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={busy}
          className="h-12 w-full rounded-full bg-[#1d1d1f] text-base font-medium text-white shadow-sm hover:bg-black/80"
        >
          {busy ? "Enviando..." : "Enviar enlace de restablecimiento"}
          {!busy && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>

        <p className="text-center text-sm text-[#6e6e73]">
          ¿Recuerdas tu contraseña?{" "}
          <Link to="/login" className="font-semibold text-[#1d1d1f] underline-offset-2 hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};
