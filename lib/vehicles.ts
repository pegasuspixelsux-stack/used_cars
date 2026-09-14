import type { Vehicle } from "./types";

/**
 * Featured showcase vehicle for the hero. Kept separate from the inventory
 * grid so the flagship car isn't duplicated below the fold.
 */
export const featuredVehicle: Vehicle = {
  id: "porsche-911-carrera-s",
  make: "Porsche",
  model: "911 Carrera S",
  trim: "Sport Design",
  year: 2023,
  bodyStyle: "Cupé",
  priceUsd: 148500,
  mileageKm: 6200,
  transmission: "Automática",
  fuelType: "Nafta",
  image: {
    src: "https://images.unsplash.com/photo-1608506436795-af65d01305bf",
    alt: "Porsche 911 Carrera S negro bajo luces de estudio",
  },
};

export const inventory: Vehicle[] = [
  {
    id: "bmw-m3-competition",
    make: "BMW",
    model: "M3",
    trim: "Competition",
    year: 2022,
    bodyStyle: "Cupé",
    priceUsd: 89900,
    mileageKm: 18400,
    transmission: "Manual",
    fuelType: "Nafta",
    image: {
      src: "https://images.unsplash.com/photo-1611785677708-128fc827a1e0",
      alt: "BMW M3 Competition cupé de color negro",
    },
  },
  {
    id: "porsche-cayenne-s",
    make: "Porsche",
    model: "Cayenne",
    trim: "S",
    year: 2023,
    bodyStyle: "SUV",
    priceUsd: 112400,
    mileageKm: 9800,
    transmission: "Automática",
    fuelType: "Nafta",
    image: {
      src: "https://images.unsplash.com/photo-1762195340046-415140d8b1b2",
      alt: "Porsche Cayenne blanco dentro de un showroom moderno",
    },
  },
  {
    id: "tesla-model-y-performance",
    make: "Tesla",
    model: "Model Y",
    trim: "Performance",
    year: 2023,
    bodyStyle: "SUV",
    priceUsd: 58900,
    mileageKm: 14200,
    transmission: "Automática",
    fuelType: "Eléctrico",
    image: {
      src: "https://images.unsplash.com/photo-1771284848859-12f150fa1637",
      alt: "Tesla Model Y blanco estacionado dentro de un showroom",
    },
  },
  {
    id: "rolls-royce-ghost",
    make: "Rolls-Royce",
    model: "Ghost",
    trim: "Extended",
    year: 2021,
    bodyStyle: "Sedán",
    priceUsd: 349000,
    mileageKm: 11600,
    transmission: "Automática",
    fuelType: "Nafta",
    image: {
      src: "https://images.unsplash.com/photo-1740098160485-d098fbf42814",
      alt: "Rolls-Royce Ghost negro estacionado en la vía pública",
    },
  },
  {
    id: "mercedes-e-class",
    make: "Mercedes-Benz",
    model: "E-Class",
    trim: "E 450 4MATIC",
    year: 2022,
    bodyStyle: "Sedán",
    priceUsd: 64500,
    mileageKm: 22100,
    transmission: "Automática",
    fuelType: "Nafta",
    image: {
      src: "https://images.unsplash.com/photo-1609703048009-d3576872b32c",
      alt: "Mercedes-Benz E-Class gris en una estructura de estacionamiento de hormigón",
    },
  },
  {
    id: "tesla-cybertruck",
    make: "Tesla",
    model: "Cybertruck",
    trim: "AWD",
    year: 2024,
    bodyStyle: "Camioneta",
    priceUsd: 96000,
    mileageKm: 4100,
    transmission: "Automática",
    fuelType: "Eléctrico",
    image: {
      src: "https://images.unsplash.com/photo-1785910723932-d8514bf53b61",
      alt: "Tesla Cybertruck exhibida dentro de un showroom",
    },
  },
];
