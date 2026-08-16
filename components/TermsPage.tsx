import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { PublicFooter } from "./PublicFooter";
import { SUPPORT_EMAIL } from "../lib/siteConfig";

const sections = [
  {
    title: "Descripción general del servicio",
    body:
      "Stampee ofrece tarjetas de fidelidad digitales basadas en el navegador y herramientas relacionadas para pequeños negocios. La beta está pensada para evaluación y uso diario de campañas, pero las funciones pueden cambiar a medida que el producto evoluciona.",
  },
  {
    title: "Uso aceptable",
    body:
      "Puedes usar Stampee solo para actividad comercial lícita. No debes usar el servicio para enviar spam, abusar de los datos de los clientes, intentar accesos no autorizados, interferir con otras cuentas o subir contenido que infrinja los derechos de terceros.",
  },
  {
    title: "Tus datos y registros de clientes",
    body:
      "Eres responsable de la información comercial, el contenido de las campañas y los datos de los clientes que agregues a Stampee. Debes tener derecho a recopilar y usar esa información, y evitar almacenar datos sensibles innecesarios en el producto.",
  },
  {
    title: "Disponibilidad de la beta",
    body:
      "Stampee se ofrece actualmente como una beta suave. Podemos modificar, suspender o eliminar funciones, y no garantizamos disponibilidad ininterrumpida, niveles específicos de tiempo de actividad ni que cada función beta permanezca en el producto.",
  },
  {
    title: "Limitación de responsabilidad",
    body:
      "En la máxima medida permitida por la ley, Stampee se proporciona tal cual y según disponibilidad durante la beta. No somos responsables por daños indirectos, incidentales, especiales, consecuenciales o punitivos, ni por pérdida de ingresos, ganancias, datos o reputación derivada del uso del servicio.",
  },
  {
    title: "Contacto",
    body: `Las preguntas sobre estos términos o la beta pueden enviarse a ${SUPPORT_EMAIL}.`,
  },
];

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-[#1d1d1f]">
      <header className="fixed top-0 z-30 w-full border-b border-black/[0.06] bg-white/78 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[88rem] items-center justify-between px-4 py-4 sm:px-6 lg:px-10">
          <Link to="/" className="inline-flex items-center">
            <img src="/stampee.svg" alt="Stampee" className="h-8 w-auto" />
          </Link>
          <Button asChild variant="ghost" className="rounded-full text-sm text-[#1d1d1f] hover:bg-black/[0.05]">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Inicio
            </Link>
          </Button>
        </div>
      </header>

      <main className="pt-20">
        <section className="bg-[#1d1d1f] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
          <div className="mx-auto max-w-[88rem]">
            <div className="max-w-[50rem]">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-white/88">
                <FileText className="h-3.5 w-3.5" />
                Términos del servicio
              </div>
              <h1 className="mt-6 text-[clamp(2.8rem,5.4vw,5.2rem)] font-black leading-[0.92] tracking-[-0.05em] text-white">
                Términos para usar Stampee durante la beta.
              </h1>
              <p className="mt-6 max-w-[38rem] text-[clamp(1rem,1.35vw,1.16rem)] leading-8 text-white/75">
                Última actualización: 3 de marzo de 2026.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-14 sm:px-6 lg:px-10 lg:py-16">
          <div className="mx-auto grid max-w-[88rem] gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <div className="bg-white px-6 py-2 sm:px-8 sm:py-2">
                <h2 className="text-[clamp(1.6rem,2.5vw,2.4rem)] font-semibold tracking-tight text-[#1d1d1f]">
                  Resumen
                </h2>
                <p className="mt-4 text-base leading-8 text-[#50545a]">
                  Estos términos describen las reglas principales para usar Stampee en su etapa actual de beta. Están escritos para
                  dar a los usuarios de pequeños negocios una base clara mientras el producto sigue mejorando.
                </p>
              </div>

              {sections.map((section) => (
                <article
                  key={section.title}
                  className="bg-white px-6 py-2 sm:px-8 sm:py-2"
                >
                  <h2 className="text-[clamp(1.5rem,2.3vw,2.2rem)] font-semibold leading-[1.02] tracking-tight text-[#1d1d1f]">
                    {section.title}
                  </h2>
                  <p className="mt-4 text-base leading-8 text-[#50545a]">{section.body}</p>
                </article>
              ))}
            </div>

            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <div className="bg-white px-6 py-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1d1d1f]">Nota sobre la beta</p>
                <p className="mt-4 text-sm leading-7 text-[#5f4a2c]">
                  Stampee todavía se está consolidando para un lanzamiento más amplio. Usa la beta con esa expectativa y contacta a{" "}
                  <a className="font-medium underline underline-offset-2" href={`mailto:${SUPPORT_EMAIL}`}>
                    {SUPPORT_EMAIL}
                  </a>{" "}
                  si necesitas aclaraciones.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
};

export default TermsPage;
