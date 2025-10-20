/**
 * MOD-2: DependencyInstaller
 *
 * Responsabilidade: Instalar dependências faltantes automaticamente
 *
 * Instala:
 * - Node.js 20.x
 * - PM2
 * - Nginx
 * - PostgreSQL
 * - Redis
 * - FFmpeg
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import EventEmitter from 'events';

const execAsync = promisify(exec);

/**
 * Helper: Verifica se comando existe
 */
async function commandExists(command) {
  try {
    await execAsync(`which ${command}`);
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper: Verifica status de serviço systemctl
 */
async function systemctlStatus(serviceName) {
  try {
    const { stdout } = await execAsync(`systemctl is-active ${serviceName}`);
    return stdout.trim() === 'active';
  } catch {
    return false;
  }
}

/**
 * Helper: Executa comando com timeout
 */
async function execCommand(command, options = {}) {
  const timeout = options.timeout || 120000;
  const sudo = options.sudo !== false; // default true

  const finalCommand = sudo ? `sudo ${command}` : command;

  try {
    const { stdout, stderr } = await execAsync(finalCommand, { timeout });
    return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode: 0 };
  } catch (error) {
    return {
      stdout: error.stdout?.trim() || '',
      stderr: error.stderr?.trim() || error.message,
      exitCode: error.code || 1
    };
  }
}

/**
 * Helper: Sleep
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class DependencyInstaller extends EventEmitter {
  constructor(logCallback = console.log) {
    super();
    this.log = logCallback;
  }

  /**
   * Instala todas as dependências faltantes
   * @param {Array<string>} missingDeps - Lista de dependências para instalar
   */
  async installMissing(missingDeps) {
    for (const dep of missingDeps) {
      this.emit('progress', {
        dep,
        status: 'installing',
        message: `Instalando ${dep}...`
      });

      try {
        switch (dep) {
          case 'nodejs':
            await this.installNodeJS();
            break;
          case 'pm2':
            await this.installPM2();
            break;
          case 'nginx':
            await this.installNginx();
            break;
          case 'postgresql':
            await this.installPostgreSQL();
            break;
          case 'redis':
            await this.installRedis();
            break;
          case 'ffmpeg':
            await this.installFFmpeg();
            break;
          default:
            throw new Error(`Unknown dependency: ${dep}`);
        }

        this.emit('progress', {
          dep,
          status: 'installed',
          message: `${dep} instalado com sucesso`
        });

      } catch (error) {
        this.emit('error', {
          dep,
          status: 'failed',
          error: error.message
        });
        throw error;
      }
    }
  }

  /**
   * Instala Node.js 20.x
   */
  async installNodeJS() {
    this.log('📦 Instalando Node.js 20.x...');

    // Adicionar repositório NodeSource
    await execCommand(
      'curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -',
      { timeout: 180000 }
    );

    // Instalar Node.js
    await execCommand('apt-get install -y nodejs', {
      sudo: true,
      timeout: 180000
    });

    // Verificar instalação
    const exists = await commandExists('node');
    if (!exists) {
      throw new Error('Node.js installation failed - command not found after install');
    }

    const { stdout } = await execCommand('node -v', { sudo: false });
    this.log(`✅ Node.js ${stdout} instalado`);
    return true;
  }

  /**
   * Instala PM2 globalmente via npm
   */
  async installPM2() {
    this.log('📦 Instalando PM2...');

    await execCommand('npm install -g pm2', {
      sudo: false,
      timeout: 120000
    });

    // Verificar instalação
    const exists = await commandExists('pm2');
    if (!exists) {
      throw new Error('PM2 installation failed - command not found after install');
    }

    // Configurar startup
    await execCommand('pm2 startup systemd -u root --hp /root', { sudo: true });

    this.log('✅ PM2 instalado e configurado');
    return true;
  }

  /**
   * Instala e configura Nginx
   */
  async installNginx() {
    this.log('📦 Instalando Nginx...');

    await execCommand('apt-get update', { sudo: true });
    await execCommand('apt-get install -y nginx', {
      sudo: true,
      timeout: 180000
    });

    await execCommand('systemctl enable nginx', { sudo: true });
    await execCommand('systemctl start nginx', { sudo: true });

    // Aguardar serviço iniciar
    await sleep(2000);

    // Verificar se está rodando
    const running = await systemctlStatus('nginx');
    if (!running) {
      throw new Error('Nginx installed but failed to start');
    }

    this.log('✅ Nginx instalado e rodando');
    return true;
  }

  /**
   * Instala PostgreSQL e cria usuário padrão
   */
  async installPostgreSQL() {
    this.log('📦 Instalando PostgreSQL...');

    await execCommand('apt-get install -y postgresql postgresql-contrib', {
      sudo: true,
      timeout: 300000
    });

    await execCommand('systemctl enable postgresql', { sudo: true });
    await execCommand('systemctl start postgresql', { sudo: true });

    // Aguardar PostgreSQL iniciar completamente
    await sleep(5000);

    // Verificar se está rodando
    const running = await systemctlStatus('postgresql');
    if (!running) {
      throw new Error('PostgreSQL installed but failed to start');
    }

    // Criar usuário padrão
    this.log('🔧 Criando usuário PostgreSQL...');
    try {
      await execCommand('sudo -u postgres psql -c "CREATE USER atuar_pay WITH PASSWORD \'123456\';"');
      await execCommand('sudo -u postgres psql -c "ALTER USER atuar_pay CREATEDB;"');
    } catch (err) {
      // Ignorar erro se usuário já existe
      if (!err.message.includes('already exists')) {
        throw err;
      }
    }

    this.log('✅ PostgreSQL instalado e configurado');
    return true;
  }

  /**
   * Instala Redis (opcional)
   */
  async installRedis() {
    this.log('📦 Instalando Redis...');

    await execCommand('apt-get install -y redis-server', {
      sudo: true,
      timeout: 180000
    });

    await execCommand('systemctl enable redis-server', { sudo: true });
    await execCommand('systemctl start redis-server', { sudo: true });

    await sleep(2000);

    this.log('✅ Redis instalado e rodando');
    return true;
  }

  /**
   * Instala FFmpeg
   */
  async installFFmpeg() {
    this.log('📦 Instalando FFmpeg...');

    await execCommand('apt-get install -y ffmpeg', {
      sudo: true,
      timeout: 180000
    });

    // Verificar instalação
    const exists = await commandExists('ffmpeg');
    if (!exists) {
      throw new Error('FFmpeg installation failed');
    }

    this.log('✅ FFmpeg instalado');
    return true;
  }
}

export default DependencyInstaller;
