#!/usr/bin/env node

/**
 * MOD-2: DependencyInstaller
 * Módulo responsável por instalar dependências faltantes automaticamente
 */

const { EventEmitter } = require('events');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

class DependencyInstaller extends EventEmitter {
  constructor(options = {}) {
    super();
    this.verbose = options.verbose || false;
    this.dryRun = options.dryRun || false;
  }

  /**
   * Helper: Log com timestamp
   */
  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[34m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warn: '\x1b[33m',
      reset: '\x1b[0m'
    };

    const color = colors[level] || colors.info;
    const prefix = level === 'error' ? '❌' : level === 'success' ? '✅' : 'ℹ️';

    console.log(`${color}${prefix} [${timestamp}] ${message}${colors.reset}`);

    if (this.verbose) {
      this.emit('log', { level, message, timestamp });
    }
  }

  /**
   * Helper: Executa comando com opções
   */
  async execCommand(command, options = {}) {
    const {
      sudo = false,
      timeout = 300000, // 5 minutos default
      cwd = process.cwd()
    } = options;

    const fullCommand = sudo ? `sudo ${command}` : command;

    if (this.dryRun) {
      this.log(`[DRY RUN] Would execute: ${fullCommand}`, 'warn');
      return { stdout: '', stderr: '' };
    }

    try {
      const { stdout, stderr } = await exec(fullCommand, { timeout, cwd });
      return { stdout, stderr };
    } catch (error) {
      throw new Error(`Command failed: ${fullCommand}\n${error.message}`);
    }
  }

  /**
   * Helper: Verifica se comando existe
   */
  async commandExists(command) {
    try {
      await exec(`command -v ${command}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Helper: Verifica status do serviço
   */
  async systemctlStatus(service) {
    try {
      await exec(`systemctl is-active --quiet ${service}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Helper: Sleep/delay
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Instala Node.js 20.x
   */
  async installNodeJS() {
    this.log('Instalando Node.js 20.x...');

    // Adicionar repositório NodeSource
    await this.execCommand(
      'curl -fsSL https://deb.nodesource.com/setup_20.x | bash -',
      { sudo: true, timeout: 120000 }
    );

    // Instalar Node.js
    await this.execCommand('apt-get install -y nodejs', {
      sudo: true,
      timeout: 180000
    });

    // Verificar instalação
    const exists = await this.commandExists('node');
    if (!exists) {
      throw new Error('Node.js installation failed - command not found after install');
    }

    const version = await this.execCommand('node -v');
    this.log(`Node.js ${version.stdout.trim()} instalado com sucesso`, 'success');

    return true;
  }

  /**
   * Instala PM2 globalmente via npm (CRÍTICO)
   */
  async installPM2() {
    this.log('Instalando PM2...');

    await this.execCommand('npm install -g pm2', {
      sudo: false,
      timeout: 120000
    });

    // Verificar instalação
    const exists = await this.commandExists('pm2');
    if (!exists) {
      throw new Error('PM2 installation failed - command not found after install');
    }

    // Configurar startup
    this.log('Configurando PM2 startup...');
    await this.execCommand('pm2 startup systemd -u root --hp /root', {
      sudo: true
    });

    const version = await this.execCommand('pm2 -v');
    this.log(`PM2 ${version.stdout.trim()} instalado e configurado`, 'success');

    return true;
  }

  /**
   * Instala e configura Nginx (CRÍTICO)
   */
  async installNginx() {
    this.log('Instalando Nginx...');

    await this.execCommand('apt-get update', { sudo: true });
    await this.execCommand('apt-get install -y nginx', {
      sudo: true,
      timeout: 180000
    });

    await this.execCommand('systemctl enable nginx', { sudo: true });
    await this.execCommand('systemctl start nginx', { sudo: true });

    // Aguardar serviço iniciar
    await this.sleep(2000);

    // Verificar se está rodando
    const running = await this.systemctlStatus('nginx');
    if (!running) {
      throw new Error('Nginx installed but failed to start');
    }

    const version = await this.execCommand('nginx -v 2>&1');
    this.log(`Nginx ${version.stdout.trim()} instalado e rodando`, 'success');

    return true;
  }

  /**
   * Instala PostgreSQL e cria usuário padrão (CRÍTICO)
   */
  async installPostgreSQL() {
    this.log('Instalando PostgreSQL...');

    await this.execCommand('apt-get install -y postgresql postgresql-contrib', {
      sudo: true,
      timeout: 300000
    });

    await this.execCommand('systemctl enable postgresql', { sudo: true });
    await this.execCommand('systemctl start postgresql', { sudo: true });

    // Aguardar PostgreSQL iniciar completamente
    this.log('Aguardando PostgreSQL iniciar...');
    await this.sleep(5000);

    // Verificar se está rodando
    const running = await this.systemctlStatus('postgresql');
    if (!running) {
      throw new Error('PostgreSQL installed but failed to start');
    }

    // Criar usuário padrão
    this.log('Criando usuário PostgreSQL padrão (atuar_pay)...');
    try {
      await this.execCommand('sudo -u postgres psql -c "CREATE USER atuar_pay WITH PASSWORD \'123456\';"');
      await this.execCommand('sudo -u postgres psql -c "ALTER USER atuar_pay CREATEDB;"');
      this.log('Usuário PostgreSQL criado com sucesso', 'success');
    } catch (err) {
      // Ignorar erro se usuário já existe
      if (err.message.includes('already exists')) {
        this.log('Usuário PostgreSQL já existe', 'warn');
      } else {
        throw err;
      }
    }

    const version = await this.execCommand('psql --version');
    this.log(`PostgreSQL ${version.stdout.trim()} instalado e configurado`, 'success');

    return true;
  }

  /**
   * Instala Redis (RECOMENDADO)
   */
  async installRedis() {
    this.log('Instalando Redis...');

    await this.execCommand('apt-get install -y redis-server', {
      sudo: true,
      timeout: 180000
    });

    await this.execCommand('systemctl enable redis-server', { sudo: true });
    await this.execCommand('systemctl start redis-server', { sudo: true });

    await this.sleep(2000);

    const version = await this.execCommand('redis-cli --version');
    this.log(`Redis ${version.stdout.trim()} instalado e rodando`, 'success');

    return true;
  }

  /**
   * Instala FFmpeg (RECOMENDADO)
   */
  async installFFmpeg() {
    this.log('Instalando FFmpeg...');

    await this.execCommand('apt-get install -y ffmpeg', {
      sudo: true,
      timeout: 180000
    });

    const version = await this.execCommand('ffmpeg -version');
    const versionMatch = version.stdout.match(/ffmpeg version (.+?) /);
    this.log(`FFmpeg ${versionMatch ? versionMatch[1] : 'instalado'} com sucesso`, 'success');

    return true;
  }

  /**
   * Instala Certbot (OPCIONAL)
   */
  async installCertbot() {
    this.log('Instalando Certbot...');

    await this.execCommand('apt-get install -y certbot python3-certbot-nginx', {
      sudo: true,
      timeout: 180000
    });

    const version = await this.execCommand('certbot --version');
    this.log(`Certbot ${version.stdout.trim()} instalado`, 'success');

    return true;
  }

  /**
   * Instala todas as dependências faltantes
   */
  async installMissing(missingDeps) {
    const results = {
      success: [],
      failed: []
    };

    for (const dep of missingDeps) {
      this.emit('progress', {
        dep,
        status: 'installing',
        message: `Instalando ${dep}...`
      });

      try {
        switch(dep) {
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
          case 'certbot':
            await this.installCertbot();
            break;
          default:
            throw new Error(`Unknown dependency: ${dep}`);
        }

        results.success.push(dep);

        this.emit('progress', {
          dep,
          status: 'installed',
          message: `${dep} instalado com sucesso`
        });

      } catch (error) {
        results.failed.push({ dep, error: error.message });

        this.log(`Falha ao instalar ${dep}: ${error.message}`, 'error');

        this.emit('error', {
          dep,
          status: 'failed',
          error: error.message
        });

        // Se for dependência crítica, interromper
        const critical = ['nodejs', 'pm2', 'nginx', 'postgresql'];
        if (critical.includes(dep)) {
          throw error;
        }
      }
    }

    return results;
  }

  /**
   * Atualiza apt cache
   */
  async updateAptCache() {
    this.log('Atualizando lista de pacotes apt...');
    await this.execCommand('apt-get update -qq', { sudo: true });
    this.log('Lista de pacotes atualizada', 'success');
  }
}

// Se executado diretamente
if (require.main === module) {
  const installer = new DependencyInstaller({ verbose: true });

  const deps = process.argv.slice(2);
  if (deps.length === 0) {
    console.log('Uso: node dependencies.js <dep1> <dep2> ...');
    console.log('Dependências disponíveis: nodejs, pm2, nginx, postgresql, redis, ffmpeg, certbot');
    process.exit(1);
  }

  (async () => {
    try {
      await installer.updateAptCache();
      const results = await installer.installMissing(deps);

      console.log('\n============================================');
      console.log(`✅ Instaladas com sucesso: ${results.success.join(', ')}`);
      if (results.failed.length > 0) {
        console.log(`❌ Falhas: ${results.failed.map(f => f.dep).join(', ')}`);
      }

      process.exit(results.failed.length === 0 ? 0 : 1);
    } catch (error) {
      console.error('❌ Erro fatal:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = DependencyInstaller;
