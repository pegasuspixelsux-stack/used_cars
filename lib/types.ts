export type Transmission = "Automática" | "Manual";
export type FuelType = "Nafta" | "Diésel" | "Híbrido" | "Eléctrico";

export interface VehicleImage {
  src: string;
  alt: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  trim: string;
  year: number;
  bodyStyle: string;
  priceUsd: number;
  mileageKm: number;
  transmission: Transmission;
  fuelType: FuelType;
  image: VehicleImage;
}

export interface Advantage {
  id: string;
  title: string;
  description: string;
}
