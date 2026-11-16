import { Product } from './product';

export const CAT_RACOES = 'Rações e alimentos';

/** Tipos de produto (igual ao filtro "Tipo de produto" do Figma). */
export const CATEGORIAS = [
  CAT_RACOES,
  'Petiscos e biscoitos',
  'Sachês',
  'Higiene e saúde',
  'Brinquedos',
  'Comedouros e bebedouros',
  'Caminhas e transporte',
  'Coleiras, guias e cones',
];

/** Tipos que aparecem em "Acessórios" no menu. */
export const ACESSORIOS = [
  'Brinquedos',
  'Comedouros e bebedouros',
  'Caminhas e transporte',
  'Coleiras, guias e cones',
  'Higiene e saúde',
];

/** Marcas do filtro do Figma (aparecem mesmo sem produto, com contagem 0). */
export const MARCAS = [
  'Alcon', 'Canex', 'Dog Chow', 'Friskies', 'Golden', 'Lucky Dog', 'Magnus', 'Matacura',
  'Natuverm', 'Nutrópica', 'Nutrópica', 'Pedigree', 'Pet Clean', 'PremieR', 'Scooby-Doo', 'Whiskas',
].filter((m, i, a) => a.indexOf(m) === i);

export const FAIXAS_PRECO = [
  { key: 'ate50', label: 'Até R$ 50', test: (p: number) => p <= 50 },
  { key: '50a100', label: 'R$ 50 a R$ 100', test: (p: number) => p > 50 && p <= 100 },
  { key: 'acima100', label: 'Acima de R$ 100', test: (p: number) => p > 100 },
];

/** Linha pequena acima do nome: "Cães · Coleiras, guias e cones" (ração mostra a fase). */
export function rotulo(p: Product): string {
  return `${p.pet} · ${p.category === CAT_RACOES ? p.fase : p.category}`;
}
