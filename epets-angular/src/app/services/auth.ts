import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Usuario } from '../models/user';
import { Storage } from './storage';

/*
 * DEMONSTRAÇÃO: as contas ficam só neste navegador (localStorage).
 * Quando a API existir, troque o miolo de login() e cadastrar() por chamadas HTTP.
 * O resto do site (telas, header, guard) continua igual, porque só usa user(), logado() e isAdmin().
 */

interface Conta {
  id: string;
  name: string;
  email: string;
  hash: string;
}

export interface DadosCadastro {
  name: string;
  email: string;
  password: string;
}

export type Resultado = { ok: true; user: Usuario } | { ok: false; erro: string };

const CONTAS = 'epets.contas.v1';
const SESSAO = 'epets.sessao.v1';

// acesso de demonstração mostrado na tela de login
const ADMIN: Usuario = {
  id: 'admin',
  name: 'Equipe E’PETS',
  email: 'admin@epets.com.br',
  role: 'admin',
};
const ADMIN_SENHA = '1234';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly store = inject(Storage);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _user = signal<Usuario | null>(this.lerSessao());

  readonly user = this._user.asReadonly();
  readonly logado = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'admin');
  readonly iniciais = computed(() => {
    const nome = this._user()?.name.trim() ?? '';
    const partes = nome.split(/\s+/).filter(Boolean);
    if (!partes.length) return '';
    return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase();
  });

  /** Entra com e-mail + senha. */
  async login(email: string, senha: string, lembrar: boolean): Promise<Resultado> {
    const id = email.trim().toLowerCase();

    if (id === ADMIN.email && senha === ADMIN_SENHA) {
      this.abrirSessao(ADMIN, lembrar);
      return { ok: true, user: ADMIN };
    }

    const conta = this.contas().find((c) => c.email === id);
    if (!conta || conta.hash !== (await this.hash(conta.id, senha))) {
      return { ok: false, erro: 'E-mail ou senha incorretos.' };
    }

    const user = this.paraUsuario(conta);
    this.abrirSessao(user, lembrar);
    return { ok: true, user };
  }

  /** Cria uma conta de cliente e já entra nela. */
  async cadastrar(dados: DadosCadastro): Promise<Resultado> {
    const email = dados.email.trim().toLowerCase();
    const contas = this.contas();

    if (email === ADMIN.email || contas.some((c) => c.email === email)) {
      return { ok: false, erro: 'Já existe uma conta com esse e-mail.' };
    }

    const id = globalThis.crypto?.randomUUID?.() ?? String(Date.now());
    const conta: Conta = {
      id,
      name: dados.name.trim(),
      email,
      hash: await this.hash(id, dados.password),
    };
    this.store.write(CONTAS, [...contas, conta]);

    const user = this.paraUsuario(conta);
    this.abrirSessao(user, true);
    return { ok: true, user };
  }

  /**
   * Troca a senha da conta que está logada.
   * Passo a passo: 1) confere se tem cliente logada, 2) acha a conta dela,
   * 3) compara a senha atual digitada com a guardada, 4) grava o hash da senha nova.
   * Devolve { ok: true } se deu certo ou { ok: false, erro } com a mensagem do problema.
   */
  async alterarSenha(atual: string, nova: string): Promise<{ ok: true } | { ok: false; erro: string }> {
    const user = this._user();
    // admin (senha fixa de demonstração) e visitante não podem trocar senha
    if (!user || user.role !== 'cliente') return { ok: false, erro: 'Entre na sua conta para alterar a senha.' };

    // procura a conta da pessoa logada na lista de contas salvas no navegador
    const contas = this.contas();
    const conta = contas.find((c) => c.id === user.id);
    if (!conta) return { ok: false, erro: 'Conta não encontrada.' };

    // a senha nunca é guardada pura: guardamos o "hash" (senha embaralhada).
    // Para conferir, embaralhamos a senha digitada e comparamos com a guardada.
    if (conta.hash !== (await this.hash(conta.id, atual))) {
      return { ok: false, erro: 'A senha atual está incorreta.' };
    }

    // gera o hash da senha nova e troca só na conta dela, mantendo as outras contas iguais
    const novoHash = await this.hash(conta.id, nova);
    this.store.write(
      CONTAS,
      contas.map((c) => (c.id === conta.id ? { ...c, hash: novoHash } : c)),
    );
    return { ok: true };
  }

  sair(): void {
    this._user.set(null);
    if (!this.browser) return;
    try {
      localStorage.removeItem(SESSAO);
      sessionStorage.removeItem(SESSAO);
    } catch {
      /* ignora */
    }
  }

  // ---------- internos

  private contas(): Conta[] {
    return this.store.read<Conta[]>(CONTAS, []);
  }

  private paraUsuario(c: Conta): Usuario {
    return { id: c.id, name: c.name, email: c.email, role: 'cliente' };
  }

  /** "Manter conectado" guarda no localStorage; sem ele, a sessão acaba ao fechar a aba. */
  private abrirSessao(user: Usuario, lembrar: boolean): void {
    this._user.set(user);
    if (!this.browser) return;
    try {
      const guarda = lembrar ? localStorage : sessionStorage;
      const outro = lembrar ? sessionStorage : localStorage;
      outro.removeItem(SESSAO);
      guarda.setItem(SESSAO, JSON.stringify(user));
    } catch {
      /* ignora */
    }
  }

  private lerSessao(): Usuario | null {
    if (!this.browser) return null;
    try {
      const raw = localStorage.getItem(SESSAO) ?? sessionStorage.getItem(SESSAO);
      return raw ? (JSON.parse(raw) as Usuario) : null;
    } catch {
      return null;
    }
  }

  private async hash(salt: string, senha: string): Promise<string> {
    const texto = `${salt}:${senha}`;
    const subtle = globalThis.crypto?.subtle;
    // sem HTTPS o navegador não libera o crypto.subtle: usa um disfarce simples (só demonstração)
    if (!subtle) return btoa(unescape(encodeURIComponent(texto)));
    const buf = await subtle.digest('SHA-256', new TextEncoder().encode(texto));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
}