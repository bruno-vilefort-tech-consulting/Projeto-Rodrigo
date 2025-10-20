/**
 * MOD-17: DependencyWizard
 *
 * Responsabilidade: Detectar e instalar automaticamente todas as dependências necessárias
 *
 * Features:
 * - Detecção inteligente de dependências ausentes
 * - Instalação automática com feedback em tempo real
 * - Suporte a múltiplas distribuições Linux
 * - Instalação de Node.js 20 via nodesource
 * - Instalação de PostgreSQL 17 via repositório oficial
 * - Configuração de pnpm, PM2, Redis, Nginx
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import EventEmitter from 'events';

const execAsync = promisify(exec);

class DependencyWizard extends EventEmitter {
  constructor(logCallback = console.log) {
    super();
    this.log = logCallback;
    this.dependencies = {
      system: [
        { name: 'curl', package: 'curl', check: 'which curl' },
        { name: 'wget', package: 'wget', check: 'which wget' },
        { name: 'git', package: 'git', check: 'which git' },
        { name: 'build-essential', package: 'build-essential', check: 'which gcc' },
        { name: 'python3', package: 'python3', check: 'which python3' },
        { name: 'python3-pip', package: 'python3-pip', check: 'which pip3' }
      ],
      services: [
        { name: 'Node.js 20', check: this.checkNodeVersion.bind(this), install: this.installNode.bind(this) },
        { name: 'pnpm', check: this.checkPnpm.bind(this), install: this.installPnpm.bind(this) },
        { name: 'PM2', check: this.checkPM2.bind(this), install: this.installPM2.bind(this) },
        { name: 'PostgreSQL 17', check: this.checkPostgreSQL.bind(this), install: this.installPostgreSQL.bind(this) },
        { name: 'Redis', check: this.checkRedis.bind(this), install: this.installRedis.bind(this) },
        { name: 'Nginx', check: this.checkNginx.bind(this), install: this.installNginx.bind(this) }
      ]
    };
  }

  /**
   * Executa comando e retorna true se sucesso
   * @param {string} command - Comando a executar
   */
  async commandExists(command) {
    try {
      await execAsync(command, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Detecta todas as dependências ausentes
   * @returns {Promise<Object>} Dependências ausentes
   */
  async detectMissingDependencies() {
    this.emit('progress', {
      status: 'detecting_dependencies',
      message: '🔍 Detectando dependências...'
    });

    this.log('🔍 Detectando dependências ausentes...\n');

    const missing = {
      system: [],
      services: []
    };

    // Verificar dependências do sistema
    this.log('📦 Verificando pacotes do sistema:');
    for (const dep of this.dependencies.system) {
      const exists = await this.commandExists(dep.check);
      this.log(`  ${exists ? '✅' : '❌'} ${dep.name}`);

      if (!exists) {
        missing.system.push(dep);
      }
    }

    // Verificar serviços
    this.log('\n🛠️  Verificando serviços:');
    for (const dep of this.dependencies.services) {
      const exists = await dep.check();
      this.log(`  ${exists ? '✅' : '❌'} ${dep.name}`);

      if (!exists) {
        missing.services.push(dep);
      }
    }

    const totalMissing = missing.system.length + missing.services.length;

    this.log(`\n📊 Resumo: ${totalMissing} dependência(s) ausente(s)`);

    this.emit('progress', {
      status: 'dependencies_detected',
      missing,
      total: totalMissing,
      message: `Encontradas ${totalMissing} dependência(s) ausente(s)`
    });

    return missing;
  }

  /**
   * Instala todas as dependências ausentes
   * @param {Object} missing - Dependências ausentes
   */
  async installMissingDependencies(missing) {
    const total = missing.system.length + missing.services.length;

    if (total === 0) {
      this.log('✅ Todas as dependências já estão instaladas!');
      return;
    }

    this.emit('progress', {
      status: 'installing_dependencies',
      total,
      message: `Instalando ${total} dependência(s)...`
    });

    this.log(`\n📦 Instalando ${total} dependência(s)...\n`);

    // Atualizar repositórios
    this.log('🔄 Atualizando repositórios...');
    await execAsync('apt-get update -qq', { timeout: 120000 });

    // Instalar pacotes do sistema
    if (missing.system.length > 0) {
      const packages = missing.system.map(d => d.package).join(' ');
      this.log(`📦 Instalando pacotes: ${packages}`);

      await execAsync(`apt-get install -y -qq ${packages}`, {
        timeout: 300000
      });

      this.log('✅ Pacotes do sistema instalados');
    }

    // Instalar serviços
    let installed = 0;
    for (const dep of missing.services) {
      this.log(`\n🔧 Instalando ${dep.name}...`);

      await dep.install();

      installed++;

      this.emit('progress', {
        status: 'dependency_installed',
        name: dep.name,
        progress: installed,
        total: missing.services.length,
        message: `${dep.name} instalado (${installed}/${missing.services.length})`
      });
    }

    this.log('\n✅ Todas as dependências instaladas com sucesso!');

    this.emit('progress', {
      status: 'all_dependencies_installed',
      message: '✅ Todas as dependências instaladas'
    });
  }

  /**
   * Verifica versão do Node.js
   */
  async checkNodeVersion() {
    try {
      const { stdout } = await execAsync('node -v');
      const version = parseInt(stdout.replace('v', '').split('.')[0]);

      return version >= 20;
    } catch {
      return false;
    }
  }

  /**
   * Instala Node.js 20 via nodesource
   */
  async installNode() {
    this.log('  📥 Baixando script do NodeSource...');

    await execAsync('curl -fsSL https://deb.nodesource.com/setup_20.x | bash -', {
      timeout: 120000
    });

    this.log('  📦 Instalando Node.js 20...');

    await execAsync('apt-get install -y nodejs', {
      timeout: 300000
    });

    const { stdout } = await execAsync('node -v');
    this.log(`  ✅ Node.js ${stdout.trim()} instalado`);
  }

  /**
   * Verifica se pnpm está instalado
   */
  async checkPnpm() {
    return await this.commandExists('which pnpm');
  }

  /**
   * Instala pnpm globalmente
   */
  async installPnpm() {
    await execAsync('npm install -g pnpm', { timeout: 120000 });

    // Configurar pnpm
    await execAsync('pnpm config set strict-peer-dependencies false');
    await execAsync('pnpm config set auto-install-peers true');
    await execAsync('pnpm config set network-concurrency 50');

    this.log('  ✅ pnpm instalado e configurado');
  }

  /**
   * Verifica se PM2 está instalado
   */
  async checkPM2() {
    return await this.commandExists('which pm2');
  }

  /**
   * Instala PM2 globalmente
   */
  async installPM2() {
    await execAsync('npm install -g pm2', { timeout: 120000 });
    this.log('  ✅ PM2 instalado');
  }

  /**
   * Verifica se PostgreSQL está instalado
   */
  async checkPostgreSQL() {
    try {
      const { stdout } = await execAsync('psql --version');
      const version = parseInt(stdout.split(' ')[2]);

      return version >= 14;
    } catch {
      return false;
    }
  }

  /**
   * Instala PostgreSQL 17 via repositório oficial
   */
  async installPostgreSQL() {
    this.log('  📥 Adicionando repositório oficial do PostgreSQL...');

    // Adicionar chave GPG
    await execAsync(
      'wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -',
      { timeout: 60000 }
    );

    // Detectar codename da distribuição
    const { stdout: codename } = await execAsync('lsb_release -cs');
    const release = codename.trim();

    // Adicionar repositório
    await execAsync(
      `echo "deb http://apt.postgresql.org/pub/repos/apt ${release}-pgdg main" > /etc/apt/sources.list.d/pgdg.list`,
      { timeout: 10000 }
    );

    this.log('  🔄 Atualizando repositórios...');
    await execAsync('apt-get update -qq', { timeout: 120000 });

    this.log('  📦 Instalando PostgreSQL 17...');
    await execAsync('apt-get install -y -qq postgresql-17 postgresql-contrib-17', {
      timeout: 300000
    });

    // Iniciar serviço
    await execAsync('systemctl enable postgresql && systemctl start postgresql');

    const { stdout } = await execAsync('psql --version');
    this.log(`  ✅ ${stdout.trim()} instalado`);
  }

  /**
   * Verifica se Redis está instalado
   */
  async checkRedis() {
    return await this.commandExists('which redis-server');
  }

  /**
   * Instala Redis
   */
  async installRedis() {
    await execAsync('apt-get install -y -qq redis-server', {
      timeout: 120000
    });

    // Habilitar e iniciar
    await execAsync('systemctl enable redis-server && systemctl start redis-server');

    this.log('  ✅ Redis instalado e iniciado');
  }

  /**
   * Verifica se Nginx está instalado
   */
  async checkNginx() {
    return await this.commandExists('which nginx');
  }

  /**
   * Instala Nginx
   */
  async installNginx() {
    await execAsync('apt-get install -y -qq nginx', {
      timeout: 120000
    });

    // Habilitar e iniciar
    await execAsync('systemctl enable nginx && systemctl start nginx');

    this.log('  ✅ Nginx instalado e iniciado');
  }

  /**
   * Executa wizard completo (detecta e instala)
   */
  async runWizard() {
    this.log('🧙 Iniciando Wizard de Dependências...\n');

    this.emit('progress', {
      status: 'wizard_started',
      message: '🧙 Wizard de Dependências iniciado'
    });

    // Verificar se é root
    const { stdout: user } = await execAsync('whoami');
    if (user.trim() !== 'root') {
      throw new Error('Este wizard deve ser executado como root (use sudo)');
    }

    // Detectar dependências ausentes
    const missing = await this.detectMissingDependencies();

    const total = missing.system.length + missing.services.length;

    if (total === 0) {
      this.log('\n🎉 Todas as dependências já estão instaladas!');

      this.emit('progress', {
        status: 'wizard_completed',
        message: '✅ Todas as dependências OK'
      });

      return { success: true, installed: 0 };
    }

    // Perguntar se deseja instalar (em modo interativo)
    this.log(`\n❓ Deseja instalar ${total} dependência(s) agora? (Recomendado)`);
    this.log('   As seguintes dependências serão instaladas:');

    for (const dep of missing.system) {
      this.log(`     • ${dep.name}`);
    }

    for (const dep of missing.services) {
      this.log(`     • ${dep.name}`);
    }

    // Instalar automaticamente (não-interativo)
    await this.installMissingDependencies(missing);

    this.emit('progress', {
      status: 'wizard_completed',
      installed: total,
      message: `✅ Wizard concluído: ${total} dependência(s) instaladas`
    });

    return { success: true, installed: total };
  }
}

export default DependencyWizard;
