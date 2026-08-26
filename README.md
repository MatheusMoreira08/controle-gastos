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

<div align="center">
  Desenvolvido para o controle financeiro do casal 
</div>
