import React from "react";
import { Link } from "react-router-dom";

export const PublicFooter: React.FC = () => {
  return (
    <footer className="border-t border-white/[0.07] bg-[#1d1d1f] px-6 py-8">
      <div className="mx-auto flex max-w-[88rem] flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <Link to="/" className="inline-flex items-center">
          <img src="/stampee.svg" alt="Stampee" className="h-7 w-auto opacity-35 invert" />
        </Link>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
          <Link
            to="/showcase"
            className="text-xs font-medium text-white/55 transition-colors hover:text-white"
          >
            Demos y plantillas
          </Link>
          <Link
            to="/articles"
            className="text-xs font-medium text-white/55 transition-colors hover:text-white"
          >
            Artículos
          </Link>
          <Link
            to="/privacy-policy"
            className="text-xs font-medium text-white/55 transition-colors hover:text-white"
          >
            Política de privacidad
          </Link>
          <Link
            to="/cookie"
            className="text-xs font-medium text-white/55 transition-colors hover:text-white"
          >
            Política de cookies
          </Link>
          <Link
            to="/terms"
            className="text-xs font-medium text-white/55 transition-colors hover:text-white"
          >
            Términos
          </Link>
          <a
            href="mailto:hello@stampee.co"
            className="text-xs font-medium text-white/55 transition-colors hover:text-white"
          >
            hello@stampee.co
          </a>
          <p className="text-xs text-white/25">© {new Date().getFullYear()} Stampee. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
