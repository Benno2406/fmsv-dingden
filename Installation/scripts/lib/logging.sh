#!/bin/bash
################################################################################
# Logging-Funktionen für Installation Scripts
################################################################################

# Globale Log-Datei Variable
LOG_FILE=""

# Logging initialisieren
init_logging() {
    LOG_FILE="$1"
    
    # Erstelle Log-Verzeichnis falls nicht vorhanden
    local log_dir=$(dirname "$LOG_FILE")
    mkdir -p "$log_dir"
    
    # Erstelle/Öffne Log-Datei
    touch "$LOG_FILE"
    chmod 644 "$LOG_FILE"
    
    # Header schreiben
    {
        echo "========================================================================"
        echo "FMSV Dingden - Installation Log"
        echo "========================================================================"
        echo "Started: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "User: $(whoami)"
        echo "Hostname: $(hostname)"
        echo "System: $(uname -a)"
        echo "========================================================================"
        echo ""
    } >> "$LOG_FILE"
}

# Basis-Logging-Funktion
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # In Log-Datei schreiben (falls initialisiert)
    if [ -n "$LOG_FILE" ]; then
        echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    fi
}

# Level-spezifische Log-Funktionen
log_info() {
    log "INFO" "$@"
}

log_success() {
    log "SUCCESS" "$@"
}

log_warning() {
    log "WARNING" "$@"
}

log_error() {
    log "ERROR" "$@"
}

log_debug() {
    log "DEBUG" "$@"
}

log_step() {
    local step="$1"
    shift
    local message="$*"
    
    {
        echo ""
        echo "========================================================================"
        echo "STEP $step: $message"
        echo "========================================================================"
        echo ""
    } >> "$LOG_FILE"
}

# Command-Output loggen
log_command() {
    local description="$1"
    shift
    local command="$*"
    
    log_info "Executing: $description"
    log_debug "Command: $command"
    
    # Command ausführen und Output loggen
    if eval "$command" >> "$LOG_FILE" 2>&1; then
        log_success "$description completed"
        return 0
    else
        local exit_code=$?
        log_error "$description failed (exit code: $exit_code)"
        return $exit_code
    fi
}

# Installation abschließen
finish_logging() {
    local status="$1"
    
    {
        echo ""
        echo "========================================================================"
        echo "Installation $status"
        echo "Finished: $(date '+%Y-%m-%d %H:%M:%S')"
        echo "========================================================================"
    } >> "$LOG_FILE"
}
