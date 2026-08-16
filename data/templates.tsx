import { Template } from '../types';
import { ICON_REGISTRY } from '../lib/iconRegistry';

export const templates: Template[] = [
  {
    id: 'cookie-classic',
    name: 'Galleta Clásica',
    description: 'La tarjeta de fidelidad original, cálida y acogedora, para los amantes de las galletas.',
    rewardName: 'Galleta Jumbo Gratis',
    backgroundOpacity: 100,
    social: {
      instagram: '@cookieclassic',
      youtube: '@cookieclassic',
      website: 'https://example.com'
    },
    icon: ICON_REGISTRY.cookie,
    totalStamps: 5,
    colors: {
      background: '#F9F7F2',
      cardBackground: '#ffffff',
      text: '#1F2937',
      muted: '#6B7280',
      stampActive: '#D4BFA6',
      stampInactive: '#EBD6C7',
      iconActive: '#5D4037',
      iconInactive: '#8D7B68', // Darker for visibility
      button: '#111111',
      buttonText: '#ffffff',
      border: '#E5E7EB'
    }
  },
  {
    id: 'midnight-brew',
    name: 'Café de Medianoche',
    description: 'Vibras oscuras y sofisticadas de una cafetería especializada.',
    rewardName: 'Bebida Artesanal Gratis',
    backgroundOpacity: 100,
    social: {
      instagram: '@midnightbrew',
      youtube: '@midnightbrew',
      website: 'https://example.com'
    },
    icon: ICON_REGISTRY.coffee,
    totalStamps: 6,
    colors: {
      background: '#1a1614',
      cardBackground: '#2c2420',
      text: '#e6dcd3',
      muted: '#9c8e85',
      stampActive: '#cfb096',
      stampInactive: '#3E342F', // Slightly lighter than card bg
      iconActive: '#2c2420',
      iconInactive: '#8A786E', // Significantly lighter than stamp inactive
      button: '#cfb096',
      buttonText: '#2c2420',
      border: '#4a3e36'
    }
  },
  {
    id: 'pizza-party',
    name: 'Fiesta de Pizza',
    description: 'Estilo divertido y vibrante para la mejor rebanada de la ciudad.',
    rewardName: 'Rebanada + Refresco Gratis',
    backgroundOpacity: 100,
    social: {
      instagram: '@pizzaparty',
      youtube: '@pizzaparty',
      website: 'https://example.com'
    },
    icon: ICON_REGISTRY.pizza,
    totalStamps: 8,
    colors: {
      background: '#FFF5F5',
      cardBackground: '#ffffff',
      text: '#C53030',
      muted: '#E53E3E',
      stampActive: '#F6E05E',
      stampInactive: '#FFEEEE', // Very light pink
      iconActive: '#C53030',
      iconInactive: '#F56565', // Darkened from #FC8181
      button: '#C53030',
      buttonText: '#ffffff',
      border: '#FEB2B2'
    }
  },
  {
    id: 'sweet-scoops',
    name: 'Cucharadas Dulces',
    description: 'Perfección pastel para los amantes del helado.',
    rewardName: 'Sundae Gratis',
    backgroundOpacity: 100,
    social: {
      instagram: '@sweetscoops',
      youtube: '@sweetscoops',
      website: 'https://example.com'
    },
    icon: ICON_REGISTRY.iceCream,
    titleSize: 'text-3xl md:text-4xl',
    totalStamps: 5,
    colors: {
      background: '#F0F9FF',
      cardBackground: '#ffffff',
      text: '#0C4A6E',
      muted: '#38BDF8',
      stampActive: '#F472B6',
      stampInactive: '#E0F2FE', // Light blue
      iconActive: '#ffffff',
      iconInactive: '#0284C7', // Darkened from #38BDF8
      button: '#F472B6',
      buttonText: '#ffffff',
      border: '#BAE6FD'
    }
  },
  {
    id: 'massage-bliss',
    name: 'Masaje de Ensueño',
    description: 'Relájate, desconecta y rejuvenece tus sentidos.',
    rewardName: 'Masaje de 60 min Gratis',
    backgroundOpacity: 100,
    social: {
      instagram: '@massagebliss',
      youtube: '@massagebliss',
      website: 'https://example.com'
    },
    icon: ICON_REGISTRY.sparkles,
    totalStamps: 10,
    colors: {
      background: '#F3E8FF', // purple-100
      cardBackground: '#ffffff',
      text: '#581C87', // purple-900
      muted: '#A855F7', // purple-500
      stampActive: '#D8B4FE', // purple-300
      stampInactive: '#FAF5FF', // purple-50
      iconActive: '#581C87',
      iconInactive: '#9333EA', // Darkened from #C084FC (purple-600)
      button: '#7E22CE', // purple-700
      buttonText: '#ffffff',
      border: '#E9D5FF'
    }
  },
  {
    id: 'laundry-fresh',
    name: 'Lavandería Fresca',
    description: 'Cuidado profesional de telas fresco, limpio e impecable.',
    rewardName: 'Prenda en Tintorería Gratis',
    backgroundOpacity: 100,
    social: {
      instagram: '@laundryfresh',
      youtube: '@laundryfresh',
      website: 'https://example.com'
    },
    icon: ICON_REGISTRY.shirt,
    totalStamps: 8,
    colors: {
      background: '#F0F9FF', // sky-50
      cardBackground: '#ffffff',
      text: '#0369A1', // sky-700
      muted: '#38BDF8', // sky-400
      stampActive: '#7DD3FC', // sky-300
      stampInactive: '#E0F2FE', // sky-100
      iconActive: '#0369A1',
      iconInactive: '#0284C7', // Darkened from #7DD3FC (sky-600)
      button: '#0EA5E9', // sky-500
      buttonText: '#ffffff',
      border: '#BAE6FD'
    }
  },
  {
    id: 'sharp-cuts',
    name: 'Cortes Precisos',
    description: 'Estilo moderno para un look contemporáneo.',
    rewardName: 'Corte o Retoque Gratis',
    backgroundOpacity: 100,
    social: {
      instagram: '@sharpcuts',
      youtube: '@sharpcuts',
      website: 'https://example.com'
    },
    icon: ICON_REGISTRY.scissors,
    totalStamps: 6,
    colors: {
      background: '#F8FAFC', // slate-50
      cardBackground: '#ffffff',
      text: '#0F172A', // slate-900
      muted: '#64748B', // slate-500
      stampActive: '#94A3B8', // slate-400
      stampInactive: '#F1F5F9', // slate-100
      iconActive: '#0F172A',
      iconInactive: '#475569', // Darkened from #CBD5E1 (slate-600)
      button: '#0F172A',
      buttonText: '#ffffff',
      border: '#E2E8F0'
    }
  },
  {
    id: 'boba-time',
    name: 'Hora del Boba',
    description: 'Perlas masticables y la delicia de un té cremoso.',
    rewardName: 'Té con Leche y Topping Gratis',
    backgroundOpacity: 100,
    social: {
      instagram: '@bobatime',
      youtube: '@bobatime',
      website: 'https://example.com'
    },
    icon: ICON_REGISTRY.cupSoda,
    totalStamps: 8,
    colors: {
      background: '#FFFBEB', // amber-50
      cardBackground: '#ffffff',
      text: '#78350F', // amber-900
      muted: '#B45309', // amber-700
      stampActive: '#FCD34D', // amber-300
      stampInactive: '#FEF3C7', // amber-100
      iconActive: '#78350F',
      iconInactive: '#D97706', // Darkened from #FDE68A (amber-600)
      button: '#D97706', // amber-600
      buttonText: '#ffffff',
      border: '#FDE68A'
    }
  },
  {
    id: 'burger-joint',
    name: 'Hamburguesería',
    description: 'Hamburguesas jugosas, a la parrilla y perfectas.',
    rewardName: 'Hamburguesa Clásica Gratis',
    backgroundOpacity: 100,
    social: {
      instagram: '@burgerjoint',
      youtube: '@burgerjoint',
      website: 'https://example.com'
    },
    icon: ICON_REGISTRY.burger,
    totalStamps: 5,
    colors: {
      background: '#FEF2F2', // red-50
      cardBackground: '#ffffff',
      text: '#991B1B', // red-800
      muted: '#EF4444', // red-500
      stampActive: '#FCA5A5', // red-300
      stampInactive: '#FEE2E2', // red-100
      iconActive: '#991B1B',
      iconInactive: '#DC2626', // Darkened from #FECACA (red-600)
      button: '#DC2626', // red-600
      buttonText: '#ffffff',
      border: '#FECACA'
    }
  }
];
