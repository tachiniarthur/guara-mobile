# Design oficial do Guará

Cópia do artefato de design ("Guará · Design do app",
<https://claude.ai/artifact/JQTwTAjHXMBuJZeTCvBZcc>, versão `1791220150-f1a1`). É a **fonte da
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

**Cor** — um só tema, escuro. Tucano marca a ação que conclui ou cria; Areia marca o que está
selecionado; Urucum é o alerta. Ganho e perda nunca dependem só da cor: sempre têm sinal, rótulo ou
seta. Valores em `@guara/ui-tokens` (`colors.ts`).

| Nome                                      | Uso                                                         |
| ----------------------------------------- | ----------------------------------------------------------- |
| Mata à noite                              | fundo do app                                                |
| Folha escura                              | cards e painéis                                             |
| Sombra                                    | elevado, bolhas, trilhos, avisos neutros                    |
| Campo                                     | inputs, itens de lista, trilho do segmentado (borda Líquen) |
| Musgo / Líquen                            | divisórias / borda de campo e botão contorno                |
| Areia / Névoa / Seriema                   | texto principal / apoio / legendas (nunca abaixo de 12 px)  |
| Névoa clara                               | texto de apoio só sobre a textura de mata                   |
| Tucano, Urucum, Folha, Arara-azul         | ação principal, alerta, ganho, dados                        |
| Folha funda, Tucano, Urucum e Arara fundo | fundos de status com o texto da cor por cima                |
| Mata                                      | destaque do saldo e superfícies com textura                 |

**Botões** — Amarelo: a ação que conclui ou cria (uma por tela). Mata: criar algo importante (Nova
conversa, Nova meta, Conectar banco). Areia: avançar etapas do questionário e item ativo em menus e
filtros. Contorno: secundárias. Texto: cancelar. Urucum: excluir e desconectar. Altura 52 no rodapé
fixo e no onboarding, 44–48 no conteúdo, 40 dentro de cards.

**Tipografia** — Fraunces para números e títulos, Figtree para o resto; números tabulares.

| Uso                                   | Fonte e tamanho                                         |
| ------------------------------------- | ------------------------------------------------------- |
| Saldo e patrimônio (número-herói)     | Fraunces 800 · 34–38                                    |
| Título de página                      | Fraunces 800 · 28 tablet · 24–26 formulários no celular |
| Título de card                        | Fraunces 700 · 20 tablet · 17–18 celular                |
| Título da barra do celular            | Figtree 700 · 16                                        |
| Chat e campos                         | Figtree 400 · 16/26                                     |
| Leitura e listas                      | Figtree 400 · 14–15                                     |
| Botões, rótulos e títulos de linha    | Figtree 700 · 14–15                                     |
| Apoio, metadados e etiquetas          | Figtree 400–700 · 12–13                                 |
| Rótulos do trilho do tablet (exceção) | Figtree 600 · 11                                        |

**Componentes** — tocável é pílula, alvo ≥ 44 px, foco Tucano de 3 px, ícone sozinho com nome
acessível.

- Campos: rótulo 14/700 acima, campo 52 (Campo + borda Líquen), dinheiro 64 px Fraunces 800 raio
  16, ajuda 13 px Seriema.
- Filtros: segmentado para trocar a visão, chips para filtrar, pílula de menu para período e ordem,
  opções do questionário em cards de 60 px.
- Etiquetas 24 px, 12/700, recuo 10; avisos com ícone, 13 px, raio 14. Cor sempre com palavra ou
  ícone.
- Listas: título 15/500 e meta 12, valor à direita tabular; estatística em bloco Campo raio 16; barra
  de teto 10 px com marcas dos avisos.
- Assistentes só no chat e em caixas onde eles falam; retrato com anel do bioma e nome escrito.
- Toda lista ou ação de rede tem estado vazio e de erro; dado ausente é "—", nunca zero.
- Painéis: celular sobe de baixo com alça; tablet é diálogo centralizado ou menu sob o botão; fundo
  escurecido a 72%.

**Textura de mata** — só para marcar o que é importante: cartão do usuário, botões de criar (Nova
conversa, Nova meta, Conectar banco), faixas de classe e topo do onboarding. O tucano e as folhas
ilustradas saíram do app.

**Formatos** — mesmas funções nos três; muda o arranjo, nunca a função.

- Celular (393): barra superior 60, barra inferior 84 (Conversar amarelo no centro), margem 16 e 16
  entre cards; formulários com fechar no topo e ação fixa embaixo; tabelas viram cartões.
- Tablet (820 / 1180 no Relatório): trilho de 88 (logo, 7 destinos, a turma e o avatar), margem 28 e
  20 entre cards, Conversar flutuante; formulários com trilha, título, card e ações à direita;
  onboarding com topo de mata e card de 600.

**Composição** — cards da mesma linha com a mesma altura; nada de card grande com pouca informação;
barras e textos alinhados em colunas; valores em R$ 1.234,56, datas brasileiras e variação com sinal
e seta. Raios: 999 pílulas, 24 cards, 20 blocos internos e opções, 16 estatísticas, 14 avisos e
faixas, 12 ícones.

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
| `Perfil-Investidor-P1`, `-P2`, `-P4`, `-P5`, `-P6`, `-Resultado` · questionário completo | M T      | `(onboarding)/investor-profile` (as 6 perguntas e o resultado)    |
| `Malvo-Autorizar`, `-Conectando`, `-Sucesso`, `-Erro` · conexão pelo Malvo               | M T      | `(onboarding)/connect/[bankId]`; no app `/malvo/[bankId]`         |
| `Termos`, `Privacidade`                                                                  | M T      | `/terms`, `/privacy`                                              |

### App

| Tela                                                                                                | Formatos | Rota no app                                                                           |
| --------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------- |
| `Inicio` (M), `Painel` (T), `Painel-Historico` (D), `Main` (D)                                      | M T D    | `/` (`(tabs)/(home)/index`)                                                           |
| `Assistentes`                                                                                       | M        | `/assistants`                                                                         |
| `Conversa`, `Conversas` (D), `Historico-Conversas`, `Escolher-Agente`                               | M T D    | `/chat`, `/chat/[conversationId]`                                                     |
| `Conversa-Menu`, `-Apagar`, `-Anexar`, `-Anexo-Previa`, `-Gravando`, `-Transcrevendo`               | M T      | estados de `/chat/[conversationId]`                                                   |
| `Gastos`                                                                                            | M T D    | `/spending`                                                                           |
| `Lancamentos` · todos os lançamentos                                                                | M T      | `/spending/transactions`                                                              |
| `Lancamentos-Categoria` · lançamentos de uma categoria                                              | M T      | `/spending/category/[categoryId]`                                                     |
| `Lancamento-Detalhe` · detalhe do lançamento                                                        | M T      | `/spending/[transactionId]`                                                           |
| `Lancamentos-Estados` · filtro vazio, vazio e erro                                                  | M T      | estados de `/spending/transactions`                                                   |
| `Assinaturas`                                                                                       | M T D    | `/spending/subscriptions`                                                             |
| `Relatorio` (T em paisagem)                                                                         | M T D    | `/reports`                                                                            |
| `Relatorio-Linha-do-Tempo`                                                                          | M T      | `/reports/timeline`                                                                   |
| `Alertas`                                                                                           | M T D    | `/alerts`                                                                             |
| `Novo-Teto`                                                                                         | M T D    | `/new-budget` (modal)                                                                 |
| `Novo-Alerta-Preco`                                                                                 | M T D    | `/new-price-alert` (modal)                                                            |
| `Investimentos`                                                                                     | M T D    | `/investments`                                                                        |
| `Ativo`, `Ativo-Tesouro-Selic`, `-CDB`, `-BOVA11`, `-HGLG11`, `-Bitcoin`                            | M T D    | `/investments/asset/[ticker]`                                                         |
| `Ativo-Comparar`, `-Comparar-Ibovespa`, `-Preco-Sem-Ajuste`, `-Mais-Detalhes`, `-Eventos`, `-Risco` | M T      | estados de `/investments/asset/[ticker]`; `/details`, `/events`                       |
| `Adicionar-Investimento`                                                                            | M T D    | `/new-manual-asset` (modal)                                                           |
| `Posicoes`, `Posicoes-Estados`                                                                      | M T      | `/investments/positions`                                                              |
| `Simulador`, `Simulador-Objetivo`, `Simulador-Corte`                                                | M T D    | `/investments/simulator/retirement`, `/goal`, `/cut-expense`                          |
| `Simulacoes`, `Simulacoes-Estados`                                                                  | M T      | `/investments/simulator/saved`                                                        |
| `Metas`, `Meta-Detalhe`, `Meta-Nova`, `Metas-Estados`                                               | M T      | `/goals`, `/goals/[goalId]`, `/new-goal` (`?from=simulation`, `?goalId=` para editar) |
| `Bem-Imovel`, `Bem-Veiculo`, `Bem-Imovel-Detalhe`, `Bem-Veiculo-Detalhe`                            | M T      | `/new-property`, `/new-vehicle`, `/investments/properties/[propertyId]`               |
| `Meu-Perfil`                                                                                        | M T D    | `/account`                                                                            |
| `Editar-Perfil`, `Editar-Perfil-Email`                                                              | M T      | `/account/profile`                                                                    |
| `Perfil-Refazer`, `Perfil-Refazer-Resultado`                                                        | M T      | `/account/investor-profile`                                                           |
| `Planos`                                                                                            | M T      | `/account/plan`                                                                       |
| `Malvo-Renovar` · renovar autorização do banco                                                      | M T      | `/malvo/[bankId]?mode=renew`                                                          |
| `Inicio-Novo`, `Gastos-Novo`, `Investimentos-Novo` · usuário sem banco                              | M T      | —                                                                                     |

Rotas marcadas com "—" ainda não existem ou existem sem seguir a tela nova do design.
