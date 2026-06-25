# 🌊 River Food Web - Nutrição Inteligente & Delivery

A interface web da plataforma **RiverFood** é uma solução full-stack que redefine a experiência de escolha alimentar. Através de um Motor de HealthScore exclusivo, o projeto analisa métodos de preparo para guiar o usuário rumo a uma alimentação mais consciente, enquanto entrega painéis dedicados e seguros para três perfis de usuários: Clientes, Restaurantes (Administradores) e Entregadores.

🔗 **Acesse a plataforma ao vivo:** [https://riverfood-frontend.vercel.app/](https://riverfood-frontend.vercel.app/)

---


## 🚀 Tecnologias Utilizadas

* **Framework & Build Tool:** React (Vite) + TypeScript
* **Estilização & Animação:** Tailwind CSS, Framer Motion, Phosphor Icons
* **Gerenciamento de Estado:** Zustand (com Persistence)
* **Validação e Integração:** Zod, Axios
* **Arquitetura & Deploy:** SPA (Single Page Application) estruturada, deploy via Vercel.

---

## 🎯 Diferenciais e Destaques Técnicos

* **Motor de HealthScore (Raio-X Nutricional):** O frontend consome um algoritmo do backend que processa atributos de saúde (como *In Natura*, *Rico em Proteínas*) para atribuir uma nota visual dinamicamente no modal de detalhes do produto.
* **UX Avançada (Drag-to-Scroll & Wheel):** Barra de categorias personalizada que adapta a experiência mobile para o desktop, contando com conversão de scroll vertical para horizontal e sistema de clique e arrasto para navegação fluida.
* **Controle de Acesso Baseado em Perfis (RBAC):** Utilização de `<ProtectedRoute />` para blindar rotas. Clientes não acessam o `/admin`, e Restaurantes possuem dashboards exclusivos para gestão de frota e controle de pedidos.
* **Gerenciamento de Estado Resiliente:** Carrinho de compras robusto controlado globalmente via `useCartStore` (Zustand). O estado sobrevive ao fechamento do navegador.
* **Estética & Usabilidade:** Interface baseada no padrão **Neon-Dark** e **Outlined**, focada em alto contraste.

---

## 🛠️ Arquitetura do Projeto

Estrutura principal orientada a domínios e componentização inteligente:
```
src/
├── components/    -> Modais, Cards, Sidebars e Layouts assíncronos
├── pages/         -> Telas principais do roteamento
│   ├── admin/     -> Painel de gestão do Restaurante
│   └── ...        -> Fluxo do Cliente (Home, Checkout)
├── schemas/       -> Validação de dados de entrada do Front-end (Zod)
├── services/      -> Centralização das requisições para a API REST
├── store/         -> Gerenciamento de estado global (Zustand)
└── utils/         -> Funções auxiliares e utilitários de estilo (Tailwind Merge)
```
---

## 💻 Como Executar o Projeto Localmente

### Pré-requisitos
* Node.js instalado (versão 18 ou superior).
* A API do RiverFood (Back-end) deve estar rodando localmente ou em nuvem.

### Configuração de Ambiente
Crie um arquivo `.env` na raiz do projeto contendo as seguintes chaves:
VITE_API_URL=http://localhost:3000

### Comandos Disponíveis

1. **Instalação:** `npm install` (Instala todas as dependências)
2. **Desenvolvimento:** `npm run dev` (Inicia o servidor Vite na porta 5173)
3. **Build:** `npm run build` (Gera a versão otimizada para produção)
4. **Lint:** `npm run lint` (Executa o ESLint para validação de código)

---

## 📸 Telas da Aplicação

### Visão do Cliente & Motor de HealthScore
> Exploração do cardápio e análise nutricional dinâmica dos pratos.

### Página Inicial
<details>
  <summary><strong>🖥️ Ver a Página Inicial Completa (Clique AQUI para expandir)</strong></summary>

   ![Página Inicial](./doc/img/inicial.png)

</details>

### Detalhe do Produto
![Detalhes do Produto](./doc/img/card.png)

---

### Visão do Restaurante (Painel Administrativo)
> Dashboard gerencial de vendas, saúde do cardápio e gestão de frota/pedidos.

### Dashboard Gerencial
![Dashboard Gerencial](./doc/img/admin.png)
### Histórico de Pedidos
![Histórico de Pedidos](./doc/img/historico.png)

---
## 👨‍💻 Desenvolvedor

Desenvolvido por **Ericky Braga**.  
Focado em transformar linhas de código em soluções de impacto para o bem-estar e negócios tecnológicos.

[LinkedIn](https://www.linkedin.com/in/erickysantana/) | [GitHub](https://github.com/erickystn)