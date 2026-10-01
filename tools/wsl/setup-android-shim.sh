#!/usr/bin/env bash
# WSL only: lets the Expo CLI running in Ubuntu drive the Android SDK installed on Windows
# (adb.exe / emulator.exe). Creates small wrapper scripts and prints the exports to add
# to your shell profile. Nothing is installed with sudo.
#
# Usage: bash tools/wsl/setup-android-shim.sh [/mnt/c/Users/<you>/AppData/Local/Android/Sdk]
set -euo pipefail

WIN_SDK="${1:-$(ls -d /mnt/c/Users/*/AppData/Local/Android/Sdk 2>/dev/null | head -n 1)}"
SHIM="${ANDROID_WSL_SHIM:-$HOME/.android-wsl-shim}"

if [[ -z "$WIN_SDK" || ! -x "$WIN_SDK/platform-tools/adb.exe" ]]; then
  echo "Android SDK do Windows não encontrado. Passe o caminho como argumento." >&2
  exit 1
fi

mkdir -p "$SHIM/platform-tools" "$SHIM/emulator"

cat > "$SHIM/platform-tools/adb" <<SH
#!/usr/bin/env bash
# Forwards to adb.exe, converting existing Linux file paths (e.g. APKs) to Windows paths.
set -o pipefail
args=()
for a in "\$@"; do
  if [[ "\$a" == /* && -e "\$a" ]]; then args+=("\$(wslpath -w "\$a")"); else args+=("\$a"); fi
done
if [[ "\${1:-}" == "exec-out" ]]; then exec "$WIN_SDK/platform-tools/adb.exe" "\${args[@]}"; fi
"$WIN_SDK/platform-tools/adb.exe" "\${args[@]}" | tr -d '\r'
SH

cat > "$SHIM/emulator/emulator" <<SH
#!/usr/bin/env bash
# Forwards to emulator.exe (strips CRLF from listings so the Expo CLI can parse them).
if [[ " \$* " == *" -list-avds "* ]]; then "$WIN_SDK/emulator/emulator.exe" "\$@" | tr -d '\r'; exit; fi
exec "$WIN_SDK/emulator/emulator.exe" "\$@"
SH

chmod +x "$SHIM/platform-tools/adb" "$SHIM/emulator/emulator"

echo "Shim criado em $SHIM. Adicione ao seu ~/.zshrc ou ~/.bashrc:"
echo
echo "  export ANDROID_HOME=\"$SHIM\""
echo "  export PATH=\"\$ANDROID_HOME/platform-tools:\$ANDROID_HOME/emulator:\$PATH\""
echo
echo "AVDs disponíveis:"
"$SHIM/emulator/emulator" -list-avds
