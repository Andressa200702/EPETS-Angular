# E’PETS

Front-end da E’PETS, uma loja online de rações e acessórios para cães, gatos, roedores e aves silvestres, com painel administrativo. Projeto Integrador feito em Angular, seguindo o protótipo do Figma.

## Como rodar

O projeto fica dentro da pasta `epets-angular`:

```bash
cd epets-angular
npm install
npm start        # abre em http://localhost:4200
```

Para gerar a versão de produção: `npm run build`.

## Acessos de demonstração

| Perfil | Como entrar |
|---|---|
| Administrador | e-mail `admin@epets.com.br` e senha `1234` |
| Cliente | crie uma conta em **Criar conta** (nome, e-mail e senha) |

O login é feito **somente por e-mail** (não existe mais nome de usuário).

## Funcionalidades

**Loja**
- Home com categorias, destaques e a seção **Um pouquinho de cuidado a mais**: cada card tem um guia que abre e fecha ao clicar em *Ler guia* / *Fechar guia*.
- Catálogo com filtros, busca e ordenação.
- Detalhe do produto.
- Cards de produto com botão **Adicionar à sacola**. Depois de adicionar, o botão vira um controle verde `− N na sacola +` para mudar a quantidade (chegando em 0, o item sai da sacola).
- Sacola com título "Uma sacola cheia de cuidado." e resumo de produtos e unidades escolhidas.
- Checkout com validação dos dados (veja abaixo), entrega ou retirada na loja, e pagamento por Pix "copia e cola" de demonstração, cartão ou dinheiro.
- Pedido confirmado e **Meus pedidos** (lista os pedidos da pessoa logada).

**Conta**
- Criar conta, entrar e sair.
- **Alterar senha** (menu do nome no cabeçalho): pede a senha atual, a nova e a confirmação. A senha nova precisa ter pelo menos 4 caracteres e ser diferente da atual.

**Painel admin**
- Visão geral, CRUD de produtos e movimentações de estoque (entradas, saídas e ajustes).
- Finalizar um pedido dá baixa no estoque e aparece como **Saída** em Movimentações.

## Validações do checkout

Os campos têm máscara (formatam enquanto a pessoa digita) e travam no tamanho certo:

| Campo | Formato | Regra |
|---|---|---|
| CPF | `000.000.000-00` | 11 números e dígitos verificadores corretos. O CPF é pedido só na hora da compra. |
| Telefone / WhatsApp | `(11) 91234-5678` | DDD de 11 a 99; celular com 11 números começando com 9 ou fixo com 10 números |
| CEP | `00000-000` | exatamente 8 números |
| Cartão | `0000 0000 0000 0000` | número válido (teste: `4111 1111 1111 1111`) |

Validadores e máscaras ficam em `src/app/utils/` (`cpf.ts` e `mascaras.ts`).

## Telas e rotas

| Rota | Tela | Pasta (em `src/app/`) |
|---|---|---|
| `/` | Home | `pages/home` |
| `/catalogo` | Catálogo | `pages/catalog` |
| `/produto/:id` | Detalhe do produto | `pages/product-detail` |
| `/sacola` | Sacola | `pages/cart` |
| `/checkout` | Finalizar compra | `pages/checkout` |
| `/confirmacao/:id` | Pedido confirmado | `pages/confirmation` |
| `/meus-pedidos` | Meus pedidos (precisa estar logada) | `pages/my-orders` |
| `/alterar-senha` | Alterar senha (precisa estar logada) | `pages/change-password` |
| `/entrar` e `/cadastro` | Entrar e criar conta | `pages/auth` |
| `/admin` | Visão geral | `admin/dashboard` |
| `/admin/produtos` | CRUD de produtos | `admin/products` |
| `/admin/movimentacoes` | Movimentações de estoque | `admin/movements` |

Layouts: `layout/header`, `layout/footer`, `layout/shop-layout` (loja) e `layout/admin-layout` (admin).
Componente reutilizável: `components/product-card`.

## Dados (por enquanto no navegador)

`services/products.ts`, `cart.ts`, `stock.ts`, `orders.ts` e `auth.ts` guardam tudo no `localStorage`.
As senhas são guardadas embaralhadas (hash), nunca em texto puro, mas isto é só uma **demonstração**.

Quando o back-end (Spring Boot) estiver pronto, troque o corpo dos métodos desses services por
chamadas `HttpClient`. As telas não precisam mudar.

Para voltar aos dados de exemplo: limpe o localStorage do site (F12 → Application).
