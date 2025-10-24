import type { TopCompany } from '@/types/api';

const freeze = <T>(value: T): T => Object.freeze(value);

export const fallbackTopGainers: TopCompany[] = freeze([
  freeze({
    symbol: 'BOABF',
    name: 'Bank of Africa Burkina Faso',
    current_price: 3890,
    change: 150,
    change_percent: 4.01,
    volume: 1520,
  }),
  freeze({
    symbol: 'ECOC',
    name: 'Ecobank Côte d’Ivoire',
    current_price: 6400,
    change: 220,
    change_percent: 3.56,
    volume: 980,
  }),
  freeze({
    symbol: 'ONTBF',
    name: 'Onatel Burkina Faso',
    current_price: 3400,
    change: 95,
    change_percent: 2.87,
    volume: 455,
  }),
  freeze({
    symbol: 'PALC',
    name: 'Palm Côte d’Ivoire',
    current_price: 1220,
    change: 30,
    change_percent: 2.52,
    volume: 1210,
  }),
  freeze({
    symbol: 'SICC',
    name: 'SICOR Côte d’Ivoire',
    current_price: 4450,
    change: 105,
    change_percent: 2.42,
    volume: 300,
  }),
]);

export const fallbackTopLosers: TopCompany[] = freeze([
  freeze({
    symbol: 'FTSC',
    name: 'FILTISAC',
    current_price: 1010,
    change: -70,
    change_percent: -6.48,
    volume: 520,
  }),
  freeze({
    symbol: 'BICC',
    name: 'BICI Côte d’Ivoire',
    current_price: 7200,
    change: -310,
    change_percent: -4.13,
    volume: 640,
  }),
  freeze({
    symbol: 'SVOC',
    name: 'Société Ivoirienne de Câbles',
    current_price: 910,
    change: -35,
    change_percent: -3.70,
    volume: 890,
  }),
  freeze({
    symbol: 'TTS',
    name: 'Total Sénégal',
    current_price: 2550,
    change: -80,
    change_percent: -3.04,
    volume: 410,
  }),
  freeze({
    symbol: 'UNXC',
    name: 'Unilever Côte d’Ivoire',
    current_price: 5750,
    change: -160,
    change_percent: -2.70,
    volume: 275,
  }),
]);
