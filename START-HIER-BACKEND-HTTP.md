# 🎯 START HIER - Backend HTTP Problem

## ❌ Dein Fehler

```
Teste /api/health...
✗ Endpoint antwortet nicht (Code: 000)
```

---

## ✅ Die Lösung (1 Befehl!)

```bash
cd /var/www/fmsv-dingden/Installation/scripts && sudo ./debug.sh
```

**Im Menü: Wähle 10** (Backend-HTTP-Problem beheben)

Das war's! 🎉

---

## 📋 Was das Script macht

1. ✅ Prüft Backend-Service Status
2. ✅ Prüft Node.js Prozess  
3. ✅ Prüft Port 5000
4. ✅ Testet HTTP-Verbindung
5. ✅ Zeigt Logs
6. ✅ Findet das Problem
7. ✅ **Bietet automatischen Fix an**

---

## 🚀 Erwartetes Ergebnis

Nach dem Fix sollte das funktionieren:

```bash
curl http://localhost:5000/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-30T...",
  "database": "connected"
}
```

---

## 🔄 Wenn Option 10 nicht hilft

### Alternative 1: Quick-Fix
```bash
sudo ./debug.sh
# Wähle: 2 (Quick-Fix)
```

### Alternative 2: Backend manuell starten
```bash
sudo ./debug.sh
# Wähle: 4 (Backend manuell starten)
```
**Das zeigt die GENAUE Fehlermeldung!**

### Alternative 3: Vollständige Diagnose
```bash
sudo ./debug.sh
# Wähle: 1 (Vollständige Diagnose)
```

---

## 💡 Warum Code 000?

**HTTP Code 000 bedeutet:**
- Keine Verbindung möglich
- Backend antwortet nicht
- Port nicht erreichbar

**Mögliche Ursachen:**
1. Backend-Service läuft nicht
2. Node.js Prozess ist abgestürzt
3. Backend hört auf falschem Port
4. Fehler beim Backend-Start

**Option 10 findet und behebt das automatisch!**

---

## 📚 Mehr Infos?

- **Quick Commands:** `/Installation/QUICK-COMMANDS.md`
- **Detaillierte Anleitung:** `/Installation/BACKEND-HTTP-PROBLEM.md`
- **Vollständige Doku:** `/Installation/README.md`

---

## ⚡ TL;DR

```bash
cd /var/www/fmsv-dingden/Installation/scripts
sudo ./debug.sh
```

**Wähle: 10**

**Fertig!** ✅

---

**Erstellt:** 2025-10-30  
**Für:** Backend HTTP Error (Code: 000)  
**Dauer:** 1-2 Minuten
