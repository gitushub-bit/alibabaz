
import React from 'react';
import { Category, Product, Country } from './types';

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Categories for you', icon: 'Star' },
  { id: '2', name: 'Apparel & Accessories', icon: 'Shirt' },
  { id: '3', name: 'Consumer Electronics', icon: 'Smartphone' },
  { id: '4', name: 'Sports & Entertainment', icon: 'Trophy' },
  { id: '5', name: 'Beauty', icon: 'Sparkles' },
  { id: '6', name: 'Luggage, Bags & Cases', icon: 'Briefcase' },
  { id: '7', name: 'Home & Garden', icon: 'Home' },
  { id: '8', name: 'Vehicles & Accessories', icon: 'Car' },
  { id: '9', name: 'Tools & Hardware', icon: 'Wrench' },
  { id: '10', name: 'Jewelry & Watches', icon: 'Watch' },
];

export const COUNTRIES: Country[] = [
  { code: 'ke', name: 'Kenya', currency: 'KES' },
  { code: 'us', name: 'United States', currency: 'USD' },
  { code: 'cn', name: 'China', currency: 'CNY' },
  { code: 'gb', name: 'United Kingdom', currency: 'GBP' },
  { code: 'de', name: 'Germany', currency: 'EUR' },
  { code: 'fr', name: 'France', currency: 'EUR' },
  { code: 'it', name: 'Italy', currency: 'EUR' },
  { code: 'es', name: 'Spain', currency: 'EUR' },
  { code: 'nl', name: 'Netherlands', currency: 'EUR' },
  { code: 'in', name: 'India', currency: 'INR' },
  { code: 'jp', name: 'Japan', currency: 'JPY' },
  { code: 'kr', name: 'South Korea', currency: 'KRW' },
  { code: 'ca', name: 'Canada', currency: 'CAD' },
  { code: 'au', name: 'Australia', currency: 'AUD' },
  { code: 'br', name: 'Brazil', currency: 'BRL' },
  { code: 'mx', name: 'Mexico', currency: 'MXN' },
  { code: 'ae', name: 'United Arab Emirates', currency: 'AED' },
  { code: 'sa', name: 'Saudi Arabia', currency: 'SAR' },
  { code: 'eg', name: 'Egypt', currency: 'EGP' },
  { code: 'ng', name: 'Nigeria', currency: 'NGN' },
  { code: 'za', name: 'South Africa', currency: 'ZAR' },
  { code: 'sg', name: 'Singapore', currency: 'SGD' },
  { code: 'my', name: 'Malaysia', currency: 'MYR' },
  { code: 'th', name: 'Thailand', currency: 'THB' },
  { code: 'vn', name: 'Vietnam', currency: 'VND' },
  { code: 'ph', name: 'Philippines', currency: 'PHP' },
  { code: 'id', name: 'Indonesia', currency: 'IDR' },
  { code: 'tr', name: 'Turkey', currency: 'TRY' },
  { code: 'pl', name: 'Poland', currency: 'PLN' },
  { code: 'se', name: 'Sweden', currency: 'SEK' },
  { code: 'ch', name: 'Switzerland', currency: 'CHF' },
  { code: 'nz', name: 'New Zealand', currency: 'NZD' },
  { code: 'ar', name: 'Argentina', currency: 'ARS' },
  { code: 'cl', name: 'Chile', currency: 'CLP' },
  { code: 'co', name: 'Colombia', currency: 'COP' },
  { code: 'pe', name: 'Peru', currency: 'PEN' },
  { code: 'dz', name: 'Algeria', currency: 'DZD' },
  { code: 'ma', name: 'Morocco', currency: 'MAD' },
  { code: 'gh', name: 'Ghana', currency: 'GHS' },
  { code: 'et', name: 'Ethiopia', currency: 'ETB' },
  { code: 'tz', name: 'Tanzania', currency: 'TZS' },
  { code: 'ug', name: 'Uganda', currency: 'UGX' },
].sort((a, b) => a.name.localeCompare(b.name));

export const FREQUENTLY_SEARCHED: Product[] = [
  { 
    id: 'f1', 
    name: 'New Energy Vehicles', 
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=300',
    category: 'Electric Car'
  },
  { 
    id: 'f2', 
    name: 'Electric Van', 
    image: 'https://images.unsplash.com/photo-1605152276897-4f618f831968?auto=format&fit=crop&q=80&w=300',
    category: 'Logistics'
  },
  { 
    id: 'f3', 
    name: 'Electric Cars', 
    image: 'https://images.unsplash.com/photo-1620210217520-293796593506?auto=format&fit=crop&q=80&w=300',
    category: 'Sedans'
  }
];

export const TRENDS_IMAGE = 'https://images.unsplash.com/photo-1621510456681-23a016df4c6b?auto=format&fit=crop&q=80&w=400';
