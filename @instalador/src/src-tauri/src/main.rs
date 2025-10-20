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
      log(&window, "Continuando instalação (SSL pode falhar)...");
    }

    if let Err(e) = validate_dns(&window, &client, &cfg.frontend_url).await {
      log(&window, format!("⚠️  Validação DNS frontend falhou: {}", e));
      log(&window, "Continuando instalação (SSL pode falhar)...");
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
  let base = PathBuf::from(format!("/home/deploy/{}", company_slug));
  write_env_backend(&base, &cfg).map_err(err)?;
  write_env_frontend(&base, &cfg).map_err(err)?;

  // Renomear .sequelizerc.deploy para .sequelizerc
  let sequelizerc_deploy = base.join("backend/.sequelizerc.deploy");
  let sequelizerc = base.join("backend/.sequelizerc");
  if sequelizerc_deploy.exists() {
    fs::rename(&sequelizerc_deploy, &sequelizerc).map_err(err)?;
    log(&window, "✅ .sequelizerc configurado para migrations");
  }

  progress(&window, ProgressEvent { phase: "write-env".into(), artifact: None, current: total, total, bytes: None, message: None });

  // Frontend já vem com node_modules incluído no artifact (express, dotenv)
  log(&window, "✅ Frontend node_modules já incluído no artifact");

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

  // FASE: Instalação de dependências do sistema e configuração (se habilitado)
  if cfg.run_post_install {
    progress(&window, ProgressEvent { phase: "system-deps".into(), artifact: None, current: 0, total: 5, bytes: None, message: Some("Instalando dependências do sistema...".into()) });

    if let Err(e) = install_system_dependencies(&window).await {
      log(&window, format!("⚠️  Instalação de dependências falhou: {}", e));
      log(&window, "Continuando instalação (algumas funcionalidades podem não funcionar)...");
    } else {
      progress(&window, ProgressEvent { phase: "system-deps".into(), artifact: None, current: 1, total: 5, bytes: None, message: Some("Dependências instaladas".into()) });
    }

    // Configurar banco de dados
    progress(&window, ProgressEvent { phase: "database".into(), artifact: None, current: 1, total: 5, bytes: None, message: Some("Configurando banco de dados...".into()) });

    if let Err(e) = setup_database(&window, &company_slug, &cfg.deploy_pass).await {
      log(&window, format!("⚠️  Configuração de banco falhou: {}", e));
    } else {
      progress(&window, ProgressEvent { phase: "database".into(), artifact: None, current: 2, total: 5, bytes: None, message: Some("Banco configurado".into()) });
    }

    // Configurar Nginx
    progress(&window, ProgressEvent { phase: "nginx".into(), artifact: None, current: 2, total: 5, bytes: None, message: Some("Configurando Nginx...".into()) });

    let backend_host = host_only(&cfg.backend_url);
    let frontend_host = host_only(&cfg.frontend_url);
    let backend_port = calc_port(&company_slug, 8000);
    let frontend_port = calc_port(&company_slug, 3001);

    if let Err(e) = setup_nginx(&window, &company_slug, &backend_host, &frontend_host, backend_port, frontend_port).await {
      log(&window, format!("⚠️  Configuração Nginx falhou: {}", e));
    } else {
      progress(&window, ProgressEvent { phase: "nginx".into(), artifact: None, current: 3, total: 5, bytes: None, message: Some("Nginx configurado".into()) });
    }
  }

  // FASE: Instalar dependências do backend (necessário para migrations/seeds e PM2)
  if cfg.run_post_install || cfg.run_migrations || cfg.run_seeds {
    progress(&window, ProgressEvent { phase: "backend-deps".into(), artifact: None, current: 0, total: 1, bytes: None, message: Some("Instalando dependências do backend...".into()) });

    if let Err(e) = install_backend_dependencies(&window, &base).await {
      log(&window, format!("⚠️  Instalação de dependências do backend falhou: {}", e));
    } else {
      progress(&window, ProgressEvent { phase: "backend-deps".into(), artifact: None, current: 1, total: 1, bytes: None, message: Some("Dependências do backend instaladas".into()) });
    }
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

  // FASE: Iniciar apps com PM2 (após instalar dependências e executar migrations)
  if cfg.run_post_install {
    progress(&window, ProgressEvent { phase: "pm2".into(), artifact: None, current: 0, total: 1, bytes: None, message: Some("Iniciando aplicações com PM2...".into()) });

    if let Err(e) = start_apps_pm2(&window, &company_slug, &base).await {
      log(&window, format!("⚠️  Inicialização PM2 falhou: {}", e));
    } else {
      progress(&window, ProgressEvent { phase: "pm2".into(), artifact: None, current: 1, total: 1, bytes: None, message: Some("Apps PM2 iniciados".into()) });
    }

    // Ajustar permissões dos arquivos
    if let Err(e) = fix_permissions(&window, &base).await {
      log(&window, format!("⚠️  Ajuste de permissões falhou: {}", e));
      log(&window, "Sistema funcionará, mas com permissões não ideais");
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

  // FASE: Validação pós-instalação (se run_post_install habilitado)
  if cfg.run_post_install {
    progress(&window, ProgressEvent {
      phase: "validation".into(),
      artifact: None,
      current: 0,
      total: 1,
      bytes: None,
      message: Some("Validando instalação...".into())
    });

    if let Err(e) = post_install_validation(&window, &base, &company_slug).await {
      log(&window, format!("⚠️  Validação detectou problemas: {}", e));
      // NÃO retornar erro aqui, apenas avisar
    }

    progress(&window, ProgressEvent {
      phase: "validation".into(),
      artifact: None,
      current: 1,
      total: 1,
      bytes: None,
      message: Some("Validação concluída".into())
    });
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

/// Instala dependências do backend (npm install)
async fn install_backend_dependencies(window: &Window, base: &Path) -> Result<()> {
  let backend = base.join("backend");
  let node_modules = backend.join("node_modules");

  // Verificar se node_modules já existe e está válido
  if node_modules.exists() {
    log(window, "📦 node_modules do backend já existe, verificando integridade...");

    // Testar se pacotes críticos existem
    let critical_packages = vec!["dotenv", "express", "sequelize"];
    let mut all_exist = true;

    for pkg in &critical_packages {
      let pkg_path = node_modules.join(pkg);
      if !pkg_path.exists() {
        log(window, &format!("⚠️  Pacote crítico '{}' não encontrado", pkg));
        all_exist = false;
        break;
      }
    }

    if all_exist {
      log(window, "✅ node_modules do backend está OK, pulando instalação");
      log(window, "   (Economizando ~5-10 minutos de reinstalação)");
      return Ok(());
    } else {
      log(window, "⚠️  node_modules corrompido ou incompleto, reinstalando...");
    }
  }

  log(window, "📦 Instalando dependências do backend...");
  let shell = window.app_handle().shell();

  let cmd = shell.command("npm")
    .args(["install", "--omit=dev", "--legacy-peer-deps"])
    .current_dir(&backend);

  let (mut rx, _child) = cmd.spawn()?;

  while let Some(ev) = rx.recv().await {
    use tauri_plugin_shell::process::CommandEvent::*;
    match ev {
      Stdout(line) | Stderr(line) =>
        log(window, String::from_utf8_lossy(&line).into_owned()),
      Terminated(status) => {
        if status.code.unwrap_or(1) != 0 {
          anyhow::bail!("Instalação de dependências do backend falhou");
        }
        break;
      }
      _ => {}
    }
  }

  log(window, "✅ Dependências do backend instaladas");
  Ok(())
}

/// Instala dependências do frontend (npm install)
async fn install_frontend_dependencies(window: &Window, base: &Path) -> Result<()> {
  log(window, "📦 Instalando dependências do frontend...");

  let frontend = base.join("frontend");
  let shell = window.app_handle().shell();

  let cmd = shell.command("npm")
    .args(["install", "--omit=dev", "--legacy-peer-deps"])
    .current_dir(&frontend);

  let (mut rx, _child) = cmd.spawn()?;

  while let Some(ev) = rx.recv().await {
    use tauri_plugin_shell::process::CommandEvent::*;
    match ev {
      Stdout(line) | Stderr(line) =>
        log(window, String::from_utf8_lossy(&line).into_owned()),
      Terminated(status) => {
        if status.code.unwrap_or(1) != 0 {
          anyhow::bail!("Instalação de dependências do frontend falhou");
        }
        break;
      }
      _ => {}
    }
  }

  log(window, "✅ Dependências do frontend instaladas");
  Ok(())
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
        if status.code.unwrap_or(1) != 0 {
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
        if status.code.unwrap_or(1) != 0 {
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
        if status.code.unwrap_or(1) != 0 {
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

/// Instala dependências do sistema (Node.js 20, PostgreSQL, Redis, Nginx, PM2)
async fn install_system_dependencies(window: &Window) -> Result<()> {
  log(window, "📦 Instalando dependências do sistema...");

  let shell = window.app_handle().shell();

  // 1. Atualizar apt
  log(window, "🔄 Atualizando apt...");
  let cmd = shell.command("sudo")
    .args(["apt-get", "update", "-y", "-qq"]);
  let (mut rx, _) = cmd.spawn()?;
  while let Some(ev) = rx.recv().await {
    use tauri_plugin_shell::process::CommandEvent::*;
    match ev {
      Terminated(status) => {
        if status.code.unwrap_or(1) != 0 {
          anyhow::bail!("apt-get update falhou");
        }
        break;
      }
      _ => {}
    }
  }

  // 2. Instalar curl, gnupg (pré-requisitos)
  log(window, "📥 Instalando pré-requisitos (curl, gnupg)...");
  let cmd = shell.command("sudo")
    .args(["apt-get", "install", "-y", "-qq", "curl", "gnupg", "ca-certificates"]);
  let (mut rx, _) = cmd.spawn()?;
  while let Some(ev) = rx.recv().await {
    use tauri_plugin_shell::process::CommandEvent::*;
    match ev {
      Terminated(status) => {
        if status.code.unwrap_or(1) != 0 {
          anyhow::bail!("Instalação de pré-requisitos falhou");
        }
        break;
      }
      _ => {}
    }
  }

  // 3. Adicionar repositório do Node.js 20
  log(window, "🟢 Adicionando repositório Node.js 20...");
  let cmd = shell.command("bash")
    .args(["-c", "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"]);
  let (mut rx, _) = cmd.spawn()?;
  while let Some(ev) = rx.recv().await {
    use tauri_plugin_shell::process::CommandEvent::*;
    match ev {
      Terminated(status) => {
        if status.code.unwrap_or(1) != 0 {
          anyhow::bail!("Falha ao adicionar repositório Node.js");
        }
        break;
      }
      _ => {}
    }
  }

  // 4. Instalar Node.js 20
  log(window, "🟢 Instalando Node.js 20...");
  let cmd = shell.command("sudo")
    .args(["apt-get", "install", "-y", "-qq", "nodejs"]);
  let (mut rx, _) = cmd.spawn()?;
  while let Some(ev) = rx.recv().await {
    use tauri_plugin_shell::process::CommandEvent::*;
    match ev {
      Terminated(status) => {
        if status.code.unwrap_or(1) != 0 {
          anyhow::bail!("Instalação Node.js falhou");
        }
        break;
      }
      _ => {}
    }
  }

  // 5. Habilitar corepack para pnpm
  log(window, "🔧 Habilitando corepack (pnpm)...");
  let cmd = shell.command("sudo")
    .args(["corepack", "enable"]);
  let (mut rx, _) = cmd.spawn()?;
  while let Some(_) = rx.recv().await {} // Aguardar conclusão

  // 6. Instalar PM2 globalmente
  log(window, "⚙️ Instalando PM2 globalmente...");
  let cmd = shell.command("sudo")
    .args(["npm", "install", "-g", "pm2"]);
  let (mut rx, _) = cmd.spawn()?;
  while let Some(ev) = rx.recv().await {
    use tauri_plugin_shell::process::CommandEvent::*;
    match ev {
      Terminated(status) => {
        if status.code.unwrap_or(1) != 0 {
          anyhow::bail!("Instalação PM2 falhou");
        }
        break;
      }
      _ => {}
    }
  }

  // 7. Instalar PostgreSQL
  log(window, "🐘 Instalando PostgreSQL...");
  let cmd = shell.command("sudo")
    .args(["apt-get", "install", "-y", "-qq", "postgresql", "postgresql-contrib"]);
  let (mut rx, _) = cmd.spawn()?;
  while let Some(ev) = rx.recv().await {
    use tauri_plugin_shell::process::CommandEvent::*;
    match ev {
      Terminated(status) => {
        if status.code.unwrap_or(1) != 0 {
          anyhow::bail!("Instalação PostgreSQL falhou");
        }
        break;
      }
      _ => {}
    }
  }

  // 8. Instalar Redis
  log(window, "🔴 Instalando Redis...");
  let cmd = shell.command("sudo")
    .args(["apt-get", "install", "-y", "-qq", "redis-server"]);
  let (mut rx, _) = cmd.spawn()?;
  while let Some(ev) = rx.recv().await {
    use tauri_plugin_shell::process::CommandEvent::*;
    match ev {
      Terminated(status) => {
        if status.code.unwrap_or(1) != 0 {
          anyhow::bail!("Instalação Redis falhou");
        }
        break;
      }
      _ => {}
    }
  }

  // 9. Instalar Nginx
  log(window, "🌐 Instalando Nginx...");
  let cmd = shell.command("sudo")
    .args(["apt-get", "install", "-y", "-qq", "nginx"]);
  let (mut rx, _) = cmd.spawn()?;
  while let Some(ev) = rx.recv().await {
    use tauri_plugin_shell::process::CommandEvent::*;
    match ev {
      Terminated(status) => {
        if status.code.unwrap_or(1) != 0 {
          anyhow::bail!("Instalação Nginx falhou");
        }
        break;
      }
      _ => {}
    }
  }

  // 10. Instalar snapd (para Certbot)
  log(window, "📦 Instalando snapd (para Certbot)...");
  let cmd = shell.command("sudo")
    .args(["apt-get", "install", "-y", "-qq", "snapd"]);
  let (mut rx, _) = cmd.spawn()?;
  while let Some(ev) = rx.recv().await {
    use tauri_plugin_shell::process::CommandEvent::*;
    match ev {
      Terminated(status) => {
        if status.code.unwrap_or(1) != 0 {
          log(window, "⚠️ Instalação snapd falhou, SSL pode não funcionar");
        }
        break;
      }
      _ => {}
    }
  }

  // 11. Habilitar e iniciar snapd
  log(window, "🔧 Habilitando snapd...");
  let cmd = shell.command("sudo")
    .args(["systemctl", "enable", "--now", "snapd"]);
  let (mut rx, _) = cmd.spawn()?;
  while let Some(_) = rx.recv().await {} // Aguardar conclusão

  // 12. Atualizar snap core
  log(window, "🔄 Atualizando snap core...");
  let cmd = shell.command("sudo")
    .args(["snap", "install", "core"]);
  let (mut rx, _) = cmd.spawn()?;
  while let Some(_) = rx.recv().await {} // Aguardar conclusão

  let cmd = shell.command("sudo")
    .args(["snap", "refresh", "core"]);
  let (mut rx, _) = cmd.spawn()?;
  while let Some(_) = rx.recv().await {} // Aguardar conclusão

  // 13. Instalar Certbot
  log(window, "🔒 Instalando Certbot (Let's Encrypt)...");
  let cmd = shell.command("sudo")
    .args(["snap", "install", "--classic", "certbot"]);
  let (mut rx, _) = cmd.spawn()?;
  while let Some(ev) = rx.recv().await {
    use tauri_plugin_shell::process::CommandEvent::*;
    match ev {
      Terminated(status) => {
        if status.code.unwrap_or(1) != 0 {
          log(window, "⚠️ Instalação Certbot falhou, SSL pode não funcionar");
        }
        break;
      }
      _ => {}
    }
  }

  // 14. Criar symlink do Certbot
  log(window, "🔗 Criando symlink do Certbot...");
  let cmd = shell.command("sudo")
    .args(["ln", "-sf", "/snap/bin/certbot", "/usr/bin/certbot"]);
  let (mut rx, _) = cmd.spawn()?;
  while let Some(_) = rx.recv().await {} // Aguardar conclusão

  // 15. Habilitar e iniciar serviços
  log(window, "🚀 Habilitando serviços (PostgreSQL, Redis, Nginx)...");
  let services = ["postgresql", "redis-server", "nginx"];
  for service in &services {
    let cmd = shell.command("sudo")
      .args(["systemctl", "enable", "--now", service]);
    let (mut rx, _) = cmd.spawn()?;
    while let Some(_) = rx.recv().await {} // Aguardar conclusão
  }

  log(window, "✅ Todas as dependências instaladas com sucesso!");
  Ok(())
}

/// Configura banco de dados PostgreSQL (role + database)
async fn setup_database(window: &Window, company: &str, password: &str) -> Result<()> {
  log(window, format!("🗄️ Configurando banco de dados para: {}", company));

  let shell = window.app_handle().shell();

  // Criar role (se não existir)
  let check_role = format!("SELECT 1 FROM pg_roles WHERE rolname='{}'", company);
  let cmd = shell.command("sudo")
    .args(["-u", "postgres", "psql", "-tc", &check_role]);
  let (mut rx, _) = cmd.spawn()?;
  let mut role_exists = false;
  while let Some(ev) = rx.recv().await {
    use tauri_plugin_shell::process::CommandEvent::*;
    match ev {
      Stdout(line) => {
        if String::from_utf8_lossy(&line).contains("1") {
          role_exists = true;
        }
      }
      Terminated(_) => break,
      _ => {}
    }
  }

  if !role_exists {
    log(window, format!("👤 Criando role PostgreSQL: {}", company));
    let create_role = format!("CREATE ROLE {} LOGIN PASSWORD '{}'", company, password);
    let cmd = shell.command("sudo")
      .args(["-u", "postgres", "psql", "-c", &create_role]);
    let (mut rx, _) = cmd.spawn()?;
    while let Some(ev) = rx.recv().await {
      use tauri_plugin_shell::process::CommandEvent::*;
      match ev {
        Terminated(status) => {
          if status.code.unwrap_or(1) != 0 {
            anyhow::bail!("Falha ao criar role PostgreSQL");
          }
          break;
        }
        _ => {}
      }
    }
  }

  // Criar database (se não existir)
  let check_db = format!("SELECT 1 FROM pg_database WHERE datname='{}'", company);
  let cmd = shell.command("sudo")
    .args(["-u", "postgres", "psql", "-tc", &check_db]);
  let (mut rx, _) = cmd.spawn()?;
  let mut db_exists = false;
  while let Some(ev) = rx.recv().await {
    use tauri_plugin_shell::process::CommandEvent::*;
    match ev {
      Stdout(line) => {
        if String::from_utf8_lossy(&line).contains("1") {
          db_exists = true;
        }
      }
      Terminated(_) => break,
      _ => {}
    }
  }

  if !db_exists {
    log(window, format!("💾 Criando database PostgreSQL: {}", company));
    let create_db = format!("CREATE DATABASE {} OWNER {}", company, company);
    let cmd = shell.command("sudo")
      .args(["-u", "postgres", "psql", "-c", &create_db]);
    let (mut rx, _) = cmd.spawn()?;
    while let Some(ev) = rx.recv().await {
      use tauri_plugin_shell::process::CommandEvent::*;
      match ev {
        Terminated(status) => {
          if status.code.unwrap_or(1) != 0 {
            anyhow::bail!("Falha ao criar database PostgreSQL");
          }
          break;
        }
        _ => {}
      }
    }
  }

  log(window, "✅ Banco de dados configurado");
  Ok(())
}

/// Configura Nginx como proxy reverso
async fn setup_nginx(window: &Window, company: &str, backend_host: &str, frontend_host: &str, backend_port: u16, frontend_port: u16) -> Result<()> {
  log(window, "🌐 Configurando Nginx...");

  // Config backend
  let backend_config = format!(
r#"server {{
  listen 80;
  server_name {backend_host};
  location / {{
    proxy_pass http://127.0.0.1:{backend_port};
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }}
}}
"#,
    backend_host = backend_host,
    backend_port = backend_port
  );

  let backend_file = format!("/etc/nginx/sites-available/{}-backend", company);
  fs::write(&backend_file, backend_config)?;

  // Config frontend
  let frontend_config = format!(
r#"server {{
  listen 80;
  server_name {frontend_host};
  location / {{
    proxy_pass http://127.0.0.1:{frontend_port};
    proxy_set_header Host $host;
    proxy_http_version 1.1;
  }}
}}
"#,
    frontend_host = frontend_host,
    frontend_port = frontend_port
  );

  let frontend_file = format!("/etc/nginx/sites-available/{}-frontend", company);
  fs::write(&frontend_file, frontend_config)?;

  // Criar symlinks
  let backend_link = format!("/etc/nginx/sites-enabled/{}-backend", company);
  let frontend_link = format!("/etc/nginx/sites-enabled/{}-frontend", company);

  let _ = fs::remove_file(&backend_link);
  let _ = fs::remove_file(&frontend_link);

  std::os::unix::fs::symlink(&backend_file, &backend_link)?;
  std::os::unix::fs::symlink(&frontend_file, &frontend_link)?;

  // Remover default
  let _ = fs::remove_file("/etc/nginx/sites-enabled/default");

  // Testar e recarregar Nginx
  log(window, "🔧 Testando configuração Nginx...");
  let shell = window.app_handle().shell();
  let cmd = shell.command("sudo")
    .args(["nginx", "-t"]);
  let (mut rx, _) = cmd.spawn()?;
  while let Some(ev) = rx.recv().await {
    use tauri_plugin_shell::process::CommandEvent::*;
    match ev {
      Terminated(status) => {
        if status.code.unwrap_or(1) != 0 {
          anyhow::bail!("Configuração Nginx inválida");
        }
        break;
      }
      _ => {}
    }
  }

  log(window, "🔄 Reiniciando Nginx...");
  let cmd = shell.command("sudo")
    .args(["systemctl", "restart", "nginx"]);
  let (mut rx, _) = cmd.spawn()?;
  while let Some(ev) = rx.recv().await {
    use tauri_plugin_shell::process::CommandEvent::*;
    match ev {
      Terminated(status) => {
        if status.code.unwrap_or(1) != 0 {
          anyhow::bail!("Falha ao reiniciar Nginx");
        }
        break;
      }
      _ => {}
    }
  }

  log(window, "✅ Nginx configurado");
  Ok(())
}

/// Inicia aplicações com PM2
async fn start_apps_pm2(window: &Window, company: &str, base: &Path) -> Result<()> {
  log(window, "🚀 Iniciando aplicações com PM2...");

  let shell = window.app_handle().shell();
  let backend_path = base.join("backend");
  let frontend_path = base.join("frontend");

  // Iniciar backend
  log(window, "⚙️ Iniciando backend com PM2...");
  let backend_name = format!("{}-backend", company);
  let cmd = shell.command("pm2")
    .args([
      "start",
      "server.js",
      "--name", &backend_name,
      "-i", "2",
      "--update-env"
    ])
    .current_dir(&backend_path);

  let (mut rx, _) = cmd.spawn()?;
  while let Some(ev) = rx.recv().await {
    use tauri_plugin_shell::process::CommandEvent::*;
    match ev {
      Stdout(line) | Stderr(line) =>
        log(window, String::from_utf8_lossy(&line).into_owned()),
      Terminated(status) => {
        if status.code.unwrap_or(1) != 0 {
          log(window, "⚠️ Backend PM2 pode já estar rodando, tentando atualizar...");
          // Tentar reload
          let cmd = shell.command("pm2")
            .args(["reload", &backend_name]);
          let (mut rx, _) = cmd.spawn()?;
          while let Some(_) = rx.recv().await {} // Aguardar conclusão
        }
        break;
      }
      _ => {}
    }
  }

  // Iniciar frontend
  log(window, "⚙️ Iniciando frontend com PM2...");
  let frontend_name = format!("{}-frontend", company);
  let cmd = shell.command("pm2")
    .args([
      "start",
      "server.js",
      "--name", &frontend_name,
      "--update-env"
    ])
    .current_dir(&frontend_path);

  let (mut rx, _) = cmd.spawn()?;
  while let Some(ev) = rx.recv().await {
    use tauri_plugin_shell::process::CommandEvent::*;
    match ev {
      Stdout(line) | Stderr(line) =>
        log(window, String::from_utf8_lossy(&line).into_owned()),
      Terminated(status) => {
        if status.code.unwrap_or(1) != 0 {
          log(window, "⚠️ Frontend PM2 pode já estar rodando, tentando atualizar...");
          // Tentar reload
          let cmd = shell.command("pm2")
            .args(["reload", &frontend_name]);
          let (mut rx, _) = cmd.spawn()?;
          while let Some(_) = rx.recv().await {} // Aguardar conclusão
        }
        break;
      }
      _ => {}
    }
  }

  // Salvar lista PM2
  log(window, "💾 Salvando configuração PM2...");
  let cmd = shell.command("pm2")
    .args(["save"]);
  let (mut rx, _) = cmd.spawn()?;
  while let Some(_) = rx.recv().await {} // Aguardar conclusão

  // Configurar auto-start do PM2
  log(window, "🔧 Configurando auto-start do PM2...");
  let cmd = shell.command("pm2")
    .args(["startup", "systemd", "-u", "deploy", "--hp", "/home/deploy"]);
  let (mut rx, _) = cmd.spawn()?;

  while let Some(ev) = rx.recv().await {
    use tauri_plugin_shell::process::CommandEvent::*;
    match ev {
      Stdout(line) => {
        let output = String::from_utf8_lossy(&line);
        log(window, output.clone().into_owned());

        // PM2 startup retorna um comando sudo que precisa ser executado
        if output.contains("sudo env PATH") {
          // Extrair e executar o comando sudo
          let cmd_line = output.trim();
          log(window, format!("📝 Executando comando de startup: {}", cmd_line));

          let result = std::process::Command::new("bash")
            .args(["-c", cmd_line])
            .output();

          match result {
            Ok(out) => {
              if out.status.success() {
                log(window, "✅ Comando de startup executado com sucesso");
              } else {
                log(window, &format!("⚠️  Comando retornou código: {}",
                  out.status.code().unwrap_or(-1)));
              }
            }
            Err(e) => {
              log(window, &format!("⚠️  Erro ao executar comando de startup: {}", e));
            }
          }
        }
      }
      Terminated(_) => break,
      _ => {}
    }
  }

  log(window, "✅ PM2 configurado para auto-start após reboot");
  log(window, "✅ Aplicações iniciadas com PM2");
  Ok(())
}

/// Ajusta permissões dos arquivos para usuário deploy
async fn fix_permissions(window: &Window, base: &Path) -> Result<()> {
  log(window, "🔐 Ajustando permissões para usuário deploy...");

  let shell = window.app_handle().shell();

  // Mudar owner para deploy:deploy
  let cmd = shell.command("sudo")
    .args(["chown", "-R", "deploy:deploy", base.to_str().unwrap()]);
  let (mut rx, _) = cmd.spawn()?;

  while let Some(ev) = rx.recv().await {
    use tauri_plugin_shell::process::CommandEvent::*;
    match ev {
      Terminated(status) => {
        if status.code.unwrap_or(1) != 0 {
          anyhow::bail!("Falha ao ajustar permissões");
        }
        break;
      }
      _ => {}
    }
  }

  // Ajustar permissões dos .env para 600 (apenas owner read/write)
  let backend_env = base.join("backend/.env");
  let frontend_env = base.join("frontend/.env");

  for env_file in &[backend_env, frontend_env] {
    let _ = std::process::Command::new("sudo")
      .args(["chmod", "600", env_file.to_str().unwrap()])
      .output();
  }

  log(window, "✅ Permissões ajustadas (deploy:deploy, .env=600)");
  Ok(())
}

/// Executa validações pós-instalação
async fn post_install_validation(window: &Window, base: &Path, company: &str) -> Result<()> {
  log(window, "\n═══════════════════════════════════════");
  log(window, "🔍 Executando verificações pós-instalação...");
  log(window, "═══════════════════════════════════════\n");

  let mut errors = Vec::new();
  let mut warnings = Vec::new();

  // 1. Verificar PM2 services
  log(window, "  • Verificando serviços PM2...");
  let pm2_output = std::process::Command::new("pm2")
    .args(["jlist"])
    .output();

  if let Ok(output) = pm2_output {
    let pm2_data = String::from_utf8_lossy(&output.stdout);
    let backend_name = format!("{}-backend", company);
    let frontend_name = format!("{}-frontend", company);

    if !pm2_data.contains(&backend_name) {
      errors.push(format!("❌ Processo PM2 '{}' não encontrado", backend_name));
    }
    if !pm2_data.contains(&frontend_name) {
      errors.push(format!("❌ Processo PM2 '{}' não encontrado", frontend_name));
    }

    if pm2_data.contains(&backend_name) && pm2_data.contains(&frontend_name) {
      if pm2_data.contains("\"status\":\"online\"") {
        log(window, "    ✅ Serviços PM2 online");
      } else {
        warnings.push("⚠️  Serviços PM2 encontrados mas não estão 'online'".to_string());
      }
    }
  } else {
    errors.push("❌ Não foi possível verificar PM2 (pm2 instalado?)".to_string());
  }

  // 2. Verificar banco de dados
  log(window, "  • Verificando banco de dados...");
  let db_output = std::process::Command::new("sudo")
    .args(["-u", "postgres", "psql", "-d", company, "-c", "\\dt", "-t"])
    .output();

  if let Ok(output) = db_output {
    let tables = String::from_utf8_lossy(&output.stdout);
    let table_count = tables.lines().filter(|l| !l.trim().is_empty()).count();

    if table_count == 0 {
      errors.push("❌ Banco de dados vazio (migrations não executadas?)".to_string());
    } else if table_count < 10 {
      warnings.push(format!("⚠️  Poucas tabelas no banco ({}), esperado 50+", table_count));
    } else {
      log(window, &format!("    ✅ Banco de dados com {} tabelas", table_count));
    }
  } else {
    warnings.push("⚠️  Não foi possível verificar banco de dados".to_string());
  }

  // 3. Verificar node_modules
  log(window, "  • Verificando dependências...");
  let frontend_nm = base.join("frontend/node_modules/express");
  let backend_nm = base.join("backend/node_modules/dotenv");

  if !frontend_nm.exists() {
    errors.push("❌ Frontend node_modules incompleto (express não encontrado)".to_string());
  } else {
    log(window, "    ✅ Frontend node_modules OK (express presente)");
  }

  if !backend_nm.exists() {
    errors.push("❌ Backend node_modules incompleto (dotenv não encontrado)".to_string());
  } else {
    log(window, "    ✅ Backend node_modules OK (dotenv presente)");
  }

  // 4. Verificar serviços HTTP
  log(window, "  • Verificando serviços HTTP...");
  log(window, "    (aguardando 5s para services iniciarem...)");
  std::thread::sleep(std::time::Duration::from_secs(5));

  let backend_port = calc_port(company, 8000);
  let frontend_port = calc_port(company, 3001);

  // Verificar backend
  let backend_check = std::process::Command::new("curl")
    .args(["-s", "-o", "/dev/null", "-w", "%{http_code}",
           &format!("http://localhost:{}", backend_port)])
    .output();

  if let Ok(output) = backend_check {
    let status = String::from_utf8_lossy(&output.stdout);
    if !status.is_empty() && status != "000" {
      log(window, &format!("    ✅ Backend respondendo na porta {} (HTTP {})", backend_port, status));
    } else {
      warnings.push(format!("⚠️  Backend não respondeu na porta {} (pode estar iniciando)", backend_port));
    }
  }

  // Verificar frontend
  let frontend_check = std::process::Command::new("curl")
    .args(["-s", "-o", "/dev/null", "-w", "%{http_code}",
           &format!("http://localhost:{}", frontend_port)])
    .output();

  if let Ok(output) = frontend_check {
    let status = String::from_utf8_lossy(&output.stdout);
    if status == "200" {
      log(window, &format!("    ✅ Frontend respondendo na porta {} (HTTP 200)", frontend_port));
    } else if !status.is_empty() && status != "000" {
      warnings.push(format!("⚠️  Frontend retornou HTTP {} na porta {}", status, frontend_port));
    } else {
      warnings.push(format!("⚠️  Frontend não respondeu na porta {} (pode estar iniciando)", frontend_port));
    }
  }

  // 5. Resultado final
  log(window, "\n═══════════════════════════════════════");

  if errors.is_empty() && warnings.is_empty() {
    log(window, "✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!");
    log(window, "\n📝 Informações de Acesso:");
    log(window, &format!("   🌐 Backend:  http://localhost:{}", backend_port));
    log(window, &format!("   🌐 Frontend: http://localhost:{}", frontend_port));
    log(window, &format!("   📊 PM2:      pm2 list"));
    log(window, &format!("   📋 Logs:     pm2 logs {}-backend", company));
    log(window, "═══════════════════════════════════════\n");
    Ok(())
  } else if !errors.is_empty() {
    log(window, "❌ INSTALAÇÃO CONCLUÍDA COM ERROS:");
    for error in &errors {
      log(window, &format!("   {}", error));
    }
    if !warnings.is_empty() {
      log(window, "\n⚠️  AVISOS:");
      for warning in &warnings {
        log(window, &format!("   {}", warning));
      }
    }
    log(window, "═══════════════════════════════════════\n");
    log(window, "💡 Dica: Execute o workaround manual no README.md");
    Err(anyhow::anyhow!("Instalação teve erros - veja logs acima"))
  } else {
    // Apenas warnings
    log(window, "✅ INSTALAÇÃO CONCLUÍDA COM AVISOS:");
    for warning in &warnings {
      log(window, &format!("   {}", warning));
    }
    log(window, "\n═══════════════════════════════════════");
    log(window, "⚠️  Alguns serviços podem estar iniciando.");
    log(window, "   Aguarde 1-2 minutos e verifique novamente.");
    log(window, &format!("\n📝 Comandos úteis:"));
    log(window, &format!("   pm2 list"));
    log(window, &format!("   pm2 logs {}", company));
    log(window, &format!("   curl http://localhost:{}", frontend_port));
    log(window, "═══════════════════════════════════════\n");
    Ok(())
  }
}

fn err(e: impl std::fmt::Display) -> String { e.to_string() }

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .invoke_handler(tauri::generate_handler![install])
    .run(tauri::generate_context!())
    .expect("erro ao rodar app");
}
