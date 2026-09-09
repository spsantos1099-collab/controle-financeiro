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

## Etapa 7 — Cartões (concluída)

Arquivos novos ou alterados nesta etapa:

- `components/cartoes.js` — **novo**. Contém a regra da fatura (em qual mês
  cada compra cai) e a geração automática das parcelas.
- `pages/cartoes.html` — a tela de cartões, faturas e compras.
- `css/style.css` — estilos do cartão colorido, das faturas e da paleta de cores.
- `js/utils.js` — funções novas de mês (`somarMeses`, `formatarMesAno`,
  `ultimoDiaDoMes`, `dataIsoSegura`, `hojeIso`).
- `components/modal.js` — nova função `confirmarAcao` (confirmação que não é exclusão).
- `pages/dashboard.html` — passou a mostrar as faturas do mês e o limite disponível.

### Como o parcelamento funciona

O cartão fecha a fatura no dia anterior ao "melhor dia de compra". Compras
feitas até o fechamento entram na fatura que está para fechar; compras feitas
a partir do melhor dia entram na fatura seguinte. Cada parcela recebe o mês
da fatura e a data de vencimento já calculados, e é gravada separadamente em
`usuarios/{uid}/parcelas`.

### Cartões de outras pessoas

Cada cartão tem um tipo: **meu cartão** ou **de outra pessoa**. No segundo
caso, o único campo obrigatório é o nome — nada de banco, bandeira ou limite,
porque controlar limite de um cartão que não é seu não faz sentido. O valor em
aberto passa a significar "quanto você ainda deve devolver", e o botão da
fatura vira "Marcar como acertado".

Quando o cartão não tem "melhor dia de compra" informado, o sistema usa a
regra simples: a compra entra na fatura do próprio mês em que foi feita, e as
parcelas seguintes caem nos meses seguintes — igual a uma planilha com uma
aba por mês.

### Assinaturas (compras recorrentes)

Ao lançar uma compra no cartão, agora existem duas abas: **Compra parcelada**
(o que já existia) e **Assinatura mensal** — para Netflix, academia, qualquer
cobrança que se repete todo mês sem uma quantidade fixa de parcelas.

Como uma assinatura nunca "acaba" sozinha, o sistema não gera as cobranças
todas de uma vez (seria infinito). Em vez disso, ele mantém sempre um
colchão de 12 meses gerados à frente e completa esse colchão sozinho toda
vez que a tela de Cartões é aberta — então a assinatura nunca fica “para
trás” mesmo que o app passe meses fechado.

**Cancelar** uma assinatura (botão 🚫 na lista de compras) marca o mês atual
como o último cobrado e apaga só as cobranças futuras que ainda não foram
pagas — o histórico de cobranças já lançadas continua intacto. Excluir, por
outro lado, apaga a assinatura inteira e todo o histórico dela.
