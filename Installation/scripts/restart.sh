#!/bin/bash

################################################################################
# FMSV Dingden - Quick Restart Script
# Startet alle Services neu (Backend, Nginx, PostgreSQL)
################################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         FMSV Dingden - Service Restart                    ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Bitte als root ausführen: sudo $0${NC}"
    exit 1
fi

echo -e "${BLUE}🔄 Stoppe alle Services...${NC}"
systemctl stop fmsv-backend 2>/dev/null || true
systemctl stop nginx 2>/dev/null || true

echo -e "${GREEN}✅ Services gestoppt${NC}"
echo ""

echo -e "${BLUE}🧹 Räume Prozesse auf...${NC}"
pkill -9 node 2>/dev/null || true
pkill -9 nginx 2>/dev/null || true

echo -e "${GREEN}✅ Prozesse beendet${NC}"
echo ""

echo -e "${BLUE}🚀 Starte Services neu...${NC}"
echo ""

# PostgreSQL
echo -e "  ${CYAN}→ PostgreSQL...${NC}"
systemctl start postgresql
sleep 1
if systemctl is-active --quiet postgresql; then
    echo -e "  ${GREEN}  ✅ PostgreSQL läuft${NC}"
else
    echo -e "  ${RED}  ❌ PostgreSQL konnte nicht gestartet werden${NC}"
    echo -e "  ${YELLOW}     Logs: journalctl -u postgresql -n 20${NC}"
fi
echo ""

# Backend
echo -e "  ${CYAN}→ FMSV Backend...${NC}"
systemctl start fmsv-backend
sleep 2
if systemctl is-active --quiet fmsv-backend; then
    echo -e "  ${GREEN}  ✅ Backend läuft${NC}"
else
    echo -e "  ${RED}  ❌ Backend konnte nicht gestartet werden${NC}"
    echo -e "  ${YELLOW}     Logs: journalctl -u fmsv-backend -n 20${NC}"
fi
echo ""

# Nginx
echo -e "  ${CYAN}→ Nginx...${NC}"
systemctl start nginx
sleep 1
if systemctl is-active --quiet nginx; then
    echo -e "  ${GREEN}  ✅ Nginx läuft${NC}"
else
    echo -e "  ${RED}  ❌ Nginx konnte nicht gestartet werden${NC}"
    echo -e "  ${YELLOW}     Logs: journalctl -u nginx -n 20${NC}"
fi
echo ""

# Cloudflared (falls verwendet)
if systemctl list-unit-files | grep -q cloudflared; then
    echo -e "  ${CYAN}→ Cloudflare Tunnel...${NC}"
    systemctl start cloudflared 2>/dev/null || true
    sleep 1
    if systemctl is-active --quiet cloudflared; then
        echo -e "  ${GREEN}  ✅ Cloudflare Tunnel läuft${NC}"
    else
        echo -e "  ${YELLOW}  ⚠️  Cloudflare Tunnel nicht aktiv (optional)${NC}"
    fi
    echo ""
fi

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}📊 Service Status${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

systemctl status postgresql --no-pager -l | head -n 3
echo ""
systemctl status fmsv-backend --no-pager -l | head -n 3
echo ""
systemctl status nginx --no-pager -l | head -n 3
echo ""

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🧪 API-Test${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${BLUE}Backend direkt (Port 3000):${NC}"
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    RESPONSE=$(curl -s http://localhost:3000/api/health)
    echo -e "  ${GREEN}✅ Erreichbar: $RESPONSE${NC}"
else
    echo -e "  ${RED}❌ Nicht erreichbar${NC}"
    echo -e "  ${YELLOW}     Prüfe Backend-Logs: journalctl -u fmsv-backend -n 20${NC}"
fi
echo ""

echo -e "${BLUE}Backend via Nginx (Port 80):${NC}"
if curl -s http://localhost/api/health > /dev/null 2>&1; then
    RESPONSE=$(curl -s http://localhost/api/health)
    echo -e "  ${GREEN}✅ Erreichbar: $RESPONSE${NC}"
else
    echo -e "  ${RED}❌ Nicht erreichbar${NC}"
    echo -e "  ${YELLOW}     Prüfe Nginx-Config: nginx -t${NC}"
    echo -e "  ${YELLOW}     Prüfe Nginx-Logs: tail /var/log/nginx/error.log${NC}"
fi
echo ""

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ Restart abgeschlossen! ✅                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if everything is running
ALL_OK=true
systemctl is-active --quiet postgresql || ALL_OK=false
systemctl is-active --quiet fmsv-backend || ALL_OK=false
systemctl is-active --quiet nginx || ALL_OK=false

if [ "$ALL_OK" = true ]; then
    echo -e "${GREEN}✨ Alle Services laufen erfolgreich!${NC}"
    echo ""
    echo -e "${CYAN}Die Website sollte jetzt erreichbar sein.${NC}"
else
    echo -e "${YELLOW}⚠️  Einige Services laufen nicht!${NC}"
    echo ""
    echo -e "${CYAN}Nächste Schritte:${NC}"
    echo -e "  ${BLUE}1.${NC} Logs ansehen: ${GREEN}sudo fmsv-errors${NC}"
    echo -e "  ${BLUE}2.${NC} Debug-Script: ${GREEN}sudo fmsv-debug${NC}"
    echo -e "  ${BLUE}3.${NC} Backend manuell: ${GREEN}sudo fmsv-manual${NC}"
fi

echo ""
exit 0
