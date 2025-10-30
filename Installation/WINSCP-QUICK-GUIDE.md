# WinSCP - Quick Guide für Cloudflare Zertifikat

## 🚀 In 5 Minuten zum Ziel

Schnellanleitung zum Hochladen des Cloudflare-Zertifikats mit WinSCP.

---

## ⚡ Die 5 Schritte

### 1️⃣ WinSCP installieren (2 Min)

```
https://winscp.net/eng/download.php
```

→ Download → Installieren → Fertig!

---

### 2️⃣ Zertifikat auf PC erstellen (3 Min)

**PowerShell als Admin:**
```powershell
# cloudflared installieren
winget install --id Cloudflare.cloudflared

# Login (Browser öffnet sich automatisch)
cloudflared tunnel login
```

→ Browser → Bei Cloudflare einloggen → Domain wählen → "Authorize"

**Zertifikat liegt jetzt hier:**
```
C:\Users\DEIN_NAME\.cloudflared\cert.pem
```

---

### 3️⃣ Server-IP finden (1 Min)

**Im Server-Terminal:**
```bash
hostname -I
```

**Ausgabe:** `192.168.1.100` ← Deine Server-IP

---

### 4️⃣ Mit WinSCP verbinden (2 Min)

**WinSCP öffnen** → Felder ausfüllen:

```
┌───────────────────────────────────┐
│ Host:       192.168.1.100         │ ← Deine Server-IP
│ Port:       22                    │
│ Benutzer:   root                  │
│ Passwort:   ••••••••              │ ← Dein Passwort
└───────────────────────────────────┘
```

→ **"Anmelden"** klicken

→ Bei Warnung: **"Ja"** klicken

✅ **Verbunden!**

---

### 5️⃣ Zertifikat hochladen (1 Min)

**Im WinSCP-Fenster:**

**Links (PC):**
- Adresse eingeben: `C:\Users\DEIN_NAME\.cloudflared`
- Du siehst: `cert.pem`

**Rechts (Server):**
- Ordner `.cloudflared` suchen
- Falls nicht da: Neu erstellen (Rechtsklick → "Neues Verzeichnis" → `.cloudflared`)
- Ordner öffnen (Doppelklick)

**Upload:**
- `cert.pem` von **links nach rechts** ziehen
- Loslassen
- Fertig! ✅

---

## ✅ Ergebnis

**Im Server-Terminal (install.sh):**
```
✅ Zertifikat erfolgreich empfangen!
✅ Cloudflare Login erfolgreich!
→ Installation fährt automatisch fort
```

---

## 🎯 Visual Guide

```
┌────────────────────────┬────────────────────────┐
│  PC (Links)            │  Server (Rechts)       │
├────────────────────────┼────────────────────────┤
│  C:\Users\Max\         │  /root/                │
│  .cloudflared          │  .cloudflared          │
│                        │                        │
│  📄 cert.pem           │  (leer)                │
│       │                │                        │
│       └────────────────┼─→ Drag & Drop          │
│                        │                        │
│  📄 cert.pem           │  📄 cert.pem ✅        │
└────────────────────────┴────────────────────────┘
```

---

## 🔧 Troubleshooting

### Problem: Verbindung fehlgeschlagen

**Checklist:**
- [ ] Server-IP korrekt? (`hostname -I` auf Server prüfen)
- [ ] Port 22 eingegeben?
- [ ] Passwort korrekt?
- [ ] SSH läuft? (`systemctl status sshd`)

---

### Problem: `.cloudflared` Ordner nicht sichtbar

**Lösung:**
1. WinSCP → **Optionen** → **Einstellungen**
2. **Anzeige** → **"Versteckte Dateien anzeigen"** ✅
3. **OK**

**Oder manuell erstellen:**
- Rechtsklick rechts → **"Neues Verzeichnis"**
- Name: `.cloudflared` (mit Punkt!)
- **OK**

---

### Problem: "scp: command not found" beim SCP-Befehl

**Du brauchst kein SCP!** 

→ Nutze einfach **WinSCP** mit Drag & Drop! ⭐

---

## 📚 Weiterführend

**Komplette Anleitung mit Details:**
→ [`CLOUDFLARE-WINSCP.md`](CLOUDFLARE-WINSCP.md)

**Alternative Methoden:**
→ [`CLOUDFLARE-METHODEN-VERGLEICH.md`](CLOUDFLARE-METHODEN-VERGLEICH.md)

**Alle Cloudflare-Hilfen:**
→ [`CLOUDFLARE-LOKALER-PC.md`](CLOUDFLARE-LOKALER-PC.md)

---

## 💡 Warum WinSCP?

| Feature | WinSCP | SCP (Terminal) |
|---------|--------|----------------|
| GUI | ✅ | ❌ |
| Drag & Drop | ✅ | ❌ |
| Dateien sichtbar | ✅ | ❌ |
| Einfach | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| Windows | ✅ | ⚠️ OpenSSH nötig |

**Für Windows:** → **WinSCP ist die beste Wahl!** ⭐⭐⭐⭐⭐

---

**Gesamtdauer:** 5-10 Minuten  
**Schwierigkeit:** ⭐ (Sehr einfach)  
**Erfolgsrate:** ⭐⭐⭐⭐⭐ (Fast 100%)
