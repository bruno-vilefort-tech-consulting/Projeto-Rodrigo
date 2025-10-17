import React, { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./app.css";
import { Language, languages, translations } from "./i18n";
import logoDark from "./logo-dark.png";

type InstallConfig = {
  manifestUrl: string;
  backendUrl: string;
  frontendUrl: string;
  email: string;
  companyName: string;
  deployPass: string;
  masterPass: string;
  supportPhone: string;
  fbAppId?: string;
  fbAppSecret?: string;
  sqlBackupPath?: string; // opcional
  runPostInstall: boolean; // executa postinstall.sh com sudo (opcional)
};

type ProgressEvent = {
  phase: string;       // ex: "download", "verify", "extract", "write-env", "postinstall"
  artifact?: string;   // nome do artefato
  current: number;     // progresso atual (itens)
  total: number;       // total de itens
  bytes?: { received?: number; total?: number }; // progresso por bytes
  message?: string;
};

const isEmail = (v: string) => /^[^@]+@[^@]+\.[^@]+$/.test(v);
const isPhone = (v: string) => /^[0-9]{10,15}$/.test(v);

export default function App() {
  const [lang, setLang] = useState<Language>('pt');
  const t = translations[lang];

  const [cfg, setCfg] = useState<InstallConfig>({
    manifestUrl: "",
    backendUrl: "",
    frontendUrl: "",
    email: "",
    companyName: "",
    deployPass: "",
    masterPass: "",
    supportPhone: "",
    fbAppId: "",
    fbAppSecret: "",
    sqlBackupPath: "",
    runPostInstall: true
  });

  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState<ProgressEvent>({ phase: "idle", current: 0, total: 0 });

  useEffect(() => {
    const unsubs: Array<() => void> = [];
    listen<ProgressEvent>("install://progress", (e) => setProgress(e.payload)).then(unsub => unsubs.push(unsub));
    listen<string>("install://log", (e) => setLogs(prev => [...prev, e.payload])).then(unsub => unsubs.push(unsub));
    listen<string>("install://error", (e) => { setError(e.payload); setStarted(false); }).then(unsub => unsubs.push(unsub));
    listen<string>("install://done", () => { setDone(true); setStarted(false); }).then(unsub => unsubs.push(unsub));
    return () => unsubs.forEach(u => u());
  }, []);

  const percent = useMemo(() => {
    if (!progress.total) return 0;
    const base = Math.min(100, Math.floor((progress.current / progress.total) * 100));
    return base;
  }, [progress]);

  const canInstall = useMemo(() => {
    if (!cfg.manifestUrl || !cfg.backendUrl || !cfg.frontendUrl || !cfg.email || !cfg.companyName || !cfg.deployPass || !cfg.masterPass || !cfg.supportPhone)
      return false;
    return isEmail(cfg.email) && isPhone(cfg.supportPhone);
  }, [cfg]);

  async function start() {
    setError(null);
    setLogs([]);
    setDone(false);
    setStarted(true);
    try {
      await invoke("install", { cfg });
    } catch (e: any) {
      setError(e?.toString?.() ?? "Erro desconhecido");
      setStarted(false);
    }
  }

  return (
    <div className="wrap">
      <div className="header">
        <div className="title-wrapper">
          <img src={logoDark} alt="ChatIA Logo" className="logo" />
          <h1>{t.title}</h1>
        </div>
        <div className="lang-selector">
          {(Object.keys(languages) as Language[]).map((l) => (
            <button
              key={l}
              className={`lang-btn ${lang === l ? 'active' : ''}`}
              onClick={() => setLang(l)}
              title={languages[l].name}
            >
              <span className="flag">{languages[l].flag}</span>
              <span className="lang-name">{languages[l].name}</span>
            </button>
          ))}
        </div>
      </div>

      <section className="card">
        <h2>{t.configTitle}</h2>
        <div className="grid">
          <label>{t.manifestUrl}
            <input placeholder={t.manifestUrlPlaceholder}
                   value={cfg.manifestUrl}
                   onChange={e => setCfg({ ...cfg, manifestUrl: e.target.value.trim() })}/>
          </label>

          <label>{t.backendUrl}
            <input placeholder={t.backendUrlPlaceholder}
                   value={cfg.backendUrl}
                   onChange={e => setCfg({ ...cfg, backendUrl: e.target.value.trim() })}/>
          </label>

          <label>{t.frontendUrl}
            <input placeholder={t.frontendUrlPlaceholder}
                   value={cfg.frontendUrl}
                   onChange={e => setCfg({ ...cfg, frontendUrl: e.target.value.trim() })}/>
          </label>

          <label>{t.email}
            <input placeholder={t.emailPlaceholder}
                   value={cfg.email}
                   onChange={e => setCfg({ ...cfg, email: e.target.value.trim() })}/>
            {!isEmail(cfg.email) && cfg.email && <small className="err">{t.emailInvalid}</small>}
          </label>

          <label>{t.companyName}
            <input placeholder={t.companyNamePlaceholder}
                   value={cfg.companyName}
                   onChange={e => setCfg({ ...cfg, companyName: e.target.value })}/>
          </label>

          <label>{t.deployPass}
            <input placeholder={t.deployPassPlaceholder}
                   type="password"
                   value={cfg.deployPass}
                   onChange={e => setCfg({ ...cfg, deployPass: e.target.value })}/>
          </label>

          <label>{t.masterPass}
            <input placeholder={t.masterPassPlaceholder}
                   type="password"
                   value={cfg.masterPass}
                   onChange={e => setCfg({ ...cfg, masterPass: e.target.value })}/>
          </label>

          <label>{t.supportPhone}
            <input placeholder={t.supportPhonePlaceholder}
                   value={cfg.supportPhone}
                   onChange={e => setCfg({ ...cfg, supportPhone: e.target.value })}/>
            {!isPhone(cfg.supportPhone) && cfg.supportPhone && <small className="err">{t.phoneInvalid}</small>}
          </label>

          <label>{t.fbAppId}
            <input placeholder={t.fbAppIdPlaceholder}
                   value={cfg.fbAppId}
                   onChange={e => setCfg({ ...cfg, fbAppId: e.target.value })}/>
          </label>

          <label>{t.fbAppSecret}
            <input placeholder={t.fbAppSecretPlaceholder}
                   type="password"
                   value={cfg.fbAppSecret}
                   onChange={e => setCfg({ ...cfg, fbAppSecret: e.target.value })}/>
          </label>

          <label>{t.sqlBackup}
            <input placeholder={t.sqlBackupPlaceholder}
                   value={cfg.sqlBackupPath}
                   onChange={e => setCfg({ ...cfg, sqlBackupPath: e.target.value })}/>
          </label>
        </div>

        <div className="actions">
          <button className="install-btn" disabled={!canInstall || started} onClick={start}>
            <span className="install-icon">⚡</span>
            {t.installButton}
          </button>
          {started && <span className="spinner" />}
        </div>
      </section>

      <section className="card">
        <h2>{t.progressTitle}</h2>
        <div className="bar">
          <div className="bar-fill" style={{ width: `${percent}%` }} />
        </div>
        <p className="muted">
          {t.phase} <b>{progress.phase}</b>
          {progress.artifact ? <> • {t.artifact} <b>{progress.artifact}</b></> : null}
          {progress.bytes?.total ? <> • {Math.floor((progress.bytes?.received ?? 0) / 1024 / 1024)} / {Math.floor((progress.bytes?.total ?? 0) / 1024 / 1024)} MB</> : null}
          {progress.message ? <> • {progress.message}</> : null}
        </p>

        <details>
          <summary>{t.logs}</summary>
          <pre className="logs">{logs.join("\n")}</pre>
        </details>

        {error && <div className="error">{t.errorPrefix} {error}</div>}
        {done && <div className="success">{t.successMessage}</div>}
      </section>
    </div>
  );
}
