import { useState, useEffect, useRef } from "react";

// ── PERSISTENT STORAGE HOOK ───────────────────────────────
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch { return initialValue; }
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);

  return [value, setValue];
}

const theme = {
  bg: "#0a0a0f", surface: "#12121a", border: "#2a2a3d",
  accent: "#7c5cfc", accentSoft: "#7c5cfc22",
  gold: "#f5c842", goldSoft: "#f5c84222",
  green: "#3dd68c", greenSoft: "#3dd68c22",
  red: "#ff5f57", redSoft: "#ff5f5722",
  blue: "#5ca8fc", blueSoft: "#5ca8fc22",
  text: "#e8e8f0", textMuted: "#7a7a9a", textDim: "#4a4a6a",
};

const NAV_H = 52;
const SCROLL_COL = 34; // width of the up/down scroll button column

const s = {
  app: { fontFamily: "'DM Sans', sans-serif", background: theme.bg, height: "100vh", color: theme.text, display: "flex", flexDirection: "column", overflow: "hidden" },
  topBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", height: NAV_H, borderBottom: `1px solid ${theme.border}`, background: theme.surface, flexShrink: 0 },
  logo: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, background: `linear-gradient(135deg, ${theme.accent}, ${theme.blue})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", flexShrink: 0 },
  navTabs: { display: "flex", gap: 2, background: theme.bg, padding: "3px", borderRadius: 9, overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none", flexShrink: 1, minWidth: 0 },
  navTab: (a) => ({ padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: a ? 600 : 400, background: a ? theme.accent : "transparent", color: a ? "#fff" : theme.textMuted, transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap", flexShrink: 0 }),
  page: { display: "flex", flexDirection: "column", padding: "10px 14px", gap: 8, boxSizing: "border-box", width: "100%", maxWidth: "100%" },
  g2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  g3: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 },
  card: (accent) => ({ background: theme.surface, border: `1px solid ${accent ? accent + "55" : theme.border}`, borderRadius: 10, padding: "9px 12px", boxShadow: accent ? `0 0 16px ${accent}12` : "none", minWidth: 0, boxSizing: "border-box" }),
  ct: { fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: theme.textMuted, marginBottom: 6, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" },
  stat: { fontSize: 17, fontWeight: 800, fontFamily: "'Syne', sans-serif", lineHeight: 1, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  sub: { fontSize: 10, color: theme.textMuted },
  pill: (color) => ({ display: "inline-flex", padding: "2px 6px", borderRadius: 100, fontSize: 10, fontWeight: 600, background: color + "22", color, border: `1px solid ${color}44`, whiteSpace: "nowrap" }),
  btn: (v = "primary") => ({ padding: "6px 12px", borderRadius: 7, border: v === "ghost" ? `1px solid ${theme.border}` : "none", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", background: v === "primary" ? theme.accent : "transparent", color: v === "primary" ? "#fff" : theme.textMuted, whiteSpace: "nowrap" }),
  input: { background: theme.bg, border: `1px solid ${theme.border}`, borderRadius: 7, padding: "6px 9px", color: theme.text, fontSize: 11, fontFamily: "'DM Sans', sans-serif", width: "100%", boxSizing: "border-box", outline: "none" },
  lbl: { fontSize: 10, color: theme.textMuted, marginBottom: 3, display: "block", fontWeight: 500 },
  row: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  hr: { border: "none", borderTop: `1px solid ${theme.border}`, margin: "6px 0" },
  ptitle: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, lineHeight: 1 },
  psub: { color: theme.textMuted, fontSize: 10 },
  th: { fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: theme.textDim, padding: "5px 8px", textAlign: "left", borderBottom: `1px solid ${theme.border}`, whiteSpace: "nowrap" },
  td: { padding: "6px 8px", fontSize: 11, borderBottom: `1px solid ${theme.border}18`, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
};

function Bar({ pct, color }) {
  return <div style={{ height: 5, background: theme.border, borderRadius: 100, overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: color || theme.accent, borderRadius: 100, transition: "width 0.5s" }} /></div>;
}
function Pill({ color, children }) { return <span style={s.pill(color)}>{children}</span>; }
function Card({ children, accent, style }) { return <div style={{ ...s.card(accent), ...style }}>{children}</div>; }

// ── MODAL OVERLAY ─────────────────────────────────────────
function Modal({ title, subtitle, onClose, onComplete, completeLabel = "✅ Complete", children, accentColor }) {
  const color = accentColor || theme.accent;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, boxSizing: "border-box",
    }}>
      <div style={{
        background: theme.surface, borderRadius: 16,
        border: `1px solid ${color}55`,
        boxShadow: `0 0 40px ${color}22`,
        width: "100%", maxWidth: 520,
        display: "flex", flexDirection: "column",
        maxHeight: "90vh", overflow: "hidden",
      }}>
        {/* Modal header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: theme.text }}>{title}</div>
            {subtitle && <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: `1px solid ${theme.border}`, borderRadius: 7, color: theme.textMuted, cursor: "pointer", fontSize: 14, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* Modal body */}
        <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
          {children}
        </div>

        {/* Modal footer */}
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${theme.border}`, display: "flex", gap: 10, justifyContent: "flex-end", flexShrink: 0 }}>
          <button onClick={onClose} style={{ ...s.btn("ghost"), padding: "8px 16px" }}>Cancel</button>
          <button onClick={onComplete} style={{ ...s.btn("primary"), padding: "8px 20px", fontSize: 12, background: color }}>{completeLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ── Smart Alerts (interactive) ────────────────────────────
const INITIAL_ALERTS = [];

function SmartAlerts() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [snoozed, setSnoozed] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [feedback, setFeedback] = useState({}); // id → confirm message

  const dismiss = (id) => setAlerts(a => a.filter(x => x.id !== id));
  const snooze  = (id) => {
    setSnoozed(s => [...s, id]);
    setAlerts(a => a.filter(x => x.id !== id));
  };
  const doAction = (alert, action) => {
    setFeedback(f => ({ ...f, [alert.id]: action.confirm }));
    setTimeout(() => {
      dismiss(alert.id);
      setFeedback(f => { const n = { ...f }; delete n[alert.id]; return n; });
    }, 1600);
  };
  const restoreSnooze = () => {
    setAlerts(INITIAL_ALERTS.filter(a => snoozed.includes(a.id)));
    setSnoozed([]);
  };

  return (
    <div>
      <div style={{ ...s.ct, justifyContent: "space-between" }}>
        <span>🔔 Smart Alerts</span>
        {snoozed.length > 0 && (
          <button onClick={restoreSnooze} style={{ ...s.btn("ghost"), padding: "2px 7px", fontSize: 10, color: theme.gold, border: `1px solid ${theme.gold}44` }}>
            {snoozed.length} snoozed — restore
          </button>
        )}
      </div>

      {alerts.length === 0 && snoozed.length === 0 && (
        <div style={{ textAlign: "center", padding: "14px 0", fontSize: 12, color: theme.textMuted }}>
          ✅ All clear — no alerts right now
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {alerts.map(a => (
          <div key={a.id} style={{ borderRadius: 8, border: `1px solid ${a.color}33`, overflow: "hidden", transition: "all 0.2s" }}>
            {/* Alert row */}
            <div
              onClick={() => setExpanded(expanded === a.id ? null : a.id)}
              style={{ display: "flex", gap: 7, alignItems: "center", padding: "7px 9px", background: a.color + "11", cursor: "pointer" }}
            >
              <span style={{ fontSize: 13 }}>{a.icon}</span>
              <span style={{ fontSize: 11, color: theme.text, flex: 1 }}>{a.text}</span>
              <span style={{ fontSize: 10, color: a.color, fontWeight: 700 }}>{expanded === a.id ? "▲" : "▼"}</span>
            </div>

            {/* Expanded actions */}
            {expanded === a.id && (
              <div style={{ background: a.color + "08", borderTop: `1px solid ${a.color}22`, padding: "8px 9px", display: "flex", flexDirection: "column", gap: 6 }}>
                {feedback[a.id] ? (
                  <div style={{ fontSize: 12, color: theme.green, fontWeight: 600, textAlign: "center", padding: "4px 0" }}>
                    ✅ {feedback[a.id]}
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: 6 }}>
                      {a.actions.map((act, i) => (
                        <button key={i} onClick={() => doAction(a, act)}
                          style={{ ...s.btn("ghost"), flex: 1, fontSize: 11, border: `1px solid ${a.color}44`, color: a.color, padding: "5px 8px" }}>
                          {act.icon} {act.label}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => snooze(a.id)}
                        style={{ ...s.btn("ghost"), flex: 1, fontSize: 11, padding: "4px 8px" }}>
                        ⏰ Snooze
                      </button>
                      <button onClick={() => dismiss(a.id)}
                        style={{ ...s.btn("ghost"), flex: 1, fontSize: 11, padding: "4px 8px", color: theme.red, border: `1px solid ${theme.red}33` }}>
                        ✕ Dismiss
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
function Dashboard() {
  const earned = 0, target = 8000, pct = Math.round((earned / target) * 100);
  return (
    <div style={s.page}>
      <div style={{ ...s.row, justifyContent: "space-between" }}>
        <div><div style={s.ptitle}>Good morning 👋</div><div style={s.psub}>Sunday, 10 May 2026 — your business at a glance</div></div>
      </div>

      <div style={s.g3}>
        {[
          { icon: "💰", label: "Monthly Goal", val: `£${earned.toLocaleString()}`, sub: `of £${target.toLocaleString()} · ${pct}%`, color: theme.accent, bar: pct },
          { icon: "🏦", label: "Tax Jar", val: "£0", sub: "25% auto set-aside · SA due Jan 2027", color: theme.gold, bar: null },
          { icon: "⏱", label: "Hours This Week", val: "0h", sub: "0h billable · 0h admin · £0/hr eff.", color: theme.green, bar: null },
        ].map((item, i) => (
          <Card key={i} accent={item.color}>
            <div style={s.ct}>{item.icon} {item.label}</div>
            <div style={{ ...s.stat, color: item.color }}>{item.val}</div>
            <div style={s.sub}>{item.sub}</div>
            {item.bar && <div style={{ marginTop: 7 }}><Bar pct={item.bar} color={item.color} /></div>}
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
        <Card style={{ display: "flex", flexDirection: "column" }}>
          <SmartAlerts />
          <hr style={s.hr} />
          <div style={s.ct}>📅 Capacity This Month</div>
          {[{ label: "No clients added yet", pct: 0, color: theme.textDim }].map((item, i) => (
            <div key={i} style={{ marginBottom: 7 }}>
              <div style={{ ...s.row, justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 11 }}>{item.label}</span>
                <span style={{ fontSize: 11, color: theme.textMuted }}>{item.pct}%</span>
              </div>
              <Bar pct={item.pct} color={item.color} />
            </div>
          ))}
        </Card>

        <Card accent={theme.blue} style={{ display: "flex", flexDirection: "column" }}>
          <div style={s.ct}>🧮 Rate Calculator</div>
          <MiniRateCalc />
          <hr style={s.hr} />
          <div style={s.ct}>🌊 Revenue Forecast</div>
          <TinyChart />
        </Card>
      </div>

      {/* Session Manager */}
      <SessionManager />
    </div>
  );
}

// ── SESSION MANAGER ───────────────────────────────────────
const SOLOOS_KEYS = [
  "soloos_invoices", "soloos_timeentries", "soloos_clients",
  "soloos_proposals", "soloos_cashflow_balance", "soloos_cashflow_items",
  "soloos_expenses"
];

function SessionManager() {
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [msg, setMsg] = useState("");

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(""), 3500); };

  // Count saved items
  const getSummary = () => {
    try {
      const invoices = JSON.parse(localStorage.getItem("soloos_invoices") || "[]");
      const clients = JSON.parse(localStorage.getItem("soloos_clients") || "[]");
      const entries = JSON.parse(localStorage.getItem("soloos_timeentries") || "[]");
      const expenses = JSON.parse(localStorage.getItem("soloos_expenses") || "[]");
      const proposals = JSON.parse(localStorage.getItem("soloos_proposals") || "[]");
      return { invoices: invoices.length, clients: clients.length, entries: entries.length, expenses: expenses.length, proposals: proposals.length };
    } catch { return null; }
  };

  const hasData = SOLOOS_KEYS.some(k => {
    try { const v = localStorage.getItem(k); return v && JSON.parse(v) && (Array.isArray(JSON.parse(v)) ? JSON.parse(v).length > 0 : JSON.parse(v) !== 0); } catch { return false; }
  });

  const clearAll = () => {
    SOLOOS_KEYS.forEach(k => localStorage.removeItem(k));
    setShowConfirmClear(false);
    showMsg("✅ All data cleared. Refresh the page to start fresh.");
  };

  const downloadBackup = () => {
    const now = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const summary = getSummary();
    let lines = [`SOLOOS — DATA BACKUP`, `Generated: ${now}`, "─".repeat(44), ""];
    if (summary) {
      lines.push("DATA SUMMARY", "─".repeat(44));
      lines.push(`Invoices:      ${summary.invoices}`);
      lines.push(`Clients:       ${summary.clients}`);
      lines.push(`Time Entries:  ${summary.entries}`);
      lines.push(`Expenses:      ${summary.expenses}`);
      lines.push(`Proposals:     ${summary.proposals}`);
      lines.push("");
    }
    lines.push("RAW DATA", "─".repeat(44));
    SOLOOS_KEYS.forEach(k => {
      try {
        const v = localStorage.getItem(k);
        if (v) lines.push(`\n[${k}]\n${JSON.stringify(JSON.parse(v), null, 2)}`);
      } catch {}
    });
    lines.push("", "─".repeat(44));
    lines.push("SOLOOS — UK Sole Trader App");
    lines.push("https://solo-os1828.vercel.app/");
    lines.push("© 2026 SoloOS. All rights reserved.");

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SoloOS-Backup-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showMsg("✅ Backup downloaded!");
  };

  const summary = getSummary();

  return (
    <div style={{ margin: "8px 0 4px 0", background: theme.surface, borderRadius: 12, border: `1px solid ${theme.border}`, padding: "12px 14px" }}>
      <div style={{ ...s.ct, marginBottom: 8 }}>💾 Data & Backup</div>

      {/* Data summary */}
      {summary && hasData && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {[
            { label: "Invoices", count: summary.invoices, color: theme.accent },
            { label: "Clients", count: summary.clients, color: theme.green },
            { label: "Time", count: summary.entries, color: theme.gold },
            { label: "Expenses", count: summary.expenses, color: theme.red },
            { label: "Proposals", count: summary.proposals, color: theme.blue },
          ].map((item, i) => item.count > 0 && (
            <div key={i} style={{ padding: "3px 9px", background: item.color + "15", border: `1px solid ${item.color}33`, borderRadius: 100, fontSize: 10, color: item.color }}>
              {item.label}: {item.count}
            </div>
          ))}
        </div>
      )}

      {!hasData && (
        <div style={{ fontSize: 10, color: theme.textMuted, marginBottom: 8, padding: "6px 10px", background: theme.bg, borderRadius: 7 }}>
          No data saved yet. Start adding invoices, clients and expenses — they save automatically!
        </div>
      )}

      {/* Status message */}
      {msg && (
        <div style={{ fontSize: 11, color: msg.startsWith("✅") ? theme.green : theme.red, marginBottom: 8, padding: "6px 10px", background: theme.bg, borderRadius: 7 }}>
          {msg}
        </div>
      )}

      {/* Auto-save notice */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: theme.green + "11", border: `1px solid ${theme.green}33`, borderRadius: 7, marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: theme.green }}>✅</span>
        <span style={{ fontSize: 10, color: theme.green, fontWeight: 600 }}>Auto-save is ON — your data saves automatically as you work</span>
      </div>

      {/* Buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
        <button onClick={downloadBackup} style={{ ...s.btn("ghost"), padding: "9px", fontSize: 11, border: `1px solid ${theme.gold}44`, color: theme.gold }}>
          📥 Download Backup
        </button>
        {!showConfirmClear
          ? <button onClick={() => setShowConfirmClear(true)} style={{ ...s.btn("ghost"), padding: "9px", fontSize: 11, border: `1px solid ${theme.red}44`, color: theme.red }}>
              🗑 Clear All Data
            </button>
          : <div style={{ display: "flex", gap: 5 }}>
              <button onClick={clearAll} style={{ ...s.btn("ghost"), flex: 1, padding: "9px", fontSize: 10, border: `1px solid ${theme.red}66`, color: theme.red }}>Yes, clear</button>
              <button onClick={() => setShowConfirmClear(false)} style={{ ...s.btn("ghost"), flex: 1, padding: "9px", fontSize: 10 }}>Cancel</button>
            </div>
        }
      </div>

      <div style={{ fontSize: 9, color: theme.textDim, marginTop: 8, lineHeight: 1.5 }}>
        Data is saved automatically in this browser. Download a backup regularly. Data is device-specific and not synced across devices.
      </div>
    </div>
  );
}

function MiniRateCalc() {
  const [salary, setSalary] = useState(0);
  const [weeks, setWeeks] = useState(46);
  const dayRate = Math.ceil(((salary + 5000) / (weeks * 5)) / 10) * 10;
  const hourRate = Math.ceil(dayRate / 6);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 8 }}>
        <div><label style={s.lbl}>Salary (£/yr)</label><input type="number" value={salary} onChange={e => setSalary(+e.target.value)} style={s.input} /></div>
        <div><label style={s.lbl}>Working weeks</label><input type="number" value={weeks} onChange={e => setWeeks(+e.target.value)} style={s.input} /></div>
      </div>
      <div style={{ display: "flex", gap: 7 }}>
        <div style={{ flex: 1, textAlign: "center", background: theme.accentSoft, borderRadius: 7, padding: "6px 0" }}>
          <div style={{ fontSize: 10, color: theme.textMuted }}>Day Rate</div>
          <div style={{ fontWeight: 800, fontSize: 17, color: theme.accent, fontFamily: "'Syne', sans-serif" }}>£{dayRate}</div>
        </div>
        <div style={{ flex: 1, textAlign: "center", background: theme.blueSoft, borderRadius: 7, padding: "6px 0" }}>
          <div style={{ fontSize: 10, color: theme.textMuted }}>Hourly</div>
          <div style={{ fontWeight: 800, fontSize: 17, color: theme.blue, fontFamily: "'Syne', sans-serif" }}>£{hourRate}</div>
        </div>
      </div>
    </div>
  );
}

function TinyChart() {
  const months = ["J", "F", "M", "A", "M", "J"];
  const actual = [5200, 6800, 4100, 7200, 5150, null];
  const forecast = [null, null, null, null, 5150, 7800];
  const max = 9000; const w = 220; const h = 55; const pad = 8;
  const iw = w - pad * 2;
  const x = i => pad + (i / (months.length - 1)) * iw;
  const y = v => h - (v / max) * h + 3;
  const toPath = data => { const pts = data.map((v, i) => v !== null ? [x(i), y(v)] : null).filter(Boolean); return pts.length < 2 ? "" : pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" "); };
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h + 13}`} width="100%" style={{ overflow: "visible" }}>
        {months.map((m, i) => <text key={m} x={x(i)} y={h + 12} textAnchor="middle" fontSize={7} fill={theme.textDim}>{m}</text>)}
        <path d={toPath(actual)} fill="none" stroke={theme.accent} strokeWidth={1.5} strokeLinecap="round" />
        <path d={toPath(forecast)} fill="none" stroke={theme.gold} strokeWidth={1.5} strokeDasharray="3 2" strokeLinecap="round" />
        {actual.map((v, i) => v !== null && <circle key={i} cx={x(i)} cy={y(v)} r={2} fill={theme.accent} />)}
        {forecast.map((v, i) => v !== null && <circle key={i} cx={x(i)} cy={y(v)} r={2} fill={theme.gold} />)}
      </svg>
      <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
        <span style={{ fontSize: 9, color: theme.accent }}>● Actual</span>
        <span style={{ fontSize: 9, color: theme.gold }}>● Forecast</span>
      </div>
    </div>
  );
}

// ── INVOICING ─────────────────────────────────────────────
const initInvoices = [];

function Invoicing() {
  const [invoices, setInvoices] = useLocalStorage("soloos_invoices", initInvoices);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ client: "", amount: "", due: "", status: "Draft" });
  const scol = { Paid: theme.green, Sent: theme.blue, Overdue: theme.red, Draft: theme.textMuted };
  const paid = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const out = invoices.filter(i => i.status === "Sent").reduce((s, i) => s + i.amount, 0);
  const over = invoices.filter(i => i.status === "Overdue").reduce((s, i) => s + i.amount, 0);

  const create = () => {
    if (!form.client || !form.amount) return;
    setInvoices([{ id: `INV-0${42 + invoices.length}`, ...form, amount: +form.amount }, ...invoices]);
    setCreating(false); setForm({ client: "", amount: "", due: "", status: "Draft" });
  };

  return (
    <div style={s.page}>
      <div style={{ ...s.row, justifyContent: "space-between" }}>
        <div><div style={s.ptitle}>Invoicing</div><div style={s.psub}>Create, send and track your invoices</div></div>
        <button style={s.btn("primary")} onClick={() => setCreating(!creating)}>+ New Invoice</button>
      </div>

      <div style={s.g3}>
        {[{ label: "Paid", val: paid, color: theme.green }, { label: "Outstanding", val: out, color: theme.blue }, { label: "Overdue", val: over, color: theme.red }].map((x, i) => (
          <Card key={i} accent={x.color}><div style={s.ct}>{x.label}</div><div style={{ ...s.stat, color: x.color }}>£{x.val.toLocaleString()}</div></Card>
        ))}
      </div>

      {creating && (
        <Modal
          title="📄 New Invoice"
          subtitle="Fill in the details below to create your invoice"
          accentColor={theme.accent}
          onClose={() => setCreating(false)}
          onComplete={create}
          completeLabel="✅ Create Invoice"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ ...s.lbl, fontSize: 11, marginBottom: 5 }}>Client Name</label>
              <input style={{ ...s.input, fontSize: 13, padding: "9px 12px" }} value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} placeholder="e.g. Apex Studio" autoFocus />
            </div>
            <div>
              <label style={{ ...s.lbl, fontSize: 11, marginBottom: 5 }}>Amount (£)</label>
              <input style={{ ...s.input, fontSize: 13, padding: "9px 12px" }} type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" />
            </div>
            <div>
              <label style={{ ...s.lbl, fontSize: 11, marginBottom: 5 }}>Due Date</label>
              <input style={{ ...s.input, fontSize: 13, padding: "9px 12px" }} type="date" value={form.due} onChange={e => setForm({ ...form, due: e.target.value })} />
            </div>
            <div>
              <label style={{ ...s.lbl, fontSize: 11, marginBottom: 5 }}>Status</label>
              <select style={{ ...s.input, fontSize: 13, padding: "9px 12px" }} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {["Draft", "Sent", "Paid"].map(x => <option key={x}>{x}</option>)}
              </select>
            </div>
          </div>
        </Modal>
      )}

      <Card style={{}}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <thead><tr>{["Invoice", "Client", "Amount", "Due", "Status", ""].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td style={{ ...s.td, fontWeight: 600, color: theme.accent }}>{inv.id}</td>
                <td style={s.td}>{inv.client}</td>
                <td style={{ ...s.td, fontWeight: 600 }}>£{inv.amount.toLocaleString()}</td>
                <td style={{ ...s.td, color: theme.textMuted }}>{inv.due}</td>
                <td style={s.td}><Pill color={scol[inv.status]}>{inv.status}</Pill></td>
                <td style={s.td}>{inv.status !== "Paid" && <button style={{ ...s.btn("ghost"), padding: "3px 7px", fontSize: 11 }} onClick={() => setInvoices(invoices.map(i => i.id === inv.id ? { ...i, status: "Paid" } : i))}>Mark Paid</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <TaxSummary invoiceTotal={paid} />
    </div>
  );
}

// ── TAX SUMMARY ───────────────────────────────────────────
function TaxSummary({ invoiceTotal }) {
  // UK 2025/26 tax rates for sole traders
  const PERSONAL_ALLOWANCE = 12570;
  const BASIC_RATE_LIMIT = 50270;
  const HIGHER_RATE_LIMIT = 125140;
  const NI_LOWER = 12570;
  const NI_UPPER = 50270;
  const CLASS4_LOWER_RATE = 0.09;
  const CLASS4_UPPER_RATE = 0.02;
  const CLASS2_WEEKLY = 3.45;

  // Editable assumptions
  const [annualRevenue, setAnnualRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [pensionContribs, setPensionContribs] = useState(0);

  const profit = Math.max(0, annualRevenue - expenses - pensionContribs);
  const taxableIncome = Math.max(0, profit - PERSONAL_ALLOWANCE);

  // Income tax bands
  const basicTax = Math.min(taxableIncome, BASIC_RATE_LIMIT - PERSONAL_ALLOWANCE) * 0.20;
  const higherTax = Math.max(0, Math.min(taxableIncome - (BASIC_RATE_LIMIT - PERSONAL_ALLOWANCE), HIGHER_RATE_LIMIT - BASIC_RATE_LIMIT)) * 0.40;
  const additionalTax = Math.max(0, taxableIncome - (HIGHER_RATE_LIMIT - PERSONAL_ALLOWANCE)) * 0.45;
  const totalIncomeTax = basicTax + higherTax + additionalTax;

  // National Insurance Class 2 & 4
  const class2 = profit > NI_LOWER ? CLASS2_WEEKLY * 52 : 0;
  const class4Lower = Math.max(0, Math.min(profit, NI_UPPER) - NI_LOWER) * CLASS4_LOWER_RATE;
  const class4Upper = Math.max(0, profit - NI_UPPER) * CLASS4_UPPER_RATE;
  const totalNI = class2 + class4Lower + class4Upper;

  const totalTax = totalIncomeTax + totalNI;
  const effectiveRate = profit > 0 ? ((totalTax / profit) * 100).toFixed(1) : 0;
  const monthlySet = Math.ceil(totalTax / 12);
  const recommended25 = Math.ceil(annualRevenue * 0.25 / 12);

  const taxBand = taxableIncome <= 0 ? "Personal Allowance" : taxableIncome <= (BASIC_RATE_LIMIT - PERSONAL_ALLOWANCE) ? "Basic Rate (20%)" : taxableIncome <= (HIGHER_RATE_LIMIT - PERSONAL_ALLOWANCE) ? "Higher Rate (40%)" : "Additional Rate (45%)";
  const bandColor = taxableIncome <= 0 ? theme.green : taxableIncome <= (BASIC_RATE_LIMIT - PERSONAL_ALLOWANCE) ? theme.blue : taxableIncome <= (HIGHER_RATE_LIMIT - PERSONAL_ALLOWANCE) ? theme.gold : theme.red;

  return (
    <Card accent={theme.gold}>
      <div style={{ ...s.ct, justifyContent: "space-between" }}>
        <span>📊 Approximate Tax Due This Year</span>
        <span style={{ color: theme.textMuted, fontSize: 9, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>UK 2025/26 · estimates only</span>
      </div>

      {/* Editable inputs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 7, marginBottom: 10 }}>
        {[
          { label: "Est. Annual Revenue (£)", val: annualRevenue, set: setAnnualRevenue },
          { label: "Business Expenses (£)", val: expenses, set: setExpenses },
          { label: "Pension Contributions (£)", val: pensionContribs, set: setPensionContribs },
        ].map((f, i) => (
          <div key={i}>
            <label style={s.lbl}>{f.label}</label>
            <input type="number" style={s.input} value={f.val} onChange={e => f.set(+e.target.value)} />
          </div>
        ))}
      </div>

      {/* Tax breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 7, marginBottom: 10 }}>
        {[
          { label: "Taxable Profit", val: `£${profit.toLocaleString()}`, color: theme.text, sub: `After £${(expenses + pensionContribs).toLocaleString()} deductions` },
          { label: "Income Tax", val: `£${Math.round(totalIncomeTax).toLocaleString()}`, color: theme.gold, sub: taxBand },
          { label: "National Insurance", val: `£${Math.round(totalNI).toLocaleString()}`, color: theme.orange || "#ff9f57", sub: "Class 2 + Class 4" },
        ].map((item, i) => (
          <div key={i} style={{ background: theme.bg, borderRadius: 8, padding: "8px 10px", border: `1px solid ${theme.border}` }}>
            <div style={s.lbl}>{item.label}</div>
            <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: item.color }}>{item.val}</div>
            <div style={{ fontSize: 10, color: bandColor, marginTop: 2 }}>{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Total + effective rate */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7, marginBottom: 10 }}>
        <div style={{ background: theme.gold + "18", borderRadius: 8, padding: "8px 10px", border: `1px solid ${theme.gold}44`, gridColumn: "1 / 2" }}>
          <div style={s.lbl}>Total Tax Bill</div>
          <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: theme.gold }}>£{Math.round(totalTax).toLocaleString()}</div>
          <div style={{ fontSize: 10, color: theme.textMuted }}>Effective rate: {effectiveRate}%</div>
        </div>
        <div style={{ background: theme.green + "11", borderRadius: 8, padding: "8px 10px", border: `1px solid ${theme.green}33` }}>
          <div style={s.lbl}>Set Aside Monthly</div>
          <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: theme.green }}>£{monthlySet.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: theme.textMuted }}>Exact amount needed</div>
        </div>
        <div style={{ background: theme.blue + "11", borderRadius: 8, padding: "8px 10px", border: `1px solid ${theme.blue}33` }}>
          <div style={s.lbl}>25% Rule (safe estimate)</div>
          <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: theme.blue }}>£{recommended25.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: theme.textMuted }}>Per month from revenue</div>
        </div>
      </div>

      {/* Tax band bar */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ ...s.row, justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: theme.textMuted }}>Income tax band</span>
          <Pill color={bandColor}>{taxBand}</Pill>
        </div>
        <div style={{ display: "flex", height: 6, borderRadius: 100, overflow: "hidden", gap: 1 }}>
          {[
            { label: "PA", limit: PERSONAL_ALLOWANCE, color: theme.green },
            { label: "Basic", limit: BASIC_RATE_LIMIT, color: theme.blue },
            { label: "Higher", limit: HIGHER_RATE_LIMIT, color: theme.gold },
            { label: "Add.", limit: HIGHER_RATE_LIMIT * 1.2, color: theme.red },
          ].map((band, i) => {
            const pct = Math.min(Math.max((profit - (i === 0 ? 0 : [0, PERSONAL_ALLOWANCE, BASIC_RATE_LIMIT, HIGHER_RATE_LIMIT][i])) / band.limit * 100, 0), 100);
            return <div key={i} style={{ flex: 1, background: profit > [0, PERSONAL_ALLOWANCE, BASIC_RATE_LIMIT, HIGHER_RATE_LIMIT][i] ? band.color : theme.border, borderRadius: 2, opacity: profit > [0, PERSONAL_ALLOWANCE, BASIC_RATE_LIMIT, HIGHER_RATE_LIMIT][i] ? 1 : 0.3 }} />;
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
          {["£0", "£12.5k", "£50.3k", "£125k"].map(l => <span key={l} style={{ fontSize: 9, color: theme.textDim }}>{l}</span>)}
        </div>
      </div>

      {/* Key dates */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {[
          { label: "Self Assessment deadline", date: "31 Jan 2027", urgent: false },
          { label: "Payment on account 1", date: "31 Jan 2026", urgent: false },
          { label: "Payment on account 2", date: "31 Jul 2026", urgent: true },
        ].map((d, i) => (
          <div key={i} style={{ padding: "4px 9px", borderRadius: 6, background: d.urgent ? theme.red + "11" : theme.bg, border: `1px solid ${d.urgent ? theme.red + "44" : theme.border}`, fontSize: 10 }}>
            <span style={{ color: theme.textMuted }}>{d.label}: </span>
            <span style={{ color: d.urgent ? theme.red : theme.text, fontWeight: 600 }}>{d.date}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8, fontSize: 9, color: theme.textDim }}>
        ⚠️ These are estimates based on UK 2025/26 rates. Consult a qualified accountant for your actual tax liability.
      </div>

      {/* PDF Download */}
      <button
        onClick={() => {
          const content = `SOLOOS — TAX SUMMARY REPORT
UK Self Assessment 2025/26
Generated: ${new Date().toLocaleDateString("en-GB")}
${"─".repeat(40)}

INCOME & DEDUCTIONS
─────────────────────────────
Estimated Annual Revenue:    £${annualRevenue.toLocaleString()}
Business Expenses:           £${expenses.toLocaleString()}
Pension Contributions:       £${pensionContribs.toLocaleString()}
─────────────────────────────
Taxable Profit:              £${profit.toLocaleString()}
Personal Allowance:          £12,570
Taxable Income:              £${taxableIncome.toLocaleString()}

TAX BREAKDOWN
─────────────────────────────
Income Tax (${taxBand}):
  Basic Rate (20%):          £${Math.round(basicTax).toLocaleString()}
  Higher Rate (40%):         £${Math.round(higherTax).toLocaleString()}
  Additional Rate (45%):     £${Math.round(additionalTax).toLocaleString()}
Total Income Tax:            £${Math.round(totalIncomeTax).toLocaleString()}

National Insurance:
  Class 2:                   £${Math.round(class2).toLocaleString()}
  Class 4 (lower):           £${Math.round(class4Lower).toLocaleString()}
  Class 4 (upper):           £${Math.round(class4Upper).toLocaleString()}
Total NI:                    £${Math.round(totalNI).toLocaleString()}

─────────────────────────────
TOTAL TAX BILL:              £${Math.round(totalTax).toLocaleString()}
Effective Tax Rate:          ${effectiveRate}%
─────────────────────────────

MONTHLY SAVINGS PLAN
─────────────────────────────
Exact amount to set aside:   £${monthlySet.toLocaleString()}/month
25% rule (safe estimate):    £${recommended25.toLocaleString()}/month

KEY HMRC DATES
─────────────────────────────
Payment on account 1:        31 January 2026
Payment on account 2:        31 July 2026
Self Assessment deadline:    31 January 2027

─────────────────────────────
⚠ These figures are estimates only.
Please consult a qualified accountant
for your actual tax liability.
─────────────────────────────
Generated by SoloOS — solo-os1828.vercel.app`;

          const blob = new Blob([content], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `SoloOS-Tax-Summary-${new Date().getFullYear()}.txt`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }}
        style={{ ...s.btn("ghost"), width: "100%", marginTop: 10, padding: "9px", fontSize: 11, border: `1px solid ${theme.gold}44`, color: theme.gold, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
      >
        📥 Download Tax Summary Report
      </button>
    </Card>
  );
}

// ── TIME TRACKER ──────────────────────────────────────────
const initEntries = [];

function TimeTracker() {
  const [entries, setEntries] = useLocalStorage("soloos_timeentries", initEntries);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [project, setProject] = useState("");
  const [rate, setRate] = useState(120);
  const [showLog, setShowLog] = useState(false);
  const [logForm, setLogForm] = useState({ project: "", hours: "", rate: 120 });
  const ref = useRef(null);

  useEffect(() => {
    if (running) ref.current = setInterval(() => setElapsed(e => e + 1), 1000);
    else clearInterval(ref.current);
    return () => clearInterval(ref.current);
  }, [running]);

  const fmt = t => { const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), sec = t % 60; return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`; };

  const stopAndConfirm = () => {
    if (!project) return;
    setRunning(false);
    setLogForm({ project, hours: (elapsed / 3600).toFixed(2), rate });
    setShowLog(true);
  };

  const confirmLog = () => {
    setEntries([{ id: Date.now(), project: logForm.project, hours: +logForm.hours, date: "Today", rate: +logForm.rate, billed: false }, ...entries]);
    setElapsed(0); setProject(""); setShowLog(false);
  };

  // Manual log (no timer)
  const [showManual, setShowManual] = useState(false);
  const [manualForm, setManualForm] = useState({ project: "", hours: "", rate: 120, date: "Today" });
  const saveManual = () => {
    if (!manualForm.project || !manualForm.hours) return;
    setEntries([{ id: Date.now(), ...manualForm, hours: +manualForm.hours, rate: +manualForm.rate, billed: false }, ...entries]);
    setManualForm({ project: "", hours: "", rate: 120, date: "Today" });
    setShowManual(false);
  };

  const unbilled = entries.filter(e => !e.billed).reduce((sum, e) => sum + e.hours * e.rate, 0);

  return (
    <div style={s.page}>
      {showLog && (
        <Modal title="⏹ Log Time Entry" subtitle="Confirm or adjust the details before saving" accentColor={theme.green} onClose={() => { setShowLog(false); setRunning(false); }} onComplete={confirmLog} completeLabel="✅ Save Entry">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div><label style={{ ...s.lbl, fontSize: 11, marginBottom: 5 }}>Project</label><input style={{ ...s.input, fontSize: 13, padding: "9px 12px" }} value={logForm.project} onChange={e => setLogForm({ ...logForm, project: e.target.value })} /></div>
            <div><label style={{ ...s.lbl, fontSize: 11, marginBottom: 5 }}>Hours Logged</label><input style={{ ...s.input, fontSize: 13, padding: "9px 12px" }} type="number" value={logForm.hours} onChange={e => setLogForm({ ...logForm, hours: e.target.value })} /></div>
            <div><label style={{ ...s.lbl, fontSize: 11, marginBottom: 5 }}>Rate (£/hr)</label><input style={{ ...s.input, fontSize: 13, padding: "9px 12px" }} type="number" value={logForm.rate} onChange={e => setLogForm({ ...logForm, rate: e.target.value })} /></div>
            <div style={{ padding: "10px 14px", background: theme.green + "11", borderRadius: 9, border: `1px solid ${theme.green}33`, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 2 }}>Total value</div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: theme.green }}>£{(+logForm.hours * +logForm.rate).toFixed(0)}</div>
            </div>
          </div>
        </Modal>
      )}
      {showManual && (
        <Modal title="✏️ Log Time Manually" subtitle="Add a time entry without using the timer" accentColor={theme.accent} onClose={() => setShowManual(false)} onComplete={saveManual} completeLabel="✅ Save Entry">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div><label style={{ ...s.lbl, fontSize: 11, marginBottom: 5 }}>Project</label><input style={{ ...s.input, fontSize: 13, padding: "9px 12px" }} value={manualForm.project} onChange={e => setManualForm({ ...manualForm, project: e.target.value })} placeholder="What did you work on?" autoFocus /></div>
            <div><label style={{ ...s.lbl, fontSize: 11, marginBottom: 5 }}>Hours</label><input style={{ ...s.input, fontSize: 13, padding: "9px 12px" }} type="number" value={manualForm.hours} onChange={e => setManualForm({ ...manualForm, hours: e.target.value })} placeholder="e.g. 2.5" /></div>
            <div><label style={{ ...s.lbl, fontSize: 11, marginBottom: 5 }}>Rate (£/hr)</label><input style={{ ...s.input, fontSize: 13, padding: "9px 12px" }} type="number" value={manualForm.rate} onChange={e => setManualForm({ ...manualForm, rate: e.target.value })} /></div>
            <div><label style={{ ...s.lbl, fontSize: 11, marginBottom: 5 }}>Date</label><input style={{ ...s.input, fontSize: 13, padding: "9px 12px" }} value={manualForm.date} onChange={e => setManualForm({ ...manualForm, date: e.target.value })} placeholder="e.g. Today, Yesterday" /></div>
          </div>
        </Modal>
      )}

      <div style={{ ...s.row, justifyContent: "space-between" }}>
        <div><div style={s.ptitle}>Time Tracker</div><div style={s.psub}>Track billable hours and know your earned value</div></div>
        <button style={s.btn("ghost")} onClick={() => setShowManual(true)}>+ Log Manually</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 9 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          <Card accent={running ? theme.green : theme.accent}>
            <div style={s.ct}>⏱ Timer</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 36, fontWeight: 800, color: running ? theme.green : theme.text, letterSpacing: "-2px", textAlign: "center", marginBottom: 9 }}>{fmt(elapsed)}</div>
            <label style={s.lbl}>Project</label>
            <input style={{ ...s.input, marginBottom: 6 }} value={project} onChange={e => setProject(e.target.value)} placeholder="What are you working on?" />
            <label style={s.lbl}>Rate (£/hr)</label>
            <input style={{ ...s.input, marginBottom: 9 }} type="number" value={rate} onChange={e => setRate(+e.target.value)} />
            <div style={{ display: "flex", gap: 6 }}>
              {!running
                ? <button style={{ ...s.btn("primary"), flex: 1 }} onClick={() => setRunning(true)}>▶ Start</button>
                : <><button style={{ ...s.btn("ghost"), flex: 1 }} onClick={() => setRunning(false)}>⏸ Pause</button><button style={{ ...s.btn("primary"), flex: 1, background: theme.green }} onClick={stopAndConfirm}>⏹ Log</button></>}
            </div>
          </Card>
          <Card accent={theme.gold} style={{}}>
            <div style={s.ct}>💸 Unbilled Value</div>
            <div style={{ ...s.stat, color: theme.gold }}>£{unbilled.toFixed(0)}</div>
            <div style={{ ...s.sub, marginBottom: 9 }}>{entries.filter(e => !e.billed).length} unbilled entries</div>
            {[{ day: "Mon", h: 0 }, { day: "Tue", h: 0 }, { day: "Wed", h: 0 }, { day: "Thu", h: 0 }, { day: "Fri", h: 0 }].map(d => (
              <div key={d.day} style={{ ...s.row, marginBottom: 5 }}>
                <span style={{ fontSize: 10, color: theme.textMuted, width: 24 }}>{d.day}</span>
                <div style={{}}><Bar pct={(d.h / 8) * 100} color={theme.gold} /></div>
                <span style={{ fontSize: 10, width: 26, textAlign: "right" }}>{d.h}h</span>
              </div>
            ))}
          </Card>
        </div>

        <Card style={{ display: "flex", flexDirection: "column" }}>
          <div style={s.ct}>📋 Recent Entries</div>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead><tr>{["Project", "Hrs", "Value", "Date", "Status", ""].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.id}>
                  <td style={s.td}>{e.project}</td>
                  <td style={{ ...s.td, fontWeight: 600 }}>{e.hours}h</td>
                  <td style={{ ...s.td, color: theme.green }}>£{(e.hours * e.rate).toFixed(0)}</td>
                  <td style={{ ...s.td, color: theme.textMuted }}>{e.date}</td>
                  <td style={s.td}><Pill color={e.billed ? theme.green : theme.gold}>{e.billed ? "Billed" : "Unbilled"}</Pill></td>
                  <td style={s.td}>{!e.billed && <button style={{ ...s.btn("ghost"), padding: "3px 7px", fontSize: 11 }} onClick={() => setEntries(entries.map(x => x.id === e.id ? { ...x, billed: true } : x))}>Bill</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

// ── CRM ───────────────────────────────────────────────────
const initClients = [];

function CRM() {
  const [clients, setClients] = useLocalStorage("soloos_clients", initClients);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", contact: "", value: "", stage: "Lead", tags: "" });
  const scol = { Active: theme.green, Proposal: theme.blue, Lead: theme.gold, Completed: theme.textMuted };

  const add = () => {
    if (!form.name) return;
    setClients([...clients, { id: Date.now(), ...form, value: +form.value, last: "Just now", tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) }]);
    setAdding(false); setForm({ name: "", contact: "", value: "", stage: "Lead", tags: "" });
  };

  return (
    <div style={s.page}>
      <div style={{ ...s.row, justifyContent: "space-between" }}>
        <div><div style={s.ptitle}>Client CRM</div><div style={s.psub}>Track relationships, follow-ups and pipeline</div></div>
        <button style={s.btn("primary")} onClick={() => setAdding(!adding)}>+ Add Client</button>
      </div>

      <div style={s.g3}>
        {[{ label: "Leads", count: clients.filter(c => c.stage === "Lead").length, color: theme.gold }, { label: "Proposals", count: clients.filter(c => c.stage === "Proposal").length, color: theme.blue }, { label: "Active", count: clients.filter(c => c.stage === "Active").length, color: theme.green }].map((x, i) => (
          <Card key={i} accent={x.color}><div style={s.ct}>{x.label}</div><div style={{ ...s.stat, color: x.color }}>{x.count}</div><div style={s.sub}>in pipeline</div></Card>
        ))}
      </div>

      {adding && (
        <Modal
          title="👤 Add New Client"
          subtitle="Enter the client details to add them to your pipeline"
          accentColor={theme.green}
          onClose={() => setAdding(false)}
          onComplete={add}
          completeLabel="✅ Add Client"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Company Name", key: "name", placeholder: "e.g. Apex Studio", type: "text" },
              { label: "Contact Name", key: "contact", placeholder: "e.g. Jane Smith", type: "text" },
              { label: "Deal Value (£)", key: "value", placeholder: "0", type: "number" },
            ].map(f => (
              <div key={f.key}>
                <label style={{ ...s.lbl, fontSize: 11, marginBottom: 5 }}>{f.label}</label>
                <input style={{ ...s.input, fontSize: 13, padding: "9px 12px" }} type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} />
              </div>
            ))}
            <div>
              <label style={{ ...s.lbl, fontSize: 11, marginBottom: 5 }}>Stage</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {["Lead", "Proposal", "Active", "Completed"].map(stage => (
                  <button key={stage} onClick={() => setForm({ ...form, stage })} style={{
                    padding: "10px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: form.stage === stage ? 700 : 400,
                    fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
                    background: form.stage === stage ? theme.green + "22" : theme.bg,
                    color: form.stage === stage ? theme.green : theme.textMuted,
                    border: `1px solid ${form.stage === stage ? theme.green + "66" : theme.border}`,
                  }}>{stage}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ ...s.lbl, fontSize: 11, marginBottom: 5 }}>Tags (comma separated)</label>
              <input style={{ ...s.input, fontSize: 13, padding: "9px 12px" }} value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="e.g. Design, Web, Brand" />
            </div>
          </div>
        </Modal>
      )}

      <Card style={{}}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {clients.map(c => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 11px", background: theme.bg, borderRadius: 8, border: `1px solid ${theme.border}` }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${theme.accent}, ${theme.blue})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{c.name[0]}</div>
              <div style={{}}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: theme.textMuted }}>{c.contact} · Last contact: {c.last}</div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>{c.tags.map(t => <Pill key={t} color={theme.accent}>{t}</Pill>)}</div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>£{c.value.toLocaleString()}</div>
                <Pill color={scol[c.stage]}>{c.stage}</Pill>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── PROPOSALS ─────────────────────────────────────────────
function Proposals() {
  const [proposals, setProposals] = useLocalStorage("soloos_proposals", []);
  const [view, setView] = useState("list"); // list | compose | sent
  const [sentMsg, setSentMsg] = useState("");
  const [bodyTouched, setBodyTouched] = useState(false);
  const [form, setForm] = useState({ client: "", email: "", title: "", value: "", scope: "", timeline: "", senderName: "Your Name", senderEmail: "you@yourbusiness.co.uk" });
  const scol = { Pending: theme.gold, Viewed: theme.blue, Won: theme.green, Lost: theme.red };

  const subject = form.title ? `Proposal: ${form.title}` : "Project Proposal";
  const buildBody = (f) => `Hi ${f.client || "[Client Name]"},

Thank you for the opportunity to submit this proposal. I've outlined everything below — please get in touch if you have any questions.

━━━━━━━━━━━━━━━━━━━━━━━
PROPOSAL: ${f.title || "[Project Title]"}
━━━━━━━━━━━━━━━━━━━━━━━
${f.scope ? `\nSCOPE OF WORK\n${f.scope}\n` : ""}
INVESTMENT
Fee: ${f.value ? `£${Number(f.value).toLocaleString()}` : "[TBC]"}
Terms: 50% deposit on acceptance, 50% on completion

TIMELINE
${f.timeline || "[To be agreed]"}

NEXT STEPS
Reply to confirm acceptance and I'll send the agreement and deposit invoice straight away. This proposal is valid for 30 days.

Warm regards,
${f.senderName || "[Your Name]"}
${f.senderEmail || "[Your Email]"}`;

  const [editedBody, setEditedBody] = useState(() => buildBody(form));
  useEffect(() => { if (!bodyTouched) setEditedBody(buildBody(form)); }, [form]);

  const openCompose = (prefill = {}) => {
    setForm(f => ({ ...f, ...prefill }));
    setBodyTouched(false);
    setView("compose");
  };

  const sendEmail = () => {
    if (!form.client || !form.email) return;
    const mailtoLink = `mailto:${form.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(editedBody)}`;
    const a = document.createElement("a");
    a.href = mailtoLink;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setProposals(p => [{ id: Date.now(), client: form.client, email: form.email, title: form.title || "Untitled", value: +form.value || 0, sent: "Today", status: "Pending", win: 50 }, ...p]);
    setSentMsg(`Proposal to ${form.client} opened in your email app ✅`);
    setView("sent");
  };

  // ── COMPOSE VIEW ──────────────────────────────────────────
  if (view === "compose") return (
    <div style={s.page}>
      <div style={{ ...s.row, justifyContent: "space-between", marginBottom: 4 }}>
        <div>
          <button style={{ ...s.btn("ghost"), fontSize: 11, marginBottom: 6 }} onClick={() => setView("list")}>← Back</button>
          <div style={s.ptitle}>📧 New Proposal</div>
          <div style={s.psub}>Fill in the details — email is pre-written and ready to send</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {/* Left: form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Card accent={theme.accent}>
            <div style={s.ct}>👤 Client</div>
            {[{ label: "Client / Company", key: "client", placeholder: "Apex Studio", type: "text" }, { label: "Client Email", key: "email", placeholder: "hello@client.co.uk", type: "email" }].map(f => (
              <div key={f.key} style={{ marginBottom: 7 }}>
                <label style={s.lbl}>{f.label}</label>
                <input style={s.input} type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} />
              </div>
            ))}
          </Card>
          <Card>
            <div style={s.ct}>📋 Project</div>
            {[{ label: "Project Title", key: "title", placeholder: "Brand Identity Package", type: "text" }, { label: "Fee (£)", key: "value", placeholder: "2400", type: "number" }, { label: "Timeline", key: "timeline", placeholder: "3 weeks from start", type: "text" }].map(f => (
              <div key={f.key} style={{ marginBottom: 7 }}>
                <label style={s.lbl}>{f.label}</label>
                <input style={s.input} type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} />
              </div>
            ))}
            <div>
              <label style={s.lbl}>Scope of Work</label>
              <textarea style={{ ...s.input, height: 65, resize: "vertical", lineHeight: 1.5 }} value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value })} placeholder="Describe what you'll deliver..." />
            </div>
          </Card>
          <Card>
            <div style={s.ct}>✍️ Your Details</div>
            {[{ label: "Your Name", key: "senderName" }, { label: "Your Email", key: "senderEmail" }].map(f => (
              <div key={f.key} style={{ marginBottom: 7 }}>
                <label style={s.lbl}>{f.label}</label>
                <input style={s.input} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}
          </Card>
        </div>

        {/* Right: live email preview */}
        <Card accent={theme.blue} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ ...s.ct, justifyContent: "space-between" }}>
            <span>📬 Email Preview</span>
            {bodyTouched && <span style={{ color: theme.gold, fontSize: 9, textTransform: "none", letterSpacing: 0 }}>✏️ Edited</span>}
          </div>
          <div style={{ background: theme.bg, borderRadius: 7, padding: "6px 10px", border: `1px solid ${theme.border}` }}>
            <div style={{ fontSize: 9, color: theme.textMuted, marginBottom: 1 }}>TO</div>
            <div style={{ fontSize: 11 }}>{form.email || <span style={{ color: theme.textDim }}>client@email.com</span>}</div>
          </div>
          <div style={{ background: theme.bg, borderRadius: 7, padding: "6px 10px", border: `1px solid ${theme.border}` }}>
            <div style={{ fontSize: 9, color: theme.textMuted, marginBottom: 1 }}>SUBJECT</div>
            <div style={{ fontSize: 11, fontWeight: 600 }}>{subject}</div>
          </div>
          <div style={{ fontSize: 10, color: theme.textMuted, marginBottom: 2 }}>BODY — edit directly:</div>
          <textarea
            style={{ ...s.input, flex: 1, minHeight: 260, resize: "vertical", lineHeight: 1.6, fontSize: 11, fontFamily: "monospace" }}
            value={editedBody}
            onChange={e => { setEditedBody(e.target.value); setBodyTouched(true); }}
          />
          {bodyTouched && (
            <button style={{ ...s.btn("ghost"), fontSize: 10, padding: "3px 8px", alignSelf: "flex-start", color: theme.textMuted }} onClick={() => { setBodyTouched(false); setEditedBody(buildBody(form)); }}>
              ↺ Reset to auto-generated
            </button>
          )}
          <button style={{ ...s.btn("primary"), padding: "10px", fontSize: 12, opacity: (!form.client || !form.email) ? 0.5 : 1 }} onClick={sendEmail} disabled={!form.client || !form.email}>
            📧 Open in Email App & Save
          </button>
          <div style={{ fontSize: 9, color: theme.textMuted, textAlign: "center" }}>Opens Outlook, Gmail or Apple Mail with proposal pre-filled</div>
        </Card>
      </div>
    </div>
  );

  // ── SENT CONFIRMATION ────────────────────────────────────
  if (view === "sent") return (
    <div style={s.page}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "50px 20px", gap: 14, textAlign: "center" }}>
        <div style={{ fontSize: 56 }}>📬</div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 19, color: theme.green }}>{sentMsg}</div>
        <div style={{ fontSize: 12, color: theme.textMuted, maxWidth: 360 }}>Proposal saved to your pipeline. Your email app should have opened with the message ready to review and send.</div>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button style={s.btn("ghost")} onClick={() => openCompose()}>+ Send Another</button>
          <button style={s.btn("primary")} onClick={() => setView("list")}>View Pipeline →</button>
        </div>
      </div>
    </div>
  );

  // ── LIST VIEW ────────────────────────────────────────────
  return (
    <div style={s.page}>
      <div style={{ ...s.row, justifyContent: "space-between" }}>
        <div><div style={s.ptitle}>Proposals</div><div style={s.psub}>Build, send and track proposals with win/loss analysis</div></div>
        <button style={s.btn("primary")} onClick={() => openCompose()}>+ New Proposal</button>
      </div>
      <div style={s.g3}>
        {[{ label: "Win Rate", val: "62%", color: theme.green }, { label: "Avg Deal Size", val: "£4,150", color: theme.accent }, { label: "Open Pipeline", val: "£7,000", color: theme.blue }].map((x, i) => (
          <Card key={i} accent={x.color}><div style={s.ct}>{x.label}</div><div style={{ ...s.stat, color: x.color }}>{x.val}</div></Card>
        ))}
      </div>
      <Card style={{}}>
        <div style={s.ct}>📊 Proposal Pipeline</div>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <thead><tr>{["Client", "Title", "Value", "Sent", "Win %", "Status", ""].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
          <tbody>
            {proposals.map(p => (
              <tr key={p.id}>
                <td style={{ ...s.td, fontWeight: 600 }}>{p.client}</td>
                <td style={s.td}>{p.title}</td>
                <td style={{ ...s.td, fontWeight: 600 }}>£{p.value.toLocaleString()}</td>
                <td style={{ ...s.td, color: theme.textMuted }}>{p.sent}</td>
                <td style={s.td}>{p.win > 0 && p.win < 100 ? <div><div style={{ fontSize: 10, marginBottom: 2 }}>{p.win}%</div><Bar pct={p.win} color={p.win > 60 ? theme.green : theme.gold} /></div> : <span style={{ color: theme.textMuted }}>—</span>}</td>
                <td style={s.td}><Pill color={scol[p.status]}>{p.status}</Pill></td>
                <td style={s.td}><button style={{ ...s.btn("ghost"), padding: "2px 7px", fontSize: 10 }} onClick={() => openCompose({ client: p.client, email: p.email || "", title: p.title })}>Resend</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr style={s.hr} />
        <div style={{ ...s.row, gap: 14 }}>
          {[{ label: "Won", count: proposals.filter(p => p.status === "Won").length, color: theme.green }, { label: "Lost", count: proposals.filter(p => p.status === "Lost").length, color: theme.red }, { label: "Pending", count: proposals.filter(p => p.status === "Pending" || p.status === "Viewed").length, color: theme.gold }].map((x, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: x.color + "22", border: `1px solid ${x.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: x.color }}>{x.count}</div>
              <span style={{ fontSize: 11, color: theme.textMuted }}>{x.label}</span>
            </div>
          ))}
          <div style={{ marginLeft: "auto", fontSize: 11, color: theme.textMuted }}>Avg close time: <span style={{ color: theme.text }}>18 days</span></div>
        </div>
      </Card>
    </div>
  );
}


// ── SUPPLIERS ─────────────────────────────────────────────
const industryCategories = [
  { id: "all",         label: "All",              icon: "🏪" },
  { id: "general",     label: "General Building",  icon: "🧱" },
  { id: "electrical",  label: "Electrical",        icon: "⚡" },
  { id: "plumbing",    label: "Plumbing & Heating", icon: "🔧" },
  { id: "timber",      label: "Timber & Joinery",  icon: "🪵" },
  { id: "roofing",     label: "Roofing",            icon: "🏠" },
  { id: "flooring",    label: "Flooring",           icon: "🟫" },
  { id: "tools",       label: "Tools & Plant",      icon: "🔨" },
  { id: "landscaping", label: "Landscaping",        icon: "🌿" },
  { id: "fixings",     label: "Fixings & Ironmongery", icon: "🔩" },
  { id: "insulation",  label: "Insulation & Drywall", icon: "🧊" },
  { id: "drainage",    label: "Drainage & Civils",  icon: "🚰" },
];

const mockSuppliers = [
  { id: 1,  name: "Travis Perkins",          category: "general",     distance: "0.4 mi", rating: 4.2, open: true,  phone: "01234 567890", address: "12 Trade Park, High St",    speciality: "Full range, trade accounts", national: true },
  { id: 2,  name: "Jewson",                  category: "general",     distance: "0.9 mi", rating: 4.0, open: true,  phone: "01234 567891", address: "Jewson Yard, Mill Rd",      speciality: "Timber, masonry, roofing",   national: true },
  { id: 3,  name: "City Electrical Factors", category: "electrical",  distance: "0.6 mi", rating: 4.5, open: true,  phone: "01234 567892", address: "Unit 3, Orbital Retail Pk", speciality: "Full electrical wholesale",  national: true },
  { id: 4,  name: "Rexel",                   category: "electrical",  distance: "1.1 mi", rating: 4.1, open: false, phone: "01234 567893", address: "45 Commerce Way",            speciality: "Cable, lighting, EV charge", national: true },
  { id: 5,  name: "Ferguson Plumbing",        category: "plumbing",    distance: "0.7 mi", rating: 4.3, open: true,  phone: "01234 567894", address: "8 Waterworks Rd",           speciality: "Boilers, bathrooms, pipe",   national: false },
  { id: 6,  name: "Wolseley",                 category: "plumbing",    distance: "1.3 mi", rating: 4.0, open: true,  phone: "01234 567895", address: "Wolseley Plumb Centre",     speciality: "HVAC, underfloor heating",   national: true },
  { id: 7,  name: "Huws Gray Timber",         category: "timber",      distance: "1.8 mi", rating: 4.4, open: true,  phone: "01234 567896", address: "Timber Wharf, Canal St",    speciality: "Hardwood, sheet goods, MDF", national: true },
  { id: 8,  name: "Arnold Laver",             category: "timber",      distance: "2.2 mi", rating: 4.6, open: false, phone: "01234 567897", address: "Arnold Laver Depot",        speciality: "Bespoke joinery, machining", national: true },
  { id: 9,  name: "Marley Roofing Centre",    category: "roofing",     distance: "2.0 mi", rating: 4.2, open: true,  phone: "01234 567898", address: "Roofing Trade Ctr, Ring Rd", speciality: "Tiles, slates, flat roof",  national: true },
  { id: 10, name: "Local Roofing Supplies",   category: "roofing",     distance: "0.5 mi", rating: 4.7, open: true,  phone: "01234 567899", address: "5 Builders Row",            speciality: "Guttering, fascia, soffits", national: false },
  { id: 11, name: "Flooring Direct Trade",    category: "flooring",    distance: "1.2 mi", rating: 4.3, open: true,  phone: "01234 567800", address: "Unit 7, Meridian Park",     speciality: "Hardwood, LVT, carpet",      national: false },
  { id: 12, name: "HSS Hire",                 category: "tools",       distance: "0.8 mi", rating: 4.1, open: true,  phone: "01234 567801", address: "HSS Tool Hire, Bridge Rd",  speciality: "Plant hire, power tools",    national: true },
  { id: 13, name: "Speedy Hire",              category: "tools",       distance: "1.5 mi", rating: 3.9, open: true,  phone: "01234 567802", address: "Speedy Depot, Industrial Est", speciality: "Scaffolding, welfare units", national: true },
  { id: 14, name: "Landscape Supply Co.",     category: "landscaping", distance: "2.5 mi", rating: 4.5, open: true,  phone: "01234 567803", address: "Nursery Lane, Greenfields", speciality: "Aggregates, paving, turf",   national: false },
  { id: 15, name: "Brett Aggregates",         category: "landscaping", distance: "3.1 mi", rating: 4.0, open: false, phone: "01234 567804", address: "Brett Quarry, Bypass Rd",   speciality: "Block paving, kerbing",      national: true },
  { id: 16, name: "Fastfix Fixings",          category: "fixings",     distance: "0.3 mi", rating: 4.8, open: true,  phone: "01234 567805", address: "2 Trade Units, Apex Park", speciality: "Screws, anchors, ironmongery", national: false },
  { id: 17, name: "Rockwool Insulation Hub",  category: "insulation",  distance: "1.9 mi", rating: 4.2, open: true,  phone: "01234 567806", address: "Thermal Park, East Way",   speciality: "PIR, mineral wool, drywall", national: true },
  { id: 18, name: "Drainstore",               category: "drainage",    distance: "1.6 mi", rating: 4.1, open: true,  phone: "01234 567807", address: "Pipe Centre, South Rd",    speciality: "HDPE, gullies, manholes",    national: false },
];

function StarRating({ rating }) {
  return (
    <span style={{ fontSize: 11, color: theme.gold }}>
      {"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}
      <span style={{ color: theme.textMuted, marginLeft: 4 }}>{rating.toFixed(1)}</span>
    </span>
  );
}

// Haversine formula — real distance in miles between two lat/lng points
function calcDistanceMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Offline UK postcode area lookup (prefix → lat/lng/city) ──────────────────
const POSTCODE_DB = {
  "AB":[57.149,-2.097,"Aberdeen"],"AL":[51.752,-0.336,"St Albans"],"B":[52.480,-1.895,"Birmingham"],
  "BA":[51.380,-2.360,"Bath"],"BB":[53.748,-2.482,"Blackburn"],"BD":[53.796,-1.759,"Bradford"],
  "BH":[50.720,-1.898,"Bournemouth"],"BL":[53.578,-2.429,"Bolton"],"BN":[50.829,-0.137,"Brighton"],
  "BR":[51.406,0.019,"Bromley"],"BS":[51.455,-2.597,"Bristol"],"CA":[54.895,-2.934,"Carlisle"],
  "CB":[52.205,0.119,"Cambridge"],"CF":[51.481,-3.180,"Cardiff"],"CH":[53.197,-2.893,"Chester"],
  "CM":[51.736,0.480,"Chelmsford"],"CO":[51.889,0.903,"Colchester"],"CR":[51.373,-0.098,"Croydon"],
  "CT":[51.279,1.081,"Canterbury"],"CV":[52.408,-1.510,"Coventry"],"CW":[53.097,-2.441,"Crewe"],
  "DA":[51.444,0.218,"Dartford"],"DD":[56.462,-2.970,"Dundee"],"DE":[52.922,-1.475,"Derby"],
  "DG":[55.070,-3.606,"Dumfries"],"DH":[54.779,-1.570,"Durham"],"DL":[54.524,-1.558,"Darlington"],
  "DN":[53.523,-1.129,"Doncaster"],"DT":[50.715,-2.440,"Dorchester"],"DY":[52.510,-2.090,"Dudley"],
  "E":[51.520,-0.040,"East London"],"EC":[51.516,-0.097,"City of London"],"EH":[55.953,-3.188,"Edinburgh"],
  "EN":[51.652,-0.083,"Enfield"],"EX":[50.725,-3.527,"Exeter"],"FK":[56.002,-3.784,"Falkirk"],
  "FY":[53.817,-3.036,"Blackpool"],"G":[55.865,-4.257,"Glasgow"],"GL":[51.864,-2.238,"Gloucester"],
  "GU":[51.236,-0.570,"Guildford"],"GY":[49.455,-2.536,"Guernsey"],"HA":[51.580,-0.334,"Harrow"],
  "HD":[53.645,-1.785,"Huddersfield"],"HG":[53.992,-1.541,"Harrogate"],"HP":[51.760,-0.728,"Hemel Hempstead"],
  "HR":[52.056,-2.716,"Hereford"],"HS":[57.769,-7.019,"Hebrides"],"HU":[53.745,-0.336,"Hull"],
  "HX":[53.725,-1.864,"Halifax"],"IG":[51.558,0.075,"Ilford"],"IP":[52.059,1.156,"Ipswich"],
  "IV":[57.478,-4.225,"Inverness"],"JE":[49.214,-2.131,"Jersey"],"KA":[55.612,-4.500,"Kilmarnock"],
  "KT":[51.411,-0.301,"Kingston"],"KW":[58.441,-3.092,"Caithness"],"KY":[56.228,-3.146,"Kirkcaldy"],
  "L":[53.408,-2.991,"Liverpool"],"LA":[54.047,-2.800,"Lancaster"],"LD":[52.244,-3.380,"Llandrindod Wells"],
  "LE":[52.636,-1.133,"Leicester"],"LL":[53.318,-3.830,"Llandudno"],"LN":[53.228,-0.540,"Lincoln"],
  "LS":[53.800,-1.549,"Leeds"],"LU":[51.879,-0.420,"Luton"],"M":[53.480,-2.242,"Manchester"],
  "ME":[51.413,0.524,"Medway"],"MK":[52.040,-0.759,"Milton Keynes"],"ML":[55.782,-3.981,"Motherwell"],
  "N":[51.570,-0.122,"North London"],"NE":[54.978,-1.618,"Newcastle"],"NG":[52.954,-1.158,"Nottingham"],
  "NN":[52.240,-0.903,"Northampton"],"NP":[51.589,-2.998,"Newport"],"NR":[52.630,1.297,"Norwich"],
  "NW":[51.550,-0.167,"North West London"],"OL":[53.540,-2.117,"Oldham"],"OX":[51.752,-1.258,"Oxford"],
  "PA":[55.846,-4.660,"Paisley"],"PE":[52.574,-0.241,"Peterborough"],"PH":[56.395,-3.437,"Perth"],
  "PL":[50.376,-4.144,"Plymouth"],"PO":[50.820,-1.092,"Portsmouth"],"PR":[53.763,-2.703,"Preston"],
  "RG":[51.454,-0.974,"Reading"],"RH":[51.235,-0.177,"Redhill"],"RM":[51.578,0.180,"Romford"],
  "S":[53.381,-1.470,"Sheffield"],"SA":[51.621,-3.944,"Swansea"],"SE":[51.490,-0.060,"South East London"],
  "SG":[51.903,-0.207,"Stevenage"],"SK":[53.407,-2.157,"Stockport"],"SL":[51.510,-0.596,"Slough"],
  "SM":[51.402,-0.192,"Sutton"],"SN":[51.558,-1.782,"Swindon"],"SO":[50.908,-1.404,"Southampton"],
  "SP":[51.064,-1.796,"Salisbury"],"SR":[54.906,-1.384,"Sunderland"],"SS":[51.542,0.707,"Southend"],
  "ST":[52.997,-2.183,"Stoke-on-Trent"],"SW":[51.470,-0.172,"South West London"],"SY":[52.707,-2.759,"Shrewsbury"],
  "TA":[51.016,-3.101,"Taunton"],"TD":[55.609,-2.793,"Galashiels"],"TF":[52.678,-2.445,"Telford"],
  "TN":[51.131,0.264,"Tunbridge Wells"],"TQ":[50.462,-3.525,"Torquay"],"TR":[50.263,-5.052,"Truro"],
  "TS":[54.575,-1.235,"Middlesbrough"],"TW":[51.449,-0.337,"Twickenham"],"UB":[51.532,-0.476,"Uxbridge"],
  "W":[51.513,-0.175,"West London"],"WA":[53.390,-2.596,"Warrington"],"WC":[51.517,-0.118,"Central London"],
  "WD":[51.659,-0.394,"Watford"],"WF":[53.683,-1.500,"Wakefield"],"WN":[53.544,-2.631,"Wigan"],
  "WR":[52.192,-2.221,"Worcester"],"WS":[52.580,-2.003,"Walsall"],"WV":[52.585,-2.130,"Wolverhampton"],
  "YO":[53.960,-1.083,"York"],"ZE":[60.154,-1.145,"Shetland"],
};

function resolvePostcode(raw) {
  const cleaned = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (cleaned.length < 2) return null;
  // Try longest prefix first (up to 4 chars), then shorter
  for (let len = Math.min(4, cleaned.length); len >= 1; len--) {
    const prefix = cleaned.slice(0, len);
    if (POSTCODE_DB[prefix]) {
      const [lat, lng, city] = POSTCODE_DB[prefix];
      return { lat, lng, city, postcode: cleaned };
    }
  }
  return null;
}

function Suppliers() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("distance");
  const [selectedId, setSelectedId] = useState(null);
  const [gps, setGps] = useState(null);
  const [postcode, setPostcode] = useState("");
  const [postcodeInput, setPostcodeInput] = useState("");
  const [postcodeStatus, setPostcodeStatus] = useState("idle"); // idle | found | error

  const lookupPostcode = () => {
    const result = resolvePostcode(postcodeInput);
    if (result) {
      setGps({ lat: result.lat, lng: result.lng, city: result.city });
      setPostcode(result.postcode);
      setPostcodeStatus("found");
    } else {
      setPostcodeStatus("error");
    }
  };

  const clearPostcode = () => {
    setGps(null); setPostcode(""); setPostcodeInput(""); setPostcodeStatus("idle");
  };

  // Enrich suppliers with real distances when GPS is available
  // Suppliers have mock lat/lng offsets relative to user for demo purposes
  const mockOffsets = [
    [0.004, 0.005], [0.009, -0.003], [0.006, 0.008], [0.011, 0.002],
    [0.007, -0.006], [0.013, 0.009], [0.018, -0.004], [0.022, 0.011],
    [0.020, 0.003], [0.005, -0.007], [0.012, 0.006], [0.008, 0.010],
    [0.015, -0.008], [0.025, 0.004], [0.031, -0.002], [0.003, 0.009],
    [0.019, 0.007], [0.016, -0.005],
  ];

  const suppliersWithDist = mockSuppliers.map((sup, i) => {
    if (gps) {
      const [dLat, dLng] = mockOffsets[i] || [0.01, 0.01];
      const supLat = gps.lat + dLat;
      const supLng = gps.lng + dLng;
      const miles = calcDistanceMiles(gps.lat, gps.lng, supLat, supLng);
      return {
        ...sup,
        distance: `${miles.toFixed(1)} mi`,
        distNum: miles,
        supLat,
        supLng,
      };
    }
    return { ...sup, distNum: parseFloat(sup.distance) };
  });

  const filtered = suppliersWithDist
    .filter(sup => activeCategory === "all" || sup.category === activeCategory)
    .filter(sup => sup.name.toLowerCase().includes(search.toLowerCase()) || sup.speciality.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "distance") return a.distNum - b.distNum;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  const selected = suppliersWithDist.find(sup => sup.id === selectedId);
  const catInfo = industryCategories.find(c => c.id === activeCategory);

  const catColors = {
    general: theme.blue, electrical: theme.gold, plumbing: theme.blue,
    timber: "#a07850", roofing: theme.red, flooring: "#c09060",
    tools: theme.accent, landscaping: theme.green, fixings: theme.textMuted,
    insulation: theme.blue, drainage: "#5ca8fc",
  };
  const getColor = (cat) => catColors[cat] || theme.accent;

  // Build Google Maps URLs — use real coords when available
  const mapsUrl = (sup) => {
    if (gps && sup.supLat) {
      return `https://www.google.com/maps/dir/?api=1&origin=${gps.lat},${gps.lng}&destination=${sup.supLat},${sup.supLng}&travelmode=driving`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sup.name + " " + sup.address)}`;
  };

  const nearbyUrl = (sup) => {
    if (gps && sup.supLat) {
      return `https://www.google.com/maps/search/${encodeURIComponent(sup.name)}/@${sup.supLat},${sup.supLng},15z`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sup.name + " " + sup.address)}`;
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={{ ...s.row, justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={s.ptitle}>🏪 Builders Merchants & Suppliers</div>
          <div style={s.psub}>
            {postcodeStatus === "found" && gps
              ? `📍 Distances from ${postcode} · ${gps.city} · ${filtered.length} suppliers`
              : "Enter your postcode to find suppliers near you"}
          </div>
        </div>
        <div style={{ ...s.row, gap: 7, flexWrap: "wrap" }}>
          {/* Postcode input */}
          {postcodeStatus !== "found" ? (
            <div style={{ ...s.row, gap: 6 }}>
              <div style={{ position: "relative" }}>
                <input
                  style={{ ...s.input, width: 130, textTransform: "uppercase", letterSpacing: "0.05em", paddingRight: postcodeStatus === "error" ? 28 : 10 }}
                  value={postcodeInput}
                  onChange={e => { setPostcodeInput(e.target.value); setPostcodeStatus("idle"); }}
                  onKeyDown={e => e.key === "Enter" && lookupPostcode()}
                  placeholder="e.g. SW1A 1AA"
                  maxLength={8}
                />
                {postcodeStatus === "error" && (
                  <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: theme.red }}>✕</span>
                )}
              </div>
              <button
                style={{ ...s.btn("primary"), minWidth: 70 }}
                onClick={lookupPostcode}
              >
                📍 Find
              </button>
              {postcodeStatus === "error" && (
                <span style={{ fontSize: 11, color: theme.red }}>Invalid postcode</span>
              )}
            </div>
          ) : (
            <div style={{ ...s.row, gap: 6 }}>
              <div style={{ ...s.pill(theme.green), padding: "5px 10px", fontSize: 12 }}>📍 {postcode}</div>
              <button style={{ ...s.btn("ghost"), padding: "5px 10px", fontSize: 11 }} onClick={clearPostcode}>Change</button>
            </div>
          )}
          <select style={{ ...s.input, width: "auto" }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="distance">Sort: Nearest</option>
            <option value="rating">Sort: Rating</option>
            <option value="name">Sort: Name A–Z</option>
          </select>
        </div>
      </div>

      {/* Category pills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {industryCategories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
            padding: "5px 11px", borderRadius: 100,
            border: activeCategory === cat.id ? `1px solid ${getColor(cat.id)}88` : `1px solid ${theme.border}`,
            cursor: "pointer", fontSize: 11, fontWeight: activeCategory === cat.id ? 700 : 400,
            background: activeCategory === cat.id ? getColor(cat.id) + "22" : "transparent",
            color: activeCategory === cat.id ? getColor(cat.id) : theme.textMuted,
            fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
          }}>
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: theme.textMuted }}>🔍</span>
        <input style={{ ...s.input, paddingLeft: 30 }} value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${catInfo?.label || "all suppliers"} by name or speciality…`} />
      </div>

      {/* Results + Detail panel */}
      <div style={{ display: "grid", gridTemplateColumns: selectedId ? "1fr 320px" : "1fr", gap: 9 }}>
        {/* Results list */}
        <Card style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ ...s.ct, marginBottom: 8 }}>
            {filtered.length} supplier{filtered.length !== 1 ? "s" : ""} found
            {activeCategory !== "all" && <span style={{ color: getColor(activeCategory), marginLeft: 4 }}>· {catInfo?.icon} {catInfo?.label}</span>}
            {postcodeStatus === "found" && <span style={{ color: theme.green, marginLeft: 4 }}>· sorted by postcode distance</span>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.length === 0 && (
              <div style={{ textAlign: "center", color: theme.textMuted, padding: "30px 0", fontSize: 13 }}>No suppliers found. Try a different category or search term.</div>
            )}
            {filtered.map(sup => (
              <div key={sup.id}
                onClick={() => setSelectedId(selectedId === sup.id ? null : sup.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 11, padding: "9px 11px",
                  background: selectedId === sup.id ? getColor(sup.category) + "18" : theme.bg,
                  borderRadius: 9,
                  border: `1px solid ${selectedId === sup.id ? getColor(sup.category) + "55" : theme.border}`,
                  cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
                }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: getColor(sup.category) + "22", border: `1px solid ${getColor(sup.category)}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                  {industryCategories.find(c => c.id === sup.category)?.icon || "🏪"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...s.row, gap: 7, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{sup.name}</span>
                    {sup.national && <span style={{ fontSize: 10, color: theme.textMuted, background: theme.border, padding: "1px 5px", borderRadius: 4 }}>National</span>}
                    <span style={{ marginLeft: "auto", fontSize: 11, color: sup.open ? theme.green : theme.red, fontWeight: 600 }}>{sup.open ? "● Open" : "● Closed"}</span>
                  </div>
                  <div style={{ fontSize: 11, color: theme.textMuted, marginBottom: 2, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{sup.speciality}</div>
                  <div style={{ ...s.row, gap: 10 }}>
                    <StarRating rating={sup.rating} />
                    <span style={{ fontSize: 11, color: postcodeStatus === "found" ? theme.green : theme.textMuted, fontWeight: postcodeStatus === "found" ? 600 : 400 }}>
                      {postcodeStatus === "found" ? "📍" : "📍"} {sup.distance}
                    </span>
                    <a href={nearbyUrl(sup)} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: 11, color: theme.blue, textDecoration: "none", marginLeft: "auto", fontWeight: 600 }}>🗺 Map</a>
                  </div>
                </div>
                <Pill color={getColor(sup.category)}>{industryCategories.find(c => c.id === sup.category)?.label || sup.category}</Pill>
              </div>
            ))}
          </div>
        </Card>

        {/* Detail panel */}
        {selected && (
          <Card accent={getColor(selected.category)} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <div style={{ ...s.row, justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontSize: 28 }}>{industryCategories.find(c => c.id === selected.category)?.icon}</div>
              <button style={{ ...s.btn("ghost"), padding: "3px 7px", fontSize: 11 }} onClick={() => setSelectedId(null)}>✕</button>
            </div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, marginBottom: 3 }}>{selected.name}</div>
            <Pill color={getColor(selected.category)}>{industryCategories.find(c => c.id === selected.category)?.label}</Pill>

            <hr style={s.hr} />

            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {[
                { icon: "📍", label: "Address", val: selected.address },
                { icon: "📞", label: "Phone", val: selected.phone },
                { icon: "📏", label: "Distance", val: postcodeStatus === "found" ? `${selected.distance} (postcode accurate)` : selected.distance },
                { icon: "🕐", label: "Status", val: selected.open ? "Open now" : "Currently closed" },
                { icon: "⭐", label: "Rating", val: `${selected.rating.toFixed(1)} / 5.0` },
                { icon: "🔧", label: "Speciality", val: selected.speciality },
                { icon: "🏢", label: "Type", val: selected.national ? "National chain" : "Independent merchant" },
              ].map((row, i) => (
                <div key={i}>
                  <div style={{ fontSize: 10, color: theme.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{row.icon} {row.label}</div>
                  <div style={{ fontSize: 12, color: row.label === "Status" ? (selected.open ? theme.green : theme.red) : row.label === "Distance" && postcodeStatus === "found" ? theme.green : theme.text, fontWeight: row.label === "Status" || (row.label === "Distance" && postcodeStatus === "found") ? 600 : 400 }}>{row.val}</div>
                </div>
              ))}
              {postcodeStatus === "found" && gps && (
                <div style={{ padding: "7px 10px", background: theme.green + "11", border: `1px solid ${theme.green}33`, borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: theme.green, fontWeight: 700, marginBottom: 2 }}>📍 POSTCODE ACTIVE</div>
                  <div style={{ fontSize: 11, color: theme.textMuted }}>Directions route from your exact location in {gps.city}</div>
                </div>
              )}
            </div>

            <hr style={s.hr} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <a href={`tel:${selected.phone}`} style={{ ...s.btn("primary"), width: "100%", textAlign: "center", textDecoration: "none", display: "block", boxSizing: "border-box" }}>📞 Call Now</a>
              <a href={mapsUrl(selected)} target="_blank" rel="noopener noreferrer" style={{ ...s.btn("ghost"), width: "100%", textAlign: "center", textDecoration: "none", display: "block", boxSizing: "border-box", border: `1px solid ${postcodeStatus === "found" ? theme.green + "66" : theme.border}`, color: postcodeStatus === "found" ? theme.green : theme.textMuted }}>
                {postcodeStatus === "found" ? "🗺 Directions from Postcode" : "🗺 Get Directions"}
              </a>
              <button style={{ ...s.btn("ghost"), width: "100%", textAlign: "center" }}>💾 Save to Suppliers</button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ── AI PROPOSAL WRITER ────────────────────────────────────
function AIProposals() {
  const [step, setStep] = useState("form"); // form | generating | result
  const [form, setForm] = useState({ client: "", job: "", scope: "", budget: "", timeline: "", tone: "Professional" });
  const [proposal, setProposal] = useState("");
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  const tones = ["Professional", "Friendly", "Concise", "Detailed"];

  const templates = {
    Professional: (f) => `PROPOSAL — ${f.job.toUpperCase()}\nPrepared for: ${f.client}\n\n─────────────────────────────\nEXECUTIVE SUMMARY\n─────────────────────────────\nThank you for the opportunity to submit this proposal for ${f.job}. Having reviewed your requirements, I am confident in delivering a high-quality outcome within your stated timeframe.\n\n─────────────────────────────\nSCOPE OF WORK\n─────────────────────────────\n${f.scope}\n\nThis engagement will be delivered in structured phases to ensure clarity, quality control, and on-time completion.\n\n─────────────────────────────\nDELIVERABLES\n─────────────────────────────\n• Initial consultation and briefing session\n• Detailed project plan and milestone schedule\n• Core deliverables as outlined in scope above\n• Review and revision rounds (up to 2 included)\n• Final handover with documentation\n\n─────────────────────────────\nINVESTMENT\n─────────────────────────────\nTotal project fee: ${f.budget}\nPayment terms: 50% deposit on acceptance, 50% on completion\n\n─────────────────────────────\nTIMELINE\n─────────────────────────────\nEstimated duration: ${f.timeline}\nProject start: Upon receipt of signed acceptance and deposit\n\n─────────────────────────────\nTERMS\n─────────────────────────────\n• This proposal is valid for 30 days\n• All work remains my intellectual property until payment is received in full\n• Scope changes may affect timeline and cost — any variations agreed in writing\n\nTo proceed, please sign and return this proposal with your deposit payment.\n\nI look forward to working with you.\n\n[Your Name]\n[Your Contact Details]`,

    Friendly: (f) => `Hi ${f.client}!\n\nThanks so much for reaching out — I'd love to help with ${f.job}. Here's a quick rundown of what I'm thinking:\n\n🎯 WHAT I'LL DO\n${f.scope}\n\n📦 WHAT YOU'LL GET\n• Everything scoped above, delivered with care\n• Regular check-ins so you're never in the dark\n• Up to 2 rounds of revisions — I want you to love the result\n• Full handover so you're set up for success\n\n💰 INVESTMENT\n${f.budget} all-in. I'd ask for 50% upfront and the rest when you're happy with the final result.\n\n⏱ TIMING\nI can get this wrapped up in ${f.timeline}. We'd kick off as soon as you give me the green light.\n\nAny questions, just shout — I'm happy to jump on a call. Otherwise, just say the word and we'll get started!\n\nCheers,\n[Your Name]`,

    Concise: (f) => `PROPOSAL: ${f.job}\nClient: ${f.client}\n\nSCOPE\n${f.scope}\n\nDELIVERABLES\n• Core work as scoped\n• 2 revision rounds\n• Final handover\n\nFEE: ${f.budget}\nTimeline: ${f.timeline}\nPayment: 50% deposit / 50% completion\nValid: 30 days\n\n[Your Name] | [Contact]`,

    Detailed: (f) => `DETAILED PROJECT PROPOSAL\n${"─".repeat(40)}\n\nPROJECT: ${f.job}\nCLIENT: ${f.client}\nDATE: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}\n\n1. BACKGROUND & OBJECTIVES\n─────────────────────────\nThis proposal has been prepared following discussions with ${f.client} regarding ${f.job}. The objective is to deliver a measurable, high-quality outcome aligned with your business goals and within agreed constraints.\n\n2. SCOPE OF WORK\n─────────────────────────\n${f.scope}\n\nOut of scope (unless agreed separately):\n• Any work not explicitly listed above\n• Third-party costs (software, materials, licences)\n• Ongoing maintenance post-delivery\n\n3. METHODOLOGY\n─────────────────────────\nPhase 1 — Discovery & Planning (Week 1)\nPhase 2 — Core Delivery (${f.timeline})\nPhase 3 — Review & Refinement (Up to 2 rounds)\nPhase 4 — Final Delivery & Handover\n\n4. INVESTMENT BREAKDOWN\n─────────────────────────\nProject total: ${f.budget}\n\nPayment schedule:\n  • 50% (${f.budget ? "£" + Math.round(parseInt(f.budget.replace(/[^0-9]/g, "")) / 2).toLocaleString() : "TBC"}) — due on project commencement\n  • 50% — due on final delivery and approval\n\nLate payment: Invoices unpaid after 30 days accrue interest at 8% above Bank of England base rate.\n\n5. TIMELINE\n─────────────────────────\nEstimated duration: ${f.timeline}\nCommencement: Within 5 business days of deposit receipt\nAll dates subject to timely client feedback at each phase.\n\n6. TERMS & CONDITIONS\n─────────────────────────\n• Intellectual property transfers to client upon receipt of final payment\n• Proposal valid for 30 days from date of issue\n• Either party may terminate with 14 days written notice\n• Governed by the laws of England and Wales\n\nACCEPTANCE\n─────────────────────────\nBy signing below, ${f.client} agrees to the terms of this proposal.\n\nSigned: _________________________ Date: _____________\n\n[Your Name] | [Your Company] | [Email] | [Phone]`,
  };

  const generate = () => {
    if (!form.client || !form.job) return;
    setStep("generating");
    let i = 0;
    const full = templates[form.tone](form);
    setProposal("");
    timerRef.current = setInterval(() => {
      i += 18;
      setProposal(full.slice(0, i));
      if (i >= full.length) { clearInterval(timerRef.current); setStep("result"); setProposal(full); }
    }, 16);
  };

  const copy = () => {
    navigator.clipboard?.writeText(proposal).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => { setStep("form"); setProposal(""); setForm({ client: "", job: "", scope: "", budget: "", timeline: "", tone: "Professional" }); };

  return (
    <div style={s.page}>
      <div style={{ ...s.row, justifyContent: "space-between" }}>
        <div><div style={s.ptitle}>🤖 AI Proposal Writer</div><div style={s.psub}>Fill in the details — get a professional proposal in seconds</div></div>
        {step !== "form" && <button style={s.btn("ghost")} onClick={reset}>← New Proposal</button>}
      </div>

      {step === "form" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Card accent={theme.accent} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={s.ct}>📋 Project Details</div>
            {[
              { label: "Client Name / Company", key: "client", placeholder: "e.g. Apex Studio" },
              { label: "Job / Project Title", key: "job", placeholder: "e.g. Brand Identity Design" },
              { label: "Budget / Fee", key: "budget", placeholder: "e.g. £2,400" },
              { label: "Timeline", key: "timeline", placeholder: "e.g. 3 weeks" },
            ].map(f => (
              <div key={f.key}>
                <label style={s.lbl}>{f.label}</label>
                <input style={s.input} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder} />
              </div>
            ))}
            <div>
              <label style={s.lbl}>Scope of Work</label>
              <textarea style={{ ...s.input, height: 80, resize: "vertical", lineHeight: 1.5 }} value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value })} placeholder="Describe what you'll deliver..." />
            </div>
          </Card>

          <Card style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={s.ct}>🎨 Proposal Tone</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {tones.map(t => (
                <button key={t} onClick={() => setForm({ ...form, tone: t })} style={{
                  padding: "12px 8px", borderRadius: 9, border: `1px solid ${form.tone === t ? theme.accent + "88" : theme.border}`,
                  background: form.tone === t ? theme.accentSoft : theme.bg, color: form.tone === t ? theme.accent : theme.textMuted,
                  cursor: "pointer", fontSize: 12, fontWeight: form.tone === t ? 700 : 400, fontFamily: "'DM Sans', sans-serif",
                  textAlign: "center", transition: "all 0.15s",
                }}>
                  {t === "Professional" ? "👔" : t === "Friendly" ? "😊" : t === "Concise" ? "⚡" : "📖"}<br />
                  <span style={{ fontSize: 11 }}>{t}</span>
                </button>
              ))}
            </div>
            <hr style={s.hr} />
            <div style={s.ct}>📎 Quick Templates</div>
            {[
              { label: "Web Design Project", job: "Website Design & Development", scope: "Design and build a responsive website including up to 5 pages, contact form, mobile optimisation, and CMS integration.", budget: "£2,500", timeline: "4 weeks" },
              { label: "Brand Identity", job: "Brand Identity Package", scope: "Logo design (3 concepts, 2 rounds of revisions), brand colour palette, typography system, and brand guidelines document.", budget: "£1,800", timeline: "3 weeks" },
              { label: "Monthly Retainer", job: "Monthly Marketing Retainer", scope: "10 hours per month of marketing support including social content creation, email campaigns, and performance reporting.", budget: "£950/month", timeline: "Ongoing" },
            ].map((t, i) => (
              <button key={i} onClick={() => setForm(f => ({ ...f, job: t.job, scope: t.scope, budget: t.budget, timeline: t.timeline }))}
                style={{ ...s.btn("ghost"), textAlign: "left", fontSize: 11, padding: "6px 10px" }}>
                ⚡ {t.label}
              </button>
            ))}
            <div style={{ marginTop: "auto", paddingTop: 10 }}>
              <button style={{ ...s.btn("primary"), width: "100%", padding: "10px", fontSize: 13 }} onClick={generate}>
                ✨ Generate Proposal
              </button>
            </div>
          </Card>
        </div>
      )}

      {(step === "generating" || step === "result") && (
        <Card accent={theme.accent} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ ...s.row, justifyContent: "space-between" }}>
            <div style={s.ct}>
              {step === "generating" ? "⏳ Writing your proposal..." : `✅ ${form.tone} Proposal — ${form.client}`}
            </div>
            {step === "result" && (
              <div style={s.row}>
                <button style={{ ...s.btn("ghost"), fontSize: 11, padding: "4px 10px", color: copied ? theme.green : theme.textMuted, border: `1px solid ${copied ? theme.green + "55" : theme.border}` }} onClick={copy}>
                  {copied ? "✅ Copied!" : "📋 Copy"}
                </button>
                <button style={{ ...s.btn("primary"), fontSize: 11, padding: "4px 10px" }}>📧 Send as Email</button>
              </div>
            )}
          </div>
          <pre style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, lineHeight: 1.7, color: theme.text, whiteSpace: "pre-wrap", wordBreak: "break-word", background: theme.bg, borderRadius: 9, padding: "12px 14px", margin: 0, border: `1px solid ${theme.border}`, overflowX: "hidden" }}>
            {proposal}{step === "generating" && <span style={{ animation: "blink 1s infinite", color: theme.accent }}>▋</span>}
          </pre>
          <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
        </Card>
      )}
    </div>
  );
}

// ── CASH FLOW FORECAST ────────────────────────────────────
function CashFlow() {
  const [balance, setBalance] = useLocalStorage("soloos_cashflow_balance", 0);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ label: "", amount: "", month: "Jun", type: "income" });
  const [items, setItems] = useLocalStorage("soloos_cashflow_items", []);

  const months = ["May", "Jun", "Jul"];
  const monthColors = [theme.blue, theme.accent, theme.green];

  const monthData = months.map((m, mi) => {
    const inc = items.filter(i => i.month === m && i.type === "income").reduce((s, i) => s + i.amount, 0);
    const exp = Math.abs(items.filter(i => i.month === m && i.type === "expense").reduce((s, i) => s + i.amount, 0));
    return { month: m, income: inc, expenses: exp, net: inc - exp, color: monthColors[mi] };
  });

  // Running balance
  let running = balance;
  const balances = monthData.map(m => { running += m.net; return running; });
  const minBal = Math.min(balance, ...balances);
  const maxBal = Math.max(balance, ...balances);

  const addItem = () => {
    if (!newItem.label || !newItem.amount) return;
    setItems([...items, { id: Date.now(), ...newItem, amount: newItem.type === "expense" ? -Math.abs(+newItem.amount) : +Math.abs(+newItem.amount), confirmed: false }]);
    setNewItem({ label: "", amount: "", month: "Jun", type: "income" });
    setShowAdd(false);
  };

  return (
    <div style={s.page}>
      <div style={{ ...s.row, justifyContent: "space-between" }}>
        <div><div style={s.ptitle}>💸 Cash Flow Forecast</div><div style={s.psub}>Predict your bank balance 90 days ahead</div></div>
        <button style={s.btn("primary")} onClick={() => setShowAdd(!showAdd)}>+ Add Item</button>
      </div>

      {/* Current balance input */}
      <div style={s.g3}>
        <Card accent={theme.blue}>
          <div style={s.ct}>🏦 Current Balance</div>
          <div style={{ ...s.row, gap: 8 }}>
            <span style={{ color: theme.textMuted, fontSize: 16 }}>£</span>
            <input type="number" value={balance} onChange={e => setBalance(+e.target.value)}
              style={{ ...s.input, fontSize: 22, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: theme.blue, background: "transparent", border: "none", padding: 0, width: "100%" }} />
          </div>
          <div style={s.sub}>Your bank balance today</div>
        </Card>
        {monthData.map((m, i) => (
          <Card key={m.month} accent={m.color}>
            <div style={s.ct}>{m.month} Projected Balance</div>
            <div style={{ ...s.stat, color: balances[i] < 0 ? theme.red : m.color }}>£{balances[i].toLocaleString()}</div>
            <div style={s.sub}>+£{m.income.toLocaleString()} in · -£{m.expenses.toLocaleString()} out</div>
          </Card>
        ))}
      </div>

      {/* Visual bar chart */}
      <Card>
        <div style={s.ct}>📊 90-Day Balance Trajectory</div>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", height: 100, padding: "0 8px" }}>
          {[{ label: "Now", val: balance, color: theme.textMuted }, ...monthData.map((m, i) => ({ label: m.month, val: balances[i], color: m.color }))].map((b, i) => {
            const range = maxBal - Math.min(0, minBal);
            const pct = range > 0 ? ((b.val - Math.min(0, minBal)) / range) * 100 : 50;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div style={{ fontSize: 10, color: b.color, fontWeight: 700 }}>£{(b.val / 1000).toFixed(1)}k</div>
                <div style={{ width: "100%", background: theme.border, borderRadius: 5, height: 80, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
                  <div style={{ width: "100%", height: `${Math.max(pct, 4)}%`, background: b.val < 0 ? theme.red : b.color, borderRadius: 5, transition: "height 0.5s ease" }} />
                </div>
                <div style={{ fontSize: 10, color: theme.textMuted }}>{b.label}</div>
              </div>
            );
          })}
        </div>
        {minBal < 1000 && (
          <div style={{ marginTop: 8, padding: "6px 10px", background: theme.red + "11", border: `1px solid ${theme.red}33`, borderRadius: 7, fontSize: 11, color: theme.red }}>
            ⚠️ Balance dips below £1,000 — consider chasing outstanding invoices or pushing a proposal
          </div>
        )}
      </Card>

      {/* Add item modal */}
      {showAdd && (
        <Modal
          title="💸 Add Cash Flow Item"
          subtitle="Add an expected income or expense to your forecast"
          accentColor={theme.blue}
          onClose={() => setShowAdd(false)}
          onComplete={addItem}
          completeLabel="✅ Add to Forecast"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ ...s.lbl, fontSize: 11, marginBottom: 5 }}>Description</label>
              <input style={{ ...s.input, fontSize: 13, padding: "9px 12px" }} value={newItem.label} onChange={e => setNewItem({ ...newItem, label: e.target.value })} placeholder="e.g. Invoice payment from Apex Studio" autoFocus />
            </div>
            <div>
              <label style={{ ...s.lbl, fontSize: 11, marginBottom: 5 }}>Amount (£)</label>
              <input style={{ ...s.input, fontSize: 13, padding: "9px 12px" }} type="number" value={newItem.amount} onChange={e => setNewItem({ ...newItem, amount: e.target.value })} placeholder="0" />
            </div>
            <div>
              <label style={{ ...s.lbl, fontSize: 11, marginBottom: 5 }}>Month</label>
              <div style={{ display: "flex", gap: 8 }}>
                {months.map(m => (
                  <button key={m} onClick={() => setNewItem({ ...newItem, month: m })} style={{
                    flex: 1, padding: "10px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: newItem.month === m ? 700 : 400,
                    fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
                    background: newItem.month === m ? theme.blue + "22" : theme.bg,
                    color: newItem.month === m ? theme.blue : theme.textMuted,
                    border: `1px solid ${newItem.month === m ? theme.blue + "66" : theme.border}`,
                  }}>{m}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ ...s.lbl, fontSize: 11, marginBottom: 5 }}>Type</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[{ val: "income", label: "💰 Income", color: theme.green }, { val: "expense", label: "💸 Expense", color: theme.red }].map(t => (
                  <button key={t.val} onClick={() => setNewItem({ ...newItem, type: t.val })} style={{
                    flex: 1, padding: "10px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: newItem.type === t.val ? 700 : 400,
                    fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
                    background: newItem.type === t.val ? t.color + "22" : theme.bg,
                    color: newItem.type === t.val ? t.color : theme.textMuted,
                    border: `1px solid ${newItem.type === t.val ? t.color + "66" : theme.border}`,
                  }}>{t.label}</button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Month breakdown */}
      <div style={s.g3}>
        {months.map((m, mi) => {
          const mItems = items.filter(i => i.month === m);
          return (
            <Card key={m} accent={monthColors[mi]}>
              <div style={s.ct}>{m} Breakdown</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {mItems.map(item => (
                  <div key={item.id} style={{ ...s.row, justifyContent: "space-between", opacity: item.confirmed ? 1 : 0.65 }}>
                    <span style={{ fontSize: 11, flex: 1 }}>{item.confirmed ? "✅" : "⏳"} {item.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: item.amount > 0 ? theme.green : theme.red, flexShrink: 0 }}>
                      {item.amount > 0 ? "+" : ""}£{Math.abs(item.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <hr style={s.hr} />
              <div style={{ ...s.row, justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: theme.textMuted }}>Net</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: monthData[mi].net >= 0 ? theme.green : theme.red }}>
                  {monthData[mi].net >= 0 ? "+" : ""}£{monthData[mi].net.toLocaleString()}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── EXPENSES & VAT ────────────────────────────────────────
function Expenses() {
  const [expenses, setExpenses] = useLocalStorage("soloos_expenses", []);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ desc: "", amount: "", cat: "Software", vat: false });

  const cats = ["Software", "Office", "Travel", "Equipment", "Entertainment", "Professional", "Marketing", "Other"];
  const catColors = { Software: theme.blue, Office: theme.accent, Travel: theme.green, Equipment: theme.gold, Entertainment: "#e07bff", Professional: theme.red, Marketing: "#ff9f57", Other: theme.textMuted };

  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
  const vatReclaimable = expenses.filter(e => e.vat).reduce((s, e) => s + e.amount * 0.2, 0);
  const vatQuarterlyRevenue = 0;
  const vatOwed = vatQuarterlyRevenue * 0.2 - vatReclaimable;
  const vatDue = "31 Jul 2026";
  const daysToVat = Math.round((new Date("2026-07-31") - new Date()) / 86400000);

  const addExpense = () => {
    if (!form.desc || !form.amount) return;
    setExpenses([...expenses, { id: Date.now(), ...form, amount: +form.amount, date: "Today", receipt: false }]);
    setForm({ desc: "", amount: "", cat: "Software", vat: false });
    setAdding(false);
  };

  const catTotals = cats.map(c => ({ cat: c, total: expenses.filter(e => e.cat === c).reduce((s, e) => s + e.amount, 0) })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  return (
    <div style={s.page}>
      <div style={{ ...s.row, justifyContent: "space-between" }}>
        <div><div style={s.ptitle}>🧾 Expenses & VAT</div><div style={s.psub}>Log expenses, track VAT owed and reclaim what you're due</div></div>
        <button style={s.btn("primary")} onClick={() => setAdding(!adding)}>+ Log Expense</button>
      </div>

      {/* Top stats */}
      <div style={s.g3}>
        <Card accent={theme.red}>
          <div style={s.ct}>💸 Total Expenses (May)</div>
          <div style={{ ...s.stat, color: theme.red }}>£{totalExp.toLocaleString()}</div>
          <div style={s.sub}>{expenses.length} transactions logged</div>
        </Card>
        <Card accent={theme.green}>
          <div style={s.ct}>♻️ VAT Reclaimable</div>
          <div style={{ ...s.stat, color: theme.green }}>£{vatReclaimable.toFixed(0)}</div>
          <div style={s.sub}>On VAT-registered purchases</div>
        </Card>
        <Card accent={theme.gold}>
          <div style={s.ct}>📋 VAT Due to HMRC</div>
          <div style={{ ...s.stat, color: theme.gold }}>£{vatOwed.toFixed(0)}</div>
          <div style={s.sub}>{vatDue} · {daysToVat} days away</div>
          <div style={{ marginTop: 7 }}><Bar pct={100 - (daysToVat / 90) * 100} color={daysToVat < 30 ? theme.red : theme.gold} /></div>
        </Card>
      </div>

      {/* Add expense */}
      {adding && (
        <Modal
          title="🧾 Log Expense"
          subtitle="Enter the expense details below"
          accentColor={theme.red}
          onClose={() => setAdding(false)}
          onComplete={addExpense}
          completeLabel="✅ Save Expense"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ ...s.lbl, fontSize: 11, marginBottom: 5 }}>Description</label>
              <input style={{ ...s.input, fontSize: 13, padding: "9px 12px" }} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="What was it for?" autoFocus />
            </div>
            <div>
              <label style={{ ...s.lbl, fontSize: 11, marginBottom: 5 }}>Amount (£)</label>
              <input style={{ ...s.input, fontSize: 13, padding: "9px 12px" }} type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0" />
            </div>
            <div>
              <label style={{ ...s.lbl, fontSize: 11, marginBottom: 5 }}>Category</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                {cats.map(c => (
                  <button key={c} onClick={() => setForm({ ...form, cat: c })} style={{
                    padding: "8px", borderRadius: 7, cursor: "pointer", fontSize: 11, fontWeight: form.cat === c ? 700 : 400,
                    fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s",
                    background: form.cat === c ? (catColors[c] || theme.accent) + "22" : theme.bg,
                    color: form.cat === c ? (catColors[c] || theme.accent) : theme.textMuted,
                    border: `1px solid ${form.cat === c ? (catColors[c] || theme.accent) + "66" : theme.border}`,
                  }}>{c}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ ...s.lbl, fontSize: 11, marginBottom: 5 }}>VAT applicable?</label>
              <div style={{ display: "flex", gap: 8 }}>
                {["Yes", "No"].map(v => (
                  <button key={v} onClick={() => setForm({ ...form, vat: v === "Yes" })} style={{
                    flex: 1, padding: "10px", borderRadius: 8, border: `1px solid ${(v === "Yes") === form.vat ? theme.accent + "88" : theme.border}`,
                    background: (v === "Yes") === form.vat ? theme.accentSoft : "transparent",
                    color: (v === "Yes") === form.vat ? theme.accent : theme.textMuted,
                    cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                  }}>{v}</button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      <div style={s.g2}>
        {/* Category breakdown */}
        <Card>
          <div style={s.ct}>📊 Spending by Category</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {catTotals.map(c => (
              <div key={c.cat}>
                <div style={{ ...s.row, justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 12 }}>{c.cat}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: catColors[c.cat] || theme.textMuted }}>£{c.total}</span>
                </div>
                <Bar pct={(c.total / totalExp) * 100} color={catColors[c.cat] || theme.textMuted} />
              </div>
            ))}
          </div>
        </Card>

        {/* VAT Summary */}
        <Card>
          <div style={s.ct}>💡 VAT Summary</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { label: "Revenue this quarter", val: `£${vatQuarterlyRevenue.toLocaleString()}`, color: theme.green },
              { label: "VAT collected (20%)", val: `£${(vatQuarterlyRevenue * 0.2).toFixed(0)}`, color: theme.gold },
              { label: "VAT reclaimable on expenses", val: `-£${vatReclaimable.toFixed(0)}`, color: theme.blue },
              { label: "Net VAT owed to HMRC", val: `£${vatOwed.toFixed(0)}`, color: theme.red },
            ].map((r, i) => (
              <div key={i} style={{ ...s.row, justifyContent: "space-between", padding: "7px 10px", background: theme.bg, borderRadius: 7 }}>
                <span style={{ fontSize: 11, color: theme.textMuted }}>{r.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: r.color }}>{r.val}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Full-width expense log at bottom */}
      <Card style={{ width: "100%", boxSizing: "border-box" }}>
        <div style={{ ...s.ct, justifyContent: "space-between" }}>
          <span>🧾 Expense Log</span>
          <span style={{ color: theme.textMuted, fontSize: 9, textTransform: "none", letterSpacing: 0, fontWeight: 400 }}>{expenses.length} transactions · £{totalExp.toLocaleString()} total</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "30%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "16%" }} />
          </colgroup>
          <thead>
            <tr>
              {["Description", "Category", "Amount", "VAT", "Receipt", "Date"].map(h => (
                <th key={h} style={s.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e.id} style={{ transition: "background 0.1s" }}>
                <td style={{ ...s.td, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12 }}>{e.desc}</td>
                <td style={s.td}><Pill color={catColors[e.cat] || theme.textMuted}>{e.cat}</Pill></td>
                <td style={{ ...s.td, fontWeight: 700, color: theme.red, fontSize: 13, whiteSpace: "nowrap" }}>£{e.amount.toLocaleString()}</td>
                <td style={{ ...s.td, textAlign: "center" }}><span style={{ color: e.vat ? theme.green : theme.textMuted, fontSize: 13 }}>{e.vat ? "✅" : "—"}</span></td>
                <td style={{ ...s.td, textAlign: "center" }}><span style={{ color: e.receipt ? theme.green : theme.gold, fontSize: 13 }}>{e.receipt ? "✅" : "⚠️"}</span></td>
                <td style={{ ...s.td, color: theme.textMuted, fontSize: 11 }}>{e.date}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: `2px solid ${theme.border}` }}>
              <td style={{ ...s.td, fontWeight: 700, fontSize: 12 }}>Total</td>
              <td style={s.td} />
              <td style={{ ...s.td, fontWeight: 800, color: theme.red, fontSize: 14 }}>£{totalExp.toLocaleString()}</td>
              <td style={{ ...s.td, fontSize: 11, color: theme.textMuted }}>£{vatReclaimable.toFixed(0)} reclaim</td>
              <td style={{ ...s.td, fontSize: 11, color: theme.gold }}>{expenses.filter(e => !e.receipt).length} missing</td>
              <td style={s.td} />
            </tr>
          </tfoot>
        </table>
      </Card>
    </div>
  );
}

// ── SHELL ─────────────────────────────────────────────────
const tabs = [
  { id: "dashboard",  label: "🏠 Dashboard" },
  { id: "invoicing",  label: "📄 Invoicing" },
  { id: "time",       label: "⏱ Time" },
  { id: "clients",    label: "👥 Clients" },
  { id: "proposals",  label: "📊 Proposals" },
  { id: "ai",         label: "🤖 AI Proposals" },
  { id: "cashflow",   label: "💸 Cash Flow" },
  { id: "expenses",   label: "🧾 Expenses & VAT" },
  { id: "suppliers",  label: "🏪 Suppliers" },
];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const navRef = useRef(null);
  const pageRef = useRef(null);
  const [agreed, setAgreed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  useEffect(() => {
    const l1 = document.createElement("link"); l1.rel = "preconnect"; l1.href = "https://fonts.googleapis.com"; document.head.appendChild(l1);
    const l2 = document.createElement("link"); l2.rel = "stylesheet"; l2.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap"; document.head.appendChild(l2);
  }, []);

  useEffect(() => {
    if (pageRef.current) pageRef.current.scrollTop = 0;
    const activeBtn = navRef.current?.querySelector("[data-active='true']");
    if (activeBtn) activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [tab]);

  const scrollNav  = (dir) => { if (navRef.current)  navRef.current.scrollBy({ left: dir * 120, behavior: "smooth" }); };
  const scrollPage = (dir) => { if (pageRef.current) pageRef.current.scrollBy({ top: dir * 220, behavior: "smooth" }); };

  const views = { dashboard: Dashboard, invoicing: Invoicing, time: TimeTracker, clients: CRM, proposals: Proposals, ai: AIProposals, cashflow: CashFlow, expenses: Expenses, suppliers: Suppliers };
  const View = views[tab];

  const scrollBtnBase = {
    background: theme.surface, border: `1px solid ${theme.border}`, color: theme.textMuted,
    borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif",
  };

  return (
    <div style={s.app}>

      {/* ── DISCLAIMER POPUP ── */}
      {showDisclaimer && !agreed && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: "rgba(0,0,0,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20, boxSizing: "border-box",
        }}>
          <div style={{
            background: theme.surface, borderRadius: 16,
            border: `1px solid ${theme.accent}55`,
            boxShadow: `0 0 40px ${theme.accent}22`,
            width: "100%", maxWidth: 480,
            padding: "28px 28px 24px",
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 32 }}>⚠️</div>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: theme.text }}>Before you get started</div>
                <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>Please read and agree to continue</div>
              </div>
            </div>

            <hr style={s.hr} />

            {/* Disclaimer text */}
            <div style={{ fontSize: 12, color: theme.text, lineHeight: 1.7, marginBottom: 16 }}>
              <p style={{ marginBottom: 10 }}>
                <strong style={{ color: theme.gold }}>Data Storage:</strong> SoloOS currently stores your data within your browser session only. This means your data <strong>may be lost</strong> if you clear your browser cache, reinstall the app, or switch devices.
              </p>
              <p style={{ marginBottom: 10 }}>
                <strong style={{ color: theme.gold }}>Your Responsibility:</strong> You are responsible for backing up any information you enter into SoloOS. We strongly recommend downloading a data backup summary regularly using the button on the Dashboard.
              </p>
              <p style={{ marginBottom: 10 }}>
                <strong style={{ color: theme.gold }}>No Liability:</strong> The developer of SoloOS accepts no responsibility for any loss of data, financial loss, or any other loss arising from the use of this app or from data not being saved, backed up, or recovered.
              </p>
              <p style={{ fontSize: 11, color: theme.textMuted }}>
                SoloOS provides estimates only. Always consult a qualified accountant for tax and financial advice.
              </p>
            </div>

            <hr style={s.hr} />

            {/* Checkbox */}
            <div
              onClick={() => setChecked(!checked)}
              style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer", padding: "10px 0", marginBottom: 16 }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
                background: checked ? theme.accent : "transparent",
                border: `2px solid ${checked ? theme.accent : theme.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}>
                {checked && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ fontSize: 12, color: theme.text, lineHeight: 1.5 }}>
                I understand that SoloOS does not automatically save my data and that the developer is not liable for any data loss. I will back up my information regularly.
              </span>
            </div>

            {/* Button */}
            <button
              onClick={() => { if (checked) { setAgreed(true); setShowDisclaimer(false); } }}
              style={{
                width: "100%", padding: "12px", borderRadius: 9, border: "none",
                background: checked ? theme.accent : theme.border,
                color: checked ? "#fff" : theme.textMuted,
                fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
                cursor: checked ? "pointer" : "not-allowed",
                transition: "all 0.2s",
              }}
            >
              {checked ? "✅ I Agree — Enter SoloOS" : "Please tick the box above to continue"}
            </button>

            <div style={{ textAlign: "center", marginTop: 10, fontSize: 10, color: theme.textDim }}>
              This disclaimer is shown once per session
            </div>
          </div>
        </div>
      )}
      {/* Top nav bar */}
      <div style={s.topBar}>
        <div style={s.logo}>SoloOS</div>

        {/* Nav with left/right scroll arrows */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, flex: 1, minWidth: 0, margin: "0 12px" }}>
          <button
            onClick={() => scrollNav(-1)}
            style={{ ...scrollBtnBase, width: 26, height: 26, fontSize: 13 }}
            title="Scroll tabs left"
          >‹</button>

          <nav ref={navRef} style={s.navTabs}>
            {tabs.map(t => (
              <button
                key={t.id}
                data-active={tab === t.id ? "true" : "false"}
                style={s.navTab(tab === t.id)}
                onClick={() => setTab(t.id)}
              >{t.label}</button>
            ))}
          </nav>

          <button
            onClick={() => scrollNav(1)}
            style={{ ...scrollBtnBase, width: 26, height: 26, fontSize: 13 }}
            title="Scroll tabs right"
          >›</button>
        </div>

        <div style={{ width: 28, height: 28, borderRadius: 7, background: `linear-gradient(135deg, ${theme.accent}, ${theme.blue})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>Y</div>
      </div>

      {/* Page area with up/down scroll buttons */}
      <div style={{ flex: 1, display: "flex", flexDirection: "row", overflow: "hidden", position: "relative" }}>
        {/* Scrollable page content */}
        <div ref={pageRef} style={{ flex: 1, overflowY: "auto", overflowX: "hidden", scrollbarWidth: "thin", scrollbarColor: `${theme.border} transparent`, minWidth: 0 }}>
          <View />
        </div>

        {/* Up / Down scroll buttons — right edge */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 6, padding: "8px 6px", borderLeft: `1px solid ${theme.border}`, background: theme.surface }}>
          <button
            onClick={() => scrollPage(-1)}
            style={{ ...scrollBtnBase, width: 28, height: 28, fontSize: 14 }}
            title="Scroll up"
          >↑</button>
          <button
            onClick={() => scrollPage(1)}
            style={{ ...scrollBtnBase, width: 28, height: 28, fontSize: 14 }}
            title="Scroll down"
          >↓</button>
        </div>
      </div>
    </div>
  );
}
