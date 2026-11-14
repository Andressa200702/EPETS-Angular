import { CurrencyPipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { startWith } from 'rxjs';
import { AuthService } from '../../services/auth';
import { CartService } from '../../services/cart';
import { OrderService } from '../../services/orders';

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly router = inject(Router);
  private readonly orders = inject(OrderService);
  private readonly auth = inject(AuthService);
  protected readonly cart = inject(CartService);

  protected readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    telefone: ['', [Validators.required, Validators.pattern(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/)]],
    entrega: ['entrega' as 'entrega' | 'retirada'],
    cep: ['', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
    rua: ['', Validators.required],
    numero: ['', Validators.required],
    bairro: ['', Validators.required],
    cidade: ['São Paulo', Validators.required],
    pagamento: ['pix' as 'pix' | 'cartao' | 'dinheiro'],
    cartaoNumero: ['', [Validators.required, cartaoValido]],
    cartaoNome: ['', [Validators.required, Validators.minLength(3)]],
    cartaoValidade: ['', [Validators.required, validadeValida]],
    cartaoCvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    parcelas: [1],
  });

  protected readonly submitted = signal(false);
  protected readonly erro = signal('');

  private readonly entrega = toSignal(this.form.controls.entrega.valueChanges.pipe(startWith(this.form.controls.entrega.value)), {
    requireSync: true,
  });
  protected readonly retirada = computed(() => this.entrega() === 'retirada');
  protected readonly frete = computed(() => (this.retirada() ? 0 : this.cart.freteEntrega()));
  protected readonly total = computed(() => this.cart.subtotal() - this.cart.desconto() + this.frete());

  private readonly pagamentoSel = toSignal(
    this.form.controls.pagamento.valueChanges.pipe(startWith(this.form.controls.pagamento.value)),
    { requireSync: true },
  );
  protected readonly cartao = computed(() => this.pagamentoSel() === 'cartao');
  protected readonly pix = computed(() => this.pagamentoSel() === 'pix');
  protected readonly pixCodigo = computed(() => gerarPix(this.total()));
  protected readonly copiado = signal(false);
  protected readonly opcoesParcela = computed(() => [1, 2, 3].map((n) => ({ n, valor: this.total() / n })));

  protected async copiarPix(): Promise<void> {
    try { await navigator.clipboard.writeText(this.pixCodigo()); } catch { /* ignora */ }
    this.copiado.set(true);
    setTimeout(() => this.copiado.set(false), 2000);
  }

  /** máscara dos campos do cartão */
  protected mascarar(campo: 'cartaoNumero' | 'cartaoValidade' | 'cartaoCvv', ev: Event): void {
    const el = ev.target as HTMLInputElement;
    let d = el.value.replace(/\D/g, '');
    let v: string;
    if (campo === 'cartaoNumero') { d = d.slice(0, 16); v = d.replace(/(\d{4})(?=\d)/g, '$1 '); }
    else if (campo === 'cartaoValidade') { d = d.slice(0, 4); v = d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; }
    else v = d.slice(0, 4);
    el.value = v;
    this.form.controls[campo].setValue(v);
  }

  constructor() {
    // os campos do cartão só são exigidos quando "Cartão de crédito" está escolhido
    effect(() => {
      const c = this.form.controls;
      for (const k of [c.cartaoNumero, c.cartaoNome, c.cartaoValidade, c.cartaoCvv, c.parcelas]) {
        if (this.cartao()) k.enable({ emitEvent: false });
        else k.disable({ emitEvent: false });
      }
    });
    // se já estiver logado, preenche nome e e-mail
    const u = this.auth.user();
    if (u) this.form.patchValue({ nome: u.name, email: u.email });
    // sem entrega = sem endereço obrigatório
    effect(() => {
      const c = this.form.controls;
      for (const k of [c.cep, c.rua, c.numero, c.bairro, c.cidade]) {
        if (this.retirada()) k.disable({ emitEvent: false });
        else k.enable({ emitEvent: false });
      }
    });
  }

  protected invalid(name: string): boolean {
    const c = this.form.get(name)!;
    return c.invalid && (c.touched || this.submitted());
  }

  protected submit(): void {
    this.submitted.set(true);
    this.erro.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const items = this.cart.items();
    if (!items.length) return;

    const semEstoque = items.find((i) => i.qty > i.product.stock);
    if (semEstoque) {
      this.erro.set(`"${semEstoque.product.name}" não tem mais ${semEstoque.qty} un. em estoque. Ajuste a quantidade na sacola.`);
      return;
    }

    const v = this.form.getRawValue();
    const order = this.orders.create({
      customer: { nome: v.nome.trim(), email: v.email.trim(), telefone: v.telefone },
      entrega: v.entrega,
      endereco: v.entrega === 'entrega' ? { cep: v.cep, rua: v.rua, numero: v.numero, bairro: v.bairro, cidade: v.cidade } : undefined,
      pagamento: v.pagamento,
      parcelas: v.pagamento === 'cartao' ? Number(v.parcelas) : undefined,
      cartaoFinal: v.pagamento === 'cartao' ? v.cartaoNumero.replace(/\D/g, '').slice(-4) : undefined,
      userId: this.auth.user()?.id,
      items: items.map((i) => ({ productId: i.product.id, name: i.product.name, detail: i.product.detail, price: i.product.price, qty: i.qty })),
      subtotal: this.cart.subtotal(),
      frete: this.frete(),
      desconto: this.cart.desconto(),
      cupom: this.cart.cupom() || undefined,
      total: this.total(),
    });
    this.cart.clear();
    this.router.navigate(['/confirmacao', order.id]);
  }
}

/** confere o número do cartão (algoritmo de Luhn). Para testar: 4111 1111 1111 1111 */
function cartaoValido(c: AbstractControl): ValidationErrors | null {
  const d = String(c.value ?? '').replace(/\D/g, '');
  if (d.length < 13 || d.length > 19) return { cartao: true };
  let soma = 0;
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i]);
    if (i % 2 === 1) { n *= 2; if (n > 9) n -= 9; }
    soma += n;
  }
  return soma % 10 === 0 ? null : { cartao: true };
}

/** validade no formato MM/AA e ainda não vencida */
function validadeValida(c: AbstractControl): ValidationErrors | null {
  const m = /^(\d{2})\/(\d{2})$/.exec(String(c.value ?? ''));
  if (!m) return { validade: true };
  const mes = Number(m[1]);
  const ano = 2000 + Number(m[2]);
  if (mes < 1 || mes > 12) return { validade: true };
  return new Date(ano, mes, 1) > new Date() ? null : { validade: true };
}

function tlv(id: string, valor: string): string {
  return id + String(valor.length).padStart(2, '0') + valor;
}

function crc16(texto: string): string {
  let crc = 0xffff;
  for (let i = 0; i < texto.length; i++) {
    crc ^= texto.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = (crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/** Pix "copia e cola" no formato do BR Code, mas com chave FICTÍCIA: nenhum banco aceita pagar. */
function gerarPix(valor: number): string {
  const base =
    tlv('00', '01') +
    tlv('26', tlv('00', 'br.gov.bcb.pix') + tlv('01', 'chave-demonstracao')) +
    tlv('52', '0000') +
    tlv('53', '986') +
    tlv('54', valor.toFixed(2)) +
    tlv('58', 'BR') +
    tlv('59', 'EPETS DEMO') +
    tlv('60', 'SAO PAULO') +
    tlv('62', tlv('05', 'DEMO')) +
    '6304';
  return base + crc16(base);
}
