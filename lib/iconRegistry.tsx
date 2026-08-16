import React from "react";
import {
  Cookie,
  Coffee,
  Pizza,
  IceCream,
  Sparkles,
  Shirt,
  Scissors,
  CupSoda,
  Heart,
  Star,
  Zap,
  ShoppingBag,
  Utensils,
  Music,
  Plane,
  WashingMachine,
  Droplets,
  Check,
  Cake,
  Beer,
  PawPrint,
  Camera,
} from "lucide-react";
import type { IconComponent } from "../types";

type IconOption = {
  key: string;
  icon: IconComponent;
  label: string;
};

// Custom Burger Icon since Lucide doesn't have a dedicated burger icon that looks round
const Burger: IconComponent = ({ size, color, strokeWidth, className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || "currentColor"}
      strokeWidth={strokeWidth || 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M6 11c0-4 2-7 6-7s6 3 6 7" />
      <rect x="4" y="11" width="16" height="3" rx="1" />
      <path d="M4 16c0 2 2 4 4 4h8c2 0 4-2 4-4v-1H4v1z" />
      <path d="M4 14h16" />
    </svg>
  );
};

export const ICON_REGISTRY: Record<string, IconComponent> = {
  cookie: Cookie,
  coffee: Coffee,
  pizza: Pizza,
  burger: Burger,
  iceCream: IceCream,
  cake: Cake,
  beer: Beer,
  sparkles: Sparkles,
  shirt: Shirt,
  washingMachine: WashingMachine,
  droplets: Droplets,
  scissors: Scissors,
  cupSoda: CupSoda,
  heart: Heart,
  star: Star,
  check: Check,
  zap: Zap,
  shoppingBag: ShoppingBag,
  utensils: Utensils,
  pawPrint: PawPrint,
  camera: Camera,
  music: Music,
  plane: Plane,
};

export const ICON_OPTIONS: IconOption[] = [
  { key: "cookie", icon: Cookie, label: "Galleta" },
  { key: "coffee", icon: Coffee, label: "Café" },
  { key: "pizza", icon: Pizza, label: "Pizza" },
  { key: "burger", icon: Burger, label: "Hamburguesa" },
  { key: "iceCream", icon: IceCream, label: "Helado" },
  { key: "cake", icon: Cake, label: "Pastel" },
  { key: "beer", icon: Beer, label: "Cerveza" },
  { key: "sparkles", icon: Sparkles, label: "Destellos" },
  { key: "shirt", icon: Shirt, label: "Camisa" },
  { key: "washingMachine", icon: WashingMachine, label: "Lavandería" },
  { key: "droplets", icon: Droplets, label: "Burbujas" },
  { key: "scissors", icon: Scissors, label: "Tijeras" },
  { key: "cupSoda", icon: CupSoda, label: "Boba" },
  { key: "heart", icon: Heart, label: "Corazón" },
  { key: "star", icon: Star, label: "Estrella" },
  { key: "check", icon: Check, label: "Palomita" },
  { key: "zap", icon: Zap, label: "Rayo" },
  { key: "shoppingBag", icon: ShoppingBag, label: "Tienda" },
  { key: "utensils", icon: Utensils, label: "Comida" },
  { key: "pawPrint", icon: PawPrint, label: "Huella" },
  { key: "camera", icon: Camera, label: "Cámara" },
  { key: "music", icon: Music, label: "Música" },
  { key: "plane", icon: Plane, label: "Viaje" },
];
