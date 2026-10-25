#!/usr/bin/env python3
"""Génère le tableau de bord kanban (dashboard.html) pour le chat Hermes."""
import subprocess, html, re, datetime, json, sys, os

WS = "C:/Users/PC/dev-team"
OUT = WS + "/docs/todo/dashboard.html"

def sh(cmd, timeout=30):
    try:
        r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=timeout)
        return r.stdout
    except Exception as e:
        return f"(erreur: {e})"

def esc(s):
    return html.escape(s, quote=True)

# --- board ---
raw = sh("hermes kanban list")
tasks = []
for line in raw.splitlines():
    line = line.strip()
    m = re.match(r'^([✓●◻⊘✗])\s+(t_\w+)\s+(\S+)\s+(\S+)\s+(.+)$', line)
    if m:
        sym, tid, status, assignee, title = m.groups()
        tasks.append({"sym": sym, "id": tid, "status": status, "assignee": assignee, "title": title})

# --- activité récente : log des tâches running ---
logs = {}
running = [t for t in tasks if t["status"] == "running"]
for t in running[:2]:
    logs[t["id"]] = sh(f"hermes kanban log {t['id']} 2>&1 | tail -15")

# --- mapping visuel ---
def badge(status, sym):
    if status == "done":
        color = "#22c55e"
    elif status == "running":
        color = "var(--accent)"
    elif status == "blocked":
        color = "#ef4444"
    else:
        color = "var(--muted-foreground)"
    return f'<span style="color:{color};font-weight:700">{sym} {status.upper()}</span>'

rows = []
for t in tasks:
    rows.append(f'''
    <div style="display:flex;gap:10px;align-items:baseline;padding:7px 0;border-bottom:1px solid var(--border);">
      <div style="min-width:86px">{badge(t["status"], t["sym"])}</div>
      <div style="min-width:96px;color:var(--foreground);font-weight:600">{esc(t["assignee"])}</div>
      <div style="color:var(--foreground)">{esc(t["title"])} <span style="color:var(--muted-foreground);font-size:12px">{esc(t["id"])}</span></div>
    </div>''')

log_html = ""
for tid, txt in logs.items():
    log_html += f'<div style="margin-top:12px"><div style="color:var(--foreground);font-weight:700;margin-bottom:4px">🔧 Agent en cours — {esc(tid)}</div><pre style="margin:0;font-size:11.5px;line-height:1.4;color:var(--muted-foreground);white-space:pre-wrap;word-break:break-word">{esc(txt)}</pre></div>'

now = datetime.datetime.now().strftime("%H:%M:%S")

html_doc = f'''<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:transparent;font-family:inherit;">
<div style="max-width:680px;">
  <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px;">
    <div>
      <div style="font-size:16px;font-weight:800;color:var(--foreground)">Todo App — pipeline multi-agents</div>
      <div style="font-size:12px;color:var(--muted-foreground)">Dernier rafraîchissement : {now} · {len(tasks)} tâches</div>
    </div>
    <button data-hermes-send="rafraîchis le tableau de bord kanban" style="cursor:pointer;padding:7px 14px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--foreground);font-size:13px;font-weight:600;">↻ Rafraîchir</button>
  </div>
  <div style="border:1px solid var(--border);border-radius:10px;padding:10px 14px;background:var(--card);">
    {''.join(rows)}
  </div>
  {log_html}
</div>
</body></html>'''

with open(OUT, "w", encoding="utf-8") as f:
    f.write(html_doc)
print(f"OK: {OUT} ({len(tasks)} tâches)")
