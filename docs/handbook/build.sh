#!/usr/bin/env bash
# 핸드북 PDF 빌드. 필요: pandoc, Google Chrome.
# 사용: bash docs/handbook/build.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
HB="$ROOT/docs/handbook"
TMP="$(mktemp -d)"
{
  cat "$HB/00-intro.md"
  for f in "$ROOT"/docs/lessons/*.md; do echo; echo; cat "$f"; done
  echo; echo; cat "$HB/99-appendix.md"
} | sed "s#](../handbook/img/#](img/#g; s#](img/#]($HB/img/#g" > "$TMP/book.md"
cp "$HB/style.css" "$TMP/style.css"
pandoc "$TMP/book.md" -o "$TMP/book.html" --standalone --toc --toc-depth=2 --highlight-style=tango --css style.css \
  --metadata title="React 손코딩 훈련 핸드북" --metadata subtitle="칸반 보드로 배우는 React" \
  --metadata author="도완 × Claude (시니어 팀장)" --metadata date="$(date +%Y-%m-%d) 기준" --metadata lang=ko
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --no-pdf-header-footer \
  --allow-file-access-from-files --print-to-pdf="$HB/react-practice-handbook.pdf" "file://$TMP/book.html" 2>/dev/null
echo "built: $HB/react-practice-handbook.pdf ($(pdfinfo "$HB/react-practice-handbook.pdf" | awk '/Pages/{print $2}') pages)"
