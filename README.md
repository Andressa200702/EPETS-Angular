# E’PETS 

Front-end da E’PETS, uma loja online de rações e acessórios para cães, gatos, roedores e aves silvestres, com painel administrativo de estoque. O visual segue o protótipo feito no Figma Make.

## Funcionalidades

### Loja
- **Home** com destaques, categorias e marcas
- **Catálogo** com busca, ordenação e filtros: Seu pet, Marca, Fase e necessidade, Tipo de produto e Faixa de preço
- **Detalhe do produto** com produtos relacionados
- **Sacola** com alteração de quantidade, cupom de desconto e cálculo de entrega por CEP
- **Checkout** com entrega ou retirada, e pagamento por Pix, cartão de crédito ou dinheiro
- **Confirmação do pedido**
- **Entrar e criar conta**
- **Meus pedidos**: histórico da cliente logada

### Painel admin
- **Visão geral**: indicadores de estoque, gráfico por categoria, itens que precisam de reposição e últimas movimentações, com exportação em CSV
- **Produtos**: cadastro, edição e exclusão
- **Movimentações**: entradas, saídas e ajustes de estoque

Ao finalizar um pedido, o estoque é baixado automaticamente e a venda aparece como **Saída** em Movimentações.

## Tecnologias

- [Angular](https://angular.dev) 22 (componentes standalone, signals, rotas com lazy loading)
- TypeScript
- CSS puro, sem biblioteca de componentes
- SSR com `@angular/ssr`
- Vitest para testes

## Como rodar

Requisitos: [Node.js](https://nodejs.org) (versão LTS) e npm.

```bash
git clone https://github.com/<seu-usuario>/EPETS-Angular.git
cd EPETS-Angular/epets-angular   # a pasta onde está o package.json
npm install
npm start
```

Abra [http://localhost:4200](http://localhost:4200).

Para testar no celular, na mesma rede Wi-Fi:

```bash
npm start -- --host 0.0.0.0
```

e acesse `http://<IP-do-seu-computador>:4200`.

## Acessos e dados de teste

| O que | Como |
|---|---|
| Painel admin | usuário `admin`, senha `1234` |
| Cliente | crie uma conta em `/cadastro` |
| Cupom | `BEMVINDO10` (10% nos produtos) |
| Cartão de teste | `4111 1111 1111 1111`, validade futura e CVV com 3 dígitos |

## Rotas

| Rota | Tela |
|---|---|
| `/` | Home |
| `/catalogo` | Catálogo |
| `/produto/:id` | Detalhe do produto |
| `/sacola` | Sacola |
| `/checkout` | Finalizar compra |
| `/confirmacao/:id` | Pedido confirmado |
| `/meus-pedidos` | Meus pedidos (cliente logada) |
| `/entrar` e `/cadastro` | Login e criação de conta |
| `/admin` | Visão geral (somente admin) |
| `/admin/produtos` | Produtos |
| `/admin/movimentacoes` | Movimentações |

## Estrutura do projeto

```
src/app/
├── admin/          # dashboard, produtos, movimentações
├── components/     # product-card, product-img
├── guards/         # proteção de rotas (admin, cliente, visitante)
├── layout/         # header, footer, shop-layout, admin-layout
├── models/         # tipos, produtos de exemplo e categorias
├── pages/          # home, catálogo, produto, sacola, checkout, pedidos...
└── services/       # produtos, sacola, pedidos, estoque, autenticação
```

## Dados e persistência

Os services (`products`, `cart`, `stock`, `orders`, `auth`) guardam tudo no `localStorage`. Quando o back-end estiver pronto, basta trocar o corpo dos métodos por chamadas `HttpClient`, e as telas não precisam mudar.

- Para voltar aos dados de exemplo, limpe o armazenamento do site (F12 → Application → Local Storage).
- Fotos dos produtos ficam em `public/img/`, com os nomes definidos em `src/app/models/seed.ts`. Sem a foto, aparece um placeholder.

## Aviso sobre pagamento e contas

- O cartão é só validado na tela. Nenhum dado é enviado, e apenas os 4 últimos dígitos ficam no pedido.
- O código Pix usa uma chave fictícia e não recebe pagamento.
- As senhas das contas de teste ficam apenas no navegador. Para produção, a autenticação e o pagamento devem passar por um back-end e por um gateway de pagamento.

## Próximos passos

- [ ] Integração com a API Spring Boot
- [ ] Pagamento real por gateway
- [ ] Tela de pedidos no painel admin, com status
- [ ] Catálogo completo e fotos dos produtos
- [ ] Revisão do layout para celular
- [ ] Recuperação de senha e edição de perfil

## Scripts

| Comando | O que faz |
|---|---|
| `npm start` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm test` | Testes |
