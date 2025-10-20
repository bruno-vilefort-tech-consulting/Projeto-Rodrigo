/**
 * MOD-8: ServiceManager
 *
 * Responsabilidade: Iniciar e gerenciar serviços (PM2, Nginx)
 *
 * Features:
 * - Iniciar backend com PM2
 * - Aguardar e validar que backend iniciou sem erros
 * - Detectar loop de restarts
 * - Configurar Nginx
 * - Testar configuração Nginx
 * - PM2 save e startup
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import EventEmitter from 'events';

const execAsync = promisify(exec);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class ServiceManager extends EventEmitter {
  constructor(logCallback = console.log) {
    super();
    this.log = logCallback;
  }

  /**
   * Inicia backend (PM2) e configura Nginx
   * @param {Object} config - Configuração da instalação
   */
  async startServices(config) {
    // 1. Iniciar backend com PM2
    this.emit('progress', {
      service: 'backend',
      status: 'starting',
      message: 'Iniciando backend com PM2...'
    });

    await this.startBackend(config);

    // 2. Configurar Nginx
    this.emit('progress', {
      service: 'nginx',
      status: 'configuring',
      message: 'Configurando Nginx...'
    });

    await this.configureNginx(config);

    // 3. Salvar configuração PM2
    await execAsync('pm2 save');

    // 4. Configurar PM2 startup
    await execAsync('pm2 startup systemd -u root --hp /root');

    this.emit('progress', {
      status: 'services_started',
      message: '✅ Todos os serviços iniciados'
    });
  }

  /**
   * Inicia backend com PM2 e valida
   * @param {Object} config - Configuração da instalação
   */
  async startBackend(config) {
    const backendDir = `/home/deploy/${config.companySlug}/backend`;
    const serviceName = `${config.companySlug}-backend`;

    // Iniciar com PM2
    await execAsync(
      `cd ${backendDir} && pm2 start server.js --name ${serviceName}`,
      { timeout: 30000 }
    );

    // Aguardar 15 segundos para serviço estabilizar
    this.emit('progress', {
      service: 'backend',
      status: 'waiting',
      message: 'Aguardando backend iniciar (15s)...'
    });

    await sleep(15000);

    // Verificar se está rodando
    const running = await this.isServiceRunning(serviceName);

    if (!running) {
      // Pegar logs de erro
      const { stdout } = await execAsync(
        `pm2 logs ${serviceName} --lines 50 --nostream || echo "No logs available"`
      );

      // Parar serviço com erro
      await execAsync(`pm2 delete ${serviceName} || true`);

      throw new Error(
        `Backend failed to start. Logs:\n${stdout}`
      );
    }

    // Verificar número de restarts (não deve estar em loop)
    const restarts = await this.getRestartCount(serviceName);
    if (restarts > 3) {
      const { stdout } = await execAsync(
        `pm2 logs ${serviceName} --lines 50 --nostream || echo "No logs available"`
      );

      throw new Error(
        `Backend is restarting repeatedly (${restarts} restarts). Logs:\n${stdout}`
      );
    }

    this.emit('progress', {
      service: 'backend',
      status: 'running',
      message: `✅ Backend online (${serviceName})`
    });

    return true;
  }

  /**
   * Verifica se processo PM2 está online
   * @param {string} serviceName - Nome do serviço PM2
   */
  async isServiceRunning(serviceName) {
    try {
      const { stdout } = await execAsync(
        `pm2 list | grep ${serviceName} | grep online || echo "not-running"`
      );
      return !stdout.includes('not-running');
    } catch {
      return false;
    }
  }

  /**
   * Obtém número de restarts do processo PM2
   * @param {string} serviceName - Nome do serviço PM2
   */
  async getRestartCount(serviceName) {
    try {
      const { stdout } = await execAsync(`pm2 jlist`);
      const processes = JSON.parse(stdout);

      const process = processes.find(p => p.name === serviceName);
      return process ? process.pm2_env.restart_time : 0;

    } catch {
      return 0;
    }
  }

  /**
   * Configura e recarrega Nginx
   * @param {Object} config - Configuração da instalação
   * @param {string} nginxConfigContent - Conteúdo da configuração Nginx
   */
  async configureNginx(config, nginxConfigContent) {
    const configPath = `/etc/nginx/sites-available/${config.companySlug}.conf`;
    const enabledPath = `/etc/nginx/sites-enabled/${config.companySlug}.conf`;

    // Escrever configuração
    await fs.writeFile(configPath, nginxConfigContent);

    // Criar symlink
    await execAsync(`ln -sf ${configPath} ${enabledPath}`);

    // Testar configuração
    const { stdout, stderr } = await execAsync('nginx -t 2>&1');
    if (stderr && !stdout.includes('test is successful')) {
      throw new Error(
        `Nginx configuration test failed:\n${stderr}\n${stdout}`
      );
    }

    // Recarregar nginx
    await execAsync('systemctl reload nginx');

    this.emit('progress', {
      service: 'nginx',
      status: 'configured',
      message: '✅ Nginx configurado e recarregado'
    });

    return true;
  }
}

export default ServiceManager;
