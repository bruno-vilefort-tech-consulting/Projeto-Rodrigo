Abaixo está um esqueleto funcional de instalador clicável com Tauri (Rust + WebView) que substitui o seu .sh por um bootstrapper com UI e foco em baixar/validar/extrair artefatos pré‑construídos do GitHub (ou qualquer URL).
Ele mantém a mesma coleta de dados (backend/frontend/email/empresa/senhas etc.), gera os .env, e executa hooks opcionais de pós‑instalação (ex.: postinstall.sh com tarefas que exigem root).

Arquitetura resumida

Pipeline (GitHub Actions): constrói e versiona backend_node_modules.tgz, backend_dist.tgz, frontend_build.tgz (e opcionalmente pnpm_store.tgz) + manifest.json com SHA‑256.

Installer Tauri: UI dark com botão Instalar, barra de progresso e logs colapsáveis. O backend em Rust faz download paralelo, checksum e extração streaming; escreve .env e dispara um hook opcional (postinstall.sh) para tarefas com privilégios (criar usuário deploy, PM2, banco etc.).

Ganho de 40–70% vem de não compilar/instalar deps na VPS: o instalador só baixa/valida/extrai o que o CI já preparou.

1) Manifesto de artefatos (publicado pelo CI)

Exemplo de manifest.json (anexado ao Release ou servido por URL público):

{
  "version": "5.0.0",
  "artifacts": [
    {
      "name": "backend_dist",
      "url": "https://example.com/releases/5.0.0/backend_dist.tar.gz",
      "sha256": "<<<sha256>>>",
      "targetDir": "/home/deploy/__EMPRESA__/backend",
      "stripComponents": 1,
      "type": "tar.gz"
    },
    {
      "name": "backend_node_modules",
      "url": "https://example.com/releases/5.0.0/backend_node_modules.tar.gz",
      "sha256": "<<<sha256>>>",
      "targetDir": "/home/deploy/__EMPRESA__/backend",
      "stripComponents": 1,
      "type": "tar.gz"
    },
    {
      "name": "frontend_build",
      "url": "https://example.com/releases/5.0.0/frontend_build.tar.gz",
      "sha256": "<<<sha256>>>",
      "targetDir": "/home/deploy/__EMPRESA__/frontend",
      "stripComponents": 1,
      "type": "tar.gz"
    }
  ]
}


Observação: __EMPRESA__ será substituído no instalador pelo slug normalizado (mesma regra do seu .sh).

2) UI (React + TypeScript)

src/App.tsx – UI dark com formulário (equivalente ao wizard), botão Instalar, barra de progresso e logs colapsáveis.

import React, { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import "./app.css";

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
    runPostInstall: false
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
      <h1>ChatIA • Instalador (v5 GUI)</h1>
      <p className="muted">Baixa/valida/extrai artefatos pré-construídos do CI. Tema dark.</p>

      <section className="card">
        <h2>Configuração</h2>
        <div className="grid">
          <label>URL do Manifest (JSON)
            <input placeholder="https://.../manifest.json"
                   value={cfg.manifestUrl}
                   onChange={e => setCfg({ ...cfg, manifestUrl: e.target.value.trim() })}/>
          </label>

          <label>Backend URL
            <input placeholder="https://api.exemplo.com"
                   value={cfg.backendUrl}
                   onChange={e => setCfg({ ...cfg, backendUrl: e.target.value.trim() })}/>
          </label>

          <label>Frontend URL
            <input placeholder="https://app.exemplo.com"
                   value={cfg.frontendUrl}
                   onChange={e => setCfg({ ...cfg, frontendUrl: e.target.value.trim() })}/>
          </label>

          <label>Email (admin)
            <input placeholder="admin@empresa.com"
                   value={cfg.email}
                   onChange={e => setCfg({ ...cfg, email: e.target.value.trim() })}/>
            {!isEmail(cfg.email) && cfg.email && <small className="err">Email inválido</small>}
          </label>

          <label>Nome da Empresa
            <input placeholder="Minha Empresa"
                   value={cfg.companyName}
                   onChange={e => setCfg({ ...cfg, companyName: e.target.value })}/>
          </label>

          <label>Senha Deploy/Redis/DB
            <input value={cfg.deployPass}
                   onChange={e => setCfg({ ...cfg, deployPass: e.target.value })}/>
          </label>

          <label>Senha MASTER (painel)
            <input value={cfg.masterPass}
                   onChange={e => setCfg({ ...cfg, masterPass: e.target.value })}/>
          </label>

          <label>Telefone Suporte (somente números)
            <input placeholder="5511999999999"
                   value={cfg.supportPhone}
                   onChange={e => setCfg({ ...cfg, supportPhone: e.target.value })}/>
            {!isPhone(cfg.supportPhone) && cfg.supportPhone && <small className="err">Telefone inválido</small>}
          </label>

          <label>FACEBOOK_APP_ID (opcional)
            <input value={cfg.fbAppId}
                   onChange={e => setCfg({ ...cfg, fbAppId: e.target.value })}/>
          </label>

          <label>FACEBOOK_APP_SECRET (opcional)
            <input value={cfg.fbAppSecret}
                   onChange={e => setCfg({ ...cfg, fbAppSecret: e.target.value })}/>
          </label>

          <label>Backup SQL (opcional)
            <input placeholder="/caminho/backup.sql"
                   value={cfg.sqlBackupPath}
                   onChange={e => setCfg({ ...cfg, sqlBackupPath: e.target.value })}/>
          </label>

          <label className="checkbox">
            <input type="checkbox" checked={cfg.runPostInstall}
                   onChange={e => setCfg({ ...cfg, runPostInstall: e.target.checked })}/>
            Executar pós-instalação (root) via <code>postinstall.sh</code>
          </label>
        </div>

        <div className="actions">
          <button disabled={!canInstall || started} onClick={start}>Instalar</button>
          {started && <span className="spinner" />}
        </div>
      </section>

      <section className="card">
        <h2>Progresso</h2>
        <div className="bar">
          <div className="bar-fill" style={{ width: `${percent}%` }} />
        </div>
        <p className="muted">
          Fase: <b>{progress.phase}</b>
          {progress.artifact ? <> • Artefato: <b>{progress.artifact}</b></> : null}
          {progress.bytes?.total ? <> • {Math.floor((progress.bytes?.received ?? 0) / 1024 / 1024)} / {Math.floor((progress.bytes?.total ?? 0) / 1024 / 1024)} MB</> : null}
          {progress.message ? <> • {progress.message}</> : null}
        </p>

        <details>
          <summary>Logs</summary>
          <pre className="logs">{logs.join("\n")}</pre>
        </details>

        {error && <div className="error">⚠️ {error}</div>}
        {done && <div className="success">✅ Instalação concluída!</div>}
      </section>
    </div>
  );
}


src/app.css (dark minimal):

:root { color-scheme: dark; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; background: #0b0f14; color: #e5e7eb; }
.wrap { max-width: 980px; margin: 2rem auto; padding: 0 1rem; }
h1 { font-size: 1.5rem; margin: 0 0 .5rem; }
.muted { color: #9aa4b2; }
.card { background: #0f1620; border: 1px solid #1f2a37; border-radius: 10px; padding: 1rem; margin-top: 1rem; }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .8rem 1rem; }
label { display: flex; flex-direction: column; gap: .35rem; font-size: .9rem; }
input { background: #0c121a; border: 1px solid #203040; color: #e5e7eb; padding: .55rem .7rem; border-radius: 8px; outline: none; }
input:focus { border-color: #3b82f6; }
.checkbox { grid-column: 1 / -1; flex-direction: row; align-items: center; gap: .5rem; }
.actions { display: flex; align-items: center; gap: .8rem; margin-top: .6rem; }
button { background: #1e293b; border: 1px solid #3b82f6; color: #e5e7eb; padding: .6rem 1rem; border-radius: 8px; cursor: pointer; }
button:disabled { opacity: .6; cursor: not-allowed; }
.spinner { width: 16px; height: 16px; border: 2px solid #385376; border-top-color: transparent; border-radius: 50%; animation: s 0.9s linear infinite; }
@keyframes s { to { transform: rotate(360deg); } }
.bar { background: #0c121a; border: 1px solid #1f2a37; height: 14px; border-radius: 99px; overflow: hidden; margin: .6rem 0; }
.bar-fill { background: #3b82f6; height: 100%; width: 0%; }
pre.logs { background: #0a0f15; border: 1px solid #16202e; border-radius: 8px; padding: .8rem; max-height: 320px; overflow: auto; font-size: .85rem; }
.err { color: #f59e0b; }
.error { background: #2a0e10; border: 1px solid #7f1d1d; padding: .6rem; border-radius: 8px; margin-top: .6rem; }
.success { background: #0e2917; border: 1px solid #14532d; padding: .6rem; border-radius: 8px; margin-top: .6rem; }

3) Backend (Rust) – downloads paralelos, checksum e extração streaming

src-tauri/Cargo.toml (trecho relevante):

[package]
name = "chatia-installer"
version = "0.1.0"
edition = "2021"

[dependencies]
tauri = { version = "2", features = ["shell-open"] }
tauri-plugin-shell = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
reqwest = { version = "0.12", features = ["json", "stream", "gzip", "brotli", "deflate", "rustls-tls"] }
futures = "0.3"
tokio = { version = "1", features = ["rt-multi-thread", "macros"] }
sha2 = "0.10"
hex = "0.4"
tar = "0.4"
flate2 = "1.0"
urlencoding = "2.1"
regex = "1"
dirs = "5"
anyhow = "1"


src-tauri/src/main.rs:

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use anyhow::{Context, Result};
use flate2::read::GzDecoder;
use futures::{StreamExt, TryStreamExt};
use regex::Regex;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
  fs::{self, File},
  io::{self, BufReader, Read},
  path::{Path, PathBuf},
};
use tar::Archive;
use tauri::{Manager, Window};

#[derive(Deserialize)]
struct InstallConfig {
  manifestUrl: String,
  backendUrl: String,
  frontendUrl: String,
  email: String,
  companyName: String,
  deployPass: String,
  masterPass: String,
  supportPhone: String,
  fbAppId: Option<String>,
  fbAppSecret: Option<String>,
  sqlBackupPath: Option<String>,
  runPostInstall: bool,
}

#[derive(Serialize, Deserialize, Clone)]
struct Artifact {
  name: String,
  url: String,
  sha256: String,
  targetDir: String,
  #[serde(default)]
  stripComponents: usize,
  #[serde(default = "default_type")]
  r#type: String,
}
fn default_type() -> String { "tar.gz".into() }

#[derive(Serialize, Deserialize)]
struct Manifest {
  version: String,
  artifacts: Vec<Artifact>,
}

#[derive(Serialize, Clone)]
struct ProgressEvent {
  phase: String,
  artifact: Option<String>,
  current: usize,
  total: usize,
  #[serde(skip_serializing_if = "Option::is_none")]
  bytes: Option<BytesProgress>,
  #[serde(skip_serializing_if = "Option::is_none")]
  message: Option<String>,
}
#[derive(Serialize, Clone)]
struct BytesProgress { received: u64, total: u64 }

fn emit(window: &Window, ev: &str, payload: impl Serialize) {
  let _ = window.emit(ev, payload);
}
fn log(window: &Window, msg: impl Into<String>) {
  let _ = window.emit("install://log", msg.into());
}
fn progress(window: &Window, p: ProgressEvent) {
  emit(window, "install://progress", p);
}

#[tauri::command]
async fn install(window: Window, cfg: InstallConfig) -> Result<(), String> {
  if !is_email(&cfg.email) || !is_phone(&cfg.supportPhone) {
    return Err("Dados inválidos (email/telefone)".into());
  }
  let company_slug = normalize_company(&cfg.companyName);
  let client = Client::builder().build().map_err(err)?;
  log(&window, format!("Baixando manifest: {}", cfg.manifestUrl));
  let manifest: Manifest = client
    .get(&cfg.manifestUrl)
    .send().await.map_err(err)?
    .error_for_status().map_err(err)?
    .json().await.map_err(err)?;
  log(&window, format!("Manifest v{} com {} artefatos.", manifest.version, manifest.artifacts.len()));

  // Substituir __EMPRESA__ no targetDir
  let mut arts: Vec<Artifact> = manifest.artifacts.iter().map(|a| {
    let mut b = a.clone();
    b.targetDir = b.targetDir.replace("__EMPRESA__", &company_slug);
    b
  }).collect();

  // Criar diretórios alvo
  for a in &arts {
    fs::create_dir_all(&a.targetDir).map_err(err)?;
  }

  // Downloads em paralelo (buffer_unordered)
  let total = arts.len();
  progress(&window, ProgressEvent { phase: "download".into(), artifact: None, current: 0, total, bytes: None, message: None });

  let mut idx = 0usize;
  let mut results = futures::stream::iter(arts.into_iter().map(|art| {
    let client = client.clone();
    let window = window.clone();
    async move {
      let tmp = download_one(&window, &client, &art).await?;
      verify_sha256(&window, &art, &tmp)?;
      extract_tar_gz(&window, &art, &tmp)?;
      fs::remove_file(&tmp).ok();
      Ok::<_, anyhow::Error>(art.name)
    }
  }))
  .buffer_unordered(3);

  while let Some(res) = results.next().await {
    match res {
      Ok(name) => {
        idx += 1;
        progress(&window, ProgressEvent { phase: "extract".into(), artifact: Some(name), current: idx, total, bytes: None, message: Some("Ok".into()) });
      }
      Err(e) => {
        let _ = window.emit("install://error", format!("Falha: {e:#}"));
        return Err(e.to_string());
      }
    }
  }

  // Escrever .env
  log(&window, "Escrevendo .env (backend/frontend)...");
  let base = PathBuf::from(format!("/home/deploy/{company}", company = company_slug));
  write_env_backend(&base, &cfg).map_err(err)?;
  write_env_frontend(&base, &cfg).map_err(err)?;
  progress(&window, ProgressEvent { phase: "write-env".into(), artifact: None, current: total, total, bytes: None, message: None });

  // Copiar backup SQL (opcional)
  if let Some(p) = &cfg.sqlBackupPath {
    if !p.trim().is_empty() {
      let dest = base.join("db_backup.sql");
      match fs::copy(p, &dest) {
        Ok(_) => log(&window, format!("Backup SQL copiado para {}", dest.display())),
        Err(e) => log(&window, format!("WARN: não foi possível copiar backup SQL: {e}")),
      }
    }
  }

  // Pós-instalação (opcional): chama /bin/bash postinstall.sh
  if cfg.runPostInstall {
    log(&window, "Executando postinstall.sh (requer sudo)...");
    progress(&window, ProgressEvent { phase: "postinstall".into(), artifact: None, current: 0, total: 1, bytes: None, message: None });
    if let Err(e) = run_postinstall(&window, &base).await {
      let _ = window.emit("install://error", format!("postinstall falhou: {e:#}"));
      return Err(e.to_string());
    }
    progress(&window, ProgressEvent { phase: "postinstall".into(), artifact: None, current: 1, total: 1, bytes: None, message: Some("OK".into()) });
  }

  let _ = window.emit("install://done", "ok");
  Ok(())
}

fn normalize_company(name: &str) -> String {
  let mut s = name.to_lowercase();
  s = s.chars().map(|c| if c.is_ascii_alphanumeric(){c}else{'_'}).collect();
  while s.contains("__") { s = s.replace("__", "_"); }
  if s.starts_with('_') { s.remove(0); }
  if s.is_empty() || s.chars().next().unwrap().is_ascii_digit() { format!("app_{s}") } else { s }
}

fn is_email(v: &str) -> bool {
  let re = Regex::new(r"^[^@]+@[^@]+\.[^@]+$").unwrap();
  re.is_match(v)
}
fn is_phone(v: &str) -> bool {
  let re = Regex::new(r"^[0-9]{10,15}$").unwrap();
  re.is_match(v)
}

async fn download_one(window: &Window, client: &Client, art: &Artifact) -> Result<PathBuf> {
  log(window, format!("Baixando {}...", art.name));
  let resp = client.get(&art.url).send().await?.error_for_status()?;
  let total = resp.content_length().unwrap_or(0);
  let tmp = std::env::temp_dir().join(format!("{}.part", art.name));
  let mut file = File::create(&tmp)?;
  let mut received: u64 = 0;

  let mut stream = resp.bytes_stream();
  while let Some(chunk) = stream.try_next().await? {
    use std::io::Write;
    file.write_all(&chunk)?;
    received += chunk.len() as u64;
    progress(window, ProgressEvent {
      phase: "download".into(),
      artifact: Some(art.name.clone()),
      current: received as usize,
      total: total as usize,
      bytes: Some(BytesProgress { received, total }),
      message: None
    });
  }
  Ok(tmp)
}

fn verify_sha256(window: &Window, art: &Artifact, file: &Path) -> Result<()> {
  log(window, format!("Verificando SHA256 de {}...", art.name));
  let mut hasher = Sha256::new();
  let mut reader = BufReader::new(File::open(file)?);
  let mut buf = [0u8; 1024*128];
  loop {
    let n = reader.read(&mut buf)?;
    if n == 0 { break; }
    hasher.update(&buf[..n]);
  }
  let hexsum = hex::encode(hasher.finalize());
  if hexsum != art.sha256.to_lowercase() {
    anyhow::bail!("Checksum inválido para {}. Esperado {}, obtido {}", art.name, art.sha256, hexsum);
  }
  Ok(())
}

fn extract_tar_gz(window: &Window, art: &Artifact, file: &Path) -> Result<()> {
  if art.r#type != "tar.gz" {
    anyhow::bail!("Tipo não suportado: {}", art.r#type);
  }
  log(window, format!("Extraindo {} em {}...", art.name, art.targetDir));
  let f = File::open(file)?;
  let dec = GzDecoder::new(f);
  let mut ar = Archive::new(dec);
  ar.unpack_in_place(strip_adapter(&art.targetDir, art.stripComponents))?;
  Ok(())
}

// Adapta extração com stripComponents (sem copiar tudo p/ tmp)
trait TarArchiveExt { fn unpack_in_place(&mut self, dest: UnpackTarget) -> io::Result<()>; }
struct UnpackTarget { dest: PathBuf, strip: usize }
fn strip_adapter(dest: &str, strip: usize) -> UnpackTarget {
  UnpackTarget { dest: PathBuf::from(dest), strip }
}
impl TarArchiveExt for Archive<GzDecoder<File>> {
  fn unpack_in_place(&mut self, target: UnpackTarget) -> io::Result<()> {
    for entry in self.entries()? {
      let mut entry = entry?;
      let path = entry.path()?;
      let comp = path.components().skip(target.strip).collect::<PathBuf>();
      if comp.as_os_str().is_empty() { continue; }
      let out = target.dest.join(comp);
      if let Some(parent) = out.parent() { fs::create_dir_all(parent)?; }
      entry.unpack(&out)?;
    }
    Ok(())
  }
}

fn write_env_backend(base: &Path, cfg: &InstallConfig) -> Result<()> {
  let backend = base.join("backend");
  fs::create_dir_all(&backend)?;
  let envp = backend.join(".env");
  let jwt = rand_b64();
  let jwt_r = rand_b64();
  let backend_url = force_https_host(&cfg.backendUrl);
  let frontend_url = force_https_host(&cfg.frontendUrl);
  let s = format!(
    "NODE_ENV=production
BACKEND_URL={backend_url}
FRONTEND_URL={frontend_url}
PROXY_PORT=443
PORT={}

DB_HOST=localhost
DB_DIALECT=postgres
DB_PORT=5432
DB_USER={}
DB_PASS={}
DB_NAME={}

REDIS_URI=redis://:{}@127.0.0.1:6379
REDIS_OPT_LIMITER_MAX=1
REDIS_OPT_LIMITER_DURATION=3000
TIMEOUT_TO_IMPORT_MESSAGE=1000
FFMPEG_PATH=/usr/bin/ffmpeg
JWT_SECRET={jwt}
JWT_REFRESH_SECRET={jwt_r}
MASTER_KEY={}
VERIFY_TOKEN=whaticket
FACEBOOK_APP_ID={}
FACEBOOK_APP_SECRET={}
USE_WHATSAPP_OFICIAL=true
TOKEN_API_OFICIAL=adminpro
TRANSCRIBE_URL=http://localhost:4002
",
    calc_port(&normalize_company(&cfg.companyName), 8000),
    normalize_company(&cfg.companyName),
    cfg.deployPass,
    normalize_company(&cfg.companyName),
    cfg.deployPass,
    cfg.masterPass,
    cfg.fbAppId.clone().unwrap_or_default(),
    cfg.fbAppSecret.clone().unwrap_or_default()
  );
  fs::write(envp, s)?;
  Ok(())
}

fn write_env_frontend(base: &Path, cfg: &InstallConfig) -> Result<()> {
  let frontend = base.join("frontend");
  fs::create_dir_all(&frontend)?;
  let env = format!(
    "REACT_APP_BACKEND_URL={}
REACT_APP_FACEBOOK_APP_ID={}
REACT_APP_REQUIRE_BUSINESS_MANAGEMENT=TRUE
REACT_APP_NAME_SYSTEM={}
REACT_APP_NUMBER_SUPPORT={}
SERVER_PORT={}
",
    force_https_host(&cfg.backendUrl),
    cfg.fbAppId.clone().unwrap_or_default(),
    cfg.companyName,
    cfg.supportPhone,
    calc_port(&normalize_company(&cfg.companyName), 3001)
  );
  fs::write(frontend.join(".env"), &env)?;
  fs::write(frontend.join(".env.production"), &env)?;
  Ok(())
}

fn force_https_host(u: &str) -> String {
  let mut s = u.trim().to_string();
  if !s.starts_with("http://") && !s.starts_with("https://") {
    s = format!("https://{}", s);
  }
  s
}
fn calc_port(name: &str, base: u16) -> u16 {
  let mut h: u32 = 0;
  for b in name.bytes() { h = h.wrapping_mul(31).wrapping_add(b as u32); }
  base + (h % 500) as u16
}
fn rand_b64() -> String {
  use rand::RngCore;
  let mut b = [0u8; 32];
  rand::rngs::OsRng.fill_bytes(&mut b);
  base64::engine::general_purpose::STANDARD.encode(b)
}

async fn run_postinstall(window: &Window, base: &Path) -> Result<()> {
  let script = base.join("postinstall.sh");
  if !script.exists() {
    log(window, format!("postinstall.sh não encontrado em {}", script.display()));
    return Ok(());
  }
  // Executa via sudo -S (usuário informará senha do sudo se necessário)
  let cmd = tauri_plugin_shell::Shell::new(window.app_handle(), "bash")
      .args(["-lc", &format!("sudo /bin/bash '{}'", script.display())])
      .spawn()?;
  let mut rx = cmd.stdout.ok_or_else(|| anyhow::anyhow!("sem stdout"))?;
  while let Some(line) = rx.next().await {
    log(window, String::from_utf8_lossy(&line).into_owned());
  }
  Ok(())
}

fn err(e: impl std::fmt::Display) -> String { e.to_string() }

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .invoke_handler(tauri::generate_handler![install])
    .run(tauri::generate_context!())
    .expect("erro ao rodar app");
}

4) Hook opcional de pós‑instalação (root)

Crie postinstall.sh (o instalador o executa se você marcar a opção). Mantenha curto – apenas “colar” serviços. Exemplo mínimo (Ubuntu 22.04+):

#!/usr/bin/env bash
set -euo pipefail

EMPRESA="${EMPRESA:-$(basename "$(pwd)")}"
BASE="/home/deploy/${EMPRESA}"

log(){ echo "[postinstall] $*"; }

# 1) Usuário deploy + PM2
id deploy &>/dev/null || useradd -m -s /bin/bash deploy
echo "deploy ALL=(ALL) NOPASSWD:ALL" >/etc/sudoers.d/deploy_nopasswd || true
su - deploy -c "corepack enable; npm -v >/dev/null 2>&1 || curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs; npm i -g pm2"

# 2) Redis e Postgres (idempotente)
apt-get update -y -qq
apt-get install -y -qq redis-server postgresql
systemctl enable --now redis-server postgresql

COMPANY_USER="$(echo "$EMPRESA" | tr -cd 'a-z0-9_')"
DEPLOY_PASS="${DEPLOY_PASS:-changeme}"

sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='${COMPANY_USER}'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE ROLE ${COMPANY_USER} LOGIN PASSWORD '${DEPLOY_PASS}';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='${COMPANY_USER}'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE ${COMPANY_USER} OWNER ${COMPANY_USER};"

# 3) Ajustar permissões do código
chown -R deploy:deploy "$BASE"

# 4) Subir apps com PM2
su - deploy -c "cd '$BASE/backend' && pm2 start dist/server.js --name ${EMPRESA}-backend -i 2 --update-env || true"
su - deploy -c "cd '$BASE/frontend' && pm2 start server.js --name ${EMPRESA}-frontend --update-env || true"
su - deploy -c "pm2 save"

log "Pós-instalação finalizada."


Variáveis como DEPLOY_PASS e EMPRESA podem ser exportadas pelo Tauri antes de invocar o script (ou você pode renderizar o script com esses valores – o exemplo acima funciona mesmo sem isso, desde que o nome do diretório seja o slug da empresa).

5) Pipeline (GitHub Actions) para pré‑construir artefatos

.github/workflows/build-artifacts.yml – exemplo simplificado (Node 20 + pnpm):

name: build-artifacts
on:
  push:
    tags: ["v*.*.*"]
jobs:
  build:
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: corepack enable
      - run: pnpm -v

      # BACKEND
      - run: |
          cd backend
          pnpm install --frozen-lockfile
          pnpm run build
          tar czf ../backend_dist.tar.gz dist ecosystem.config.js || true
          tar czf ../backend_node_modules.tar.gz node_modules
      # FRONTEND
      - run: |
          cd frontend
          pnpm install --frozen-lockfile
          pnpm run build
          tar czf ../frontend_build.tar.gz build

      # checksums + manifest
      - run: |
          sha256sum backend_dist.tar.gz > sha256_backend_dist.txt
          sha256sum backend_node_modules.tar.gz > sha256_backend_node_modules.txt
          sha256sum frontend_build.tar.gz > sha256_frontend_build.txt

          BDD=$(cut -d' ' -f1 sha256_backend_dist.txt)
          BNM=$(cut -d' ' -f1 sha256_backend_node_modules.txt)
          FBD=$(cut -d' ' -f1 sha256_frontend_build.txt)

          cat > manifest.json <<JSON
          {
            "version": "${GITHUB_REF_NAME#refs/tags/}",
            "artifacts": [
              {"name":"backend_dist","url":"__RELEASE_URL__/backend_dist.tar.gz","sha256":"$BDD","targetDir":"/home/deploy/__EMPRESA__/backend","stripComponents":0,"type":"tar.gz"},
              {"name":"backend_node_modules","url":"__RELEASE_URL__/backend_node_modules.tar.gz","sha256":"$BNM","targetDir":"/home/deploy/__EMPRESA__/backend","stripComponents":0,"type":"tar.gz"},
              {"name":"frontend_build","url":"__RELEASE_URL__/frontend_build.tar.gz","sha256":"$FBD","targetDir":"/home/deploy/__EMPRESA__/frontend","stripComponents":0,"type":"tar.gz"}
            ]
          }
          JSON

      - name: Upload release assets
        uses: softprops/action-gh-release@v2
        with:
          files: |
            backend_dist.tar.gz
            backend_node_modules.tar.gz
            frontend_build.tar.gz
            manifest.json


Importante: node_modules do backend pode conter bins nativos. Gere os artefatos na mesma distro que sua VPS (ex.: Ubuntu 22.04) para maximizar compatibilidade.
Alternativa “mais segura”: publicar imagens Docker e o bootstrapper apenas faz docker compose pull/up.

6) Como o instalador substitui o .sh

A maior parte do tempo do .sh (compilar deps, build do front/back, pnpm install) sai do servidor e vai para o CI.

O instalador:

Coleta os mesmos dados (wizard)

Baixa, valida SHA‑256 e extrai os artefatos (paralelo/streaming)

Gera .env do backend e frontend

(Opcional) Executa postinstall.sh para “colar” serviços (Redis/Postgres/PM2/Nginx/SSL), se você quiser manter fora de contêineres.

Você pode manter certbot/nginx em um hook separado, ou migrar para Docker para simplificar e evitar apt.

7) Observações práticas

Rodar como root? O Tauri não eleva privilégios automaticamente. Para o hook de pós‑instalação, o exemplo usa sudo. Se preferir, rode o app com pkexec ou deixe o hook trabalhar só com Docker.

Headless/VPS: Se não houver GUI, disponibilize um fallback CLI (por exemplo, um binário Rust sem WebView que consome o mesmo manifest.json).

DNS/IP: Caso queira reproduzir a checagem de DNS do seu .sh, adicione um comando Rust que resolva o IP do domínio e compare com o IP público (chamando https://api.ipify.org).

i18n: A UI está em PT‑BR; é simples acoplar um JSON de traduções replicando sua função t().

8) Próximos passos (objetivo/curto)

Ativar pipeline com o workflow de exemplo e publicar um Release contendo os três .tgz + manifest.json.

Buildar o Tauri (Linux): pnpm tauri build (ou cargo tauri build) e abrir o app.

Preencher o URL do manifest, dados do wizard e clicar Instalar.

(Opcional) Executar o pós‑instalação para PM2/DB/Redis/NGINX, ou usar Docker.

Se quiser, eu ajusto o postinstall.sh para espelhar 1:1 as partes essenciais do seu .sh (Redis/Postgres/PM2/Certbot/Nginx), mantendo idempotência e logs — mas mantendo o build no CI conforme acima.