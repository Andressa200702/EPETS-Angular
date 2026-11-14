import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { CartLine, Product } from '../models/product';
import { ProductService } from './products';
import { Storage } from './storage';

const KEY = 'epets.cart.v1';
const KEY_CUPOM = 'epets.cart.cupom.v1';
const KEY_CEP = 'epets.cart.cep.v1';

/** Frete de entrega local (igual ao Figma: R$ 12,90, até 2 dias úteis). */
export const FRETE_FIXO = 12.9;
export const PRAZO_ENTREGA = 'até 2 dias úteis';

/** Cupons de demonstração (percentual sobre os produtos). */
export const CUPONS: Record<string, number> = { BEMVINDO10: 0.1 };

export type ResultadoCupom = { ok: true; codigo: string } | { ok: false; erro: string };

export interface CartItem {
  product: Product;
  qty: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly storage = inject(Storage);
  private readonly products = inject(ProductService);
  private readonly lines = signal<CartLine[]>(this.storage.read<CartLine[]>(KEY, []));

  /** linhas já com os dados do produto (descarta produtos que foram removidos do catálogo) */
  readonly items = computed<CartItem[]>(() =>
    this.lines().flatMap((l) => {
      const product = this.products.byId(l.productId);
      return product ? [{ product, qty: l.qty, total: product.price * l.qty }] : [];
    }),
  );
  readonly count = computed(() => this.items().reduce((s, i) => s + i.qty, 0));
  readonly subtotal = computed(() => this.items().reduce((s, i) => s + i.total, 0));
  readonly freteEntrega = computed(() => (this.subtotal() === 0 ? 0 : FRETE_FIXO));

  /** cupom aplicado (ex.: BEMVINDO10) */
  readonly cupom = signal<string>(this.storage.read<string>(KEY_CUPOM, ''));
  readonly desconto = computed(() => Math.round(this.subtotal() * (CUPONS[this.cupom()] ?? 0) * 100) / 100);
  readonly total = computed(() => this.subtotal() - this.desconto() + this.freteEntrega());

  /** CEP usado para calcular a entrega (demonstração: sempre entrega local) */
  readonly cep = signal<string>(this.storage.read<string>(KEY_CEP, ''));

  constructor() {
    effect(() => this.storage.write(KEY, this.lines()));
    effect(() => this.storage.write(KEY_CUPOM, this.cupom()));
    effect(() => this.storage.write(KEY_CEP, this.cep()));
  }

  aplicarCupom(texto: string): ResultadoCupom {
    const codigo = texto.trim().toUpperCase();
    if (!codigo) return { ok: false, erro: 'Digite o código do cupom.' };
    if (!(codigo in CUPONS)) return { ok: false, erro: 'Cupom inválido ou expirado.' };
    this.cupom.set(codigo);
    return { ok: true, codigo };
  }

  removerCupom(): void {
    this.cupom.set('');
  }

  /** valida o CEP (8 dígitos) e guarda formatado como 00000-000 */
  calcularEntrega(texto: string): boolean {
    const d = texto.replace(/\D/g, '');
    if (d.length !== 8) return false;
    this.cep.set(`${d.slice(0, 5)}-${d.slice(5)}`);
    return true;
  }

  qtyOf(productId: string): number {
    return this.lines().find((l) => l.productId === productId)?.qty ?? 0;
  }

  add(product: Product, qty = 1): void {
    const max = product.stock;
    this.lines.update((ls) => {
      const found = ls.find((l) => l.productId === product.id);
      if (!found) return max > 0 ? [...ls, { productId: product.id, qty: Math.min(qty, max) }] : ls;
      return ls.map((l) => (l.productId === product.id ? { ...l, qty: Math.min(l.qty + qty, max) } : l));
    });
  }

  setQty(productId: string, qty: number): void {
    const max = this.products.byId(productId)?.stock ?? 0;
    if (qty <= 0) return this.remove(productId);
    this.lines.update((ls) => ls.map((l) => (l.productId === productId ? { ...l, qty: Math.min(qty, max) } : l)));
  }

  remove(productId: string): void {
    this.lines.update((ls) => ls.filter((l) => l.productId !== productId));
  }

  clear(): void {
    this.lines.set([]);
    this.cupom.set('');
  }
}
