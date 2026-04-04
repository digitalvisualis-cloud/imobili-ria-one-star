export type TipoImovel = 'apartamento' | 'casa' | 'chacara' | 'sitio' | 'terreno' | 'comercial';
export type FinalidadeImovel = 'venda' | 'aluguel';

export interface Imovel {
  id: string;
  codigo_imovel: string;
  titulo: string;
  descricao: string | null;
  tipo: TipoImovel;
  finalidade: FinalidadeImovel;
  preco: number;
  quartos: number;
  banheiros: number;
  vagas: number;
  area_m2: number;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  imagens: string[];
  capa_url: string | null;
  mapa_url: string | null;
  destaque: boolean;
  publicado: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConfigSite {
  id: string;
  nome_imobiliaria: string;
  logo_url: string | null;
  favicon_url: string | null;
  endereco_texto: string | null;
  whatsapp: string | null;
  email: string | null;
  google_maps_url: string | null;
  politica_privacidade: string | null;
  termos_uso: string | null;
  politica_cookies: string | null;
  updated_at: string;
}

export interface PropertyFilters {
  tipo?: TipoImovel | '';
  finalidade?: FinalidadeImovel | '';
  cidade?: string;
  bairro?: string;
  preco_min?: number;
  preco_max?: number;
  quartos?: number;
  vagas?: number;
}

export const TIPO_LABELS: Record<TipoImovel, string> = {
  apartamento: 'Apartamento',
  casa: 'Casa',
  chacara: 'Chácara',
  sitio: 'Sítio',
  terreno: 'Terreno',
  comercial: 'Comercial',
};

export const FINALIDADE_LABELS: Record<FinalidadeImovel, string> = {
  venda: 'Venda',
  aluguel: 'Aluguel',
};

export function generatePropertyCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'IMV-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, '');
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}
