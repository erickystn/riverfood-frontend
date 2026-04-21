# 🌊 River Food - Nutrição Inteligente & Delivery

O **River Food** é uma plataforma de delivery full-stack que redefine a experiência de escolha alimentar. Através de um **Motor de HealthScore** exclusivo, o projeto analisa técnicas de preparo e ingredientes para guiar o usuário em direção a uma alimentação mais consciente, sem perder a praticidade do delivery moderno.

---

## 🚀 Diferenciais Técnicos

### 🟢 Motor de HealthScore (Raio-X Nutricional)
Diferente de apps convencionais, o River Food utiliza um algoritmo que processa atributos de saúde (como `In Natura`, `Rico em Proteínas` ou `Ultraprocessado`) para atribuir uma nota visual (A, B ou C). O modal de detalhes realiza o mapeamento dinâmico dessas informações diretamente da API.

### 🖱️ UX Avançada: Drag-to-Scroll & Wheel
Desenvolvemos uma barra de categorias personalizada que adapta a experiência mobile para o desktop. 
- **Scroll Horizontal:** Conversão de movimento vertical do mouse em deslocamento lateral.
- **Interatividade:** Sistema de clique e arrasto (*drag-to-scroll*) para navegação fluida em qualquer dispositivo.

### 📦 Arquitetura & Estado
- **Zustand + Persistence:** Carrinho de compras robusto que sobrevive ao fechamento do navegador.
- **Framer Motion:** Micro-interações e transições de modais com alta performance.
- **NestJS + TypeORM:** Backend estruturado para escalabilidade e integridade de dados.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React, TypeScript, Tailwind CSS, Zustand, Framer Motion, Phosphor Icons.
- **Backend:** NestJS, TypeORM, PostgreSQL.
- **Ferramentas:** Vite, ImageKit (fallback de imagens), Axios.

---

## 📂 Como Rodar o Projeto

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/seu-usuario/river-food.git](https://github.com/seu-usuario/river-food.git)
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configuração da API:**
   Certifique-se de que o backend está rodando e aponte a URL no seu `.env`:
   ```env
   VITE_API_URL=http://localhost:8080
   ```

4. **Execução:**
   ```bash
   npm run dev
   ```

---

## 🎨 Protótipo e Design
O projeto utiliza uma estética **Neon-Dark** e **Outlined**, focada em contraste e legibilidade, garantindo que as informações de saúde (badges coloridas) sejam o ponto central de atenção do usuário.

---

## 👨‍💻 Desenvolvedor
Desenvolvido por **Erick Braga**.  
Focado em transformar linhas de código em soluções de impacto para o bem-estar.

[LinkedIn](https://www.linkedin.com/in/erick-braga-santana/) | [GitHub](https://github.com/ErickBragaLopes)