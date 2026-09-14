import { ShieldCheck, ReceiptText, Truck } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const ADVANTAGES = [
  {
    icon: ShieldCheck,
    title: "Historial e inspección verificados",
    description:
      "Cada vehículo pasa por una inspección mecánica y estética de 120 puntos, con un informe completo de titularidad y siniestros incluido antes de que usted decida.",
  },
  {
    icon: ReceiptText,
    title: "Precio transparente, sin costos ocultos",
    description:
      "El precio que ve es el precio que paga. Sin agregados de último momento ni gastos de gestoría sorpresa: cada costo está detallado desde el principio.",
  },
  {
    icon: Truck,
    title: "Entrega y registro llave en mano",
    description:
      "Nos encargamos del transporte, los trámites aduaneros y el registro en su nombre, y entregamos en cualquier punto de Uruguay, listo para andar el día que llega.",
  },
];

export default function Advantages() {
  return (
    <section id="why-us" className="border-y border-hairline py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
        <ScrollReveal>
          <h2 className="max-w-lg text-3xl font-semibold tracking-tight text-ink-100 sm:text-4xl">
            Por qué los compradores eligen Aero Motors
          </h2>
        </ScrollReveal>

        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
          {ADVANTAGES.map(({ icon: Icon, title, description }, index) => (
            <ScrollReveal
              key={title}
              delay={index * 0.08}
              className="border-t border-hairline pt-8 sm:border-t-0 sm:border-l sm:pl-8 sm:pt-0 first:sm:border-l-0 first:sm:pl-0"
            >
              <Icon size={26} strokeWidth={1.5} className="text-champagne-400" />
              <h3 className="mt-5 text-lg font-medium text-ink-100">{title}</h3>
              <p className="mt-3 leading-relaxed text-ink-400">{description}</p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
