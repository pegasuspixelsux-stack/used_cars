"use client";

import { useMemo, useState } from "react";
import { formatPriceUsd } from "@/lib/format";

const TERMS = [6, 12, 24, 36, 48, 60];

const PRICE_MIN = 15000;
const PRICE_MAX = 350000;
const PRICE_STEP = 500;
const RATE_MIN = 0;
const RATE_MAX = 18;
const RATE_STEP = 0.1;

function monthlyPayment(principal: number, annualRatePct: number, termMonths: number): number {
  if (principal <= 0) return 0;
  const monthlyRate = annualRatePct / 100 / 12;
  if (monthlyRate === 0) return principal / termMonths;
  const factor = (1 + monthlyRate) ** termMonths;
  return (principal * monthlyRate * factor) / (factor - 1);
}

export default function FinancingCalculator() {
  const [price, setPrice] = useState(95000);
  const [downPayment, setDownPayment] = useState(15000);
  const [rate, setRate] = useState(8.5);
  const [termMonths, setTermMonths] = useState(48);

  function updatePrice(value: number) {
    const clamped = Math.min(Math.max(value, 0), PRICE_MAX);
    setPrice(clamped);
    if (downPayment > clamped) setDownPayment(clamped);
  }

  function updateDownPayment(value: number) {
    setDownPayment(Math.min(Math.max(value, 0), price));
  }

  const { principal, payment, totalInterest, totalCost } = useMemo(() => {
    const principal = Math.max(price - downPayment, 0);
    const payment = monthlyPayment(principal, rate, termMonths);
    const totalPaid = payment * termMonths;
    return {
      principal,
      payment,
      totalInterest: Math.max(totalPaid - principal, 0),
      totalCost: totalPaid + downPayment,
    };
  }, [price, downPayment, rate, termMonths]);

  const downPaymentPct = price > 0 ? Math.round((downPayment / price) * 100) : 0;

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
      <div className="space-y-8">
        <SliderField
          label="Precio del vehículo"
          value={price}
          display={formatPriceUsd(price)}
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={PRICE_STEP}
          onChange={updatePrice}
        />

        <SliderField
          label="Anticipo"
          value={downPayment}
          display={formatPriceUsd(downPayment)}
          hint={`${downPaymentPct}% del precio`}
          min={0}
          max={price}
          step={PRICE_STEP}
          onChange={updateDownPayment}
        />

        <SliderField
          label="Tasa de interés anual"
          value={rate}
          display={`${rate.toFixed(1)}%`}
          min={RATE_MIN}
          max={RATE_MAX}
          step={RATE_STEP}
          onChange={setRate}
        />

        <div>
          <p className="mb-3 text-sm text-ink-400">Plazo del préstamo</p>
          <div className="flex flex-wrap gap-2">
            {TERMS.map((months) => (
              <button
                key={months}
                type="button"
                onClick={() => setTermMonths(months)}
                aria-pressed={termMonths === months}
                className={
                  termMonths === months
                    ? "rounded-full bg-champagne-400 px-4 py-2 text-sm font-medium text-obsidian-950 transition-transform active:scale-[0.97]"
                    : "rounded-full border border-hairline px-4 py-2 text-sm text-ink-300 transition-colors hover:border-hairline-strong hover:text-ink-100 active:scale-[0.97]"
                }
              >
                {months} meses
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-hairline bg-obsidian-900 p-7 backdrop-blur-md sm:p-8">
        <p className="text-sm text-ink-400">Cuota mensual estimada</p>
        <p className="mt-2 font-mono text-4xl text-ink-100 sm:text-5xl">
          {formatPriceUsd(payment)}
          <span className="ml-1.5 text-lg text-ink-400">/mes</span>
        </p>

        <dl className="mt-8 space-y-3 border-t border-hairline pt-6 text-sm">
          <div className="flex items-baseline justify-between">
            <dt className="text-ink-400">Monto financiado</dt>
            <dd className="font-mono text-ink-100">{formatPriceUsd(principal)}</dd>
          </div>
          <div className="flex items-baseline justify-between">
            <dt className="text-ink-400">Interés total</dt>
            <dd className="font-mono text-ink-100">{formatPriceUsd(totalInterest)}</dd>
          </div>
          <div className="flex items-baseline justify-between">
            <dt className="text-ink-400">Costo total</dt>
            <dd className="font-mono text-ink-100">{formatPriceUsd(totalCost)}</dd>
          </div>
        </dl>

        <p className="mt-6 text-xs leading-relaxed text-ink-600">
          Estimación referencial a modo informativo. Sujeta a aprobación
          crediticia y a las condiciones vigentes al momento de la compra.
        </p>
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  display,
  hint,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  hint?: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-sm text-ink-400">
          {label}
          {hint && <span className="ml-2 text-xs text-ink-600">{hint}</span>}
        </span>
        <span className="font-mono text-base text-ink-100">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-obsidian-700 accent-champagne-400"
        aria-label={label}
      />
    </div>
  );
}
