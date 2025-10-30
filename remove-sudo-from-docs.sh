#!/bin/bash

# Script to remove 'sudo' from all documentation files

echo "Entferne 'sudo' aus allen Dokumentationen..."

# Find all markdown files and replace sudo ./ with ./
find . -name "*.md" -type f -exec sed -i 's/sudo \.\//\.\//g' {} +

# Replace sudo with nothing in common commands (when following by specific commands)
find . -name "*.md" -type f -exec sed -i 's/sudo apt-get/apt-get/g' {} +
find . -name "*.md" -type f -exec sed -i 's/sudo systemctl/systemctl/g' {} +
find . -name "*.md" -type f -exec sed -i 's/sudo npm/npm/g' {} +
find . -name "*.md" -type f -exec sed -i 's/sudo chmod/chmod/g' {} +
find . -name "*.md" -type f -exec sed -i 's/sudo chown/chown/g' {} +
find . -name "*.md" -type f -exec sed -i 's/sudo rm /rm /g' {} +
find . -name "*.md" -type f -exec sed -i 's/sudo mv /mv /g' {} +
find . -name "*.md" -type f -exec sed -i 's/sudo nano/nano/g' {} +
find . -name "*.md" -type f -exec sed -i 's/sudo cat/cat/g' {} +
find . -name "*.md" -type f -exec sed -i 's/sudo tail/tail/g' {} +
find . -name "*.md" -type f -exec sed -i 's/sudo git/git/g' {} +
find . -name "*.md" -type f -exec sed -i 's/sudo pm2/pm2/g' {} +
find . -name "*.md" -type f -exec sed -i 's/sudo ufw/ufw/g' {} +
find . -name "*.md" -type f -exec sed -i 's/sudo journalctl/journalctl/g' {} +
find . -name "*.md" -type f -exec sed -i 's/sudo lsof/lsof/g' {} +
find . -name "*.md" -type f -exec sed -i 's/sudo kill/kill/g' {} +
find . -name "*.md" -type f -exec sed -i 's/sudo killall/killall/g' {} +
find . -name "*.md" -type f -exec sed -i 's/sudo dpkg/dpkg/g' {} +
find . -name "*.md" -type f -exec sed -i 's/sudo service/service/g' {} +
find . -name "*.md" -type f -exec sed -i 's/sudo mkdir/mkdir/g' {} +

echo "✓ Fertig! Alle 'sudo' wurden aus Markdown-Dateien entfernt."
echo ""
echo "Hinweis: Das Script wird als root ausgeführt, daher ist sudo nicht nötig."
