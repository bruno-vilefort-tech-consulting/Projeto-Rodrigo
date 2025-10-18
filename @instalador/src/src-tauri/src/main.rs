#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use anyhow::Result;
use base64::prelude::*;
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
use tauri::{Emitter, Manager, Window};
use tauri_plugin_shell::ShellExt;

// URL fixa do manifest no repositório
const MANIFEST_URL: &str = "https://github.com/bruno-vilefort-tech-consulting/Projeto-Rodrigo/releases/download/v5.0.0/manifest.json";

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct InstallConfig {
  backend_url: String,
  frontend_url: String,
  email: String,
  company_name: String,
  deploy_pass: String,
  master_pass: String,
  support_phone: String,
  fb_app_id: Option<String>,
  fb_app_secret: Option<String>,
  sql_backup_path: Option<String>,
  run_post_install: bool,
  #[serde(default)]
  skip_dns_validation: bool,
  #[serde(default)]
  skip_ssl_setup: bool,
  #[serde(default)]
  run_migrations: bool,
  #[serde(default)]
  run_seeds: bool,
  #[serde(default)]
  setup_crons: bool,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct Artifact {
  name: String,
  url: String,
  sha256: String,
  target_dir: String,
  #[serde(default)]
  strip_components: usize,
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

struct PostVars {
  empresa: String,
  deploy_pass: String,
  admin_email: String,
  admin_pass: String,
  backend_host: String,
  frontend_host: String,
  backend_port: u16,
  frontend_port: u16,
}

fn emit(window: &Window, ev: &str, payload: impl Serialize + Clone) {
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
  if !is_email(&cfg.email) || !is_phone(&cfg.support_phone) {
    return Err("Dados inválidos (email/telefone)".into());
  }
  let company_slug = normalize_company(&cfg.company_name);
  let client = Client::builder().build().map_err(err)?;

  // FASE 0: Validação DNS (se não pulada)
  if !cfg.skip_dns_validation {
    progress(&window, ProgressEvent { phase: "dns-validation".into(), artifact: None, current: 0, total: 2, bytes: None, message: Some("Validando DNS...".into()) });

    if let Err(e) = validate_dns(&window, &client, &cfg.backend_url).await {
      log(&window, format!("⚠️  Validação DNS backend falhou: {}", e));
      log(&window, "Continuando instalação (SSL pode falhar)...".into());
    }

    if let Err(e) = validate_dns(&window, &client, &cfg.frontend_url).await {
      log(&window, format!("⚠️  Validação DNS frontend falhou: {}", e));
      log(&window, "Continuando instalação (SSL pode falhar)...".into());
    }

    progress(&window, ProgressEvent { phase: "dns-validation".into(), artifact: None, current: 2, total: 2, bytes: None, message: Some("DNS validado".into()) });
  }

  log(&window, format!("Baixando manifest: {}", MANIFEST_URL));
  let manifest: Manifest = client
    .get(MANIFEST_URL)
    .send().await.map_err(err)?
    .error_for_status().map_err(err)?
    .json().await.map_err(err)?;
  log(&window, format!("Manifest v{} com {} artefatos.", manifest.version, manifest.artifacts.len()));

  // Substituir __EMPRESA__ no targetDir
  let arts: Vec<Artifact> = manifest.artifacts.iter().map(|a| {
    let mut b = a.clone();
    b.target_dir = b.target_dir.replace("__EMPRESA__", &company_slug);
    b
  }).collect();

  // Criar diretórios alvo
  for a in &arts {
    fs::create_dir_all(&a.target_dir).map_err(err)?;
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
  if let Some(p) = &cfg.sql_backup_path {
    if !p.trim().is_empty() {
      let dest = base.join("db_backup.sql");
      match fs::copy(p, &dest) {
        Ok(_) => log(&window, format!("Backup SQL copiado para {}", dest.display())),
        Err(e) => log(&window, format!("WARN: não foi possível copiar backup SQL: {e}")),
      }
    }
  }

  // Pós-instalação (opcional): chama /bin/bash postinstall.sh
  if cfg.run_post_install {
    log(&window, "Executando postinstall.sh (requer sudo)...");
    progress(&window, ProgressEvent { phase: "postinstall".into(), artifact: None, current: 0, total: 1, bytes: None, message: None });

    // Calcular variáveis para postinstall
    let backend_host = host_only(&cfg.backend_url);
    let frontend_host = host_only(&cfg.frontend_url);
    let backend_port = calc_port(&company_slug, 8000);
    let frontend_port = calc_port(&company_slug, 3001);

    if let Err(e) = run_postinstall(&window, &base, PostVars {
      empresa: company_slug.clone(),
      deploy_pass: cfg.deploy_pass.clone(),
      admin_email: cfg.email.clone(),
      admin_pass: cfg.master_pass.clone(),
      backend_host,
      frontend_host,
      backend_port,
      frontend_port,
    }).await {
      let _ = window.emit("install://error", format!("postinstall falhou: {e:#}"));
      return Err(e.to_string());
    }
    progress(&window, ProgressEvent { phase: "postinstall".into(), artifact: None, current: 1, total: 1, bytes: None, message: Some("OK".into()) });
  }

  // FASE: Migrations (se habilitado)
  if cfg.run_migrations {
    progress(&window, ProgressEvent { phase: "migrations".into(), artifact: None, current: 0, total: 1, bytes: None, message: Some("Executando migrations...".into()) });

    if let Err(e) = run_migrations(&window, &base).await {
      log(&window, format!("⚠️  Migrations falharam: {}", e));
    } else {
      progress(&window, ProgressEvent { phase: "migrations".into(), artifact: None, current: 1, total: 1, bytes: None, message: Some("Migrations OK".into()) });
    }
  }

  // FASE: Seeds (se habilitado)
  if cfg.run_seeds {
    progress(&window, ProgressEvent { phase: "seeds".into(), artifact: None, current: 0, total: 1, bytes: None, message: Some("Executando seeds...".into()) });

    if let Err(e) = run_seeds(&window, &base).await {
      log(&window, format!("⚠️  Seeds falharam: {}", e));
    } else {
      progress(&window, ProgressEvent { phase: "seeds".into(), artifact: None, current: 1, total: 1, bytes: None, message: Some("Seeds OK".into()) });
    }
  }

  // FASE: SSL/Certbot (se não pulado)
  if !cfg.skip_ssl_setup {
    progress(&window, ProgressEvent { phase: "ssl".into(), artifact: None, current: 0, total: 2, bytes: None, message: Some("Configurando SSL...".into()) });

    let backend_domain = host_only(&cfg.backend_url);
    let frontend_domain = host_only(&cfg.frontend_url);

    if let Err(e) = setup_ssl(&window, &backend_domain, &cfg.email).await {
      log(&window, format!("⚠️  SSL backend falhou: {}", e));
    }

    if let Err(e) = setup_ssl(&window, &frontend_domain, &cfg.email).await {
      log(&window, format!("⚠️  SSL frontend falhou: {}", e));
    }

    progress(&window, ProgressEvent { phase: "ssl".into(), artifact: None, current: 2, total: 2, bytes: None, message: Some("SSL configurado".into()) });
  }

  // FASE: Cron Jobs (se habilitado)
  if cfg.setup_crons {
    progress(&window, ProgressEvent { phase: "crons".into(), artifact: None, current: 0, total: 3, bytes: None, message: Some("Configurando cron jobs...".into()) });

    if let Err(e) = setup_crons(&window, &company_slug).await {
      log(&window, format!("⚠️  Crons falharam: {}", e));
    } else {
      progress(&window, ProgressEvent { phase: "crons".into(), artifact: None, current: 3, total: 3, bytes: None, message: Some("Crons configurados".into()) });
    }
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
  log(window, format!("Extraindo {} em {}...", art.name, art.target_dir));
  let f = File::open(file)?;
  let dec = GzDecoder::new(f);
  let mut ar = Archive::new(dec);
  ar.unpack_in_place(strip_adapter(&art.target_dir, art.strip_components))?;
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
    use std::io::Write;

    for entry in self.entries()? {
      let mut entry = entry?;
      let path = entry.path()?;
      let comp = path.components().skip(target.strip).collect::<PathBuf>();
      if comp.as_os_str().is_empty() { continue; }
      let out = target.dest.join(&comp);
      if let Some(parent) = out.parent() { fs::create_dir_all(parent)?; }

      // Se for hard link, copiar o conteúdo como arquivo regular
      if entry.header().entry_type().is_hard_link() {
        // Obter o caminho do link
        if let Some(link_name) = entry.link_name()? {
          let link_comp = link_name.components().skip(target.strip).collect::<PathBuf>();
          let source = target.dest.join(&link_comp);

          // Se o arquivo fonte já existe, copiar o conteúdo
          if source.exists() {
            fs::copy(&source, &out)?;
          } else {
            // Se não existe, extrair o conteúdo do entry como arquivo regular
            let mut file = fs::File::create(&out)?;
            std::io::copy(&mut entry, &mut file)?;
          }
        }
      } else {
        entry.unpack(&out)?;
      }
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
  let backend_url = force_https_host(&cfg.backend_url);
  let frontend_url = force_https_host(&cfg.frontend_url);
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
    calc_port(&normalize_company(&cfg.company_name), 8000),
    normalize_company(&cfg.company_name),
    cfg.deploy_pass,
    normalize_company(&cfg.company_name),
    cfg.deploy_pass,
    cfg.master_pass,
    cfg.fb_app_id.clone().unwrap_or_default(),
    cfg.fb_app_secret.clone().unwrap_or_default()
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
    force_https_host(&cfg.backend_url),
    cfg.fb_app_id.clone().unwrap_or_default(),
    cfg.company_name,
    cfg.support_phone,
    calc_port(&normalize_company(&cfg.company_name), 3001)
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

fn host_only(u: &str) -> String {
  u.trim()
   .trim_start_matches("http://")
   .trim_start_matches("https://")
   .split('/')
   .next()
   .unwrap_or(u)
   .to_string()
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
  BASE64_STANDARD.encode(b)
}

async fn run_postinstall(window: &Window, base: &Path, v: PostVars) -> Result<()> {
  let script = base.join("postinstall.sh");
  if !script.exists() {
    log(window, format!("postinstall.sh não encontrado em {}", script.display()));
    return Ok(());
  }

  let shell = window.app_handle().shell();
  let cmd = shell.command("sudo")
    .args(["-S", "/bin/bash", script.to_string_lossy().as_ref()])
    .env("EMPRESA", &v.empresa)
    .env("DEPLOY_PASS", &v.deploy_pass)
    .env("ADMIN_EMAIL", &v.admin_email)
    .env("ADMIN_PASSWORD", &v.admin_pass)
    .env("BACKEND_HOST", &v.backend_host)
    .env("FRONTEND_HOST", &v.frontend_host)
    .env("BACKEND_PORT", &v.backend_port.to_string())
    .env("FRONTEND_PORT", &v.frontend_port.to_string());

  let (mut rx, _child) = cmd.spawn()?;
  while let Some(ev) = rx.recv().await {
    use tauri_plugin_shell::process::CommandEvent::*;
    match ev {
      Stdout(line) | Stderr(line) =>
        log(window, String::from_utf8_lossy(&line).into_owned()),
      Error(e) => log(window, format!("ERR: {e}")),
      Terminated(_) => break,
      _ => {}
    }
  }
  Ok(())
}

// ============================================================================
// NOVAS FUNCIONALIDADES v5.1.0
// ============================================================================

/// Valida DNS de um domínio
async fn validate_dns(window: &Window, client: &Client, url: &str) -> Result<()> {
  let domain = host_only(url);
  log(window, format!("🌐 Validando DNS para: {}", domain));

  // Obter IP público da VPS
  let vps_ip = get_public_ip(client).await?;
  log(window, format!("  IP da VPS: {}", vps_ip));

  // Resolver domínio
  let resolved_ip = resolve_domain(&domain).await?;
  log(window, format!("  DNS resolve para: {}", resolved_ip));

  if resolved_ip != vps_ip {
    anyhow::bail!(
      "DNS inválido: {} aponta para {} mas deveria apontar para {}",
      domain, resolved_ip, vps_ip
    );
  }

  log(window, format!("✅ DNS correto para {}", domain));
  Ok(())
}

/// Obtém IP público da VPS
async fn get_public_ip(client: &Client) -> Result<String> {
  let services = vec![
    "https://api.ipify.org",
    "https://ifconfig.me/ip",
    "https://icanhazip.com",
  ];

  for service in services {
    if let Ok(resp) = client.get(service).send().await {
      if let Ok(ip) = resp.text().await {
        let ip = ip.trim().to_string();
        if ip.split('.').count() == 4 {
          return Ok(ip);
        }
      }
    }
  }

  anyhow::bail!("Não foi possível detectar IP público")
}

/// Resolve domínio para IP (via dig ou nslookup)
async fn resolve_domain(domain: &str) -> Result<String> {
  use std::process::Command;

  // Tentar com dig primeiro
  if let Ok(output) = Command::new("dig")
    .args(["+short", domain])
    .output()
  {
    let stdout = String::from_utf8_lossy(&output.stdout);
    if let Some(line) = stdout.lines().next() {
      let ip = line.trim();
      if !ip.is_empty() && ip.split('.').count() == 4 {
        return Ok(ip.to_string());
      }
    }
  }

  // Fallback para nslookup
  if let Ok(output) = Command::new("nslookup")
    .arg(domain)
    .output()
  {
    let stdout = String::from_utf8_lossy(&output.stdout);
    for line in stdout.lines() {
      if line.contains("Address:") && !line.contains("#") {
        if let Some(ip) = line.split_whitespace().last() {
          if ip.split('.').count() == 4 {
            return Ok(ip.to_string());
          }
        }
      }
    }
  }

  anyhow::bail!("Não foi possível resolver domínio: {}", domain)
}

/// Executa migrations do Sequelize
async fn run_migrations(window: &Window, base: &Path) -> Result<()> {
  log(window, "🔄 Executando migrations...");

  let backend = base.join("backend");
  let shell = window.app_handle().shell();

  let cmd = shell.command("npx")
    .args(["sequelize-cli", "db:migrate"])
    .current_dir(&backend);

  let (mut rx, _child) = cmd.spawn()?;

  while let Some(ev) = rx.recv().await {
    use tauri_plugin_shell::process::CommandEvent::*;
    match ev {
      Stdout(line) | Stderr(line) =>
        log(window, String::from_utf8_lossy(&line).into_owned()),
      Terminated(status) => {
        if !status.success() {
          anyhow::bail!("Migrations falharam");
        }
        break;
      }
      _ => {}
    }
  }

  log(window, "✅ Migrations executadas");
  Ok(())
}

/// Executa seeds do Sequelize
async fn run_seeds(window: &Window, base: &Path) -> Result<()> {
  log(window, "🌱 Executando seeds...");

  let backend = base.join("backend");
  let shell = window.app_handle().shell();

  let cmd = shell.command("npx")
    .args(["sequelize-cli", "db:seed:all"])
    .current_dir(&backend);

  let (mut rx, _child) = cmd.spawn()?;

  while let Some(ev) = rx.recv().await {
    use tauri_plugin_shell::process::CommandEvent::*;
    match ev {
      Stdout(line) | Stderr(line) =>
        log(window, String::from_utf8_lossy(&line).into_owned()),
      Terminated(status) => {
        if !status.success() {
          anyhow::bail!("Seeds falharam");
        }
        break;
      }
      _ => {}
    }
  }

  log(window, "✅ Seeds executados");
  Ok(())
}

/// Configura SSL/Certbot para um domínio
async fn setup_ssl(window: &Window, domain: &str, email: &str) -> Result<()> {
  log(window, format!("🔒 Configurando SSL para: {}", domain));

  let shell = window.app_handle().shell();

  // Verificar se certbot está instalado
  if let Err(_) = std::process::Command::new("which").arg("certbot").output() {
    log(window, "📦 Instalando Certbot...");

    // Instalar certbot via snap
    let install_cmds = vec![
      vec!["apt-get", "update", "-qq"],
      vec!["apt-get", "install", "-y", "-qq", "snapd"],
      vec!["systemctl", "enable", "snapd"],
      vec!["systemctl", "start", "snapd"],
      vec!["snap", "install", "core"],
      vec!["snap", "refresh", "core"],
      vec!["snap", "install", "--classic", "certbot"],
      vec!["ln", "-sf", "/snap/bin/certbot", "/usr/bin/certbot"],
    ];

    for args in install_cmds {
      std::process::Command::new("sudo")
        .args(&args)
        .output()?;
    }

    log(window, "✅ Certbot instalado");
  }

  // Gerar certificado
  let cmd = shell.command("sudo")
    .args([
      "certbot", "--nginx",
      "-d", domain,
      "--non-interactive",
      "--agree-tos",
      "--email", email,
      "--redirect"
    ]);

  let (mut rx, _child) = cmd.spawn()?;

  while let Some(ev) = rx.recv().await {
    use tauri_plugin_shell::process::CommandEvent::*;
    match ev {
      Stdout(line) | Stderr(line) =>
        log(window, String::from_utf8_lossy(&line).into_owned()),
      Terminated(status) => {
        if !status.success() {
          anyhow::bail!("Certbot falhou");
        }
        break;
      }
      _ => {}
    }
  }

  log(window, format!("✅ SSL configurado para {}", domain));
  Ok(())
}

/// Configura cron jobs (backup, limpeza)
async fn setup_crons(window: &Window, company: &str) -> Result<()> {
  log(window, "⏰ Configurando cron jobs...");

  // Script de backup do banco
  let backup_script = format!(
r#"#!/bin/bash
BACKUP_DIR="/home/deploy/backups/{company}"
DB_NAME="{company}_chatia"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_${{TIMESTAMP}}.sql.gz"

mkdir -p "$BACKUP_DIR"
PGPASSWORD="123456" pg_dump -h localhost -U atuar_pay -d $DB_NAME | gzip > "$BACKUP_FILE"
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +7 -delete
"#,
    company = company
  );

  let script_path = format!("/home/deploy/{}/scripts/db-backup.sh", company);
  fs::create_dir_all(format!("/home/deploy/{}/scripts", company))?;
  fs::write(&script_path, backup_script)?;
  std::process::Command::new("chmod")
    .args(["+x", &script_path])
    .output()?;

  // Criar cron
  let cron_content = format!(
r#"# Backup diário do banco de dados - {}
0 2 * * * deploy {}
"#,
    company, script_path
  );

  let cron_file = format!("/etc/cron.d/{}-backup", company);
  fs::write(&cron_file, cron_content)?;

  log(window, "✅ Cron de backup configurado (diário às 2h)");

  // Script de limpeza de logs
  let cleanup_script = format!(
r#"#!/bin/bash
LOG_DIR="/home/deploy/{company}/backend/logs"
find "$LOG_DIR" -name "*.log" -mtime +30 -delete 2>/dev/null
find "$LOG_DIR" -name "*.log" -mtime +7 -exec gzip {{}} \; 2>/dev/null
"#,
    company = company
  );

  let cleanup_path = format!("/home/deploy/{}/scripts/log-cleanup.sh", company);
  fs::write(&cleanup_path, cleanup_script)?;
  std::process::Command::new("chmod")
    .args(["+x", &cleanup_path])
    .output()?;

  let cleanup_cron = format!(
r#"# Limpeza de logs - {}
0 3 * * 1 deploy {}
"#,
    company, cleanup_path
  );

  let cleanup_file = format!("/etc/cron.d/{}-cleanup", company);
  fs::write(&cleanup_file, cleanup_cron)?;

  log(window, "✅ Cron de limpeza configurado (semanalmente)");

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
