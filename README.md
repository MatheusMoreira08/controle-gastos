# 💑 FinanceFlow — Gestão Financeira para Casal

<div align="center">

![FinanceFlow Logo](public/favicon.svg)

### Aplicação web moderna, intuitiva e em tempo real para gestão de despesas, receitas e metas conjuntas do casal.

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.3-646CFF.svg)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28.svg)](https://firebase.google.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com/)

</div>

---

## 🌟 Destaques do Projeto

- **💑 Visão Compartilhada & Individual:**
  - Identificação de cada lançamento e meta por responsável: **Matheus 👨**, **Vitória 👩** ou **Ambos 🤝**.
  - Filtros dinâmicos no Dashboard e Lançamentos para visualizar gastos conjuntos ou de cada um separadamente.

- **📊 Dashboard Financeiro Completo:**
  - Cards com **Receitas**, **Despesas Pagas**, **Saldo Atual** e **Balanço Previsto** (considerando contas pendentes).
  - Filtros por período: *Este mês*, *Mês anterior*, *3 meses* e *Este ano*.
  - Gráfico de **Despesas por Categoria** (Donut interativo com Recharts).
  - Gráfico de **Fluxo de Caixa Mensal** dos últimos 6 meses.
  - Prévia em tempo real das últimas movimentações e metas financeiras ativas.

- **💸 Gestão Completa de Lançamentos (CRUD):**
  - Cadastro fácil de **Receitas** e **Despesas**.
  - Categorização completa (Alimentação, Moradia, Transporte, Saúde, Lazer, Educação, etc.).
  - Controle de vencimentos e ação rápida com 1 clique para **Marcar como Pago / Pendente**.
  - Suporte a despesas **recorrentes** e **parcelamentos** (ex: 5/12x).
  - Sinalização automática de **Contas Vencidas ⚠️**.

- **🎯 Metas Financeiras & Sonhos do Casal:**
  - Cadastro de objetivos com nome, valor alvo, valor acumulado e prazo limite.
  - Barra de progresso visual com cálculo automático de `% atingido` e status (*Em andamento*, *Concluída*, *Atrasada*).
  - Modal rápido de **Aporte** para adicionar economias diretamente à meta.

- **📱 Design Responsivo & Mobile-First:**
  - Layout adaptável com **Sidebar retrátil** no Desktop e **Bottom Navigation Bar** no celular.
  - Botão de Ação Flutuante (**FAB**) para lançamento rápido pelo smartphone.
  - Suporte completo a **Dark Mode** (padrão) e **Light Mode**.
  - Modais responsivos em formato *bottom-sheet* no mobile.

- **🔒 Segurança & Nuvem (Firebase):**
  - Login seguro com Email e Senha (Firebase Auth) restrito ao casal.
  - Banco de dados em tempo real com **Cloud Firestore** — lançamentos feitos no celular de um aparecem instantaneamente no de outro.

---

## 🛠️ Tecnologias & Bibliotecas

| Camada | Tecnologia |
| :--- | :--- |
| **Framework Frontend** | [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite](https://vitejs.dev/) |
| **Roteamento** | [React Router v6](https://reactrouter.com/) |
| **Backend & Banco de Dados** | [Firebase Auth](https://firebase.google.com/docs/auth) & [Cloud Firestore](https://firebase.google.com/docs/firestore) |
| **Formulários & Validação** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Gráficos** | [Recharts](https://recharts.org/) |
| **Ícones** | [Lucide React](https://lucide.dev/) |
| **Manipulação de Datas** | [date-fns](https://date-fns.org/) |
| **Estilização** | CSS Puro com Custom Properties e Design System estruturado |

---

## 🚀 Como Executar Localmente

### 1. Clonar o repositório e instalar as dependências
```bash
git clone https://github.com/MatheusMoreira08/controle-gastos.git
cd controle-gastos
npm install
```

### 2. Configurar as Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto com as credenciais do seu Firebase:

```env
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id

# Emails autorizados (opcional se contiverem matheus/vitoria no email)
VITE_USER_MATHEUS_EMAIL=email_matheus@gmail.com
VITE_USER_VITORIA_EMAIL=email_vitoria@gmail.com
```

### 3. Rodar o servidor de desenvolvimento
```bash
npm run dev
```
Acesse no navegador: `http://localhost:5173`

---

## 🌐 Como Hospedar na Vercel (Passo a Passo)

1. **Suba as alterações para o GitHub:**
   ```bash
   git add .
   git commit -m "feat: FinanceFlow - Gestão financeira completa para casal com Firebase"
   git push origin main
   ```

2. **Criar o projeto na Vercel:**
   - Acesse [vercel.com](https://vercel.com) e faça login com sua conta do GitHub.
   - Clique em **"Add New..."** ➡️ **"Project"**.
   - Localize o repositório `controle-gastos` e clique em **"Import"**.

3. **Configurar as Variáveis de Ambiente na Vercel:**
   - Na tela de configuração do deploy, expanda a seção **"Environment Variables"**.
   - Adicione cada uma das variáveis do seu `.env.local`:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`
     - `VITE_USER_MATHEUS_EMAIL`
     - `VITE_USER_VITORIA_EMAIL`

4. **Deploy:**
   - Clique no botão **"Deploy"**.
   - Em menos de 1 minuto seu link estará no ar com **HTTPS gratuito** para você e a Vitória usarem no celular e no computador! 🎉

---

## 🔒 Regras de Segurança do Firebase Firestore

Para garantir que apenas vocês dois autenticados possam acessar os dados, configure a aba **Rules** no Firebase Firestore:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

<div align="center">
  Desenvolvido com carinho para o controle financeiro do casal ❤️
</div>
