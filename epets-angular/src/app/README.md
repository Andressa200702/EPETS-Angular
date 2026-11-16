# E’PETS — PI Front (Angular)

Loja de rações e acessórios + painel admin, seguindo o protótipo do Figma Make.

## Rodar

```bash
npm install
npm start        # http://localhost:4200
```

## Telas

| Rota | Tela | Pasta |
|---|---|---|
| `/` | Home | `pages/home` |
| `/catalogo` | Catálogo (filtros, busca, ordenação) | `pages/catalog` |
| `/produto/:id` | Detalhe do produto | `pages/product-detail` |
| `/sacola` | Sacola | `pages/cart` |
| `/checkout` | Finalizar compra | `pages/checkout` |
| `/confirmacao/:id` | Pedido confirmado | `pages/confirmation` |
| `/admin` | Visão geral | `admin/dashboard` |
| `/admin/produtos` | CRUD de produtos | `admin/products` |
| `/admin/movimentacoes` | Entradas, saídas e ajustes | `admin/movements` |

Layout: `layout/header`, `layout/footer`, `layout/shop-layout` (loja) e `layout/admin-layout` (admin).
Componente reutilizável: `components/product-card`.

## Dados (por enquanto no navegador)

`services/products.ts`, `cart.ts`, `stock.ts` e `orders.ts` guardam tudo no `localStorage`.
Quando o back-end (Spring Boot) estiver pronto, troque o corpo dos métodos desses services por
chamadas `HttpClient` — as telas não precisam mudar.

- Finalizar um pedido dá baixa no estoque e aparece como **Saída** em Movimentações.
- Para voltar aos dados de exemplo: limpe o localStorage do site (F12 → Application).

## Fotos dos produtos

Coloque as fotos em `public/img/` com os nomes de `src/app/models/seed.ts`
(ex.: `p-golden-adultos.jpg`). Enquanto não existirem, aparece um placeholder.

## Alinhado com o Figma (carrinho, catálogo, entrar)

- **Sacola**: colunas Produto/Quantidade/Subtotal, "Esvaziar sacola", resumo com Produtos, Entrega local (R$ 12,90), Descontos e Total,
  cupom de teste `BEMVINDO10` (10%) e cálculo de entrega por CEP.
- **Catálogo**: filtros Seu pet, Marca, Fase e necessidade, Tipo de produto e Faixa de preço (opções com contagem 0 continuam visíveis).
  Tipos e marcas ficam em `models/categorias.ts`.
- **Cabeçalho**: botão "Entrar" (vira o nome da pessoa, com menu Painel admin / Sair, depois do login).
