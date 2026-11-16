import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

/** Só deixa entrar no painel quem é administrador. */
export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.isAdmin()) return true;
  return inject(Router).createUrlTree(['/entrar'], { queryParams: { redirect: state.url } });
};

/** Quem já está logado não precisa ver a tela de entrar / criar conta. */
export const visitanteGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (!auth.logado()) return true;
  return inject(Router).createUrlTree([auth.isAdmin() ? '/admin' : '/']);
};

/** Área da cliente (ex.: Meus pedidos): precisa estar logada. Admin vai para o painel. */
export const clienteGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.isAdmin()) return inject(Router).createUrlTree(['/admin']);
  if (auth.logado()) return true;
  return inject(Router).createUrlTree(['/entrar'], { queryParams: { redirect: state.url } });
};