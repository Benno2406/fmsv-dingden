#!/bin/bash
################################################################################
# Modul: Repository klonen
# Klont das FMSV Dingden Repository von GitHub
################################################################################

info "Repository-Setup..."
echo ""

# Prüfe ob Verzeichnis bereits existiert
if [ -d "$INSTALL_DIR" ]; then
    info "Verzeichnis existiert bereits: $INSTALL_DIR"
    
    # Prüfe ob es ein Git-Repository ist
    if [ -d "$INSTALL_DIR/.git" ]; then
        cd "$INSTALL_DIR" || exit 1
        
        # Zeige aktuellen Branch
        CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
        info "Aktueller Branch: $CURRENT_BRANCH"
        
        # Prüfe auf lokale Änderungen
        if [ -n "$(git status --porcelain)" ]; then
            warning "Lokale Änderungen gefunden!"
            echo ""
            git status --short | sed 's/^/  /'
            echo ""
            
            if ask_yes_no "Änderungen verwerfen und Repository aktualisieren?" "n"; then
                info "Verwerfe lokale Änderungen..."
                git reset --hard HEAD 2>&1 | tee -a "$LOG_FILE" > /dev/null
                git clean -fd 2>&1 | tee -a "$LOG_FILE" > /dev/null
                success "Änderungen verworfen"
            else
                warning "Lokale Änderungen bleiben erhalten (Update könnte fehlschlagen)"
            fi
        fi
        
        # Git Config
        git config --local pull.rebase false 2>/dev/null || true
        git config --local --add safe.directory "$INSTALL_DIR" 2>/dev/null || true
        
        # Fetch & Checkout
        info "Aktualisiere Repository (Branch: $BRANCH)..."
        
        if git fetch origin 2>&1 | tee -a "$LOG_FILE" > /dev/null; then
            success "Repository gefetched"
        else
            warning "git fetch hatte Probleme"
        fi
        
        if git checkout "$BRANCH" 2>&1 | tee -a "$LOG_FILE" > /dev/null; then
            success "Branch '$BRANCH' ausgecheckt"
        else
            error "Branch '$BRANCH' konnte nicht ausgecheckt werden!"
            echo ""
            echo -e "${YELLOW}Verfügbare Branches:${NC}"
            git branch -a | sed 's/^/  /'
            echo ""
            exit 1
        fi
        
        # Pull
        if git pull origin "$BRANCH" 2>&1 | tee -a "$LOG_FILE" | tail -5; then
            echo ""
            success "Repository aktualisiert"
        else
            warning "git pull hatte Probleme (wird fortgesetzt)"
        fi
        
        # Zeige aktuellen Commit
        CURRENT_COMMIT=$(git rev-parse --short HEAD)
        COMMIT_MSG=$(git log -1 --pretty=format:"%s")
        info "Aktueller Commit: $CURRENT_COMMIT"
        info "Commit-Nachricht: $COMMIT_MSG"
        
    else
        error "Verzeichnis existiert, ist aber kein Git-Repository!"
        echo ""
        echo -e "${YELLOW}Lösungen:${NC}"
        echo -e "  ${GREEN}1.${NC} Verzeichnis löschen:"
        echo -e "     ${CYAN}rm -rf $INSTALL_DIR${NC}"
        echo -e "  ${GREEN}2.${NC} Anderes Verzeichnis verwenden"
        echo ""
        exit 1
    fi
    
else
    # Verzeichnis existiert nicht → klonen
    info "Klone Repository..."
    echo ""
    echo -e "${CYAN}Repository: ${YELLOW}$GITHUB_REPO${NC}"
    echo -e "${CYAN}Branch: ${YELLOW}$BRANCH${NC}"
    echo -e "${CYAN}Ziel: ${YELLOW}$INSTALL_DIR${NC}"
    echo ""
    
    # Erstelle Parent-Verzeichnis falls nötig
    PARENT_DIR=$(dirname "$INSTALL_DIR")
    mkdir -p "$PARENT_DIR"
    
    # Clone mit Progress
    if git clone -b "$BRANCH" "$GITHUB_REPO" "$INSTALL_DIR" 2>&1 | tee -a "$LOG_FILE" | grep -E "Cloning|Receiving|Resolving"; then
        echo ""
        success "Repository geklont"
    else
        echo ""
        error "Repository konnte nicht geklont werden!"
        echo ""
        echo -e "${YELLOW}Häufige Ursachen:${NC}"
        echo -e "  ${RED}1.${NC} Branch '$BRANCH' existiert nicht"
        echo -e "  ${RED}2.${NC} Repository ist privat (keine Zugriffsrechte)"
        echo -e "  ${RED}3.${NC} Keine Internet-Verbindung zu GitHub"
        echo ""
        echo -e "${YELLOW}Diagnose:${NC}"
        echo -e "  ${GREEN}git ls-remote $GITHUB_REPO${NC}"
        echo ""
        exit 1
    fi
    
    # Wechsle ins Verzeichnis
    cd "$INSTALL_DIR" || exit 1
    
    # Git Config
    git config --local pull.rebase false
    git config --local --add safe.directory "$INSTALL_DIR"
    
    # Zeige Statistik
    FILE_COUNT=$(find . -type f | wc -l)
    DIR_SIZE=$(du -sh . | cut -f1)
    CURRENT_COMMIT=$(git rev-parse --short HEAD)
    
    info "Dateien: $FILE_COUNT"
    info "Größe: $DIR_SIZE"
    info "Commit: $CURRENT_COMMIT"
fi

# Finale Validierung
echo ""
info "Validiere Repository..."

REQUIRED_DIRS=(
    "backend"
    "Installation"
    "components"
    "pages"
)

VALIDATION_OK=true

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$INSTALL_DIR/$dir" ]; then
        success "$dir/ vorhanden"
    else
        error "$dir/ fehlt!"
        VALIDATION_OK=false
    fi
done

if [ "$VALIDATION_OK" = false ]; then
    error "Repository ist unvollständig!"
    exit 1
fi

log_success "Repository cloned/updated"
log_info "Branch: $BRANCH, Directory: $INSTALL_DIR"
