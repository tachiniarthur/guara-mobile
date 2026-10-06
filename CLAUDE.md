# Guará — guia para sessões do Claude Code

App de finanças pessoais para o Brasil: contas e cartões via Open Finance, investimentos, metas,
tetos de gasto, alertas e assistentes de IA. Este repositório é um monorepo; hoje só existe o app
mobile (`apps/mobile`). Web (Next.js), API (NestJS) e workers entram depois em `apps/*`, sem
reorganizar nada.

> Comunicação com o usuário: **sempre em português (pt-BR)**. Código, pastas e nomes de arquivos em
> **inglês**. Textos exibidos no app em **pt-BR**.

## Fase atual: Expo Go

O app roda **exclusivamente no Expo Go** (iPhone/iPad e Android físicos, emulador Android). Regra de ouro:

- Só instale pacotes **JavaScript puro** ou cujo código nativo **já venha no Expo Go** (módulos
  `expo-*` do SDK e as libs de terceiros listadas em https://docs.expo.dev/versions/latest/ — a página
  de cada uma mostra o selo "Included in Expo Go").
- Pacote nativo fora do Expo Go → **não instale**; registre na seção
  [Migração para development build](#migração-para-development-build).
- **Não instale `expo-dev-client`** (faz o `expo start` abrir em modo dev build).
- Use `npx expo install <pkg>` (dentro de `apps/mobile`) para tudo ligado ao Expo/nativo;
  `pnpm add` só para JS puro. Confira com `npx expo install --check` e `npx expo-doctor`.
- O Expo muda a cada SDK — não confie em memória. Consulte a doc da versão do `expo` em
  `apps/mobile/package.json`: `https://docs.expo.dev/versions/v<major>.0.0/` e
  https://docs.expo.dev/llms.txt.

## Produto (contexto para decisões)

- **Back-end:** uma API NestJS. O app só fala com ela. **Exceção:** autenticação via Supabase Auth
  (Google, Apple, e-mail) com `@supabase/supabase-js`.
- **IA:** API do Claude chamada **somente pela API NestJS**. O app recebe o chat por **SSE** da nossa API.
- **Open Finance:** Malvo, via widget web dentro do app (WebView). Nos textos do app, sempre "Malvo".
- **Cotações:** Brapi, sempre via nossa API.
- **Notificações:** push (Expo Notifications) e e-mail (back-end). No Expo Go só notificações locais.
- **Nenhum segredo no app.** Claude, Malvo, Brapi e a service role do Supabase ficam só na API.
  `EXPO_PUBLIC_*` é público (vai no bundle).
- **Assistentes de IA** (avatar em `assets/images/assistants/`): Capivara (coordenador/roteador),
  Tamanduá (gastos), Pacu (investimentos e simulações), Caramelo (alertas de preço), Quero-quero
  (compras fora do padrão), Onça (metas). Metadados em `src/features/chat/assistants`.
- **Visual:** tema escuro, textos neutros. Fauna brasileira **só** nos assistentes e no chat.
  Logo: lobo-guará.

### Regras inegociáveis

1. **Dinheiro sempre em centavos inteiros** (`Cents` de `@guara/types`), nunca `float`.
   Crie com `cents()`, some com `sumCents()`/`addCents()`, formate com `formatCents()` e leia input com
   `parseToCents()` — tudo em `@guara/utils`. Parcelas: `splitCents()`.
2. **Formatação pt-BR** (`R$ 1.234,56`) e **fuso `America/Sao_Paulo`** em toda data exibida
   (`formatDate`, `formatDateTime`, `toISODate`… de `@guara/utils`). Nunca use o fuso do aparelho.
3. **Dado ausente mostra "—"** (`EMPTY`/`orEmpty()` de `@guara/utils`). Nunca invente valores.
4. **Paridade celular/tablet:** mesmas funcionalidades; só o layout muda (`useBreakpoint`,
   `ResponsiveContainer`).

## Design

O design oficial está em [`docs/design/`](docs/design/README.md): uma tela por `.dc.html`
(`Escuro-Mobile-*`, `Escuro-Tablet-*`), os fundamentos em `screens/Fundamentos.dc.html` e o índice
tela → rota no `README.md`.

- **Fonte da verdade visual:** espaçamentos, tamanhos, textos, estados e comportamento vêm do design.
- **Antes de codar uma tela**, leia os `.dc.html` de celular **e** de tablet dela (e os de estados,
  quando houver).
- **Números do design são exemplos.** Os dados vêm de `data.ts`/API; derivados são calculados.
- **Em conflito**, vale o design. Se o conflito for de regra de negócio (cálculo, limite, fluxo),
  pergunte antes.
- Tela nova implementada → atualize a coluna "Rota no app" do índice.

## Arquitetura

| Tema               | Escolha                                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| Monorepo           | pnpm workspaces + Turborepo (`nodeLinker: hoisted` em `pnpm-workspace.yaml`)                                        |
| App                | Expo SDK 57 (RN 0.86, React 19.2), TypeScript strict, New Architecture (obrigatória desde o SDK 55), React Compiler |
| Execução local     | Expo Go                                                                                                             |
| Navegação          | Expo Router, typed routes, `Stack.Protected` para auth                                                              |
| Estado do servidor | TanStack Query (`src/lib/query-client.ts`)                                                                          |
| Estado do cliente  | Zustand (`src/stores`, `src/features/*/store`)                                                                      |
| Formulários        | react-hook-form + zod (`src/features/*/schemas`)                                                                    |
| Estilo             | NativeWind 4 + Tailwind 3, tokens de `@guara/ui-tokens` (`tailwind.config.js`)                                      |
| Gráficos           | SVG próprio (`react-native-svg`) com a geometria do design, em `src/components/charts`; globo interativo em Skia    |
| Listas longas      | `@shopify/flash-list`                                                                                               |
| Armazenamento      | `expo-sqlite/kv-store` (cache/preferências) e `expo-secure-store` (sessão), atrás de `src/lib/storage.ts`           |
| Login Google       | OAuth do Supabase no navegador (`expo-web-browser` + `expo-auth-session`)                                           |
| Login Apple        | `expo-apple-authentication` (só iOS)                                                                                |
| Datas              | date-fns + date-fns-tz                                                                                              |
| Ícones             | `Icon` (`src/components/ui/Icon.tsx`): traços 24×24 copiados do design, sobre `react-native-svg`                    |
| Markdown no chat   | react-native-marked (JS puro)                                                                                       |
| Testes             | jest-expo + @testing-library/react-native 13 (pacotes puros: Jest + @swc/jest)                                      |
| Qualidade          | ESLint 9 (flat, `@guara/eslint-config`) + Prettier + Husky + lint-staged                                            |
| Monitoramento      | adiado (Sentry na migração)                                                                                         |

### Estrutura

```
apps/mobile/
  app/                 SOMENTE rotas (Expo Router). Cada arquivo só importa e exporta a tela.
  src/features/<x>/    um diretório por domínio:
    screens/           telas
    components/        peças da feature (cards, linhas, gráficos montados)
    data.ts            dados estáticos do design (até a API existir) — dinheiro em Cents
    lib/               cálculos puros e testados da feature (ex.: simulator/lib/finance.ts)
    index.ts           API pública da feature (importe sempre de '@/features/<x>')
  src/components/      compartilhados: ui/ (primitivos e controles), feedback/, layout/, charts/,
                       illustrations/ (selva, contornos, textura Mata, bandeira), brand/ (logo)
  src/navigation/      barra inferior (celular), trilho lateral (tablet), menu da conta, destinos
  src/dev/             ferramentas só de desenvolvimento (catálogo de UI em /ui)
  src/lib/             infraestrutura: env, runtime, supabase, auth-oauth, api (transporte), sse,
                       query-client, storage, notifications, media, logger, cn, haptics
  src/providers/       AppProviders, QueryProvider, AuthProvider, ThemeProvider
  src/hooks/ src/stores/ src/theme/ src/constants/ src/types/
packages/
  types/               schemas zod de domínio + tipos inferidos + contrato da API (src/api)
  ui-tokens/           tokens de design (tema escuro)
  utils/               funções puras e testadas (money, date, percent, decimal, empty, text)
  tsconfig/            base.json, react-native.json
  eslint-config/       base (TS puro) e expo (app)
```

### Convenções

- **Tela nova:** crie `src/features/<feature>/screens/<Nome>Screen.tsx`, exporte em
  `screens/index.ts` e crie a rota fina em `app/`:
  ```tsx
  import { BudgetsScreen } from '@/features/budgets';
  export default BudgetsScreen;
  ```
  Depois acrescente a URL em `apps/mobile/__tests__/routes.test.tsx` (o teste abre todas as rotas).
- **Infra isolada:** features **não** importam `expo-sqlite`, `expo-secure-store`,
  `@supabase/supabase-js`, `expo-auth-session`, `expo-apple-authentication`, `expo-web-browser`,
  `expo-notifications` nem `expo-image-picker` — o ESLint bloqueia (`no-restricted-imports`). Use `src/lib/*`.
- **Dados das telas:** hoje vêm de `src/features/<x>/data.ts`, fiéis ao artefato de design. Valores
  derivados (totais, percentuais, simulações) são **calculados** a partir deles, nunca copiados.
  Detalhes em [Dados: hoje estáticos, amanhã a API](#dados-hoje-estáticos-amanhã-a-api).
- **Modais:** arquivos em `app/(app)/(modals)/` são apresentados como modal automaticamente.
- **Env:** novas variáveis entram em `.env.example` e no schema zod de `src/lib/env.ts`, lidas com
  `process.env.EXPO_PUBLIC_X` estático.
- **Logs:** `logger` de `src/lib/logger.ts`; mensagem estática, dados só no `context` (é redigido).
- **Estilo:** classes NativeWind com os tokens (`bg-background`, `text-foreground-muted`,
  `rounded-lg`…). Cores cruas só onde for obrigatório objeto de estilo (navegação, gráficos).
- **Alias:** `@/` → `apps/mobile/src`, `@assets/` → `apps/mobile/assets`.
- **Sessão simulada:** `devSession.status` em `src/providers/AuthProvider.tsx`
  (`signedOut` → (auth), `onboarding` → (onboarding), `signedIn` → (app)).

### Chat em tablets

- **Uma largura só:** toda coluna de chat (histórico ou conversa aberta) usa `ChatSideColumn`, com
  `navigationSize.chatPanelWidth` (360 dp). Não crie painéis de chat com largura própria.
- **Tablet largo** (`useChatDocked()`: janela ≥ `chatPanelMinWindow`, 1100 dp): o `ChatPanel`
  fica à direita de todas as páginas (`app/(app)/_layout.tsx`); o botão "Conversar" reabre o painel.
  Nas rotas `/chat`, o histórico vira coluna fixa à esquerda da conversa.
- **Tablet em pé e celular:** conversa e histórico abrem como página inteira.
- **Estado compartilhado:** mensagens, destinatário (@) e painel ficam em `useChatStore`
  (`src/features/chat/store.ts`). Uma página pode abrir o chat sobre si com `setContext` (ex.:
  Relatório com o Tamanduá) e deve limpar ao sair.

### Componentes base (`src/components/`)

- **Catálogo vivo:** abra `/ui` no app em desenvolvimento. Componente novo ou variante nova →
  acrescente ao catálogo (`src/dev/ui-catalog`).
- **Tipografia:** Fraunces (títulos e números grandes, `serif`) e Figtree (o resto), carregadas em
  `app/_layout.tsx`. Todo texto passa por `Text` (variantes `hero/display/title/section/heading/
subtitle/body/lead/label/caption/micro`, ou `size`/`weight`/`serif` explícitos) e `Span` para
  trechos inline. `Text` aplica a escala de "Tamanho do texto" (`useUiPreferences`).
- **Valores:** dinheiro com `MoneyText` (`Cents | null`), percentuais com `PercentText`, variação
  com `DeltaBadge`, ausência com `EmptyValue`. Nunca formate valores na mão.
- **Blocos prontos:** `SectionCard` (card com título Fraunces), `DataRow` (linha de `dl`),
  `DataTable` (tabela do tablet, colunas com largura fixa), `InfoTip` (ⓘ com explicação),
  `Slider`, `SegmentedControl`, `UnderlineTabs`, `Chip`, `ResponsiveGrid`, `PageHeader`/`Breadcrumb`
  (tablet) e `TopBar` (celular), `FormScreen` (formulários nos dois tamanhos).
- **Variantes:** `cva` + `cn()` (`src/lib/cn.ts`, tailwind-merge v2 configurado com nossos tokens).
  Classes sempre escritas por extenso (o Tailwind não enxerga classes montadas dinamicamente).
- **Cores em props** (`Icon`, SVG, ActivityIndicator): use `toneColor`/tokens de
  `@guara/ui-tokens`, nunca hex no componente. Contraste AA é testado em `ui-tokens`.
- **Toque e acessibilidade:** `hitSlopFor(size)` garante 44×44; `accessibilityRole/State` em todo
  controle; `haptics` (`src/lib/haptics.ts`) em ações principais e seleção.
- **Feedback:** `toast.success/error/info()` funciona de qualquer lugar; `Sheet` e `ConfirmDialog`
  são controlados por `open`.

### Armadilhas conhecidas

- **NativeWind + classe nova:** se uma classe recém-criada não aparecer no app, reinicie o Metro com
  `--clear` e force o reload do Expo Go (o deep link não recarrega o bundle).
- **Texto cortado no Android:** em linhas curtas (badges, chips) use `numberOfLines={1}` — o
  Android às vezes quebra a linha mesmo com largura sobrando.
- **`@gorhom/bottom-sheet`:** nunca chame `dismiss()` num modal que não foi apresentado (trava em
  `DISMISSING` e ignora `present()` depois). O `Sheet` já trata isso.
- **Testes:** `expo-router/testing-library` registra o próprio mock do Reanimated (sem
  `useReducedMotion` nem `ReducedMotionConfig`) — prefira `ReduceMotion.System` nas animações e
  confira `typeof ReducedMotionConfig === 'function'` antes de renderizá-lo. Use os matchers do RNTL 13
  (`toBeChecked`, `toBeSelected`, `toBeBusy`); `jest-native` está descontinuado.
- **Testes de hooks:** use `createWrapper()` de `__tests__/utils/query.tsx` — o `QueryClient` de
  teste tem `gcTime: Infinity` também nas **mutações**; com o padrão (5 min) o Jest não encerra o
  worker ("failed to exit gracefully").
- **`renderRouter` e timers:** nos testes de rota os retries do TanStack (1 s + 2 s) andam em tempo
  simulado; em `renderHook` com o `createQueryClient()` real eles levam tempo de verdade.
- **Raio + fundo dinâmico no Android:** um `View` que ganha `bg-*` depois de montado pode perder o
  `rounded-*` (cantos retos). Em pílulas que trocam de fundo, passe também `style={{ borderRadius }}`.
- **Tabelas/linhas com conteúdo largo:** o Yoga deixa uma célula larga empurrar as vizinhas mesmo
  com `flex`. Use larguras fixas (como o `DataTable`) quando as colunas precisam alinhar.
- **Worklets (Reanimated/Skia):** dentro de `useDerivedValue`/gestos, nada de `.map`/`.forEach` com
  callback nem funções auxiliares locais — viram "Remote Function" e quebram no aparelho (os testes
  não pegam). Use laços simples ou funções de módulo com `'worklet'` (veja `InteractiveGlobe`). Leia e
  escreva shared values com `.get()`/`.set()` (o React Compiler recusa `.value =`) e use
  `scheduleOnRN` (react-native-worklets) no lugar de `runOnJS`.
- **Gesto dentro de página que rola:** um dedo só assume depois de movimento horizontal
  (`activeOffsetX` + `failOffsetY`); deixe o vertical para a rolagem e ofereça dois dedos.
- **Gestos:** prefira `react-native-gesture-handler` (`Gesture.Pan().runOnJS(true)`) a
  `PanResponder` com refs — o React Compiler recusa ler refs durante o render (veja `Slider`).
- **FlashList nos testes:** `__tests__/setup.ts` troca o `FlashList` por uma `ScrollView` que
  renderiza todos os itens (sem medir células). No aparelho, células encostadas desenham emendas
  finas por causa de posições fracionárias: um card montado em fatias (veja `LedgerFeed`) estende o
  fundo 1 dp para baixo.
- **Linhas de `dl` com valor longo:** rótulo com `flexShrink: 0` e valor com `flex: 1, minWidth: 0`
  (por estilo, não classe); códigos sem espaço ("LOJAELETRON*ONLINE SP") quebram no meio da palavra
  no Android — insira `\u200B` onde a quebra pode acontecer.
- **Código só de dev:** carregue com `__DEV__ ? require(...) : null` para o Metro remover do bundle
  de produção (veja `app/(dev)/ui.tsx`).

### Comandos

```bash
pnpm dev          # expo start (Expo Go) — emulador Android / rede local
pnpm dev:tunnel   # expo start --tunnel — aparelho físico (padrão no WSL2 em NAT)
pnpm typecheck    # gera tipos de rotas + tsc em todos os pacotes
pnpm lint
pnpm test
pnpm format
cd apps/mobile && npx expo-doctor && npx expo install --check
```

Antes de dar uma tarefa por concluída: `pnpm typecheck && pnpm lint && pnpm test`.

### Ambiente de desenvolvimento (WSL2)

- O desenvolvimento roda em **Ubuntu no WSL2 com rede NAT**; o Android SDK e o emulador ficam no
  **Windows** (`tools/wsl/setup-android-shim.sh` faz a ponte).
- Aparelho físico usa **`pnpm dev:tunnel`** (`@expo/ngrok`, devDependency do app).
- **⚠️ URL da API com túnel:** o túnel leva o _app_ até o Metro, mas **não** expõe uma API em
  `localhost` no WSL. Quando a API NestJS existir, `EXPO_PUBLIC_API_URL` deve apontar para uma URL
  acessível pelo celular (túnel próprio da API ou ambiente publicado). O emulador Android continua
  usando `http://10.0.2.2:3000`.

### React Compiler

O **React Compiler está ligado** (`experiments.reactCompiler`, padrão do SDK 57): ele memoiza
componentes e hooks automaticamente.

- **Não** use `useMemo`, `useCallback` ou `memo` manualmente sem um motivo **medido** (profiler).
- Em bugs estranhos de renderização (estado "congelado", efeito que não dispara), **suspeite do
  compilador primeiro**: confira se o código respeita as regras de React (sem mutar props/estado,
  sem ler refs durante o render) e, para isolar, use a diretiva `'use no memo'` no componente.

## Dados: hoje estáticos, amanhã a API

As telas são construídas **sem a API NestJS**. Cada feature guarda os dados do design em
`data.ts` (tipados, dinheiro em `Cents`) e calcula o que é derivado na hora (ex.: as simulações em
`src/features/simulator/lib`, os recortes de período em `src/features/investments/lib`). O contrato
tipado e o transporte HTTP já existem e serão usados quando a API chegar:

```
@guara/types (schema zod)  →  @guara/types/src/api (endpoint)  →  src/lib/api (httpTransport)
                       src/features/<x>/api (hooks TanStack, quando houver API)  ←──┘
```

- **Nunca invente valores:** períodos ou campos que o design não traz mostram "—" ou um estado vazio
  ("Ainda não temos 5 anos de histórico deste ativo.").
- **Ao trocar para a API:** troque a leitura de `data.ts` por um hook TanStack da feature e mantenha
  os mesmos tipos/formatos; os cálculos de `lib/` continuam valendo.

### Caminho para um dado novo

1. **Schema** em `packages/types/src/<dominio>.ts`: exporte `XSchema` e `type X = z.infer<…>`.
   Sem `transform`/`default` (o formato no fio e o parseado precisam ser iguais).
2. **Endpoint** em `packages/types/src/api/endpoints/<grupo>.ts` (nome estável `'dominio.acao'`,
   método, caminho `/v1/...` com `:params`, `params`/`query`/`body`/`response`). Streaming (SSE)
   fica em `api/stream.ts`. O teste do contrato confere placeholders × params.
3. **Hook** em `src/features/<x>/api/`: query keys em `keys.ts`, leitura em `queries.ts`, mutação
   em `mutations.ts` (otimista com rollback onde a interação pede resposta imediata). Exporte pelo
   `index.ts` da feature. `staleTime` por tipo em `STALE_TIME` (`src/lib/query-client.ts`).

### Convenções dos contratos

- **Dinheiro:** `Cents` inteiro (`CentsSchema`, `PositiveCentsSchema`, `NonNegativeCentsSchema`).
  Lançamentos têm valor positivo + `direction: 'in' | 'out'`.
- **Percentuais:** pontos percentuais (`12.5` = 12,5%), como `formatPercent`. Participações
  (carteira, alocação) com 2 casas e soma exata 100 — use `sharesOf()` de `@guara/utils`.
- **Quantidades fracionárias** (cotas, cripto) e valores por unidade abaixo de 1 centavo
  (proventos): `DecimalString` (`"0.0315"`). Conta só com `multiplyCentsByDecimal`,
  `multiplyReaisByDecimal`, `divideCentsByDecimal`, `addDecimals` (`@guara/utils`, BigInt).
- **Datas:** `IsoDateTime` (UTC com `Z`), `IsoDate` (dia de São Paulo), `YearMonth`.
- **IDs:** branded por entidade (`BudgetId`…). Requisições aceitam string comum; respostas
  parseadas trazem o brand.
- **Ausente é `null`** (nunca `0` nem `""`); a UI mostra "—". Ex.: usuário sem banco tem
  `consolidatedBalance: null`, não `0`.
- **Categorias:** `categoryId` é o que o usuário vê e o que tem teto ("Alimentação" = `food`);
  `subcategoryId` (opcional, sempre dentro da categoria) é o recorte de "Onde foi"
  (`restaurants`, `groceries`, `bakery`). Rótulos em `src/features/spending/categories.ts`.
- **Enums em inglês**; rótulos pt-BR ficam no app. Mensagens de erro (`ApiError.message`) e
  textos de notificação vêm em pt-BR da API.
- **Erros:** todo erro de transporte vira `ApiError` (`code`, `message` pt-BR, `status`).
  O TanStack só repete `network`, `internal` e `unavailable`.
- **Validação de respostas:** em dev/testes, `schema.parse` (lança `ContractViolationError`);
  em produção, `safeParse` + `logger.error`, sem derrubar o app.

## Versões fixadas de propósito

**Regra:** não atualize nenhum pacote desta tabela sem checar o motivo. Ao atualizar (ou ao remover
a trava), **atualize a tabela no mesmo commit**. Pacotes do Expo/React Native (react, react-native,
reanimated, skia, flash-list, `expo-*`…) são controlados pelo SDK: mude-os só com
`npx expo install --fix` / upgrade de SDK, nunca à mão.

| Pacote                                                           | Fixado em                       | Motivo                                                                                                                                                                         | Reavaliar quando                                           |
| ---------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `eslint` (+ `@eslint/js`)                                        | 9.x                             | `eslint-plugin-react` (usado pelo `eslint-config-expo`) ainda não suporta ESLint 10. O lint-staged usa `--flag v10_config_lookup_from_file` para achar a config de cada pacote | `eslint-plugin-react` suportar 10                          |
| `@testing-library/react-native`                                  | 13.3.x                          | `renderRouter` do `expo-router/testing-library` (SDK 57) é síncrono e não funciona com o `render` assíncrono da v14                                                            | expo-router suportar RNTL 14                               |
| `react-test-renderer`                                            | 19.2.3                          | Exigido pelo RNTL 13; precisa ser idêntico ao `react`                                                                                                                          | junto com RNTL ou com o React do SDK                       |
| `nativewind` / `tailwindcss`                                     | 4.2.x / 3.4.x                   | NativeWind 5 ainda em RC; NativeWind 4 (via `react-native-css-interop`) exige Tailwind 3                                                                                       | NativeWind 5 estável                                       |
| `prettier-plugin-tailwindcss`                                    | 0.8.x, sem `tailwindStylesheet` | A opção `tailwindStylesheet` é só para Tailwind 4; com ela o plugin ignora nosso `tailwind.config.js` e ordena as classes errado                                               | migração para Tailwind 4                                   |
| `react-dom`                                                      | 19.2.3                          | Não usamos web, mas o `@expo/metro-runtime` pede `react-dom` como peer; sem fixar, o pnpm instala a última (19.3) que exige React 19.3, diferente do React do SDK              | upgrade de SDK (acompanhar o `react`)                      |
| `@react-native/metro-config` (override no `pnpm-workspace.yaml`) | 0.86.3                          | O pnpm resolvia 0.87.x como peer do `@react-native/community-cli-plugin@0.86.3`, misturando versões de RN                                                                      | upgrade de SDK (acompanhar o `react-native`)               |
| `jest` / `@types/jest`                                           | 29.x                            | `jest-expo` 57 usa Jest 29 (Jest 30 duplicaria o runner no monorepo)                                                                                                           | `jest-expo` migrar para Jest 30                            |
| `typescript`                                                     | ~6.0.x                          | Versão do template do SDK 57. TS 6 depreca `baseUrl` e muda o default de `types` para `[]` (por isso cada tsconfig lista `types`)                                              | upgrade de SDK                                             |
| `jiti` (em `apps/mobile`)                                        | 2.x                             | `tailwind.config.js` carrega os tokens TS de `@guara/ui-tokens` com `createJiti` (API da v2). A raiz tem jiti 1.x, dependência do Tailwind 3                                   | migração para Tailwind 4                                   |
| `@expo/ngrok`                                                    | ^4.1.x                          | O Expo CLI do SDK 57 exige `@expo/ngrok@^4.1.0` para o `--tunnel`                                                                                                              | Expo CLI mudar o requisito                                 |
| `@types/node`                                                    | 24.x                            | Acompanha o Node 24 LTS do `.nvmrc`                                                                                                                                            | troca de Node LTS                                          |
| `globals` (`minimumReleaseAgeExclude`)                           | 17.13.0                         | A política de supply-chain do pnpm 12 bloqueia releases muito recentes; essa versão foi liberada explicitamente                                                                | quando a versão tiver idade suficiente (remover a exceção) |

## Migração para development build

Quando o projeto precisar de push remoto, login nativo do Google ou distribuição via TestFlight:

1. **Contas e ferramentas:** conta Apple Developer (iOS), conta Expo/EAS, `npm i -g eas-cli`, JDK 17
   e Android SDK para build local.
2. **`expo-dev-client`** (`npx expo install expo-dev-client`) e scripts `dev` → `expo start --dev-client`.
3. **`eas.json`** com perfis `development` (dev client, distribuição interna), `preview` e
   `production`; `APP_VARIANT` em cada perfil (o `app.config.ts` já tem as três variantes e os
   identificadores `br.com.guara.app[.dev|.preview]`).
4. **Push remoto:** `eas init` → `projectId` em `extra.eas.projectId`/`EXPO_PUBLIC_EAS_PROJECT_ID`;
   implementar `getExpoPushTokenAsync({ projectId })` em `src/lib/notifications.ts`; ícone de
   notificação Android (96×96 branco) no plugin `expo-notifications`.
5. **`react-native-mmkv`** (+ `react-native-nitro-modules`): trocar a implementação de `kvStorage` em
   `src/lib/storage.ts` (a interface `KeyValueStorage` não muda).
6. **`@react-native-google-signin/google-signin`**: substituir o OAuth por navegador em
   `src/lib/auth-oauth.ts` por `signInWithIdToken`; criar `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` e
   `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`.
7. **`@sentry/react-native`**: `src/lib/sentry.ts`, plugin no `app.config.ts`,
   `EXPO_PUBLIC_SENTRY_DSN`; ligar o `logger.error` ao Sentry (há um TODO).
8. **`SplashScreen.setOptions`** (fade/duração) volta a funcionar — não existe no Expo Go.
9. Pacotes recusados neste setup por exigirem build nativa: `expo-dev-client`, `react-native-mmkv`,
   `@react-native-google-signin/google-signin`, `@sentry/react-native`.
