/** Standard fixed-rate amortization — shared by FinancingCalculator and the car detail page. */
export function monthlyPayment(principal: number, annualRatePct: number, termMonths: number): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  const monthlyRate = annualRatePct / 100 / 12;
  if (monthlyRate === 0) return principal / termMonths;
  const factor = (1 + monthlyRate) ** termMonths;
  return (principal * monthlyRate * factor) / (factor - 1);
}

/**
 * The dealership's standard advertised offer — used everywhere a car's price
 * is shown as a monthly payment (CarCard, the inventory grid, the car detail
 * page). Keep these three numbers and FINANCING_DISCLAIMER's wording in sync;
 * they're quoted verbatim in the disclaimer shown alongside the price.
 */
export const FINANCING_TERMS = {
  downPaymentPct: 0.3,
  termMonths: 60,
  annualRatePct: 6.9,
} as const;

/** Estimated monthly payment for a car's total cash price, under the standard offer above. */
export function estimateMonthlyPayment(price: number): number {
  const principal = price * (1 - FINANCING_TERMS.downPaymentPct);
  return monthlyPayment(principal, FINANCING_TERMS.annualRatePct, FINANCING_TERMS.termMonths);
}

export const FINANCING_DISCLAIMER = `Precio basado en una entrega del ${Math.round(FINANCING_TERMS.downPaymentPct * 100)}% con un financiamiento de ${FINANCING_TERMS.termMonths} cuotas a una tasa anual del ${FINANCING_TERMS.annualRatePct}%, sujeto a aprobación crediticia del banco.`;
