# Controle Financeiro

Sistema pessoal de controle financeiro, feito para substituir sua planilha
de Excel. Construído com **HTML, CSS e JavaScript puro**, usando
**Firebase** (login e banco de dados) e publicado na **Netlify**.

Este é o resultado da **Etapa 1 — Estrutura do projeto**. Ainda não há
funcionalidade real (login, dados, gráficos); o objetivo desta etapa é
apenas montar o "esqueleto" organizado do sistema, para que as próximas
etapas encaixem nele sem bagunça.

## Como o projeto está organizado

```
controle-financeiro/
├── index.html              → porta de entrada (vira a tela de Login na Etapa 3)
├── README.md                → este arquivo
│
├── css/
│   └── style.css            → cores, fontes, tema claro/escuro (já pronto)
│
├── js/
│   ├── config.js             → dados de configuração (moeda, categorias padrão)
│   ├── firebase.js           → conexão com o Firebase (Etapa 2)
│   ├── app.js                → arranca o sistema (por ora, só o tema claro/escuro)
│   └── utils.js               → funções auxiliares (formatar dinheiro, datas, parcelas)
│
├── components/
│   ├── modal.js               → janelas de cadastro/confirmação (Etapa 5)
│   ├── cards.js                → cartões do dashboard (Etapa 4)
│   └── charts.js               → gráficos (Etapas 4 e 10)
│
└── pages/
    ├── dashboard.html          → visão geral (Etapa 4)
    ├── receitas.html            → cadastro de receitas (Etapa 5)
    ├── despesas.html             → cadastro de despesas (Etapa 6)
    ├── cartoes.html               → cartões de crédito e parcelas (Etapa 7)
    ├── metas.html                  → metas financeiras (Etapa 9)
    ├── relatorios.html              → relatórios e exportações (Etapa 10)
    └── configuracoes.html            → perfil, tema, moeda, idioma (Etapa 11)
```

## Por que essa organização?

- **`css/`** guarda toda a aparência do sistema num só lugar. Mudar uma cor
  aqui muda em todas as telas ao mesmo tempo.
- **`js/`** guarda a "lógica" que não é visual: conexão com o banco de
  dados, cálculos, formatação de valores.
- **`components/`** guarda pedaços de interface reutilizados em várias
  páginas (por exemplo, o mesmo modal de "confirmar exclusão" serve para
  receitas, despesas e cartões).
- **`pages/`** guarda cada tela do sistema, uma por arquivo.

Isso evita repetição de código e facilita a manutenção — se um dia você
quiser mudar como uma parcela é calculada, por exemplo, só precisa mexer
em um lugar (`js/utils.js`), e todas as telas que usam esse cálculo são
atualizadas automaticamente.

## O que já está pronto nesta etapa

- Estrutura de pastas completa.
- Sistema de design em `css/style.css`: paleta de cores, tipografia e
  suporte a tema claro/escuro (a troca de tema em si já funciona — veja
  `js/app.js`).
- Esqueleto de todas as páginas, com título e um aviso de "em construção",
  para você já visualizar a navegação geral do sistema.
- Funções utilitárias prontas em `js/utils.js`: formatação de moeda no
  padrão brasileiro, formatação de data e cálculo automático de parcelas
  (essencial para a tela de Cartões, mais adiante).

## O que NÃO está pronto ainda (de propósito)

- Login (Etapa 3)
- Conexão com o Firebase — os arquivos `firebase.js` e `config.js` têm
  campos vazios, esperando as chaves do seu projeto Firebase (Etapa 2)
- Qualquer cadastro de receita, despesa, cartão, meta, etc.
- Gráficos e relatórios

## Próxima etapa: Firebase

Na Etapa 2, vamos:

1. Criar juntos um projeto gratuito no [Firebase Console](https://console.firebase.google.com/),
   passo a passo, com prints explicados.
2. Ativar o **Firestore Database** (banco de dados) e o **Authentication**
   (login com Google e com e-mail/senha).
3. Copiar as chaves de configuração do seu projeto para dentro de
   `js/config.js`.
4. Escrever as **regras de segurança do Firestore**, para garantir que
   cada usuário só enxergue os próprios dados.

Você não precisa saber nada de programação para isso — vou te guiar
clicando em cada botão.

---

**Confirma que pode seguir para a Etapa 2 (Firebase)?** Se quiser ajustar
alguma cor, fonte ou nome de pasta antes de continuar, também é só falar.
