import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { OrderService } from '../../services/orders';

@Component({
  selector: 'app-my-orders',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css',
})
export class MyOrders {
  private readonly auth = inject(AuthService);
  private readonly orders = inject(OrderService);

  protected readonly lista = computed(() => {
    const u = this.auth.user();
    return u ? this.orders.doUsuario(u.id, u.email) : [];
  });

  protected pagamento(p: string, parcelas?: number, final?: string): string {
    if (p === 'pix') return 'Pix';
    if (p === 'cartao') return `Cartão de crédito${final ? ' final ' + final : ''}${parcelas && parcelas > 1 ? ' em ' + parcelas + 'x' : ''}`;
    return 'Dinheiro na entrega/retirada';
  }
}
