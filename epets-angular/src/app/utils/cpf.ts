import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validador de CPF para usar nos formulários (Validators.required, cpfValido).
 * Não basta ter 11 números: o CPF tem 2 dígitos verificadores no final,
 * calculados a partir dos 9 primeiros. Aqui a gente refaz a conta e compara.
 * Retorna null quando está certo e { cpf: true } quando está errado
 * (é esse "erro" que faz o campo ficar vermelho).
 */
export function cpfValido(c: AbstractControl): ValidationErrors | null {
  // tira pontos e traço: "529.982.247-25" vira "52998224725"
  const n = String(c.value ?? '').replace(/\D/g, '');

  // precisa ter 11 números e não pode ser repetido (111.111.111-11 passa na conta, mas é inválido)
  if (n.length !== 11 || /^(\d)\1{10}$/.test(n)) return { cpf: true };

  // calcula um dígito verificador: len = 9 gera o 1º dígito, len = 10 gera o 2º
  const dv = (len: number) => {
    let soma = 0;
    // multiplica cada número por um peso que vai diminuindo (10, 9, 8... ou 11, 10, 9...)
    for (let i = 0; i < len; i++) soma += Number(n[i]) * (len + 1 - i);
    const r = (soma * 10) % 11;
    // resto 10 conta como 0
    return r === 10 ? 0 : r;
  };

  // compara os dígitos calculados com os 2 últimos que a pessoa digitou
  return dv(9) === Number(n[9]) && dv(10) === Number(n[10]) ? null : { cpf: true };
}

/**
 * Máscara de CPF: vai colocando os pontos e o traço enquanto a pessoa digita.
 * Ex.: "52998224725" -> "529.982.247-25"
 */
export function formatarCpf(valor: string): string {
  return valor
    .replace(/\D/g, '') // deixa só números
    .slice(0, 11) // no máximo 11 números
    .replace(/^(\d{3})(\d)/, '$1.$2') // depois do 3º número, põe o 1º ponto
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3') // depois do 6º, põe o 2º ponto
    .replace(/\.(\d{3})(\d)/, '.$1-$2'); // depois do 9º, põe o traço
}
