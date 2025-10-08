// /home/deploy/empresa01/ecosystem.config.js
const path = require("path");

// Deriva um nome seguro a partir do diretório da instância (ex.: empresa01)
const INSTANCE = (process.env.INSTANCE_NAME || path.basename(path.resolve(__dirname)))
  .toLowerCase()
  .replace(/[^a-z0-9-_]/g, "-");

// Gera portas determinísticas por instância (pode ser sobrescrito via env)
function hashPort(name, base) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return base + (h % 500);
}
const BACKEND_PORT  = Number(process.env.BACKEND_PORT)  || hashPort(INSTANCE, 8000); // 8000–8499
const FRONTEND_PORT = Number(process.env.FRONTEND_PORT) || hashPort(INSTANCE, 3001); // 3001–3500

// Usa caminhos com base no diretório deste arquivo (portável entre instâncias)
const BACKEND_CWD   = path.join(__dirname, "backend");
const BACKEND_FILE  = path.join(__dirname, "backend", "dist", "server.js");
const FRONTEND_CWD  = path.join(__dirname, "frontend");
const FRONTEND_FILE = path.join(__dirname, "frontend", "server.js");

module.exports = {
  apps: [
    {
      // --- BACKEND ---
      name: `${INSTANCE}-backend`,
      script: BACKEND_FILE,
      cwd: BACKEND_CWD,
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      exp_backoff_restart_delay: 200, // evita restart loop agressivo
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: "production",
        HOST: "0.0.0.0",
        PORT: String(BACKEND_PORT)
      }
    },
    {
      // --- FRONTEND ---
      name: `${INSTANCE}-frontend`,
      script: FRONTEND_FILE,
      cwd: FRONTEND_CWD,
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      exp_backoff_restart_delay: 200,
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: "production",
        HOST: "0.0.0.0",
        PORT: String(FRONTEND_PORT)
      }
    }
  ]
};
