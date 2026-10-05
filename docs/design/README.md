# Design oficial do Guará

Cópia do artefato de design ("Guará · Design do app",
<https://claude.ai/artifact/JQTwTAjHXMBuJZeTCvBZcc>, versão `1791162157-589c`). É a **fonte da
verdade visual** do app: espaçamentos, tamanhos, textos, estados e comportamento.

```
docs/design/
  screens/     uma tela por arquivo .dc.html (Escuro-<Mobile|Tablet|Desktop>-<Tela>)
  assets/      imagens referenciadas pelas telas (nome = id do asset no artefato)
  canvas.json  organização do quadro: páginas, seções e títulos de cada tela
```

- **Como ler:** abra o `.dc.html` no navegador ou leia o HTML (estilos inline, em px). As telas se
  ligam por links relativos. O `support.js` citado nelas é o runtime da ferramenta de design e não
  vem junto — a tela renderiza, mas sem interações.
- **Celular** = `Mobile` (393 px), **tablet** = `Tablet` (820 px em pé, 1180 px deitado).
  **Desktop** (2560 px) é referência para a web futura; o app não o implementa.
- **Números são exemplos.** Os valores do design ilustram o layout; os dados do app vêm de
  `src/features/<x>/data.ts` (e, depois, da API). Valores derivados são sempre calculados.
- **Não edite** os arquivos daqui à mão. Para atualizar, baixe de novo do artefato e reescreva
  `/_blob/<id>` para `../assets/<id>.<ext>`.

## Fundamentos (resumo de `screens/Fundamentos.dc.html`)

**Princípios:** turma, não robô (cada resposta tem um bicho com nome e jeito); calor de mata (escuro
verde, luz de tucano); claro antes de bonito (número legível, rótulo escrito, um assunto por tela).

**Cor** — um só tema, escuro. Ganho e perda nunca dependem só da cor: sempre têm sinal, rótulo ou
seta. Os valores estão em `@guara/ui-tokens` (`colors.ts`).

| Nome         | Uso                                          |
| ------------ | -------------------------------------------- |
| Mata à noite | fundo do app                                 |
| Folha escura | cards e painéis                              |
| Sombra       | elevado, bolhas, trilhos                     |
| Musgo        | bordas e divisórias                          |
| Líquen       | borda de campo e botão contorno              |
| Areia        | texto principal                              |
| Névoa        | texto de apoio                               |
| Seriema      | legendas e metadados (nunca abaixo de 12 px) |
| Tucano       | ação principal, atenção, bolha do usuário    |
| Urucum       | alerta, fora do padrão, apertado             |
| Folha        | ganho, tranquilo, compra                     |
| Arara-azul   | dados, entradas, gráficos                    |
| Mata         | destaque do saldo (hero)                     |

**Estados do mês** — sempre com palavra e porcentagem:

- **Tranquilo:** até 69% dos tetos e nenhuma compra suspeita.
- **Atenção:** algum teto entre 70% e 84%, ou alerta a confirmar.
- **Apertado:** algum teto a partir de 85% ou compra fora do padrão.

**Tipografia** — Fraunces para números e títulos, Figtree para ler e tocar; números tabulares.

| Uso                   | Fonte e tamanho                          |
| --------------------- | ---------------------------------------- |
| Saldos, números-herói | Fraunces 800 · 44–50                     |
| Título de página      | Fraunces 800 · 32–44                     |
| Título de card        | Fraunces 700 · 20–22                     |
| Texto e chat          | Figtree 400 · 16/26 (mín. 16 no celular) |
| Botões e rótulos      | Figtree 700 · 14–15                      |
| Apoio                 | Figtree 400 · 12–13                      |

**Identidade** — fauna só nos assistentes e no chat. Curvas de nível só no card do saldo. Cenas da
turma no topo de alertas e cards da turma. Textura de mata só em três lugares: cartão do usuário,
botão "Nova conversa" e faixas de classe nas posições. Logo: lobo-guará no círculo verde-mata, com o
nome em Fraunces 800 (no trilho do tablet, só o lobo).

**Componentes** — tudo que é tocável é pílula, com alvo ≥ 44 px; foco visível em tucano (3 px);
ícone sozinho sempre tem nome acessível. Avatar da turma é retrato com anel na cor do bioma, sempre
com o nome escrito ao lado.

**Responsividade** — mesmas funções nos três formatos; muda o arranjo (tabela vira cartão, colunas
viram abas), nunca o que o usuário consegue fazer.

- Celular: barra inferior (Início, Gastos, Conversar, Investir, Assistentes); Assinaturas,
  Simulador, Relatórios, Alertas e Meu perfil no menu do avatar.
- Tablet: trilho lateral de 88 px; botão Conversar flutuante; chat em tela própria com histórico.

## Assets

| Arquivo                                | No app                                     | Observação          |
| -------------------------------------- | ------------------------------------------ | ------------------- |
| `5ae1878c704af5ce3448ee86dd44562b.png` | `assets/images/brand/wolf.png`             | logo (lobo-guará)   |
| `18ee5836c368927d9d95da0314af6ef3.jpg` | `assets/images/textures/mata.jpg`          | textura de mata     |
| `b1e62bbca3986be23039141b806f67bd.jpg` | `assets/images/assistants/capivara.jpg`    | avatar              |
| `a49ffef25d304dfde09c68a5eba8be1d.jpg` | `assets/images/assistants/tamandua.jpg`    | avatar              |
| `8eedad9dcae84b7dd0a0fc9b2e301975.jpg` | `assets/images/assistants/pacu.jpg`        | avatar              |
| `6ea0133282c6fcd21d0cd57b5d5718f3.jpg` | `assets/images/assistants/caramelo.jpg`    | avatar              |
| `2f3617a5737802e0a4aac2062892b44f.jpg` | `assets/images/assistants/quero-quero.jpg` | avatar              |
| `608c88c1e20b4abba684a87a751a47a4.jpg` | `assets/images/assistants/onca.jpg`        | avatar              |
| `7c82af7a5a6854725790b5e51e9fd888.jpg` | `assets/images/scenes/capivara.jpg`        | cena                |
| `09e5100f0268b0143fd3e12704d1224c.jpg` | `assets/images/scenes/tamandua.jpg`        | cena                |
| `2d2c9f70ed9ac05980758a0a8d00d207.jpg` | `assets/images/scenes/pacu.jpg`            | cena                |
| `4a5073434b123fbd306c16a53d362057.jpg` | `assets/images/scenes/caramelo.jpg`        | cena                |
| `edacf546f62705187b7608516b428c89.jpg` | `assets/images/scenes/quero-quero.jpg`     | cena                |
| `ce65184761ef1f41fd840ba1e40c0490.jpg` | `assets/images/scenes/onca.jpg`            | cena                |
| `56b7fd17efde2f13608cd924d90b1cd2.jpg` | —                                          | não usado nas telas |
| `9bfd287f0cd9a54ca92c2d9f2132d914.jpg` | —                                          | não usado nas telas |
| `ce53bee2696150faa42cf1021f93ff57.jpg` | —                                          | não usado nas telas |

Os arquivos do app são idênticos (mesmo SHA-256) aos do design.

## Índice das telas

`M` = celular, `T` = tablet, `D` = desktop. Rotas relativas a `apps/mobile/app`; "—" = ainda não
implementada.

### Onboarding

| Tela (arquivo `Escuro-*-<Tela>`)                                                         | Formatos | Rota no app                                                       |
| ---------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------- |
| `Boas-Vindas` · boas-vindas e criação de conta                                           | M T D    | `(auth)/sign-in`, `(auth)/sign-up`                                |
| `Conectar-Bancos` · onboarding 1                                                         | M T D    | `(onboarding)/connect-banks`; fora do onboarding `/connect-bank`  |
| `Perfil-Investidor` · onboarding 2                                                       | M T D    | `(onboarding)/investor-profile`; fora `/account/investor-profile` |
| `Agentes-Avisos` · onboarding 3                                                          | M T D    | `(onboarding)/assistants`                                         |
| `Perfil-Investidor-P1`, `-P2`, `-P4`, `-P5`, `-P6`, `-Resultado` · questionário completo | M T      | —                                                                 |
| `Malvo-Autorizar`, `-Conectando`, `-Sucesso`, `-Erro` · conexão pelo Malvo               | M T      | `(onboarding)/connect/[bankId]`; no app `/malvo/[bankId]`         |
| `Termos`, `Privacidade`                                                                  | M T      | —                                                                 |

### App

| Tela                                                                                                | Formatos | Rota no app                                                             |
| --------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `Inicio` (M), `Painel` (T), `Painel-Historico` (D), `Main` (D)                                      | M T D    | `/` (`(tabs)/(home)/index`)                                             |
| `Assistentes`                                                                                       | M        | `/assistants`                                                           |
| `Conversa`, `Conversas` (D), `Historico-Conversas`, `Escolher-Agente`                               | M T D    | `/chat`, `/chat/[conversationId]`                                       |
| `Conversa-Menu`, `-Apagar`, `-Anexar`, `-Anexo-Previa`, `-Gravando`, `-Transcrevendo`               | M T      | —                                                                       |
| `Gastos`                                                                                            | M T D    | `/spending`                                                             |
| `Lancamentos` · todos os lançamentos                                                                | M T      | `/spending/transactions`                                                |
| `Lancamentos-Categoria` · lançamentos de uma categoria                                              | M T      | `/spending/category/[categoryId]`                                       |
| `Lancamento-Detalhe` · detalhe do lançamento                                                        | M T      | `/spending/[transactionId]`                                             |
| `Lancamentos-Estados` · filtro vazio, vazio e erro                                                  | M T      | estados de `/spending/transactions`                                     |
| `Assinaturas`                                                                                       | M T D    | `/spending/subscriptions`                                               |
| `Relatorio` (T em paisagem)                                                                         | M T D    | `/reports`                                                              |
| `Relatorio-Linha-do-Tempo`                                                                          | M T      | —                                                                       |
| `Alertas`                                                                                           | M T D    | `/alerts`                                                               |
| `Novo-Teto`                                                                                         | M T D    | `/new-budget` (modal)                                                   |
| `Novo-Alerta-Preco`                                                                                 | M T D    | `/new-price-alert` (modal)                                              |
| `Investimentos`                                                                                     | M T D    | `/investments`                                                          |
| `Ativo`, `Ativo-Tesouro-Selic`, `-CDB`, `-BOVA11`, `-HGLG11`, `-Bitcoin`                            | M T D    | `/investments/asset/[ticker]`                                           |
| `Ativo-Comparar`, `-Comparar-Ibovespa`, `-Preco-Sem-Ajuste`, `-Mais-Detalhes`, `-Eventos`, `-Risco` | M T      | —                                                                       |
| `Adicionar-Investimento`                                                                            | M T D    | `/new-manual-asset` (modal)                                             |
| `Posicoes`, `Posicoes-Estados`                                                                      | M T      | `/investments/positions`                                                |
| `Simulador`, `Simulador-Objetivo`, `Simulador-Corte`                                                | M T D    | `/investments/simulator/retirement`, `/goal`, `/cut-expense`            |
| `Simulacoes`, `Simulacoes-Estados`                                                                  | M T      | `/investments/simulator/saved`                                          |
| `Metas`, `Meta-Detalhe`, `Meta-Nova`, `Metas-Estados`                                               | M T      | `/goals`, `/goals/[goalId]`, `/new-goal`                                |
| `Bem-Imovel`, `Bem-Veiculo`, `Bem-Imovel-Detalhe`, `Bem-Veiculo-Detalhe`                            | M T      | `/new-property`, `/new-vehicle`, `/investments/properties/[propertyId]` |
| `Meu-Perfil`                                                                                        | M T D    | `/account`                                                              |
| `Editar-Perfil`, `Editar-Perfil-Email`                                                              | M T      | `/account/profile`                                                      |
| `Perfil-Refazer`, `Perfil-Refazer-Resultado`                                                        | M T      | —                                                                       |
| `Planos`                                                                                            | M T      | `/account/plan`                                                         |
| `Malvo-Renovar` · renovar autorização do banco                                                      | M T      | `/malvo/[bankId]?mode=renew`                                            |
| `Inicio-Novo`, `Gastos-Novo`, `Investimentos-Novo` · usuário sem banco                              | M T      | —                                                                       |

Rotas marcadas com "—" ainda não existem ou existem sem seguir a tela nova do design.
