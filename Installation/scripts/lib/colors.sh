#!/bin/bash
################################################################################
# Farb-Definitionen für Installation Scripts
################################################################################

# Farben - WICHTIG: Verwende $'...' Syntax für ANSI Escape Codes!
# Diese funktionieren mit echo (ohne -e) UND mit printf!
export RED=$'\033[0;31m'
export GREEN=$'\033[0;32m'
export YELLOW=$'\033[1;33m'
export BLUE=$'\033[0;34m'
export MAGENTA=$'\033[0;35m'
export CYAN=$'\033[0;36m'
export WHITE=$'\033[1;37m'
export NC=$'\033[0m'  # No Color

# Formatierung
export BOLD=$'\033[1m'
export DIM=$'\033[2m'
export ITALIC=$'\033[3m'
export UNDERLINE=$'\033[4m'
export BLINK=$'\033[5m'
export REVERSE=$'\033[7m'
export HIDDEN=$'\033[8m'

# Hintergrund-Farben
export BG_RED=$'\033[41m'
export BG_GREEN=$'\033[42m'
export BG_YELLOW=$'\033[43m'
export BG_BLUE=$'\033[44m'
export BG_MAGENTA=$'\033[45m'
export BG_CYAN=$'\033[46m'
export BG_WHITE=$'\033[47m'

# Reset
export RESET=$'\033[0m'
