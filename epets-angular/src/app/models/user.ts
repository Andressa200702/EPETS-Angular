export type Papel = 'admin' | 'cliente';

export interface Usuario {
  id: string;
  name: string;
  email: string;
  role: Papel;
}