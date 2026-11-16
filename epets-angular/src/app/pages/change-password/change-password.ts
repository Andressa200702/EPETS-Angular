import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

/** Validador do formulário inteiro: a senha nova não pode ser igual à atual. */
function novaDiferente(g: AbstractControl): ValidationErrors | null {
  const atual = g.get('atual')?.value;
  const nova = g.get('nova')?.value;
  return atual && nova && atual === nova ? { igual: true } : null;
}

/** Validador do formulário inteiro: "confirmar" precisa ser igual à senha nova. */
function senhasIguais(g: AbstractControl): ValidationErrors | null {
  return g.get('nova')?.value === g.get('confirmar')?.value ? null : { diferentes: true };
}

/** Tela "Alterar senha": só quem está logada (cliente) acessa, a rota tem o clienteGuard. */
@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePassword {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService); // é quem sabe trocar a senha de verdade

  // os 3 campos do formulário e as regras de cada um
  protected readonly form = this.fb.nonNullable.group(
    {
      atual: ['', [Validators.required]], // senha que ela usa hoje
      nova: ['', [Validators.required, Validators.minLength(4)]], // mínimo de 4, igual ao cadastro
      confirmar: ['', [Validators.required]], // repetir a senha nova
    },
    // regras que olham mais de um campo ao mesmo tempo
    { validators: [novaDiferente, senhasIguais] },
  );

  // "signal" guarda um valor que, quando muda, atualiza a tela sozinha
  protected readonly verSenha = signal(false); // checkbox "Mostrar senhas"
  protected readonly enviando = signal(false); // true enquanto salva (desliga o botão)
  protected readonly erro = signal(''); // mensagem vermelha, ex.: "A senha atual está incorreta."
  protected readonly sucesso = signal(false); // mostra a mensagem verde
  protected readonly tentou = signal(false); // true depois do 1º clique em "Salvar"

  /** Diz se o campo deve aparecer com erro: só depois de mexer nele ou de tentar salvar. */
  protected invalido(nome: 'atual' | 'nova' | 'confirmar'): boolean {
    const c = this.form.controls[nome];
    return c.invalid && (c.touched || this.tentou());
  }

  /** Roda quando clica em "Salvar nova senha". */
  protected async salvar(): Promise<void> {
    this.tentou.set(true);
    this.erro.set('');
    this.sucesso.set(false);

    // se o formulário tem erro, mostra os avisos e para por aqui
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    const v = this.form.getRawValue();
    // pede ao AuthService para conferir a senha atual e gravar a nova
    const r = await this.auth.alterarSenha(v.atual, v.nova);
    this.enviando.set(false);

    // senha atual errada (ou outro problema): mostra o erro e para
    if (!r.ok) {
      this.erro.set(r.erro);
      return;
    }

    // deu certo: mostra a mensagem verde e limpa os campos
    this.sucesso.set(true);
    this.tentou.set(false);
    this.form.reset();
  }
}
