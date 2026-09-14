import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CircleCheck, Gauge, Cog, Fuel, Palette } from "lucide-react";
import CarGallery from "@/components/CarGallery";
import VehicleInquiryForm from "@/components/VehicleInquiryForm";
import ScrollReveal from "@/components/ScrollReveal";
import { getPublicCarById } from "@/lib/public-inventory";
import { formatMileage, formatPriceUsd } from "@/lib/format";
import { estimateMonthlyPayment, FINANCING_DISCLAIMER } from "@/lib/finance";

export const revalidate = 60;

export async function generateMetadata(props: PageProps<"/cars/[id]">) {
  const { id } = await props.params;
  const car = await getPublicCarById(id);
  if (!car) return { title: "Auto no encontrado — Aero Motors" };
  return {
    title: `${car.year} ${car.make} ${car.model} — Aero Motors`,
    description: `${car.year} ${car.make} ${car.model}, ${formatMileage(car.mileage)}, ${formatPriceUsd(car.price)}. Disponible en Aero Motors, Punta del Este.`,
  };
}

export default async function CarDetailPage(props: PageProps<"/cars/[id]">) {
  const { id } = await props.params;
  const car = await getPublicCarById(id);
  if (!car) notFound();

  const images = car.images?.length ? car.images : car.image ? [car.image] : [];
  const estimatedPayment = estimateMonthlyPayment(car.price);

  const specs = [
    { icon: Gauge, label: formatMileage(car.mileage) },
    { icon: Cog, label: car.transmission },
    { icon: Fuel, label: car.fuelType },
    ...(car.color ? [{ icon: Palette, label: car.color }] : []),
  ];

  const features =
    car.features?.length ? car.features : [car.transmission, car.fuelType, car.color].filter(Boolean);

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-16 sm:px-10 sm:py-20">
      <Link
        href="/#inventory"
        className="inline-flex items-center gap-1.5 text-sm text-ink-400 transition-colors hover:text-ink-100"
      >
        <ArrowLeft size={15} />
        Volver al inventario
      </Link>

      <ScrollReveal className="mt-6">
        <CarGallery images={images} alt={`${car.make} ${car.model}`} />
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-ink-100 sm:text-4xl">
            {car.year} {car.make} {car.model}
          </h1>
          <div className="shrink-0 sm:text-right">
            <p className="font-mono text-2xl font-bold text-ink-100 sm:text-3xl">
              {formatPriceUsd(estimatedPayment)}
              <span className="ml-1 text-sm font-normal text-ink-400">/mes</span>
            </p>
            <p className="mt-0.5 text-sm text-ink-400">{formatPriceUsd(car.price)} de contado</p>
          </div>
        </div>

        <ul className="mt-4 flex flex-wrap gap-2">
          {specs.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-xs text-ink-300"
            >
              <Icon size={14} strokeWidth={1.75} className="text-champagne-400" />
              {label}
            </li>
          ))}
        </ul>

        <p className="mt-4 text-xs leading-relaxed text-ink-600">{FINANCING_DISCLAIMER}</p>
      </ScrollReveal>

      <ScrollReveal className="mt-14">
        <h2 className="text-lg font-medium text-ink-100">Sobre este vehículo</h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-300">
          {car.description?.trim() ||
            `Un ${car.make} ${car.model} ${car.year} en ${car.color ? `color ${car.color.toLowerCase()}, ` : ""}excelente estado general. Pasó por nuestra inspección mecánica de 120 puntos y está listo para conducir, con registro local y garantía incluidos.`}
        </p>
      </ScrollReveal>

      <ScrollReveal className="mt-14">
        <h2 className="text-lg font-medium text-ink-100">Equipamiento</h2>
        <ul className="mt-5 grid grid-cols-1 gap-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2.5 text-sm text-ink-300">
              <CircleCheck size={16} strokeWidth={1.75} className="shrink-0 text-champagne-400" />
              {feature}
            </li>
          ))}
        </ul>
      </ScrollReveal>

      <ScrollReveal className="mt-14">
        <VehicleInquiryForm car={car} />
      </ScrollReveal>
    </div>
  );
}
