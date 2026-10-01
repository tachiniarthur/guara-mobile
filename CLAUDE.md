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
- **Open Finance:** Malvo, via widget web dentro do app (WebView).
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
| Gráficos           | Victory Native (XL) + Skia                                                                                          |
| Listas longas      | `@shopify/flash-list`                                                                                               |
| Armazenamento      | `expo-sqlite/kv-store` (cache/preferências) e `expo-secure-store` (sessão), atrás de `src/lib/storage.ts`           |
| Login Google       | OAuth do Supabase no navegador (`expo-web-browser` + `expo-auth-session`)                                           |
| Login Apple        | `expo-apple-authentication` (só iOS)                                                                                |
| Datas              | date-fns + date-fns-tz                                                                                              |
| Ícones             | lucide-react-native                                                                                                 |
| Markdown no chat   | react-native-marked (JS puro)                                                                                       |
| Testes             | jest-expo + @testing-library/react-native 13 (pacotes puros: Jest + @swc/jest)                                      |
| Qualidade          | ESLint 9 (flat, `@guara/eslint-config`) + Prettier + Husky + lint-staged                                            |
| Monitoramento      | adiado (Sentry na migração)                                                                                         |

### Estrutura

```
apps/mobile/
  app/                 SOMENTE rotas (Expo Router). Cada arquivo só importa e exporta a tela.
  src/features/<x>/    um diretório por domínio:
    screens/           telas (hoje placeholders)
    components/ hooks/ api/ schemas/ store/
    index.ts           API pública da feature (importe sempre de '@/features/<x>')
  src/components/      compartilhados: ui/, charts/, feedback/, layout/ (PlaceholderScreen, ResponsiveContainer)
  src/lib/             infraestrutura: env, runtime, supabase, auth-oauth, api-client, sse,
                       query-client, storage, notifications, logger
  src/providers/       AppProviders, QueryProvider, AuthProvider, ThemeProvider
  src/hooks/ src/stores/ src/theme/ src/constants/ src/types/
packages/
  types/               tipos de domínio e DTOs (só tipos)
  ui-tokens/           tokens de design (tema escuro)
  utils/               funções puras e testadas (money, date, percent, empty)
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
  `@supabase/supabase-js`, `expo-auth-session`, `expo-apple-authentication`, `expo-web-browser` nem
  `expo-notifications` — o ESLint bloqueia (`no-restricted-imports`). Use `src/lib/*`.
- **Chamadas à API:** `api.get/post…` de `src/lib/api-client.ts`; query keys por feature em
  `src/features/<x>/api`; hooks TanStack em `src/features/<x>/hooks`.
- **Modais:** arquivos em `app/(app)/(modals)/` são apresentados como modal automaticamente.
- **Env:** novas variáveis entram em `.env.example` e no schema zod de `src/lib/env.ts`, lidas com
  `process.env.EXPO_PUBLIC_X` estático.
- **Logs:** `logger` de `src/lib/logger.ts`; mensagem estática, dados só no `context` (é redigido).
- **Estilo:** classes NativeWind com os tokens (`bg-background`, `text-foreground-muted`,
  `rounded-lg`…). Cores cruas só onde for obrigatório objeto de estilo (navegação, gráficos).
- **Alias:** `@/` → `apps/mobile/src`, `@assets/` → `apps/mobile/assets`.
- **Sessão simulada:** `devSession.status` em `src/providers/AuthProvider.tsx`
  (`signedOut` → (auth), `onboarding` → (onboarding), `signedIn` → (app)).

### Comandos

```bash
pnpm dev          # expo start (Expo Go)
pnpm typecheck    # gera tipos de rotas + tsc em todos os pacotes
pnpm lint
pnpm test
pnpm format
cd apps/mobile && npx expo-doctor && npx expo install --check
```

Antes de dar uma tarefa por concluída: `pnpm typecheck && pnpm lint && pnpm test`.

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
