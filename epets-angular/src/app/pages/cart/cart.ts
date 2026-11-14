import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductImg } from '../../components/product-img';
import { rotulo } from '../../models/categorias';
import { CartService, FRETE_FIXO, PRAZO_ENTREGA } from '../../services/cart';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, CurrencyPipe, ProductImg],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class CartPage {
  protected readonly cart = inject(CartService);
  protected readonly freteFixo = FRETE_FIXO;
  protected readonly prazo = PRAZO_ENTREGA;
  protected readonly rotulo = rotulo;

  protected readonly msgCupom = signal<{ ok: boolean; texto: string } | null>(null);
  protected readonly cepErro = signal(false);

  protected aplicarCupom(codigo: string): void {
    const r = this.cart.aplicarCupom(codigo);
    this.msgCupom.set(r.ok ? { ok: true, texto: `Cupom ${r.codigo} aplicado: 10% de desconto nos produtos.` } : { ok: false, texto: r.erro });
  }

  protected removerCupom(): void {
    this.cart.removerCupom();
    this.msgCupom.set(null);
  }

  protected calcular(cep: string): void {
    this.cepErro.set(!this.cart.calcularEntrega(cep));
  }

  protected esvaziar(): void {
    if (confirm('Remover todos os itens da sacola?')) this.cart.clear();
  }
}
