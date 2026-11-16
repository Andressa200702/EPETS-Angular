import { AbstractControl, ValidationErrors } from '@angular/forms';

/** Deixa só os números de um texto: "(11) 91234-5678" vira "11912345678". */
const soNumeros = (v: string) => v.replace(/\D/g, '');

/**
 * Máscara de CEP: 00000-000.
 * Corta em 8 números e coloca o traço depois do 5º.
 */
export function formatarCep(valor: string): string {
  const d = soNumeros(valor).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

/**
 * Máscara de telefone, escolhendo o formato conforme a quantidade de números:
 *  - celular (11 números): (11) 91234-5678
 *  - fixo (10 números):    (11) 1234-5678
 * Vai montando aos poucos enquanto a pessoa digita.
 */
export function formatarTelefone(valor: string): string {
  const d = soNumeros(valor).slice(0, 11); // no máximo 11 números
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`; // só o começo do DDD
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`; // DDD + início do número
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`; // fixo
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`; // celular
}

/**
 * Validador de CEP: precisa ter exatamente 8 números.
 * Retorna null quando está certo e { cep: true } quando está errado.
 */
export function cepValido(c: AbstractControl): ValidationErrors | null {
  return soNumeros(String(c.value ?? '')).length === 8 ? null : { cep: true };
}

/**
 * Validador de telefone:
 *  - 10 números (fixo) ou 11 números (celular), contando o DDD;
 *  - DDD de 11 a 99 (não existe DDD começando com 0 nem 10);
 *  - celular com 11 números precisa começar com 9 depois do DDD.
 */
export function telefoneValido(c: AbstractControl): ValidationErrors | null {
  const d = soNumeros(String(c.value ?? ''));
  if (d.length !== 10 && d.length !== 11) return { telefone: true };
  if (Number(d.slice(0, 2)) < 11) return { telefone: true };
  if (d.length === 11 && d[2] !== '9') return { telefone: true };
  return null;
}
