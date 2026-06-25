import { useState, useEffect, useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const ADMIN_EMAIL = "admin@hifz.com";
const ADMIN_PASSWORD = "Admin@1234";
const ADMIN_NAME = "Administrator";

const SURAHS = [
  "Al-Fatiha","Al-Baqarah","Al-Imran","An-Nisa","Al-Maidah","Al-Anam","Al-Araf","Al-Anfal","At-Tawbah","Yunus",
  "Hud","Yusuf","Ar-Ra'd","Ibrahim","Al-Hijr","An-Nahl","Al-Isra","Al-Kahf","Maryam","Ta-Ha",
  "Al-Anbiya","Al-Hajj","Al-Mu'minun","An-Nur","Al-Furqan","Ash-Shu'ara","An-Naml","Al-Qasas","Al-Ankabut","Ar-Rum",
  "Luqman","As-Sajdah","Al-Ahzab","Saba","Fatir","Ya-Sin","As-Saffat","Sad","Az-Zumar","Ghafir",
  "Fussilat","Ash-Shura","Az-Zukhruf","Ad-Dukhan","Al-Jathiyah","Al-Ahqaf","Muhammad","Al-Fath","Al-Hujurat","Qaf",
  "Adh-Dhariyat","At-Tur","An-Najm","Al-Qamar","Ar-Rahman","Al-Waqi'ah","Al-Hadid","Al-Mujadila","Al-Hashr","Al-Mumtahanah",
  "As-Saf","Al-Jumu'ah","Al-Munafiqun","At-Taghabun","At-Talaq","At-Tahrim","Al-Mulk","Al-Qalam","Al-Haqqah","Al-Ma'arij",
  "Nuh","Al-Jinn","Al-Muzzammil","Al-Muddaththir","Al-Qiyamah","Al-Insan","Al-Mursalat","An-Naba","An-Nazi'at","Abasa",
  "At-Takwir","Al-Infitar","Al-Mutaffifin","Al-Inshiqaq","Al-Buruj","At-Tariq","Al-Ala","Al-Ghashiyah","Al-Fajr","Al-Balad",
  "Ash-Shams","Al-Layl","Ad-Duha","Ash-Sharh","At-Tin","Al-Alaq","Al-Qadr","Al-Bayyinah","Az-Zalzalah","Al-Adiyat",
  "Al-Qari'ah","At-Takathur","Al-Asr","Al-Humazah","Al-Fil","Quraysh","Al-Ma'un","Al-Kawthar","Al-Kafirun","An-Nasr",
  "Al-Masad","Al-Ikhlas","Al-Falaq","An-Nas"
];
const JUZAA = Array.from({ length: 30 }, (_, i) => `Juz ${i + 1}`);
const today = () => new Date().toISOString().split("T")[0];
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const uid = () => Date.now() + Math.random().toString(36).slice(2, 7);

// ─── Storage helpers (in-memory, shared via React state) ──────────────────────
const STORE_KEY = "hifzPortalData_v2";
function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    teachers: [
      { id: "admin", name: ADMIN_NAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: "admin", approved: true, createdAt: today() }
    ],
    students: [],
    progress: [],
    attendance: [],
    dues: [],
  };
}
function saveStore(data) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch {}
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const C = {
  bg: "#0d1b0d", card: "#142014", border: "#1e3a1e",
  gold: "#c9a84c", goldDim: "rgba(201,168,76,0.15)",
  text: "#e8e0d0", muted: "#7a9e7a", danger: "#e05c5c",
  green: "#4caf6a", sidebar: "#0a150a",
};

const S = {
  app: { minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Georgia', 'Times New Roman', serif" },
  // login
  loginWrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(160deg, #0a150a 0%, #1a2d1a 100%)` },
  loginCard: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "44px 40px", width: 400, boxShadow: "0 32px 80px rgba(0,0,0,0.6)" },
  arabicTitle: { textAlign: "center", fontSize: 22, color: C.gold, marginBottom: 4, lineHeight: 1.5, direction: "rtl" },
  arabicSub: { textAlign: "center", fontSize: 13, color: C.muted, marginBottom: 28 },
  crescent: { textAlign: "center", fontSize: 42, marginBottom: 10 },
  label: { display: "block", fontSize: 11, color: C.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: 1.2 },
  input: { width: "100%", background: "#0d1b0d", border: `1px solid ${C.border}`, borderRadius: 7, padding: "11px 14px", color: C.text, fontSize: 14, outline: "none", boxSizing: "border-box", marginBottom: 14, fontFamily: "Georgia, serif" },
  btn: (variant = "gold") => ({
    background: variant === "gold" ? C.gold : variant === "green" ? "#2e6b3a" : variant === "danger" ? "transparent" : "transparent",
    color: variant === "gold" ? "#0d1b0d" : variant === "danger" ? C.danger : variant === "green" ? C.text : C.gold,
    border: variant === "danger" ? `1px solid ${C.danger}` : variant === "outline" ? `1px solid ${C.gold}` : "none",
    borderRadius: 6, padding: "8px 18px", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "Georgia, serif",
  }),
  btnFull: { width: "100%", padding: "12px", marginTop: 4 },
  sidebar: { width: 240, background: C.sidebar, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", minHeight: "100vh", position: "fixed", top: 0, left: 0, zIndex: 10 },
  sidebarLogo: { padding: "22px 18px 18px", borderBottom: `1px solid ${C.border}` },
  sidebarAr: { color: C.gold, fontSize: 15, fontWeight: 700, direction: "rtl", textAlign: "right", lineHeight: 1.6, marginBottom: 2 },
  sidebarEn: { color: C.muted, fontSize: 11 },
  sidebarNav: { flex: 1, padding: "10px 0" },
  navItem: (active) => ({ display: "flex", alignItems: "center", gap: 10, padding: "11px 18px", cursor: "pointer", color: active ? C.gold : "#9abf9a", background: active ? C.goldDim : "transparent", borderLeft: `3px solid ${active ? C.gold : "transparent"}`, fontSize: 13.5 }),
  sidebarFooter: { padding: "16px 18px", borderTop: `1px solid ${C.border}` },
  main: { marginLeft: 240, padding: "30px 36px", minHeight: "100vh" },
  pageTitle: { fontSize: 23, color: C.gold, marginBottom: 5, fontWeight: 700 },
  pageSub: { color: C.muted, fontSize: 13, marginBottom: 26 },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "22px 26px", marginBottom: 20 },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 26 },
  statCard: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "20px 22px" },
  statNum: { fontSize: 30, color: C.gold, fontWeight: 700, marginBottom: 4 },
  statLabel: { color: C.muted, fontSize: 12 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 14px", color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, borderBottom: `1px solid ${C.border}` },
  td: { padding: "12px 14px", borderBottom: `1px solid #111e11`, fontSize: 14, verticalAlign: "middle" },
  badge: (c) => ({ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: c === "green" ? "rgba(76,175,106,0.2)" : c === "red" ? "rgba(224,92,92,0.2)" : c === "gold" ? "rgba(201,168,76,0.18)" : "rgba(150,150,150,0.15)", color: c === "green" ? "#7ecf7e" : c === "red" ? C.danger : c === "gold" ? C.gold : "#aaa" }),
  modal: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 },
  modalCard: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "32px 36px", width: 540, maxHeight: "88vh", overflowY: "auto" },
  modalTitle: { color: C.gold, fontSize: 19, marginBottom: 20, fontWeight: 700 },
  select: { background: "#0d1b0d", border: `1px solid ${C.border}`, borderRadius: 7, padding: "11px 14px", color: C.text, fontSize: 14, outline: "none", width: "100%", marginBottom: 14, boxSizing: "border-box", fontFamily: "Georgia, serif" },
  textarea: { background: "#0d1b0d", border: `1px solid ${C.border}`, borderRadius: 7, padding: "11px 14px", color: C.text, fontSize: 14, outline: "none", width: "100%", marginBottom: 14, boxSizing: "border-box", minHeight: 80, fontFamily: "Georgia, serif", resize: "vertical" },
  sectionHead: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 },
  row: { display: "flex", gap: 14 },
  err: { color: C.danger, fontSize: 12, marginBottom: 10 },
  success: { color: C.green, fontSize: 12, marginBottom: 10 },
};

const QColors = { "Excellent": "green", "Good": "gold", "Needs Work": "red", "Revision": "" };

// ─── Print / PDF helper ───────────────────────────────────────────────────────
function printDiv(id, title) {
  const el = document.getElementById(id);
  if (!el) return;
  const w = window.open("", "_blank");
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
  <style>
    body { font-family: Georgia, serif; color: #111; background: #fff; padding: 32px; }
    h1 { color: #1a4a1a; border-bottom: 2px solid #c9a84c; padding-bottom: 8px; }
    h2 { color: #1a4a1a; margin-top: 28px; font-size: 15px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
    th { background: #1a4a1a; color: #fff; padding: 8px 10px; text-align: left; }
    td { padding: 8px 10px; border-bottom: 1px solid #ddd; }
    tr:nth-child(even) td { background: #f5f9f5; }
    .badge { display:inline-block; padding: 2px 8px; border-radius:12px; font-size:11px; font-weight:700; }
    .green { background:#d4edda; color:#155724; }
    .red { background:#f8d7da; color:#721c24; }
    .gold { background:#fff3cd; color:#856404; }
    .meta { font-size:12px; color:#555; margin-bottom:20px; }
    .arabic { direction:rtl; font-size:18px; color:#1a4a1a; margin-bottom:4px; }
    @media print { body { padding:16px; } }
  </style></head><body>`);
  w.document.write(el.innerHTML);
  w.document.write("</body></html>");
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); }, 400);
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [store, setStoreRaw] = useState(loadStore);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"

  const setStore = (updater) => {
    setStoreRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveStore(next);
      return next;
    });
  };

  const isAdmin = user?.role === "admin";
  const myStudents = store.students.filter(s => isAdmin ? true : s.teacherId === user?.id);

  if (!user) return <Auth store={store} setStore={setStore} onLogin={setUser} authMode={authMode} setAuthMode={setAuthMode} />;

  const NAV = [
    { id: "dashboard", icon: "⊞", label: "Dashboard" },
    { id: "students", icon: "👤", label: "Students" },
    { id: "progress", icon: "📖", label: "Memorisation" },
    { id: "attendance", icon: "✓", label: "Attendance" },
    { id: "dues", icon: "£", label: "Weekly Dues" },
    { id: "reports", icon: "📊", label: "Reports" },
    ...(isAdmin ? [{ id: "admin", icon: "⚙", label: "Admin Panel" }] : []),
  ];

  return (
    <div style={S.app}>
      {/* Sidebar */}
      <div style={S.sidebar}>
        <div style={S.sidebarLogo}>
          <div style={S.sidebarAr}>حلقة التحفيظ</div>
          <div style={{ ...S.sidebarAr, fontSize: 12, color: C.muted }}>القرآن الكريم</div>
          <div style={{ ...S.sidebarEn, marginTop: 4 }}>Quran Memorisation Circle</div>
        </div>
        <nav style={S.sidebarNav}>
          {NAV.map(n => (
            <div key={n.id} style={S.navItem(tab === n.id)} onClick={() => setTab(n.id)}>
              <span>{n.icon}</span><span>{n.label}</span>
            </div>
          ))}
        </nav>
        <div style={S.sidebarFooter}>
          {isAdmin && <div style={{ ...S.badge("gold"), marginBottom: 8, fontSize: 10 }}>ADMIN</div>}
          <div style={{ color: C.muted, fontSize: 11, marginBottom: 3 }}>Signed in as</div>
          <div style={{ color: C.gold, fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{user.name}</div>
          <button style={{ ...S.btn("outline"), width: "100%", fontSize: 12 }} onClick={() => setUser(null)}>Sign Out</button>
        </div>
      </div>

      {/* Main */}
      <main style={S.main}>
        {tab === "dashboard" && <Dashboard user={user} isAdmin={isAdmin} store={store} myStudents={myStudents} />}
        {tab === "students" && <Students user={user} isAdmin={isAdmin} store={store} setStore={setStore} myStudents={myStudents} />}
        {tab === "progress" && <Progress user={user} isAdmin={isAdmin} store={store} setStore={setStore} myStudents={myStudents} />}
        {tab === "attendance" && <AttendancePage user={user} isAdmin={isAdmin} store={store} setStore={setStore} myStudents={myStudents} />}
        {tab === "dues" && <DuesPage user={user} isAdmin={isAdmin} store={store} setStore={setStore} myStudents={myStudents} />}
        {tab === "reports" && <Reports user={user} isAdmin={isAdmin} store={store} myStudents={myStudents} />}
        {tab === "admin" && isAdmin && <AdminPanel store={store} setStore={setStore} />}
      </main>
    </div>
  );
}

// ─── Auth (Login + Register) ──────────────────────────────────────────────────
function Auth({ store, setStore, onLogin, authMode, setAuthMode }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");

  const login = () => {
    setErr("");
    if (form.email === ADMIN_EMAIL && form.password === ADMIN_PASSWORD) {
      onLogin(store.teachers.find(t => t.role === "admin") || { id: "admin", name: ADMIN_NAME, email: ADMIN_EMAIL, role: "admin" });
      return;
    }
    const t = store.teachers.find(t => t.email.toLowerCase() === form.email.toLowerCase() && t.password === form.password);
    if (!t) return setErr("Invalid email or password.");
    if (!t.approved) return setErr("Your account is pending admin approval.");
    onLogin(t);
  };

  const register = () => {
    setErr("");
    if (!form.name || !form.email || !form.password) return setErr("All fields are required.");
    if (form.password !== form.confirm) return setErr("Passwords do not match.");
    if (form.password.length < 6) return setErr("Password must be at least 6 characters.");
    if (store.teachers.find(t => t.email.toLowerCase() === form.email.toLowerCase())) return setErr("Email already registered.");
    const newTeacher = { id: uid(), name: form.name, email: form.email, password: form.password, role: "teacher", approved: false, createdAt: today() };
    setStore(prev => ({ ...prev, teachers: [...prev.teachers, newTeacher] }));
    setSuccess("Account created! Please wait for admin approval before logging in.");
    setAuthMode("login");
    setForm({ name: "", email: "", password: "", confirm: "" });
  };

  return (
    <div style={S.loginWrap}>
      <div style={S.loginCard}>
        <div style={S.crescent}>☽</div>
        <div style={S.arabicTitle}>حلقة التحفيظ القرآن الكريم</div>
        <div style={S.arabicSub}>Quran Memorisation Circle Portal</div>

        {authMode === "login" ? (
          <>
            <label style={S.label}>Email</label>
            <input style={S.input} type="email" placeholder="teacher@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <label style={S.label}>Password</label>
            <input style={S.input} type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} onKeyDown={e => e.key === "Enter" && login()} />
            {err && <div style={S.err}>{err}</div>}
            {success && <div style={S.success}>{success}</div>}
            <button style={{ ...S.btn("gold"), ...S.btnFull }} onClick={login}>Sign In</button>
            <div style={{ textAlign: "center", marginTop: 18, color: C.muted, fontSize: 13 }}>
              New teacher?{" "}
              <span style={{ color: C.gold, cursor: "pointer", fontWeight: 700 }} onClick={() => { setAuthMode("register"); setErr(""); setSuccess(""); }}>
                Create an account
              </span>
            </div>
          </>
        ) : (
          <>
            <label style={S.label}>Full Name</label>
            <input style={S.input} placeholder="Ustadh / Ustadha …" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <label style={S.label}>Email</label>
            <input style={S.input} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <label style={S.label}>Password</label>
            <input style={S.input} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            <label style={S.label}>Confirm Password</label>
            <input style={S.input} type="password" value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} onKeyDown={e => e.key === "Enter" && register()} />
            {err && <div style={S.err}>{err}</div>}
            <button style={{ ...S.btn("gold"), ...S.btnFull }} onClick={register}>Create Account</button>
            <div style={{ textAlign: "center", marginTop: 18, color: C.muted, fontSize: 13 }}>
              Already have an account?{" "}
              <span style={{ color: C.gold, cursor: "pointer", fontWeight: 700 }} onClick={() => { setAuthMode("login"); setErr(""); }}>Sign in</span>
            </div>
            <div style={{ marginTop: 14, background: C.goldDim, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: C.muted }}>
              ⓘ Your account will be reviewed by the admin before access is granted.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ user, isAdmin, store, myStudents }) {
  const todayStr = today();
  const myAttend = store.attendance.filter(a => myStudents.find(s => s.id === a.studentId));
  const todayPresent = myAttend.filter(a => a.date === todayStr && a.status === "Present").length;
  const unpaid = store.dues.filter(d => !d.paid && myStudents.find(s => s.id === d.studentId));
  const myProgress = store.progress.filter(p => myStudents.find(s => s.id === p.studentId));
  const pending = isAdmin ? store.teachers.filter(t => !t.approved && t.role !== "admin") : [];

  return (
    <div>
      <div style={{ direction: "rtl", textAlign: "right", marginBottom: 4 }}>
        <span style={{ fontSize: 15, color: C.gold }}>بسم الله الرحمن الرحيم</span>
      </div>
      <div style={S.pageTitle}>مرحباً، {user.name.split(" ").slice(-1)[0]}</div>
      <div style={S.pageSub}>Welcome back — {fmtDate(todayStr)}</div>

      {isAdmin && pending.length > 0 && (
        <div style={{ background: "rgba(201,168,76,0.12)", border: `1px solid ${C.gold}`, borderRadius: 8, padding: "12px 18px", marginBottom: 20, fontSize: 13 }}>
          ⚠ <strong style={{ color: C.gold }}>{pending.length} teacher account{pending.length > 1 ? "s" : ""}</strong> awaiting your approval. Go to <strong>Admin Panel</strong> to review.
        </div>
      )}

      <div style={S.statGrid}>
        <div style={S.statCard}><div style={S.statNum}>{myStudents.length}</div><div style={S.statLabel}>{isAdmin ? "Total" : "My"} Students</div></div>
        <div style={S.statCard}><div style={S.statNum}>{todayPresent}</div><div style={S.statLabel}>Present Today</div></div>
        <div style={S.statCard}><div style={S.statNum}>{unpaid.length}</div><div style={S.statLabel}>Unpaid Dues</div></div>
        <div style={S.statCard}><div style={S.statNum}>{myProgress.length}</div><div style={S.statLabel}>Sessions Logged</div></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={S.card}>
          <div style={{ color: C.gold, fontWeight: 700, marginBottom: 14 }}>Recent Sessions</div>
          {myProgress.slice(-5).reverse().map(p => {
            const st = myStudents.find(s => s.id === p.studentId);
            return (
              <div key={p.id} style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 10, marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{st?.name}</div>
                <div style={{ color: C.muted, fontSize: 12 }}>{p.surah} · {p.juz} · Ayah {p.ayahFrom}–{p.ayahTo} · {fmtDate(p.date)}</div>
                <span style={S.badge(QColors[p.quality])}>{p.quality}</span>
              </div>
            );
          })}
          {myProgress.length === 0 && <div style={{ color: C.muted, fontSize: 13 }}>No sessions logged yet.</div>}
        </div>
        <div style={S.card}>
          <div style={{ color: C.gold, fontWeight: 700, marginBottom: 14 }}>Outstanding Fees</div>
          {unpaid.slice(0, 6).map(d => {
            const st = myStudents.find(s => s.id === d.studentId);
            return (
              <div key={d.id} style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 10, marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{st?.name}</div>
                <div style={{ color: C.muted, fontSize: 12 }}>Week of {fmtDate(d.weekOf)} · £{d.amount}</div>
                {d.note && <div style={{ color: "#aaa", fontSize: 12, fontStyle: "italic" }}>{d.note}</div>}
              </div>
            );
          })}
          {unpaid.length === 0 && <div style={{ color: C.muted, fontSize: 13 }}>All fees paid. Alhamdulillah! 🌿</div>}
        </div>
      </div>
    </div>
  );
}

// ─── Students ─────────────────────────────────────────────────────────────────
function Students({ user, isAdmin, store, setStore, myStudents }) {
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState("");

  const filtered = myStudents.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setForm({ teacherId: user.id, enrollDate: today(), notes: "" }); setModal("add"); };
  const openEdit = (s) => { setForm({ ...s }); setModal("edit"); };
  const save = () => {
    if (!form.name || !form.age) return;
    if (modal === "add") setStore(prev => ({ ...prev, students: [...prev.students, { ...form, id: uid(), age: +form.age }] }));
    else setStore(prev => ({ ...prev, students: prev.students.map(s => s.id === form.id ? { ...form, age: +form.age } : s) }));
    setModal(null);
  };
  const del = (id) => { if (confirm("Remove this student?")) setStore(prev => ({ ...prev, students: prev.students.filter(s => s.id !== id) })); };

  const teacherName = (tid) => store.teachers.find(t => t.id === tid)?.name || "—";

  return (
    <div>
      <div style={S.sectionHead}>
        <div><div style={S.pageTitle}>Students</div><div style={S.pageSub}>Manage enrolled students</div></div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input style={{ ...S.input, width: 200, marginBottom: 0, padding: "8px 12px" }} placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          <button style={S.btn("gold")} onClick={openAdd}>+ Add Student</button>
        </div>
      </div>
      <div style={S.card}>
        <table style={S.table}>
          <thead><tr>{["Name", "Age", isAdmin ? "Teacher" : null, "Parent / Guardian", "Contact", "Enrolled", ""].filter(Boolean).map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.length === 0 && <tr><td style={{ ...S.td, color: C.muted }} colSpan={7}>No students found.</td></tr>}
            {filtered.map(s => (
              <tr key={s.id}>
                <td style={{ ...S.td, fontWeight: 700 }}>{s.name}</td>
                <td style={S.td}>{s.age}</td>
                {isAdmin && <td style={{ ...S.td, color: C.muted, fontSize: 13 }}>{teacherName(s.teacherId)}</td>}
                <td style={S.td}>{s.parentName || "—"}</td>
                <td style={S.td}>{s.parentPhone || "—"}</td>
                <td style={S.td}>{fmtDate(s.enrollDate)}</td>
                <td style={{ ...S.td }}><div style={{ display: "flex", gap: 8 }}>
                  <button style={S.btn("outline")} onClick={() => openEdit(s)}>Edit</button>
                  <button style={S.btn("danger")} onClick={() => del(s.id)}>Remove</button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <div style={S.modal} onClick={() => setModal(null)}>
          <div style={S.modalCard} onClick={e => e.stopPropagation()}>
            <div style={S.modalTitle}>{modal === "add" ? "Add Student" : "Edit Student"}</div>
            {[["Full Name","name","text"],["Age","age","number"],["Parent / Guardian","parentName","text"],["Parent Phone","parentPhone","tel"]].map(([lbl, key, type]) => (
              <div key={key}><label style={S.label}>{lbl}</label><input style={S.input} type={type} value={form[key] || ""} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} /></div>
            ))}
            {isAdmin && (
              <><label style={S.label}>Assign Teacher</label>
              <select style={S.select} value={form.teacherId || ""} onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))}>
                <option value="">Select teacher…</option>
                {store.teachers.filter(t => t.role !== "admin" && t.approved).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select></>
            )}
            <label style={S.label}>Enrolment Date</label>
            <input style={S.input} type="date" value={form.enrollDate || ""} onChange={e => setForm(f => ({ ...f, enrollDate: e.target.value }))} />
            <label style={S.label}>Notes</label>
            <textarea style={S.textarea} value={form.notes || ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button style={S.btn("outline")} onClick={() => setModal(null)}>Cancel</button>
              <button style={S.btn("gold")} onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Progress ─────────────────────────────────────────────────────────────────
function Progress({ user, isAdmin, store, setStore, myStudents }) {
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({ date: today(), surah: SURAHS[0], juz: JUZAA[0], ayahFrom: 1, ayahTo: 7, quality: "Good", teacherNote: "" });

  const myProgress = store.progress
    .filter(p => myStudents.find(s => s.id === p.studentId))
    .filter(p => !filter || p.studentId === filter)
    .sort((a, b) => b.date.localeCompare(a.date));

  const save = () => {
    if (!form.studentId) return;
    setStore(prev => ({ ...prev, progress: [...prev.progress, { ...form, id: uid(), ayahFrom: +form.ayahFrom, ayahTo: +form.ayahTo }] }));
    setModal(false);
    setForm({ date: today(), surah: SURAHS[0], juz: JUZAA[0], ayahFrom: 1, ayahTo: 7, quality: "Good", teacherNote: "" });
  };

  const printId = "progress-print";
  return (
    <div>
      <div style={S.sectionHead}>
        <div><div style={S.pageTitle}>Memorisation Tracker</div><div style={S.pageSub}>Log and review Quran memorisation sessions</div></div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={S.btn("outline")} onClick={() => printDiv(printId, "Memorisation Report")}>⬇ Export PDF</button>
          <button style={S.btn("gold")} onClick={() => setModal(true)}>+ Log Session</button>
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <select style={{ ...S.select, width: 230, marginBottom: 0 }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Students</option>
          {myStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div id={printId}>
        <div className="arabic" style={{ display: "none" }}>حلقة التحفيظ القرآن الكريم</div>
        <h1 style={{ display: "none" }}>Memorisation Report — {fmtDate(today())}</h1>
        <div style={S.card}>
          <table style={S.table}>
            <thead><tr>{["Student","Date","Surah","Juz","Ayah Range","Quality","Teacher's Note",""].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {myProgress.length === 0 && <tr><td style={{ ...S.td, color: C.muted }} colSpan={8}>No sessions logged yet.</td></tr>}
              {myProgress.map(p => {
                const st = myStudents.find(s => s.id === p.studentId);
                return (
                  <tr key={p.id}>
                    <td style={{ ...S.td, fontWeight: 700 }}>{st?.name}</td>
                    <td style={S.td}>{fmtDate(p.date)}</td>
                    <td style={S.td}>{p.surah}</td>
                    <td style={S.td}>{p.juz}</td>
                    <td style={S.td}>{p.ayahFrom}–{p.ayahTo}</td>
                    <td style={S.td}><span style={S.badge(QColors[p.quality])}>{p.quality}</span></td>
                    <td style={{ ...S.td, color: "#aaa", fontSize: 13 }}>{p.teacherNote || "—"}</td>
                    <td style={S.td}><button style={S.btn("danger")} onClick={() => setStore(prev => ({ ...prev, progress: prev.progress.filter(x => x.id !== p.id) }))}>✕</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div style={S.modal} onClick={() => setModal(false)}>
          <div style={S.modalCard} onClick={e => e.stopPropagation()}>
            <div style={S.modalTitle}>Log Memorisation Session</div>
            <label style={S.label}>Student</label>
            <select style={S.select} value={form.studentId || ""} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}>
              <option value="">Select student…</option>
              {myStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <label style={S.label}>Date</label>
            <input style={S.input} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div><label style={S.label}>Surah</label><select style={S.select} value={form.surah} onChange={e => setForm(f => ({ ...f, surah: e.target.value }))}>{SURAHS.map(s => <option key={s}>{s}</option>)}</select></div>
              <div><label style={S.label}>Juz</label><select style={S.select} value={form.juz} onChange={e => setForm(f => ({ ...f, juz: e.target.value }))}>{JUZAA.map(j => <option key={j}>{j}</option>)}</select></div>
              <div><label style={S.label}>Ayah From</label><input style={S.input} type="number" min={1} value={form.ayahFrom} onChange={e => setForm(f => ({ ...f, ayahFrom: e.target.value }))} /></div>
              <div><label style={S.label}>Ayah To</label><input style={S.input} type="number" min={1} value={form.ayahTo} onChange={e => setForm(f => ({ ...f, ayahTo: e.target.value }))} /></div>
            </div>
            <label style={S.label}>Quality</label>
            <select style={S.select} value={form.quality} onChange={e => setForm(f => ({ ...f, quality: e.target.value }))}>
              {["Excellent","Good","Needs Work","Revision"].map(q => <option key={q}>{q}</option>)}
            </select>
            <label style={S.label}>Teacher's Note</label>
            <textarea style={S.textarea} placeholder="Tajweed observations…" value={form.teacherNote} onChange={e => setForm(f => ({ ...f, teacherNote: e.target.value }))} />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button style={S.btn("outline")} onClick={() => setModal(false)}>Cancel</button>
              <button style={S.btn("gold")} onClick={save}>Save Session</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Attendance ───────────────────────────────────────────────────────────────
function AttendancePage({ user, isAdmin, store, setStore, myStudents }) {
  const [date, setDate] = useState(today());
  const existing = (sid) => store.attendance.find(a => a.studentId === sid && a.date === date && (isAdmin || a.teacherId === user.id));
  const mark = (sid, status) => {
    const ex = existing(sid);
    if (ex) setStore(prev => ({ ...prev, attendance: prev.attendance.map(a => a.id === ex.id ? { ...a, status } : a) }));
    else setStore(prev => ({ ...prev, attendance: [...prev.attendance, { id: uid(), studentId: sid, date, status, teacherId: user.id }] }));
  };
  const counts = myStudents.reduce((acc, s) => { const ex = existing(s.id); acc[ex?.status || "—"] = (acc[ex?.status || "—"] || 0) + 1; return acc; }, {});
  const printId = "attendance-print";

  return (
    <div>
      <div style={S.sectionHead}>
        <div><div style={S.pageTitle}>Attendance</div><div style={S.pageSub}>Mark daily attendance</div></div>
        <button style={S.btn("outline")} onClick={() => printDiv(printId, "Attendance Register")}>⬇ Export PDF</button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
        <input style={{ ...S.input, width: 190, marginBottom: 0 }} type="date" value={date} onChange={e => setDate(e.target.value)} />
        {[["Present","green"],["Absent","red"],["Late","gold"]].map(([s, c]) => (
          <span key={s} style={{ fontSize: 13, color: C.muted }}>{s}: <strong style={{ color: c === "green" ? C.green : c === "red" ? C.danger : C.gold }}>{counts[s] || 0}</strong></span>
        ))}
      </div>
      <div id={printId}>
        <h1 style={{ display: "none" }}>Attendance Register — {fmtDate(date)}</h1>
        <div style={S.card}>
          <table style={S.table}>
            <thead><tr>{["Student","Status","Mark Attendance"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {myStudents.length === 0 && <tr><td style={{ ...S.td, color: C.muted }} colSpan={3}>No students assigned.</td></tr>}
              {myStudents.map(s => {
                const ex = existing(s.id);
                return (
                  <tr key={s.id}>
                    <td style={{ ...S.td, fontWeight: 700 }}>{s.name}</td>
                    <td style={S.td}>{ex ? <span style={S.badge(ex.status === "Present" ? "green" : ex.status === "Absent" ? "red" : "gold")}>{ex.status}</span> : <span style={S.badge("")}>Not Marked</span>}</td>
                    <td style={S.td}><div style={{ display: "flex", gap: 8 }}>
                      {["Present","Absent","Late"].map(status => (
                        <button key={status} style={{ ...S.btn(status === "Present" ? "green" : status === "Absent" ? "danger" : "outline"), opacity: ex?.status === status ? 1 : 0.55 }} onClick={() => mark(s.id, status)}>{status}</button>
                      ))}
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Dues ─────────────────────────────────────────────────────────────────────
function DuesPage({ user, isAdmin, store, setStore, myStudents }) {
  const [modal, setModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ weekOf: today(), amount: 20, note: "" });

  const myDues = store.dues
    .filter(d => myStudents.find(s => s.id === d.studentId))
    .filter(d => filter === "all" ? true : filter === "unpaid" ? !d.paid : d.paid)
    .sort((a, b) => b.weekOf.localeCompare(a.weekOf));

  const outstanding = store.dues.filter(d => !d.paid && myStudents.find(s => s.id === d.studentId)).reduce((s, d) => s + d.amount, 0);

  const addDue = () => {
    if (!form.studentId || !form.amount) return;
    setStore(prev => ({ ...prev, dues: [...prev.dues, { ...form, id: uid(), amount: +form.amount, paid: false, paidDate: null }] }));
    setModal(false); setForm({ weekOf: today(), amount: 20, note: "" });
  };
  const togglePaid = (d) => setStore(prev => ({ ...prev, dues: prev.dues.map(x => x.id === d.id ? { ...x, paid: !x.paid, paidDate: !x.paid ? today() : null } : x) }));
  const del = (id) => setStore(prev => ({ ...prev, dues: prev.dues.filter(d => d.id !== id) }));
  const printId = "dues-print";

  return (
    <div>
      <div style={S.sectionHead}>
        <div><div style={S.pageTitle}>Weekly Dues</div><div style={S.pageSub}>Track fees and payments</div></div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={S.btn("outline")} onClick={() => printDiv(printId, "Dues Report")}>⬇ Export PDF</button>
          <button style={S.btn("gold")} onClick={() => setModal(true)}>+ Add Due</button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "center" }}>
        {["all","unpaid","paid"].map(f => <button key={f} style={filter === f ? S.btn("gold") : S.btn("outline")} onClick={() => setFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>)}
        <span style={{ marginLeft: "auto", color: C.danger, fontWeight: 700 }}>Total outstanding: £{outstanding}</span>
      </div>
      <div id={printId}>
        <h1 style={{ display: "none" }}>Fees Report — {fmtDate(today())}</h1>
        <div style={S.card}>
          <table style={S.table}>
            <thead><tr>{["Student","Week Of","Amount","Status","Paid On","Note",""].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {myDues.length === 0 && <tr><td style={{ ...S.td, color: C.muted }} colSpan={7}>No records found.</td></tr>}
              {myDues.map(d => {
                const st = myStudents.find(s => s.id === d.studentId);
                return (
                  <tr key={d.id}>
                    <td style={{ ...S.td, fontWeight: 700 }}>{st?.name}</td>
                    <td style={S.td}>{fmtDate(d.weekOf)}</td>
                    <td style={S.td}>£{d.amount}</td>
                    <td style={S.td}><span style={S.badge(d.paid ? "green" : "red")}>{d.paid ? "Paid" : "Unpaid"}</span></td>
                    <td style={S.td}>{fmtDate(d.paidDate)}</td>
                    <td style={{ ...S.td, color: "#aaa", fontSize: 13 }}>{d.note || "—"}</td>
                    <td style={S.td}><div style={{ display: "flex", gap: 8 }}>
                      <button style={S.btn(d.paid ? "outline" : "green")} onClick={() => togglePaid(d)}>{d.paid ? "Unpaid" : "Mark Paid"}</button>
                      <button style={S.btn("danger")} onClick={() => del(d.id)}>✕</button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {modal && (
        <div style={S.modal} onClick={() => setModal(false)}>
          <div style={S.modalCard} onClick={e => e.stopPropagation()}>
            <div style={S.modalTitle}>Add Weekly Due</div>
            <label style={S.label}>Student</label>
            <select style={S.select} value={form.studentId || ""} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}>
              <option value="">Select student…</option>
              {myStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <label style={S.label}>Week Of</label>
            <input style={S.input} type="date" value={form.weekOf} onChange={e => setForm(f => ({ ...f, weekOf: e.target.value }))} />
            <label style={S.label}>Amount (£)</label>
            <input style={S.input} type="number" min={0} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            <label style={S.label}>Note</label>
            <textarea style={S.textarea} value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Optional note…" />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button style={S.btn("outline")} onClick={() => setModal(false)}>Cancel</button>
              <button style={S.btn("gold")} onClick={addDue}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Reports ──────────────────────────────────────────────────────────────────
function Reports({ user, isAdmin, store, myStudents }) {
  const [selected, setSelected] = useState(myStudents[0]?.id || "");
  const student = myStudents.find(s => s.id === selected);
  const sProgress = store.progress.filter(p => p.studentId === selected).sort((a, b) => b.date.localeCompare(a.date));
  const sAttend = store.attendance.filter(a => a.studentId === selected);
  const sDues = store.dues.filter(d => d.studentId === selected);
  const attendRate = sAttend.length ? Math.round(sAttend.filter(a => a.status === "Present").length / sAttend.length * 100) : 0;
  const outstanding = sDues.filter(d => !d.paid).reduce((s, d) => s + d.amount, 0);
  const juzCovered = [...new Set(sProgress.map(p => p.juz))];
  const surahsCovered = [...new Set(sProgress.map(p => p.surah))];
  const printId = "student-report-print";

  return (
    <div>
      <div style={S.sectionHead}>
        <div><div style={S.pageTitle}>Student Reports</div><div style={S.pageSub}>Full academic & financial overview per student</div></div>
        {student && <button style={S.btn("outline")} onClick={() => printDiv(printId, `Report — ${student.name}`)}>⬇ Export PDF</button>}
      </div>
      <div style={{ marginBottom: 22 }}>
        <select style={{ ...S.select, width: 280, marginBottom: 0 }} value={selected} onChange={e => setSelected(e.target.value)}>
          <option value="">Select a student…</option>
          {myStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      {!student && <div style={{ color: C.muted }}>Please select a student to view their report.</div>}
      {student && (
        <div id={printId}>
          <div className="arabic" style={{ display: "none" }}>حلقة التحفيظ القرآن الكريم</div>
          <h1 style={{ display: "none" }}>Student Report: {student.name} — {fmtDate(today())}</h1>
          <div style={{ ...S.card, borderColor: C.gold }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {[["Student",student.name],["Age",student.age],["Enrolled",fmtDate(student.enrollDate)],["Parent",student.parentName||"—"],["Contact",student.parentPhone||"—"],["Notes",student.notes||"—"]].map(([k,v]) => (
                <div key={k}><div style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>{k}</div><div style={{ fontWeight: 700, fontSize: 14 }}>{v}</div></div>
              ))}
            </div>
          </div>
          <div style={S.statGrid}>
            <div style={S.statCard}><div style={S.statNum}>{sProgress.length}</div><div style={S.statLabel}>Sessions</div></div>
            <div style={S.statCard}><div style={S.statNum}>{attendRate}%</div><div style={S.statLabel}>Attendance</div></div>
            <div style={S.statCard}><div style={S.statNum}>{juzCovered.length}</div><div style={S.statLabel}>Juz Covered</div></div>
            <div style={S.statCard}><div style={S.statNum}>£{outstanding}</div><div style={S.statLabel}>Outstanding</div></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={S.card}>
              <div style={{ color: C.gold, fontWeight: 700, marginBottom: 10 }}>Surahs Memorised ({surahsCovered.length})</div>
              {surahsCovered.length === 0 ? <div style={{ color: C.muted, fontSize: 13 }}>None logged yet.</div> :
                surahsCovered.map(s => <span key={s} style={{ ...S.badge("green"), marginRight: 5, marginBottom: 5, display: "inline-block" }}>{s}</span>)}
            </div>
            <div style={S.card}>
              <div style={{ color: C.gold, fontWeight: 700, marginBottom: 10 }}>Attendance Breakdown</div>
              {["Present","Absent","Late"].map(status => {
                const n = sAttend.filter(a => a.status === status).length;
                return <div key={status} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={S.badge(status === "Present" ? "green" : status === "Absent" ? "red" : "gold")}>{status}</span>
                  <strong>{n}</strong>
                </div>;
              })}
            </div>
          </div>
          <div style={S.card}>
            <div style={{ color: C.gold, fontWeight: 700, marginBottom: 10 }}>Memorisation History</div>
            <table style={S.table}>
              <thead><tr>{["Date","Surah","Juz","Ayah Range","Quality","Note"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {sProgress.length === 0 && <tr><td style={{ ...S.td, color: C.muted }} colSpan={6}>No sessions logged.</td></tr>}
                {sProgress.map(p => (
                  <tr key={p.id}>
                    <td style={S.td}>{fmtDate(p.date)}</td>
                    <td style={S.td}>{p.surah}</td>
                    <td style={S.td}>{p.juz}</td>
                    <td style={S.td}>{p.ayahFrom}–{p.ayahTo}</td>
                    <td style={S.td}><span style={S.badge(QColors[p.quality])}>{p.quality}</span></td>
                    <td style={{ ...S.td, color: "#aaa", fontSize: 13 }}>{p.teacherNote || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={S.card}>
            <div style={{ color: C.gold, fontWeight: 700, marginBottom: 10 }}>Fee History</div>
            <table style={S.table}>
              <thead><tr>{["Week Of","Amount","Status","Paid On","Note"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {sDues.length === 0 && <tr><td style={{ ...S.td, color: C.muted }} colSpan={5}>No dues recorded.</td></tr>}
                {sDues.sort((a,b)=>b.weekOf.localeCompare(a.weekOf)).map(d => (
                  <tr key={d.id}>
                    <td style={S.td}>{fmtDate(d.weekOf)}</td>
                    <td style={S.td}>£{d.amount}</td>
                    <td style={S.td}><span style={S.badge(d.paid ? "green" : "red")}>{d.paid ? "Paid" : "Unpaid"}</span></td>
                    <td style={S.td}>{fmtDate(d.paidDate)}</td>
                    <td style={{ ...S.td, color: "#aaa", fontSize: 13 }}>{d.note || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Admin Panel ──────────────────────────────────────────────────────────────
function AdminPanel({ store, setStore }) {
  const pending = store.teachers.filter(t => !t.approved && t.role !== "admin");
  const approved = store.teachers.filter(t => t.approved && t.role !== "admin");

  const approve = (id) => setStore(prev => ({ ...prev, teachers: prev.teachers.map(t => t.id === id ? { ...t, approved: true } : t) }));
  const reject = (id) => { if (confirm("Remove this teacher account?")) setStore(prev => ({ ...prev, teachers: prev.teachers.filter(t => t.id !== id) })); };
  const printId = "admin-print";

  return (
    <div>
      <div style={S.sectionHead}>
        <div><div style={S.pageTitle}>Admin Panel</div><div style={S.pageSub}>Manage teachers, approvals, and school overview</div></div>
        <button style={S.btn("outline")} onClick={() => printDiv(printId, "Admin Report")}>⬇ Export PDF</button>
      </div>

      <div id={printId}>
        <h1 style={{ display: "none" }}>Admin Report — {fmtDate(today())}</h1>

        {pending.length > 0 && (
          <div style={{ ...S.card, borderColor: C.gold }}>
            <div style={{ color: C.gold, fontWeight: 700, marginBottom: 14, fontSize: 15 }}>⏳ Pending Approvals ({pending.length})</div>
            <table style={S.table}>
              <thead><tr>{["Name","Email","Registered","Actions"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {pending.map(t => (
                  <tr key={t.id}>
                    <td style={{ ...S.td, fontWeight: 700 }}>{t.name}</td>
                    <td style={S.td}>{t.email}</td>
                    <td style={S.td}>{fmtDate(t.createdAt)}</td>
                    <td style={S.td}><div style={{ display: "flex", gap: 8 }}>
                      <button style={S.btn("green")} onClick={() => approve(t.id)}>✓ Approve</button>
                      <button style={S.btn("danger")} onClick={() => reject(t.id)}>✕ Reject</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={S.card}>
          <div style={{ color: C.gold, fontWeight: 700, marginBottom: 14 }}>Active Teachers ({approved.length})</div>
          <table style={S.table}>
            <thead><tr>{["Name","Email","Students","Sessions","Joined","Actions"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {approved.length === 0 && <tr><td style={{ ...S.td, color: C.muted }} colSpan={6}>No approved teachers yet.</td></tr>}
              {approved.map(t => {
                const tstudents = store.students.filter(s => s.teacherId === t.id);
                const tsessions = store.progress.filter(p => tstudents.find(s => s.id === p.studentId));
                return (
                  <tr key={t.id}>
                    <td style={{ ...S.td, fontWeight: 700 }}>{t.name}</td>
                    <td style={S.td}>{t.email}</td>
                    <td style={S.td}>{tstudents.length}</td>
                    <td style={S.td}>{tsessions.length}</td>
                    <td style={S.td}>{fmtDate(t.createdAt)}</td>
                    <td style={S.td}><button style={S.btn("danger")} onClick={() => reject(t.id)}>Remove</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={S.statGrid}>
          <div style={S.statCard}><div style={S.statNum}>{store.students.length}</div><div style={S.statLabel}>Total Students</div></div>
          <div style={S.statCard}><div style={S.statNum}>{approved.length}</div><div style={S.statLabel}>Active Teachers</div></div>
          <div style={S.statCard}><div style={S.statNum}>{store.progress.length}</div><div style={S.statLabel}>Total Sessions</div></div>
          <div style={S.statCard}><div style={S.statNum}>£{store.dues.filter(d=>!d.paid).reduce((s,d)=>s+d.amount,0)}</div><div style={S.statLabel}>Fees Outstanding</div></div>
        </div>
      </div>
    </div>
  );
}
