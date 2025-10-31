#!/bin/bash
################################################################################
# Zentrale Fehlerbehandlung für Installation Scripts
################################################################################

# Libraries laden
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/colors.sh"
source "$SCRIPT_DIR/logging.sh"
source "$SCRIPT_DIR/ui.sh"

################################################################################
# Error-Handler Setup
################################################################################

# Exit bei Fehler (kann für bestimmte Befehle mit || true deaktiviert werden)
set -o errexit   # Exit bei Fehler
set -o pipefail  # Exit bei Fehler in Pipeline
set -o nounset   # Exit bei Nutzung undefinierter Variablen

# Globaler Error-Trap
trap 'error_trap $? $LINENO $BASH_COMMAND' ERR

# Error-Trap Funktion
error_trap() {
    local exit_code=$1
    local line_no=$2
    local bash_command="$3"
    
    # Logging
    log_error "Command failed at line $line_no: $bash_command (exit code: $exit_code)"
    
    # UI
    echo ""
    echo -e "${RED}═══════════════════════════════════════════════════════${NC}"
    echo -e "${RED}  FEHLER IN ZEILE $line_no${NC}"
    echo -e "${RED}═══════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}Fehlgeschlagener Befehl:${NC}"
    echo -e "  ${DIM}$bash_command${NC}"
    echo ""
    echo -e "${YELLOW}Exit-Code:${NC} ${RED}$exit_code${NC}"
    echo ""
    
    # Letzte Log-Einträge anzeigen
    if [ -n "${LOG_FILE:-}" ] && [ -f "$LOG_FILE" ]; then
        echo -e "${YELLOW}Letzte Log-Einträge:${NC}"
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        tail -20 "$LOG_FILE" 2>/dev/null | sed 's/^/  /' || true
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo -e "${YELLOW}Vollständige Logs:${NC} ${CYAN}$LOG_FILE${NC}"
    fi
    
    echo ""
    echo -e "${RED}Installation abgebrochen!${NC}"
    echo ""
    
    # Cleanup aufrufen (falls definiert)
    if type cleanup_on_error &>/dev/null; then
        cleanup_on_error
    fi
    
    finish_logging "FAILED"
    
    exit $exit_code
}

################################################################################
# Modul-Ausführung
################################################################################

# Modul ausführen mit Error-Handling
run_module() {
    local module="$1"
    local title="$2"
    local optional="${3:-no}"
    local step="${4:-}"
    local total="${5:-18}"
    
    # Modul-Pfad bestimmen
    local module_path
    if [[ "$module" == optional/* ]]; then
        module_path="$MODULES_DIR/$module.sh"
    elif [[ "$module" == helpers/* ]]; then
        module_path="$MODULES_DIR/$module.sh"
    else
        module_path="$MODULES_DIR/$module.sh"
    fi
    
    # Prüfe ob Modul existiert
    if [ ! -f "$module_path" ]; then
        log_error "Module not found: $module_path"
        
        if [ "$optional" = "yes" ]; then
            warning "Optionales Modul nicht gefunden: $module"
            return 0
        else
            error "Modul nicht gefunden: $module_path"
            return 1
        fi
    fi
    
    # Header anzeigen (falls step angegeben)
    if [ -n "$step" ]; then
        print_header "$step" "$title" "$total"
    else
        echo ""
        info "Starte Modul: $title"
    fi
    
    # Logging
    log_step "$step" "$title"
    log_info "Starting module: $module"
    
    # Modul ausführen
    # Deaktiviere errexit temporär für optionale Module
    if [ "$optional" = "yes" ]; then
        set +e
    fi
    
    # Source das Modul
    if source "$module_path"; then
        log_success "Module completed: $module"
        
        if [ "$optional" = "yes" ]; then
            set -e
        fi
        
        sleep 1
        return 0
    else
        local exit_code=$?
        log_error "Module failed: $module (exit code: $exit_code)"
        
        if [ "$optional" = "yes" ]; then
            warning "Optionales Modul fehlgeschlagen - Installation wird fortgesetzt"
            set -e
            return 0
        else
            error "Modul fehlgeschlagen: $module"
            if [ "$optional" = "yes" ]; then
                set -e
            fi
            return $exit_code
        fi
    fi
}

################################################################################
# Helper-Funktionen
################################################################################

# Prüfe ob Befehl existiert
require_command() {
    local cmd="$1"
    local package="${2:-$cmd}"
    
    if ! command -v "$cmd" &> /dev/null; then
        error "Befehl '$cmd' nicht gefunden!"
        echo ""
        echo -e "${YELLOW}Installation:${NC}"
        echo -e "  ${GREEN}apt-get install -y $package${NC}"
        echo ""
        return 1
    fi
    
    return 0
}

# Prüfe ob Variable gesetzt ist
require_var() {
    local var_name="$1"
    local var_value="${!var_name:-}"
    
    if [ -z "$var_value" ]; then
        error "Variable '$var_name' ist nicht gesetzt!"
        return 1
    fi
    
    debug "Variable $var_name = $var_value"
    return 0
}

# Prüfe ob Datei existiert
require_file() {
    local file="$1"
    
    if [ ! -f "$file" ]; then
        error "Datei nicht gefunden: $file"
        return 1
    fi
    
    return 0
}

# Prüfe ob Verzeichnis existiert
require_dir() {
    local dir="$1"
    
    if [ ! -d "$dir" ]; then
        error "Verzeichnis nicht gefunden: $dir"
        return 1
    fi
    
    return 0
}

# Sichere Command-Ausführung mit Retry
safe_exec() {
    local max_retries="${1:-1}"
    shift
    local description="$1"
    shift
    local command="$*"
    
    local attempt=1
    
    while [ $attempt -le $max_retries ]; do
        if [ $attempt -gt 1 ]; then
            warning "Versuch $attempt von $max_retries..."
        fi
        
        log_info "Executing: $description (attempt $attempt)"
        log_debug "Command: $command"
        
        # Command ausführen
        if eval "$command" >> "$LOG_FILE" 2>&1; then
            log_success "$description completed"
            return 0
        else
            local exit_code=$?
            log_warning "$description failed (attempt $attempt, exit code: $exit_code)"
            
            if [ $attempt -lt $max_retries ]; then
                sleep 2
            fi
            
            ((attempt++))
        fi
    done
    
    log_error "$description failed after $max_retries attempts"
    return 1
}

################################################################################
# Service-Validierung
################################################################################

# Prüfe ob Service läuft
check_service() {
    local service="$1"
    local timeout="${2:-10}"
    
    info "Prüfe Service: $service"
    
    # Warte bis Service läuft
    for i in $(seq 1 $timeout); do
        if systemctl is-active --quiet "$service"; then
            success "$service läuft"
            log_success "Service $service is running"
            return 0
        fi
        
        if [ $i -lt $timeout ]; then
            sleep 1
        fi
    done
    
    # Service läuft nicht
    error "$service läuft nicht!"
    log_error "Service $service is not running"
    
    # Zeige Status
    echo ""
    echo -e "${YELLOW}Service-Status:${NC}"
    systemctl status "$service" --no-pager -l 2>&1 | sed 's/^/  /' || true
    
    echo ""
    echo -e "${YELLOW}Letzte Logs:${NC}"
    journalctl -u "$service" -n 20 --no-pager 2>&1 | sed 's/^/  /' || true
    
    return 1
}

# Prüfe ob Port frei ist
check_port() {
    local port="$1"
    local should_be_free="${2:-yes}"
    
    if ss -tuln 2>/dev/null | grep -q ":$port " || netstat -tuln 2>/dev/null | grep -q ":$port "; then
        # Port belegt
        if [ "$should_be_free" = "yes" ]; then
            warning "Port $port ist belegt"
            ss -tuln 2>/dev/null | grep ":$port " | sed 's/^/  /' || netstat -tuln 2>/dev/null | grep ":$port " | sed 's/^/  /'
            return 1
        else
            # Port soll belegt sein
            success "Port $port ist belegt (wie erwartet)"
            return 0
        fi
    else
        # Port frei
        if [ "$should_be_free" = "yes" ]; then
            success "Port $port ist frei"
            return 0
        else
            # Port soll belegt sein, ist aber frei
            error "Port $port ist nicht belegt!"
            return 1
        fi
    fi
}

################################################################################
# Cleanup-Funktionen
################################################################################

# Wartungs-Script installieren
install_maintenance_script() {
    local script_name="$1"
    local command_name="$2"
    
    local script_path="$INSTALL_DIR/Installation/scripts/$script_name"
    local target_path="/usr/local/bin/$command_name"
    
    if [ -f "$script_path" ]; then
        info "Installiere $command_name..."
        
        if cp -f "$script_path" "$target_path" && chmod +x "$target_path"; then
            success "$command_name installiert"
            log_info "Maintenance script installed: $command_name → $target_path"
            return 0
        else
            warning "$command_name Installation fehlgeschlagen"
            log_warning "Failed to install maintenance script: $command_name"
            return 1
        fi
    else
        warning "$script_name nicht gefunden - überspringe"
        log_warning "Maintenance script not found: $script_name"
        return 0
    fi
}

# Temporäre Dateien aufräumen
cleanup_temp_files() {
    local temp_pattern="$1"
    
    if [ -n "$temp_pattern" ]; then
        info "Räume temporäre Dateien auf..."
        rm -f $temp_pattern 2>/dev/null || true
        log_info "Cleaned up temporary files: $temp_pattern"
    fi
}
