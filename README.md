# Guará

App de finanças pessoais para o Brasil — contas e cartões via Open Finance, investimentos, metas,
tetos de gasto, alertas e assistentes de IA.

Monorepo **pnpm + Turborepo**. Hoje contém só o app mobile (**Expo SDK 57 + Expo Router**), testado
pelo **Expo Go**. Regras de arquitetura e convenções: veja [`CLAUDE.md`](./CLAUDE.md).

## Pré-requisitos (Ubuntu)

| Ferramenta                      | Obrigatório? | Como instalar                                                                                                                                                                                               |
| ------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node.js 24 LTS (via nvm)        | sim          | `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh \| bash` e depois `nvm install` (lê `.nvmrc`)                                                                                     |
| pnpm                            | sim          | `corepack enable` (a versão vem do `packageManager` do `package.json`)                                                                                                                                      |
| Git                             | sim          | `sudo apt install git`                                                                                                                                                                                      |
| GitHub CLI (`gh`)               | sim          | Sem sudo: baixe o `gh_<versão>_linux_amd64.tar.gz` oficial em https://github.com/cli/cli/releases, confira o SHA-256 com o `checksums.txt`, copie `bin/gh` para `~/.local/bin` e rode `gh auth login --web` |
| Watchman                        | recomendado  | `sudo apt install watchman`                                                                                                                                                                                 |
| Android Studio + SDK + emulador | recomendado  | Baixe em https://developer.android.com/studio (ou `sudo snap install android-studio --classic`). No _Device Manager_, crie um emulador de **celular** e um de **tablet** (ex.: Pixel Tablet).               |
| `libasound2t64`                 | opcional     | `sudo apt install libasound2t64` — necessário para abrir o React Native DevTools (tecla `j`)                                                                                                                |

Com o Android Studio instalado, adicione ao `~/.bashrc` (ou `~/.zshrc`):

```bash
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH"
```

**Não são necessários nesta fase:** JDK, Xcode, Mac, conta Apple Developer e EAS CLI.

### Usando WSL2 (Windows)

- **Emulador:** se o Android Studio estiver instalado no **Windows**, rode uma vez
  `bash tools/wsl/setup-android-shim.sh` e adicione as duas linhas que ele imprime ao seu shell.
  Assim o `pnpm dev` / `npx expo start --android` no WSL controla o `adb.exe`/`emulator.exe` do Windows.
- **Aparelho físico:** no modo de rede padrão do WSL (NAT) o celular **não alcança** o Metro pela
  rede local — use **`pnpm dev:tunnel`** (veja [Como rodar](#como-rodar)).
- Alternativa sem túnel: rede espelhada do WSL, que permite usar `pnpm dev` também no celular —
  veja [Alternativa sem túnel](#alternativa-sem-túnel-rede-espelhada-do-wsl).

## Instalação

```bash
gh repo clone GabrielGomesRodrigues/guara && cd guara   # repositório privado
nvm install && corepack enable
pnpm install
cp apps/mobile/.env.example apps/mobile/.env   # ajuste EXPO_PUBLIC_API_URL
```

## Como rodar

| Onde testar                         | Comando (na raiz)                          |
| ----------------------------------- | ------------------------------------------ |
| **iPhone / iPad / Android físico**  | `pnpm dev:tunnel` — recomendado            |
| Emulador Android (celular e tablet) | `pnpm dev` (e tecla `a`) ou `pnpm android` |

O terminal mostra um **QR code** e atalhos (`a` abre no Android, `r` recarrega, `j` abre o DevTools).

O `dev:tunnel` publica o Metro numa URL `exp://….exp.direct` (via `@expo/ngrok`, já instalado no
projeto), que o celular alcança de qualquer rede — inclusive com o WSL em NAT. É um pouco mais lento
que a rede local e a URL é pública enquanto o servidor estiver rodando.

### iPhone / iPad (sem Mac)

1. Instale o **Expo Go** pela App Store.
2. Rode `pnpm dev:tunnel` e espere aparecer `Tunnel ready.` e o QR code.
3. Escaneie o QR code com a **câmera** do iPhone e toque na notificação para abrir no Expo Go.

#### Primeira vez no iPhone: conta Expo

O Expo Go no iPhone exige uma **conta Expo gratuita** (https://expo.dev/signup), logada **com a
mesma conta** no computador e no app:

1. No computador, dentro de `apps/mobile`: `npx expo login`.
2. No iPhone, abra o Expo Go e entre com a mesma conta.
3. Confira com `npx expo whoami`. Se o endereço `exp://…` do túnel tiver **`anonymous`**, o
   computador não está logado.

Contas criadas com **"Continue with GitHub"** não têm senha, e o `expo login` pede uma. Duas saídas:

- defina uma senha em expo.dev → _Account settings_; ou
- crie um token de acesso em expo.dev → _Access tokens_ e exporte-o no shell (`~/.zshrc`):
  `export EXPO_TOKEN=…`. **Nunca** coloque o token no `.env` do projeto — o que está lá pode acabar
  no bundle ou no Git.

### Quando o túnel falha

Mensagens como `failed to start tunnel` ou `session closed` costumam ser sessão antiga do ngrok
presa ou instabilidade do serviço:

```bash
pkill -f ngrok; pkill -f "expo start"
# espere uns 30 segundos
pnpm dev:tunnel
```

Se continuar falhando, confira https://status.ngrok.com/ ou use a rede espelhada abaixo.

### Alternativa sem túnel: rede espelhada do WSL

Com a rede espelhada (Windows 11 22H2+), o WSL usa os mesmos IPs do Windows e o celular na mesma
Wi-Fi alcança o Metro diretamente — mais rápido que o túnel.

1. No Windows, crie (ou edite) `%UserProfile%\.wslconfig`:
   ```ini
   [wsl2]
   networkingMode=mirrored
   ```
   e reinicie o WSL num PowerShell: `wsl --shutdown`.
2. Libere a porta 8081 no **firewall Hyper-V** para o WSL (PowerShell **como administrador**; o
   `VMCreatorId` abaixo é o do WSL, conforme a
   [documentação da Microsoft](https://learn.microsoft.com/windows/wsl/networking#mirrored-mode-networking)):
   ```powershell
   New-NetFirewallHyperVRule -Name "ExpoMetro" -DisplayName "Expo Metro (WSL)" -Direction Inbound -VMCreatorId '{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}' -Protocol TCP -LocalPorts 8081
   ```
3. Descubra o IP do Windows na Wi-Fi (`ipconfig` no Windows, adaptador Wi-Fi) e rode no WSL:
   ```bash
   REACT_NATIVE_PACKAGER_HOSTNAME=<IP do Windows no Wi-Fi> pnpm dev
   ```
4. Escaneie o QR code normalmente (o endereço deve ser `exp://<IP>:8081`).

O `tools/wsl/setup-android-shim.sh` não depende do modo de rede (só encaminha para o `adb.exe`/`emulator.exe`).

### Android físico

1. Instale o **Expo Go** pela Play Store.
2. Rode `pnpm dev:tunnel`.
3. Abra o Expo Go e use **Scan QR code**.

### Emulador Android (celular e tablet)

```bash
pnpm dev   # depois tecle `a` — ou `pnpm android`, que já abre no emulador
```

O Expo CLI abre o emulador, instala o Expo Go automaticamente e carrega o app. Para testar o
**tablet**, abra o emulador de tablet antes (ou escolha-o com `shift + a`) — o layout se adapta pelo
`useBreakpoint`.

### Dicas

- **⚠️ Túnel × API local:** o túnel leva o **app** até o Metro, mas **não** expõe uma API rodando em
  `localhost` no WSL. Quando a API NestJS existir, `EXPO_PUBLIC_API_URL` precisará apontar para uma
  URL que o celular alcance (um túnel próprio da API ou um ambiente publicado). No emulador Android,
  `http://10.0.2.2:3000` continua funcionando. Reinicie o `expo start` após mudar o `.env`.
- **Erro `libasound.so.2`** ao abrir o React Native DevTools (tecla `j`): inofensivo — o app
  continua funcionando. Correção opcional: `sudo apt install libasound2t64`.
- **Dados falsos:** em desenvolvimento o app usa dados falsos (`EXPO_PUBLIC_DATA_SOURCE=mock`).
  Toque em "Dados falsos (dev)" (rota `/dev/data`) para trocar o cenário (completo, usuário novo,
  erros), a latência e a taxa de erro, ou reiniciar os dados. Detalhes no `CLAUDE.md`.
- **Navegar entre telas placeholder:** toque em "Mapa de rotas (dev)" (abre o `/_sitemap`).
- **Testar cada área do app:** mude `devSession.status` em
  `apps/mobile/src/providers/AuthProvider.tsx` (`signedOut`, `onboarding`, `signedIn`) e recarregue.

### Limitações do Expo Go

- **Push remoto indisponível** — só notificações locais. Push chega com o development build.
- **Login Google** é feito pelo navegador (OAuth do Supabase), não pela tela nativa do Google.
- **Login Apple** (só iOS) usa a identidade do Expo Go: no Supabase, adicione `host.exp.Exponent`
  aos _Client IDs_ do provedor Apple.
- **OAuth:** a URL de retorno gerada pelo `expo-auth-session` (`getOAuthRedirectUri()` em
  `src/lib/auth-oauth.ts`; no Expo Go algo como `exp://xxxx-anonymous-8081.exp.direct/--/auth/callback`
  com o túnel, ou `exp://192.168.0.10:8081/--/auth/callback` na rede local) precisa estar em _Supabase → Authentication → URL Configuration → Redirect URLs_.
- Bundle identifier, nome por variante e splash customizado (`SplashScreen.setOptions`) só valem no
  development build. O plano de migração está no `CLAUDE.md`.

## Scripts

| Na raiz                             | O que faz                                                                          |
| ----------------------------------- | ---------------------------------------------------------------------------------- |
| `pnpm dev`                          | `expo start` do app mobile (Expo Go) — emulador / rede local                       |
| `pnpm dev:tunnel`                   | `expo start --tunnel` — aparelho físico (iPhone e Android)                         |
| `pnpm android` / `pnpm ios`         | `expo start --android` / `--ios`                                                   |
| `pnpm typecheck`                    | gera os tipos das rotas e roda `tsc` em todos os pacotes                           |
| `pnpm lint`                         | ESLint em todos os pacotes                                                         |
| `pnpm test`                         | Jest em todos os pacotes (utils + app, incluindo um teste que abre todas as rotas) |
| `pnpm format` / `pnpm format:check` | Prettier (com ordenação de classes Tailwind)                                       |
| `pnpm clean`                        | remove caches e `node_modules`                                                     |

Em `apps/mobile`: `pnpm doctor` (expo-doctor), `npx expo install --check`.

O hook de `pre-commit` (Husky + lint-staged) roda ESLint e Prettier nos arquivos alterados.

## Estrutura

```
.
├── apps/
│   └── mobile/                 # Expo (Expo Go)
│       ├── app/                # só rotas finas (Expo Router)
│       ├── src/
│       │   ├── features/       # um diretório por domínio (screens, components, hooks, api, schemas, store)
│       │   ├── components/     # ui, charts, feedback, layout
│       │   ├── lib/            # env, supabase, api (transporte), sse, storage, notifications, logger…
│       │   ├── mocks/          # dados falsos (só desenvolvimento e testes)
│       │   ├── dev/            # catálogo de UI (/ui) e painel de dados falsos (/dev/data)
│       │   ├── providers/ hooks/ stores/ theme/ constants/ types/
│       ├── assets/             # brand/, assistants/ (placeholders), fonts/, icons/
│       └── __tests__/
├── packages/
│   ├── types/                  # @guara/types — schemas zod, tipos e contrato da API
│   ├── ui-tokens/              # @guara/ui-tokens — tokens do tema escuro
│   ├── utils/                  # @guara/utils — dinheiro (centavos), datas (America/Sao_Paulo), "—"
│   ├── tsconfig/               # @guara/tsconfig
│   └── eslint-config/          # @guara/eslint-config
└── tools/wsl/                  # utilitário opcional para WSL
```

Variáveis de ambiente: veja `apps/mobile/.env.example`. **Nenhuma chave secreta vai para o app.**
