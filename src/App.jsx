import React, { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useLocation,
  Link,
} from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FlaskConical,
  Microscope,
  ClipboardCheck,
  AlertTriangle,
  FileText,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MinusCircle,
  ChevronRight,
  Printer,
  Download,
  Plus,
  Trash2,
  Search,
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "./lib/utils";
import LoginPage from "./components/LoginPage";

/* -------------------- Utilities -------------------- */
const uid = () => Math.random().toString(36).slice(2, 9);
const SCORE_VALUES = { compliant: 2, partial: 1, non: 0, na: null };

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue];
}

/* -------------------- Visual Theme Helpers -------------------- */
const COLORS = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5"];
const CHART_COLORS = {
  temp: "#10b981",
  airflow: "#0ea5e9",
};

/* -------------------- Shared UI Components -------------------- */
function TopCenteredNav({ onLogout, darkMode, toggleTheme }) {
  const links = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/labs", label: "Labs", icon: FlaskConical },
    { to: "/equipment", label: "Equipment", icon: Microscope },
    { to: "/inspections", label: "Inspections", icon: ClipboardCheck },
    { to: "/incidents", label: "Incidents", icon: AlertTriangle },
    { to: "/audit", label: "Manager", icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
              <FlaskConical size={18} />
            </div>
            <span className="font-serif font-bold text-xl tracking-tight text-slate-800 dark:text-white">
              BioSafe
            </span>
          </div>

          <nav className="hidden md:flex gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                    isActive
                      ? "text-emerald-700 bg-emerald-50/80 shadow-sm ring-1 ring-emerald-100"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <l.icon
                      size={16}
                      className={
                        isActive ? "text-emerald-600" : "text-slate-400"
                      }
                    />
                    {l.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-emerald-50/50 -z-10"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4">

            <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
                onClick={onLogout}
                className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                title="Log Out"
            >
                <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function PageIntro({ title, subtitle, note }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-8 mb-8 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-900/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

      <div className="relative z-10">
        <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
          {title}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
          {subtitle}
        </p>
        {note && (
          <div className="mt-6 flex items-start gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 inline-flex">
            <AlertCircle size={16} className="mt-0.5 text-emerald-600 dark:text-emerald-400" />
            {note}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Stat({ label, value, hint, icon: Icon, trend }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        {Icon && <Icon size={64} className="text-emerald-600 dark:text-emerald-500" />}
      </div>
      <div className="relative z-10">
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</div>
        <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
          {value}
        </div>
        {hint && (
          <div className="flex items-center gap-2 text-xs">
            <span
              className={cn(
                "font-medium px-1.5 py-0.5 rounded-md",
                trend === "up"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : trend === "down"
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              )}
            >
              {hint}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function Tag({ children, tone = "gray" }) {
  const tones = {
    gray: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    red: "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30",
    amber: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30",
  };
  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-medium border",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

/* -------------------- Scoring UI -------------------- */
function ScorePicker({ value, onChange }) {
  const options = [
    {
      key: "compliant",
      label: "Compliant",
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      key: "partial",
      label: "Partial",
      icon: AlertCircle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      key: "non",
      label: "Non-Compliant",
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      key: "na",
      label: "N/A",
      icon: MinusCircle,
      color: "text-slate-400",
      bg: "bg-slate-50",
    },
  ];

  return (
    <div className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 w-fit">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200",
            value === opt.key
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <opt.icon
            size={14}
            className={value === opt.key ? opt.color : "currentColor"}
          />
          <span className="hidden sm:inline">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

/* -------------------- Audit components -------------------- */
function AuditSection({ section, answers, setAnswer }) {
  const totalWeight = (section.items || []).reduce(
    (s, it) => s + (it.weight || 0),
    0
  );
  const earned = (section.items || []).reduce((s, it) => {
    const ans = answers[it.id]?.score ?? null;
    const w = it.weight || 0;
    if (ans === "na" || ans === null) return s;
    return s + (SCORE_VALUES[ans] / 2) * w;
  }, 0);
  const scoredWeight = (section.items || []).reduce((s, it) => {
    const ans = answers[it.id]?.score ?? null;
    const w = it.weight || 0;
    if (ans === "na" || ans === null) return s;
    return s + w;
  }, 0);
  const pct =
    scoredWeight === 0 ? 0 : Math.round((earned / scoredWeight) * 100);
  const tone = pct >= 90 ? "green" : pct >= 70 ? "amber" : "red";

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50 dark:border-slate-800">
        <h3 className="text-xl font-serif font-semibold text-slate-800 dark:text-white">
          {section.title}
        </h3>
        <div className="flex items-center gap-3">
          <div className="text-sm text-slate-500 font-medium">
            Section Score
          </div>
          <Tag tone={tone}>{pct}%</Tag>
        </div>
      </div>
      <div className="space-y-6">
        {(section.items || []).map((it, idx) => (
          <div key={it.id} className="group">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="flex-1">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center text-xs font-medium mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                      {it.text}
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Weight: {it.weight ?? 1}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 md:mt-0 md:w-[28rem] flex-shrink-0 space-y-3">
                <div className="flex justify-end">
                  <ScorePicker
                    value={answers[it.id]?.score ?? null}
                    onChange={(score) => setAnswer(it.id, { score })}
                  />
                </div>
                <div className="relative">
                  <input
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 transition-all text-sm dark:text-slate-200"
                    placeholder="Add observation or corrective action..."
                    value={answers[it.id]?.note ?? ""}
                    onChange={(e) => setAnswer(it.id, { note: e.target.value })}
                  />
                  <FileText
                    size={14}
                    className="absolute left-3 top-3 text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

function Summary({ audit, answers }) {
  const { scorePct, riskLevel, totals } = useMemo(() => {
    let earned = 0,
      denom = 0;
    (audit.sections || []).forEach((s) => {
      s.items.forEach((it) => {
        const ans = answers[it.id]?.score ?? null;
        const w = it.weight || 0;
        if (ans === "na" || ans === null) return;
        denom += w;
        earned += (SCORE_VALUES[ans] / 2) * w;
      });
    });
    const pct = denom === 0 ? 0 : Math.round((earned / denom) * 100);
    let riskLevel = "High";
    if (pct >= 90) riskLevel = "Low";
    else if (pct >= 70) riskLevel = "Moderate";
    return { scorePct: pct, riskLevel, totals: { earned, denom } };
  }, [audit, answers]);

  const nonCompliantCount = useMemo(() => {
    let count = 0;
    (audit.sections || []).forEach((s) =>
      s.items.forEach((it) => {
        const a = answers[it.id];
        if (a && (a.score === "non" || a.score === "partial")) count++;
      })
    );
    return count;
  }, [audit, answers]);

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-center">
        <div className="text-xs text-emerald-600 font-medium uppercase tracking-wider mb-1">
          Compliance
        </div>
        <div className="text-2xl font-bold text-emerald-700">{scorePct}%</div>
      </div>
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
        <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
          Risk Level
        </div>
        <div
          className={cn(
            "text-2xl font-bold",
            riskLevel === "Low"
              ? "text-emerald-600"
              : riskLevel === "Moderate"
              ? "text-amber-600"
              : "text-red-600"
          )}
        >
          {riskLevel}
        </div>
      </div>
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
        <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
          Findings
        </div>
        <div className="text-2xl font-bold text-slate-700">
          {nonCompliantCount}
        </div>
      </div>
    </div>
  );
}

/* -------------------- Dashboard data & helpers -------------------- */
const STORAGE_KEY = "biosafety_data_v2";

function generateMetrics(days = 30) {
  const arr = [];
  const now = Date.now();
  for (let i = 0; i < days; i++) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    arr.push({
      date: date.toISOString().slice(0, 10),
      temp: 20 + Math.round(Math.random() * 6),
      airflow: 80 + Math.round(Math.random() * 20),
    });
  }
  return arr;
}

const DEMO_DATA = {
  labs: [
    {
      id: uuidv4(),
      name: "Microbiology Lab A",
      bsl: 2,
      status: "Operational",
      inspectionDue: "2025-12-05",
      metrics: generateMetrics(30),
    },
    {
      id: uuidv4(),
      name: "Virology Suite",
      bsl: 3,
      status: "Operational",
      inspectionDue: "2025-11-25",
      metrics: generateMetrics(30),
    },
  ],
  incidents: [
    {
      id: uuidv4(),
      type: "Chemical Spill",
      status: "Investigation Pending",
      date: "2025-12-15",
      severity: "High",
    },
    {
      id: uuidv4(),
      type: "PPE Violation",
      status: "Resolved",
      date: "2025-11-20",
      severity: "Low",
    },
  ],
  inspections: [],
  equipment: [
    {
      id: uuidv4(),
      name: "Autoclave #1",
      status: "Good",
      lastService: "2025-08-01",
    },
    {
      id: uuidv4(),
      name: "BSC II",
      status: "Service Due",
      lastService: "2024-11-10",
    },
  ],
};

function aggregateMetrics(labs) {
  if (!labs || labs.length === 0) return [];
  const days = labs[0].metrics.length;
  const res = [];
  for (let i = 0; i < days; i++) {
    const date = labs[0].metrics[i].date;
    let temp = 0,
      airflow = 0;
    labs.forEach((l) => {
      temp += Number(l.metrics[i].temp);
      airflow += Number(l.metrics[i].airflow);
    });
    res.push({
      date,
      temp: Math.round(temp / labs.length),
      airflow: Math.round(airflow / labs.length),
    });
  }
  return res;
}

/* -------------------- Audit templates (10 questions each) -------------------- */

const getLabsTemplate = () => [
  {
    id: uid(),
    text: "Access restricted to trained and authorized personnel",
    weight: 1,
  },
  { id: uid(), text: "Laboratory entry signage clearly visible", weight: 1 },
  { id: uid(), text: "PPE available and used correctly", weight: 1 },
  { id: uid(), text: "Handwashing stations functional", weight: 1 },
  {
    id: uid(),
    text: "Work surfaces disinfected before and after use",
    weight: 1,
  },
  { id: uid(), text: "Biosafety cabinets maintained and certified", weight: 2 },
  { id: uid(), text: "Biohazard waste segregated and autoclaved", weight: 2 },
  { id: uid(), text: "Emergency procedures displayed", weight: 1 },
  { id: uid(), text: "Staff biosafety training records maintained", weight: 2 },
  { id: uid(), text: "Internal audits conducted regularly", weight: 1 },
];

const getEquipmentTemplate = () => [
  { id: uid(), text: "Equipment logbooks available and updated", weight: 2 },
  { id: uid(), text: "Preventive maintenance performed", weight: 2 },
  { id: uid(), text: "Calibration certificates valid", weight: 2 },
  { id: uid(), text: "Safety interlocks functional", weight: 1 },
  { id: uid(), text: "Electrical grounding verified", weight: 1 },
  { id: uid(), text: "Cleaning and sterilization documented", weight: 1 },
  { id: uid(), text: "Fault reporting system active", weight: 1 },
  { id: uid(), text: "Critical control points monitored", weight: 1 },
  { id: uid(), text: "Operator training verified", weight: 1 },
  { id: uid(), text: "Faulty equipment properly tagged", weight: 1 },
];

const getInspectionTemplate = () => [
  { id: uid(), text: "Inspection checklist complete", weight: 1 },
  { id: uid(), text: "Sampling methods compliant", weight: 1 },
  { id: uid(), text: "Test records traceable", weight: 1 },
  { id: uid(), text: "Housekeeping acceptable", weight: 1 },
  { id: uid(), text: "Glassware sterilized", weight: 1 },
  { id: uid(), text: "Waste disposal verified", weight: 1 },
  { id: uid(), text: "Environmental logs maintained", weight: 1 },
  { id: uid(), text: "Non-conformities documented", weight: 1 },
  { id: uid(), text: "Follow-up reports submitted", weight: 1 },
  { id: uid(), text: "Inspector independence maintained", weight: 1 },
];

const getIncidentTemplate = () => [
  { id: uid(), text: "Incidents reported on time", weight: 1 },
  { id: uid(), text: "Containment performed immediately", weight: 2 },
  { id: uid(), text: "Medical evaluation provided", weight: 2 },
  { id: uid(), text: "Root cause analysis done", weight: 2 },
  { id: uid(), text: "Corrective actions implemented", weight: 1 },
  { id: uid(), text: "Incident reviewed by committee", weight: 1 },
  { id: uid(), text: "Emergency contacts displayed", weight: 1 },
  { id: uid(), text: "Lessons communicated to staff", weight: 1 },
  { id: uid(), text: "Equipment inspected post-incident", weight: 1 },
  { id: uid(), text: "Confidentiality maintained", weight: 1 },
];

const getAuditManagerTemplate = () => [
  { id: uid(), text: "Biosafety policy reviewed annually", weight: 1 },
  { id: uid(), text: "Regulatory reporting compliant", weight: 2 },
  { id: uid(), text: "Training programs conducted", weight: 1 },
  { id: uid(), text: "SOPs version-controlled", weight: 1 },
  { id: uid(), text: "Risk assessments updated", weight: 1 },
  { id: uid(), text: "External audit findings closed", weight: 1 },
  { id: uid(), text: "Ethical practices ensured", weight: 1 },
  { id: uid(), text: "Resources allocated for safety", weight: 1 },
  { id: uid(), text: "Inter-department coordination", weight: 1 },
  { id: uid(), text: "Continuous improvement monitored", weight: 1 },
];

/* -------------------- Generic Audit Page component -------------------- */
function AuditPageShell({ storageKey, defaultSections, title, intro, ethics }) {
  const [audits, setAudits] = useLocalStorage(storageKey, [
    {
      id: uid(),
      facility: "",
      location: "",
      auditor: "",
      date: new Date().toISOString().slice(0, 10),
      bsl: "BSL-2",
      sections: JSON.parse(JSON.stringify(defaultSections || [])),
      notes: "",
    },
  ]);

  const [activeId, setActiveId] = useState(audits[0]?.id);
  const active = useMemo(
    () => audits.find((a) => a.id === activeId) || audits[0],
    [audits, activeId]
  );
  const [answers, setAnswers] = useLocalStorage(
    `${storageKey}.answers.${active?.id}`,
    {}
  );

  // useEffect(() => {
  //   try {
  //     const raw = localStorage.getItem(`${storageKey}.answers.${active.id}`);
  //     if (raw) setAnswers(JSON.parse(raw));
  //   } catch { }
  // }, [activeId]);
  useEffect(() => {
    if (!active?.id) return;
    try {
      const raw = localStorage.getItem(`${storageKey}.answers.${active.id}`);
      if (raw) setAnswers(JSON.parse(raw));
    } catch {}
  }, [active?.id]);

  const setAnswer = (itemId, changes) => {
    setAnswers((prev) => {
      const next = {
        ...(prev || {}),
        [itemId]: { ...(prev[itemId] || {}), ...changes },
      };
      try {
        localStorage.setItem(
          `${storageKey}.answers.${active.id}`,
          JSON.stringify(next)
        );
      } catch {}
      return next;
    });
  };

  const updateActive = (changes) =>
    setAudits((prev) =>
      prev.map((a) => (a.id === active.id ? { ...a, ...changes } : a))
    );

  const addAudit = () => {
    const a = {
      id: uid(),
      facility: "",
      location: "",
      auditor: "",
      date: new Date().toISOString().slice(0, 10),
      bsl: "BSL-2",
      sections: JSON.parse(JSON.stringify(defaultSections)),
      notes: "",
    };
    setAudits((p) => [a, ...p]);
    setActiveId(a.id);
  };

  const removeAudit = (id) => {
    const remaining = audits.filter((a) => a.id !== id);
    setAudits(remaining);
    if (activeId === id && remaining.length) setActiveId(remaining[0].id);
  };

  const exportCSV = () => {
    const rows = [];
    audits.forEach((audit) => {
      const stored = JSON.parse(
        localStorage.getItem(`${storageKey}.answers.${audit.id}`) || "{}"
      );
      (audit.sections || []).forEach((s) => {
        s.items.forEach((it) => {
          const a = stored[it.id] || {};
          rows.push({
            auditId: audit.id,
            facility: audit.facility,
            date: audit.date,
            bsl: audit.bsl,
            section: s.title,
            item: it.text,
            score: a.score ?? "",
            note: a.note ?? "",
            weight: it.weight ?? 1,
          });
        });
      });
    });
    if (rows.length === 0) return alert("No data to export");
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(",")]
      .concat(
        rows.map((r) =>
          headers
            .map((h) => `"${String(r[h] ?? "").replaceAll('"', '""')}"`)
            .join(",")
        )
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${storageKey}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => window.print();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageIntro title={title} subtitle={intro} note={ethics} />

      <div className="flex items-center justify-between mb-6 gap-3">
        <div className="flex gap-3">
          <button
            onClick={addAudit}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all"
          >
            <Plus size={18} /> New Audit
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-all"
          >
            <Download size={18} /> Export CSV
          </button>
          <button
            onClick={printReport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-all"
          >
            <Printer size={18} /> Print
          </button>
        </div>
        <div className="text-sm text-slate-500 font-medium bg-white px-3 py-1 rounded-full border border-slate-200">
          Active audits:{" "}
          <strong className="text-slate-900">{audits.length}</strong>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3">
          <div className="p-4 rounded-3xl bg-white shadow-sm border border-slate-100 sticky top-24">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="font-serif font-semibold text-slate-900">
                History
              </h3>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Select
              </span>
            </div>
            <ul className="space-y-2 max-h-[60vh] overflow-auto pr-1 custom-scrollbar">
              {audits.map((a) => (
                <li key={a.id} className="group relative">
                  <button
                    className={cn(
                      "w-full text-left p-3 rounded-2xl border transition-all duration-200",
                      a.id === active.id
                        ? "bg-emerald-50 border-emerald-200 shadow-sm"
                        : "bg-white border-transparent hover:bg-slate-50"
                    )}
                    onClick={() => setActiveId(a.id)}
                  >
                    <div
                      className={cn(
                        "font-medium truncate mb-1",
                        a.id === active.id
                          ? "text-emerald-900"
                          : "text-slate-700"
                      )}
                    >
                      {a.facility || "Untitled facility"}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{a.date}</span>
                      <span className="bg-white/50 px-1.5 py-0.5 rounded-md border border-slate-100">
                        {a.bsl}
                      </span>
                    </div>
                  </button>
                  {audits.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAudit(a.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/80 text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="lg:col-span-9 space-y-6">
          <div className="p-6 rounded-3xl bg-white shadow-sm border border-slate-100">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                      Facility Name
                    </label>
                    <input
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                      value={active.facility}
                      onChange={(e) =>
                        updateActive({ facility: e.target.value })
                      }
                      placeholder="e.g. Central Lab"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                      Location
                    </label>
                    <input
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                      value={active.location}
                      onChange={(e) =>
                        updateActive({ location: e.target.value })
                      }
                      placeholder="Building A"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                      Auditor
                    </label>
                    <input
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                      value={active.auditor}
                      onChange={(e) =>
                        updateActive({ auditor: e.target.value })
                      }
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                      Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all"
                      value={active.date}
                      onChange={(e) => updateActive({ date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                      BSL Level
                    </label>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all appearance-none"
                        value={active.bsl}
                        onChange={(e) => updateActive({ bsl: e.target.value })}
                      >
                        {["BSL-1", "BSL-2", "BSL-2+", "BSL-3", "BSL-4"].map(
                          (b) => (
                            <option key={b}>{b}</option>
                          )
                        )}
                      </select>
                      <ChevronRight
                        className="absolute right-3 top-3 text-slate-400 rotate-90 pointer-events-none"
                        size={16}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <h4 className="font-serif font-semibold text-slate-700">
                  Audit Summary
                </h4>
                <Summary audit={active} answers={answers} />
                <div className="text-xs text-slate-500 mt-auto leading-relaxed">
                  <strong className="text-emerald-600">Guidance:</strong> Use
                  findings to close corrective actions and improve lab safety
                  culture. Audits should be evidence-based and documented.
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {(active.sections || []).map((s) => (
              <AuditSection
                key={s.id}
                section={s}
                answers={answers}
                setAnswer={setAnswer}
              />
            ))}

            <div className="p-6 rounded-3xl bg-white shadow-sm border border-slate-100">
              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                General Notes & Recommendations
              </label>
              <textarea
                className="w-full min-h-[120px] px-4 py-3 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all resize-y"
                placeholder="Enter overall observations..."
                value={active.notes}
                onChange={(e) => updateActive({ notes: e.target.value })}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* -------------------- Dashboard Page -------------------- */
function DashboardPage({ data, onAddLab, onAddEquipment, onAddIncident, onDeleteLab, onDeleteEquipment, onDeleteIncident }) {
  const [timeRange, setTimeRange] = useState("30 Days");

  const countsByBSL = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    (data.labs || []).forEach((l) => {
      counts[l.bsl] = (counts[l.bsl] || 0) + 1;
    });
    return counts;
  }, [data.labs]);

  const filteredMetrics = useMemo(() => {
    const allMetrics = aggregateMetrics(data.labs || []);
    if (timeRange === "This Week") return allMetrics.slice(-7);
    if (timeRange === "Yearly") return allMetrics; // Shows all available history (30 days in demo, but structurally correct)
    return allMetrics.slice(-30); // Default 30 Days
  }, [data.labs, timeRange]);
  
  const [isAddLabOpen, setIsAddLabOpen] = useState(false);
  const [newLab, setNewLab] = useState({ 
    name: "", 
    bsl: "2", 
    status: "Operational", 
    inspectionDue: "" 
  });

  const handleAdd = () => {
    if (!newLab.name || !newLab.inspectionDue) return;
    onAddLab(newLab);
    setIsAddLabOpen(false);
    setNewLab({ name: "", bsl: "2", status: "Operational", inspectionDue: "" });
  };

  const [isAddEquipmentOpen, setIsAddEquipmentOpen] = useState(false);
  const [newEquipment, setNewEquipment] = useState({
    name: "",
    status: "Good",
    lastService: ""
  });

  const handleAddEquipment = () => {
    if (!newEquipment.name || !newEquipment.lastService) return;
    onAddEquipment(newEquipment);
    setIsAddEquipmentOpen(false);
    setNewEquipment({ name: "", status: "Good", lastService: "" });
  };

  const [isAddIncidentOpen, setIsAddIncidentOpen] = useState(false);
  const [newIncident, setNewIncident] = useState({
    type: "",
    status: "Pending Investigation",
    date: "",
    severity: "Low"
  });

  const handleAddIncident = () => {
    if (!newIncident.type || !newIncident.date) return;
    onAddIncident(newIncident);
    setIsAddIncidentOpen(false);
    setNewIncident({ type: "", status: "Pending Investigation", date: "", severity: "Low" });
  };

  const handleDownload = () => {
    const csvContent = [
      "Metric,Value",
      `Active Labs,${(data.labs || []).length}`,
      `Equipment Count,${(data.equipment || []).length}`,
      `Pending Incidents,${(data.incidents || []).length}`,
      `Inspections Due,${(data.labs || []).filter((l) => l.inspectionDue < "2025-12-01").length}`
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dashboard_summary.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="print:hidden">
          <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
            Safety Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            Overview of biosafety metrics & compliance status.
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium uppercase tracking-wider">
              Live
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <div className="hidden sm:flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm border border-slate-100">
            {["This Week", " 30 Days", ""].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                  timeRange === range
                    ? "text-emerald-700 bg-emerald-50 shadow-sm ring-1 ring-black/5 dark:bg-emerald-900/20 dark:text-emerald-400"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
                )}
              >
                {range}
              </button>
            ))}
          </div>
          <button 
            onClick={handleDownload}
            className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-sm"
          >
            <Download size={20} />
          </button>
          <button 
            onClick={handlePrint}
            className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-sm"
          >
            <Printer size={20} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Active Labs"
          value={(data.labs || []).length}
          icon={FlaskConical}
          trend="+2"
        />
        <Stat
          label="Equipment"
          value={(data.equipment || []).length}
          icon={Microscope}
          trend="+5"
        />
        <Stat
          label="Inspections Due"
          value={
            (data.labs || []).filter((l) => l.inspectionDue < "2025-12-01")
              .length
          } // Simple logic demo
          icon={ClipboardCheck}
          hint="Within 30 Days"
          trend="-1"
          tone="amber"
          />
        <Stat
          label="Pending Incidents"
          value={(data.incidents || []).length}
          icon={AlertTriangle}
          hint="Requires Attention"
          trend={data.incidents?.length > 0 ? "+1" : "0"}
          tone="rose"
        />
      </div>

      {/* Main Charts Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl col-span-1">
          <h3 className="font-serif font-semibold text-lg text-slate-800 dark:text-white mb-6">
            Lab Distribution
          </h3>
          <div style={{ height: 220 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={[
                    { name: "BSL-1", value: countsByBSL[1] },
                    { name: "BSL-2", value: countsByBSL[2] },
                    { name: "BSL-3", value: countsByBSL[3] },
                    { name: "BSL-4", value: countsByBSL[4] },
                  ]}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {[
                    countsByBSL[1],
                    countsByBSL[2],
                    countsByBSL[3],
                    countsByBSL[4],
                  ].map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={COLORS[idx % COLORS.length]}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-serif font-semibold text-lg text-slate-800 dark:text-white">
                Environmental Metrics
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Average Temperature & Airflow ({timeRange})
              </p>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> Temp
              </span>
              <span className="flex items-center gap-1 text-xs font-medium text-sky-600 bg-sky-50 px-2 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-sky-500" /> Airflow
              </span>
            </div>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer>
              <AreaChart data={filteredMetrics}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={CHART_COLORS.temp}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor={CHART_COLORS.temp}
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="colorAir" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={CHART_COLORS.airflow}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor={CHART_COLORS.airflow}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                  cursor={{
                    stroke: "#cbd5e1",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="temp"
                  stroke={CHART_COLORS.temp}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorTemp)"
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="airflow"
                  stroke={CHART_COLORS.airflow}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAir)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="glass-card rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-serif font-semibold text-lg text-slate-800 dark:text-white">
            Lab Status
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsAddLabOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-500/20"
            >
              <Plus size={16} /> Add Lab
            </button>
            <Link to="/labs" className="text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:text-emerald-700 dark:hover:text-emerald-300">
              View All
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">BSL</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Inspection Due</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(data.labs || []).map((l) => (
                <tr
                  key={l.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                    {l.name}
                  </td>
                  <td className="px-6 py-4">
                    <Tag tone={l.bsl >= 3 ? "amber" : "gray"}>BSL-{l.bsl}</Tag>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          l.status === "Operational"
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                        )}
                      />
                      {l.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {l.inspectionDue}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onDeleteLab && onDeleteLab(l.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Lab"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="text-slate-400 hover:text-emerald-600 transition-colors">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Equipment Status Section */}
      <section className="glass-card rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-serif font-semibold text-lg text-slate-800 dark:text-white">
            Equipment Status
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsAddEquipmentOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-500/20"
            >
              <Plus size={16} /> Add Equipment
            </button>
            <Link to="/equipment" className="text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:text-emerald-700 dark:hover:text-emerald-300">
              View All
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Service</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(data.equipment || []).map((e) => (
                <tr
                  key={e.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                    {e.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          e.status === "Good"
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                        )}
                      />
                      {e.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {e.lastService}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onDeleteEquipment && onDeleteEquipment(e.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Equipment"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="text-slate-400 hover:text-emerald-600 transition-colors">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Incidents Section */}
      <section className="glass-card rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-serif font-semibold text-lg text-slate-800 dark:text-white">
            Recent Incidents
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsAddIncidentOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all shadow-sm shadow-emerald-500/20"
            >
              <Plus size={16} /> Add Incident
            </button>
            <Link to="/incidents" className="text-sm text-emerald-600 dark:text-emerald-400 font-medium hover:text-emerald-700 dark:hover:text-emerald-300">
              View All
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium">
              <tr>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(data.incidents || []).map((inc) => (
                <tr
                  key={inc.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                    {inc.type}
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-2">
                       <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          inc.status === "Resolved"
                            ? "bg-emerald-500"
                            : "bg-rose-500"
                        )}
                      />
                      {inc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {inc.date}
                  </td>
                  <td className="px-6 py-4">
                     <Tag tone={inc.severity === "High" ? "red" : "gray"}>{inc.severity}</Tag>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onDeleteIncident && onDeleteIncident(inc.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Incident"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="text-slate-400 hover:text-emerald-600 transition-colors">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add Lab Modal */}
      <AnimatePresence>
        {isAddLabOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsAddLabOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-serif font-semibold text-lg text-slate-800 dark:text-white">Add New Lab</h3>
                <button 
                  onClick={() => setIsAddLabOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Lab Name</label>
                  <input 
                    type="text" 
                    value={newLab.name}
                    onChange={e => setNewLab({...newLab, name: e.target.value})}
                    placeholder="e.g. Molecular Biology Core"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 text-slate-900 dark:text-white outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">BSL Level</label>
                    <select
                      value={newLab.bsl}
                      onChange={e => setNewLab({...newLab, bsl: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 text-slate-900 dark:text-white outline-none transition-all"
                    >
                      <option value="1">BSL-1</option>
                      <option value="2">BSL-2</option>
                      <option value="3">BSL-3</option>
                      <option value="4">BSL-4</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                    <select
                      value={newLab.status}
                      onChange={e => setNewLab({...newLab, status: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 text-slate-900 dark:text-white outline-none transition-all"
                    >
                      <option value="Operational">Operational</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Decommissioned">Decommissioned</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Next Inspection</label>
                  <input 
                    type="date"
                    value={newLab.inspectionDue}
                    onChange={e => setNewLab({...newLab, inspectionDue: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 text-slate-900 dark:text-white outline-none transition-all"
                  />
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setIsAddLabOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAdd}
                  disabled={!newLab.name || !newLab.inspectionDue}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-500/20 transition-all"
                >
                  Add Lab
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Equipment Modal */}
      <AnimatePresence>
        {isAddEquipmentOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsAddEquipmentOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-serif font-semibold text-lg text-slate-800 dark:text-white">Add Equipment</h3>
                <button 
                  onClick={() => setIsAddEquipmentOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Equipment Name</label>
                  <input 
                    type="text" 
                    value={newEquipment.name}
                    onChange={e => setNewEquipment({...newEquipment, name: e.target.value})}
                    placeholder="e.g. Centrifuge C-12"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 text-slate-900 dark:text-white outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                    <select
                      value={newEquipment.status}
                      onChange={e => setNewEquipment({...newEquipment, status: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 text-slate-900 dark:text-white outline-none transition-all"
                    >
                      <option value="Good">Good</option>
                      <option value="Service Due">Service Due</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Service</label>
                    <input 
                      type="date"
                      value={newEquipment.lastService}
                      onChange={e => setNewEquipment({...newEquipment, lastService: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 text-slate-900 dark:text-white outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setIsAddEquipmentOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddEquipment}
                  disabled={!newEquipment.name || !newEquipment.lastService}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-500/20 transition-all"
                >
                  Add Equipment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Incident Modal */}
      <AnimatePresence>
        {isAddIncidentOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsAddIncidentOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden relative z-10"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <h3 className="font-serif font-semibold text-lg text-slate-800 dark:text-white">Report Incident</h3>
                <button 
                  onClick={() => setIsAddIncidentOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Incident Type</label>
                  <input 
                    type="text" 
                    value={newIncident.type}
                    onChange={e => setNewIncident({...newIncident, type: e.target.value})}
                    placeholder="e.g. Chemical Spill"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 text-slate-900 dark:text-white outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                    <select
                      value={newIncident.status}
                      onChange={e => setNewIncident({...newIncident, status: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 text-slate-900 dark:text-white outline-none transition-all"
                    >
                      <option value="Pending Investigation">Pending Investigation</option>
                      <option value="Investigation In Progress">Investigation In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Severity</label>
                    <select
                      value={newIncident.severity}
                      onChange={e => setNewIncident({...newIncident, severity: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 text-slate-900 dark:text-white outline-none transition-all"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
                   <input 
                      type="date"
                      value={newIncident.date}
                      onChange={e => setNewIncident({...newIncident, date: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 text-slate-900 dark:text-white outline-none transition-all"
                    />
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setIsAddIncidentOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddIncident}
                  disabled={!newIncident.type || !newIncident.date}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-500/20 transition-all"
                >
                  Report Incident
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------- Main App -------------------- */
import Chatbot from "./components/Chatbot";


export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage("biosafety_auth", false);
  const [data, setData] = useLocalStorage(STORAGE_KEY, DEMO_DATA);
  const [darkMode, setDarkMode] = useLocalStorage("biosafety_theme", false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const handleAddLab = (newLab) => {
    const newLabEntry = {
      id: uuidv4(),
      ...newLab,
      metrics: generateMetrics(30),
    };
    setData((prev) => ({ ...prev, labs: [...(prev.labs || []), newLabEntry] }));
  };

  const handleAddEquipment = (newEquipment) => {
    const entry = { id: uuidv4(), ...newEquipment };
     setData((prev) => ({ ...prev, equipment: [...(prev.equipment || []), entry] }));
  };

  const handleAddIncident = (newIncident) => {
    const entry = { id: uuidv4(), ...newIncident };
     setData((prev) => ({ ...prev, incidents: [...(prev.incidents || []), entry] }));
  };

  const handleDeleteLab = (id) => {
    if (window.confirm("Are you sure you want to delete this lab?")) {
      setData((prev) => ({ ...prev, labs: prev.labs.filter((l) => l.id !== id) }));
    }
  };

  const handleDeleteEquipment = (id) => {
    if (window.confirm("Are you sure you want to delete this equipment?")) {
      setData((prev) => ({ ...prev, equipment: prev.equipment.filter((e) => e.id !== id) }));
    }
  };

  const handleDeleteIncident = (id) => {
    if (window.confirm("Are you sure you want to delete this incident?")) {
      setData((prev) => ({ ...prev, incidents: prev.incidents.filter((i) => i.id !== id) }));
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }, []);

  // Live Sensor Simulation
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      setData(prevData => {
        const nextLabs = (prevData.labs || []).map(lab => {
          // Generate new fake values
          const newTemp = 20 + Math.round(Math.random() * 6);
          const newAirflow = 80 + Math.round(Math.random() * 20);

          // Get existing metrics (values only) and keep last 29
          const oldMetrics = lab.metrics || [];
          const keptMetrics = oldMetrics.length >= 30 ? oldMetrics.slice(1) : oldMetrics;
          
          const valsToKeep = keptMetrics.map(m => ({ temp: m.temp, airflow: m.airflow }));
          valsToKeep.push({ temp: newTemp, airflow: newAirflow });
          
          // Reassign dates anchored to Today
          const today = new Date();
          const newMetrics = valsToKeep.map((val, idx) => {
             // idx 0 is oldest. len-1 is newest (today).
             const offset = valsToKeep.length - 1 - idx;
             const d = new Date(today.getTime() - offset * 24 * 60 * 60 * 1000);
             return {
               date: d.toISOString().slice(0, 10),
               temp: val.temp,
               airflow: val.airflow
             };
          });

          return {
            ...lab,
            metrics: newMetrics
          };
        });

        return { ...prevData, labs: nextLabs };
      });
    }, 2500); // 2.5 second update rate

    return () => clearInterval(interval);
  }, [isAuthenticated, setData]); // Removed dependency on removed state

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} darkMode={darkMode} toggleTheme={toggleTheme} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-300">
        <TopCenteredNav onLogout={() => setIsAuthenticated(false)} darkMode={darkMode} toggleTheme={toggleTheme} />
        {/* Dynamic Mesh Background */}
        <div className="fixed inset-0 -z-10 animate-mesh bg-[radial-gradient(at_0%_0%,_hsla(147,100%,96%,1)_0,transparent_50%),_radial-gradient(at_50%_0%,_hsla(215,100%,96%,1)_0,transparent_50%),_radial-gradient(at_100%_0%,_hsla(147,100%,96%,1)_0,transparent_50%)] dark:bg-[radial-gradient(at_0%_0%,_hsla(147,30%,10%,1)_0,transparent_50%),_radial-gradient(at_50%_0%,_hsla(215,30%,15%,1)_0,transparent_50%)] opacity-80 pointer-events-none transition-all duration-500" />
        <div className="fixed inset-0 -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none" />

        <main className="pt-6 pb-24">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={
                <DashboardPage 
                  data={data} 
                  onAddLab={handleAddLab}
                  onAddEquipment={handleAddEquipment}
                  onAddIncident={handleAddIncident}
                  onDeleteLab={handleDeleteLab}
                  onDeleteEquipment={handleDeleteEquipment}
                  onDeleteIncident={handleDeleteIncident}
                />
              } />

              <Route
                path="/labs"
                element={
                  <AuditPageShell
                    key="labs"
                    storageKey="biosafety.labs_v2"
                    defaultSections={[
                      {
                        id: uid(),
                        title: "Lab Compliance",
                        items: getLabsTemplate(),
                      },
                    ]}
                    title="Lab Audits"
                    intro="Assess lab biosafety compliance."
                  />
                }
              />

              <Route
                path="/equipment"
                element={
                  <AuditPageShell
                    key="equipment"
                    storageKey="biosafety.equipment_v2"
                    defaultSections={[
                      {
                        id: uid(),
                        title: "Equipment Compliance",
                        items: getEquipmentTemplate(),
                      },
                    ]}
                    title="Equipment Audits"
                    intro="Inspect lab equipment safety."
                  />
                }
              />

              <Route
                path="/inspections"
                element={
                  <AuditPageShell
                    key="inspections"
                    storageKey="biosafety.inspections_v2"
                    defaultSections={[
                      {
                        id: uid(),
                        title: "Inspection Checklist",
                        items: getInspectionTemplate(),
                      },
                    ]}
                    title="Inspection Audits"
                    intro="Routine biosafety inspections."
                  />
                }
              />

              <Route
                path="/incidents"
                element={
                  <AuditPageShell
                    key="incidents"
                    storageKey="biosafety.inspections_v2"
                    defaultSections={[
                      {
                        id: uid(),
                        title: "Incident Review",
                        items: getIncidentTemplate(),
                      },
                    ]}
                    title="Incident Audits"
                    intro="Incident analysis and prevention."
                  />
                }
              />

              <Route
                path="/audit"
                element={
                  <AuditPageShell
                    key="auditmanager"
                    storageKey="biosafety.auditmanager_v2"
                    defaultSections={[
                      {
                        id: uid(),
                        title: "Program Audit",
                        items: getAuditManagerTemplate(),
                      },
                    ]}
                    title="Audit Manager"
                    intro="Overall biosafety program review."
                  />
                }
              />
            </Routes>
          </AnimatePresence>
        </main>


        <Chatbot />
        
        <footer className="w-full text-center py-6 mt-auto">
          <div className="text-xs font-serif text-black dark:text-white font-medium">
             <h2 className="!text-black dark:!text-white"> Designed and Developed By
                        <br /> Arnav, Akshar and Aman
                  </h2>
                  <h3 className="!text-black dark:!text-white">&copy;  RVCE</h3>
          </div>
        </footer>

      </div>
    </BrowserRouter>
  );
}
