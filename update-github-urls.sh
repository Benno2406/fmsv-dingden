#!/bin/bash

################################################################################
# Script zum Ersetzen der Beispiel-GitHub-URLs mit der echten URL
################################################################################

echo "Ersetze GitHub-URLs in allen Dokumentationen..."
echo ""

# Echte GitHub-Daten
REAL_USER="Benno2406"
REAL_REPO="fmsv-dingden"
REAL_URL_HTTPS="https://github.com/${REAL_USER}/${REAL_REPO}.git"
REAL_URL_SSH="git@github.com:${REAL_USER}/${REAL_REPO}.git"

# Zähler
COUNT=0

# Funktion zum Ersetzen in einer Datei
replace_in_file() {
    local file=$1
    local before=$(md5sum "$file" 2>/dev/null)
    
    # Verschiedene Varianten von Beispiel-URLs
    sed -i "s|https://github.com/dein-username/fmsv-dingden.git|${REAL_URL_HTTPS}|g" "$file"
    sed -i "s|https://github.com/DEIN-USERNAME/fmsv-dingden.git|${REAL_URL_HTTPS}|g" "$file"
    sed -i "s|https://github.com/dein-username/fmsv-dingden|${REAL_URL_HTTPS}|g" "$file"
    sed -i "s|git@github.com:dein-username/fmsv-dingden.git|${REAL_URL_SSH}|g" "$file"
    sed -i "s|git@github.com:DEIN-USERNAME/fmsv-dingden.git|${REAL_URL_SSH}|g" "$file"
    
    # Username in Beispielen
    sed -i "s|Username: dein-username|Username: ${REAL_USER}|g" "$file"
    sed -i "s|dein-username/fmsv-dingden|${REAL_USER}/${REAL_REPO}|g" "$file"
    sed -i "s|DEIN-USERNAME/fmsv-dingden|${REAL_USER}/${REAL_REPO}|g" "$file"
    
    local after=$(md5sum "$file" 2>/dev/null)
    
    if [ "$before" != "$after" ]; then
        echo "  ✓ $file"
        ((COUNT++))
    fi
}

# Alle Markdown-Dateien durchsuchen
echo "Durchsuche Markdown-Dateien..."
echo ""

while IFS= read -r -d '' file; do
    replace_in_file "$file"
done < <(find . -name "*.md" -type f -print0)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Fertig!"
echo ""
echo "Aktualisierte Dateien: $COUNT"
echo ""
echo "Neue GitHub-URL:"
echo "  HTTPS: ${REAL_URL_HTTPS}"
echo "  SSH:   ${REAL_URL_SSH}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
