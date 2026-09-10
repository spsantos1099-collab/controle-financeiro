# Fluxo — Controle financeiro pessoal

O **Fluxo** é um sistema pessoal de controle financeiro feito com **HTML, CSS e JavaScript puro**, usando **Firebase Authentication + Realtime Database** e publicação pela **Netlify** a partir do GitHub.

A identidade "Fluxo" é a marca do app; o subtítulo **Controle financeiro pessoal** permanece visível para deixar claro o propósito do sistema.

## Estado atual

Concluídas até aqui:

1. Estrutura do projeto
2. Firebase Realtime Database
3. Login com Google e e-mail/senha
4. Dashboard
5. Receitas
6. Despesas
7. Cartões, faturas, parcelamento e assinaturas
8. Calendário financeiro
9. Metas financeiras com planejamento mensal
10. Relatórios
11. Perfil e aparência
12. Controle de valores que outras pessoas devem ao usuário

## Estrutura

```text
controle-financeiro/
├── index.html
├── database.rules.json
├── assets/
│   ├── fluxo-logo.png
│   ├── fluxo-icon.png
│   ├── favicon.ico
│   ├── favicon-32.png
│   ├── favicon-48.png
│   ├── apple-touch-icon.png
│   ├── icon-192.png
│   └── icon-512.png
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── calculos.js
│   ├── config.js
│   ├── firebase.js
│   ├── theme-init.js
│   └── utils.js
├── components/
│   ├── calendario.js
│   ├── metas.js
│   ├── recebiveis.js
│   ├── relatorios.js
│   ├── cards.js
│   ├── cartoes.js
│   ├── charts.js
│   └── modal.js
└── pages/
    ├── dashboard.html
    ├── receitas.html
    ├── despesas.html
    ├── cartoes.html
    ├── calendario.html
    ├── metas.html
    ├── relatorios.html
    └── configuracoes.html
```

## Banco de dados

Todos os dados ficam em `usuarios/{uid}/...`. As regras de `database.rules.json` permitem que cada usuário autenticado leia e altere somente a própria árvore.

Áreas utilizadas atualmente:

- `receitas`
- `despesas`
- `cartoes`
- `compras`
- `parcelas`
- `faturasManuais`
- `acertosPessoas`
- `pagamentosFaturas`
- `dividasReceber`
- `configuracoes/preferencias`
- `perfil/principal`
- `metas`

## Regra financeira central

O arquivo `js/calculos.js` é a fonte única dos cálculos financeiros principais.

- **Recebido no mês:** receitas marcadas como recebidas + valores de pessoas que foram efetivamente recebidos naquele mês.
- **Pago no mês:** despesas comuns pagas + faturas próprias pagas + pagamentos/acertos com terceiros.
- **Total do mês:** despesas + faturas, sem contar acertos novamente.
- **Saldo de caixa:** recebido − pago.
- **Saldo disponível:** saldo de caixa − valores reservados em metas + valores retirados das metas.

Dinheiro guardado em uma meta não é tratado como despesa. Continua sendo patrimônio, mas deixa de compor o saldo disponível.

## Metas e planejamento mensal

Cada meta pode ter um planejamento mensal, por exemplo:

- Setembro: R$ 500
- Outubro: R$ 600
- Novembro: R$ 700

Planejar não altera o saldo. Ao marcar um mês como **separado**, o valor é adicionado à meta e passa a reduzir o saldo disponível daquele mês. A marcação pode ser desfeita e o planejamento pode ser editado ou excluído.

Aportes manuais também entram como valores reservados. Retiradas de uma meta devolvem dinheiro ao saldo disponível no mês da retirada.

## Pessoas que me devem

Dentro de **Receitas** existe uma área específica para valores que outras pessoas precisam devolver.

Enquanto um registro estiver pendente, ele não entra nas receitas nem no saldo. Ao marcar como recebido, o usuário escolhe:

- **Deixar no saldo disponível**; ou
- **Enviar para uma meta**.

Quando o valor é enviado para uma meta, ele conta como entrada recebida e, ao mesmo tempo, como valor reservado. Assim, o sistema não duplica o dinheiro nem aumenta artificialmente o saldo livre.

## Identidade visual

O app usa a marca **Fluxo** e mantém a descrição **Controle financeiro pessoal** nas áreas de identidade. A tela de login tem visual fixo verde + branco e não acompanha o tema do sistema.

O favicon e os ícones do futuro PWA usam o símbolo aprovado da marca Fluxo.

## Tema e aparência

Nas páginas internas, o usuário pode escolher em **Configurações → Aparência**:

- Claro
- Escuro
- Seguir sistema

A preferência é salva localmente e no perfil. A tela de login permanece sempre verde + branca.

## Publicação

O projeto não tem etapa de build. No GitHub, `index.html`, `assets/`, `css/`, `js/`, `components/` e `pages/` devem permanecer na raiz do repositório. Na Netlify, o diretório de publicação é a raiz (`.` ou vazio, conforme a interface).

## Navegação lateral

A navegação principal das páginas internas usa uma barra lateral fixa e recolhível. No modo compacto, apenas os ícones ficam visíveis e o nome da seção aparece ao passar o mouse ou focar pelo teclado. A seta no topo expande/recolhe a barra e a preferência fica salva localmente no navegador.
