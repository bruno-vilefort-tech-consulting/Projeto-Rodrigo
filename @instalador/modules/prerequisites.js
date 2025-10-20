#!/usr/bin/env node

/**
 * MOD-1: PrerequisitesChecker
 * Módulo responsável por verificar todas as dependências do sistema
 */

const { execSync } = require('child_process');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

class PrerequisitesChecker {
  constructor() {
    this.results = {};
  }

  /**
   * Helper: Executa comando e retorna output
   */
  async execCommand(command) {
    try {
      const { stdout, stderr } = await exec(command);
      return stdout || stderr;
    } catch (error) {
      throw new Error(`Command failed: ${error.message}`);
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
   * Helper: Verifica status do serviço via systemctl
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
   * Verifica Node.js versão >= 18.x
   */
  async checkNodeJS() {
    const exists = await this.commandExists('node');
    if (!exists) {
      return { installed: false, required: true };
    }

    const versionOutput = await this.execCommand('node -v');
    const version = versionOutput.trim().replace('v', '');
    const majorVersion = parseInt(version.split('.')[0]);

    if (majorVersion < 18) {
      return {
        installed: true,
        version,
        required: true,
        valid: false,
        message: `Node.js ${version} muito antigo, requer >= 18.x`
      };
    }

    return {
      installed: true,
      version,
      required: true,
      valid: true
    };
  }

  /**
   * Verifica NPM
   */
  async checkNPM() {
    const exists = await this.commandExists('npm');
    if (!exists) {
      return {
        installed: false,
        required: true,
        message: 'NPM não está instalado'
      };
    }

    const version = await this.execCommand('npm -v');
    return {
      installed: true,
      version: version.trim(),
      required: true
    };
  }

  /**
   * Verifica se PM2 está instalado (CRÍTICO)
   */
  async checkPM2() {
    const exists = await this.commandExists('pm2');
    if (exists) {
      const version = await this.execCommand('pm2 -v');
      return {
        installed: true,
        version: version.trim(),
        required: true
      };
    }
    return {
      installed: false,
      required: true,
      critical: true,
      message: 'PM2 é ESSENCIAL para gerenciar processos Node.js'
    };
  }

  /**
   * Verifica se Nginx está instalado e rodando (CRÍTICO)
   */
  async checkNginx() {
    const exists = await this.commandExists('nginx');
    if (!exists) {
      return {
        installed: false,
        required: true,
        critical: true,
        message: 'Nginx é ESSENCIAL para servir frontend e proxy backend'
      };
    }

    const versionOutput = await this.execCommand('nginx -v 2>&1');
    const version = versionOutput.match(/nginx\/(.+)/)?.[1] || 'unknown';

    const running = await this.systemctlStatus('nginx');

    return {
      installed: true,
      version,
      running,
      required: true
    };
  }

  /**
   * Verifica se PostgreSQL está instalado e rodando (CRÍTICO)
   */
  async checkPostgreSQL() {
    const exists = await this.commandExists('psql');
    if (!exists) {
      return {
        installed: false,
        required: true,
        critical: true,
        message: 'PostgreSQL é ESSENCIAL - banco de dados principal'
      };
    }

    const versionOutput = await this.execCommand('psql --version');
    const version = versionOutput.match(/PostgreSQL (.+)/)?.[1] || 'unknown';

    const running = await this.systemctlStatus('postgresql');

    return {
      installed: true,
      version,
      running,
      required: true
    };
  }

  /**
   * Verifica se Redis está instalado (RECOMENDADO)
   */
  async checkRedis() {
    const exists = await this.commandExists('redis-cli');
    if (!exists) {
      return {
        installed: false,
        required: false,
        recommended: true,
        message: 'Redis é recomendado para cache e filas'
      };
    }

    const versionOutput = await this.execCommand('redis-cli --version');
    const version = versionOutput.match(/redis-cli (.+)/)?.[1] || 'unknown';

    const running = await this.systemctlStatus('redis-server') ||
                    await this.systemctlStatus('redis');

    return {
      installed: true,
      version,
      running,
      required: false,
      recommended: true
    };
  }

  /**
   * Verifica se FFmpeg está instalado (RECOMENDADO)
   */
  async checkFFmpeg() {
    const exists = await this.commandExists('ffmpeg');
    if (!exists) {
      return {
        installed: false,
        required: false,
        recommended: true,
        message: 'FFmpeg é recomendado para processamento de mídia'
      };
    }

    const versionOutput = await this.execCommand('ffmpeg -version');
    const version = versionOutput.split('\n')[0].match(/ffmpeg version (.+?) /)?.[1] || 'unknown';

    return {
      installed: true,
      version,
      required: false,
      recommended: true
    };
  }

  /**
   * Verifica se Certbot está instalado (OPCIONAL)
   */
  async checkCertbot() {
    const exists = await this.commandExists('certbot');
    if (!exists) {
      return {
        installed: false,
        required: false,
        optional: true,
        message: 'Certbot é opcional para certificados SSL/TLS'
      };
    }

    const version = await this.execCommand('certbot --version');
    return {
      installed: true,
      version: version.trim(),
      required: false,
      optional: true
    };
  }

  /**
   * Verifica todas as dependências e retorna relatório completo
   */
  async checkAll() {
    const results = {
      nodejs: await this.checkNodeJS(),
      npm: await this.checkNPM(),
      pm2: await this.checkPM2(),
      nginx: await this.checkNginx(),
      postgresql: await this.checkPostgreSQL(),
      redis: await this.checkRedis(),
      ffmpeg: await this.checkFFmpeg(),
      certbot: await this.checkCertbot()
    };

    this.results = results;
    return results;
  }

  /**
   * Retorna lista de dependências críticas faltando
   */
  getMissingCritical() {
    const missing = [];
    for (const [dep, result] of Object.entries(this.results)) {
      if (result.required && !result.installed) {
        missing.push(dep);
      }
      if (result.installed && result.valid === false) {
        missing.push(dep);
      }
    }
    return missing;
  }

  /**
   * Retorna lista de dependências recomendadas faltando
   */
  getMissingRecommended() {
    const missing = [];
    for (const [dep, result] of Object.entries(this.results)) {
      if (result.recommended && !result.installed) {
        missing.push(dep);
      }
    }
    return missing;
  }

  /**
   * Imprime relatório formatado no console
   */
  printReport() {
    const colors = {
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      reset: '\x1b[0m'
    };

    console.log('\n🔍 Relatório de Pré-requisitos ChatIA v5.0.0\n');

    for (const [dep, result] of Object.entries(this.results)) {
      if (result.installed) {
        const status = result.valid === false ?
          `${colors.red}❌ ${dep} ${result.version} (${result.message})${colors.reset}` :
          `${colors.green}✅ ${dep} ${result.version}${colors.reset}`;
        console.log(status);

        if (result.running !== undefined) {
          const runningStatus = result.running ?
            `${colors.green}   └─ Serviço rodando${colors.reset}` :
            `${colors.yellow}   └─ Serviço instalado mas não está rodando${colors.reset}`;
          console.log(runningStatus);
        }
      } else {
        const priority = result.critical ? 'CRÍTICO' :
                        result.recommended ? 'RECOMENDADO' :
                        'OPCIONAL';
        const color = result.critical ? colors.red : colors.yellow;
        console.log(`${color}❌ ${dep} não instalado (${priority})${colors.reset}`);
      }
    }

    console.log('\n============================================');

    const missingCritical = this.getMissingCritical();
    const missingRecommended = this.getMissingRecommended();

    if (missingCritical.length === 0) {
      console.log(`${colors.green}✅ Todos os pré-requisitos CRÍTICOS estão instalados!${colors.reset}`);
      if (missingRecommended.length > 0) {
        console.log(`${colors.yellow}⚠️  Dependências RECOMENDADAS faltando:${colors.reset}`);
        missingRecommended.forEach(dep => console.log(`   - ${dep}`));
      }
    } else {
      console.log(`${colors.red}❌ Dependências CRÍTICAS faltando:${colors.reset}`);
      missingCritical.forEach(dep => console.log(`   - ${dep}`));
    }

    console.log('');
  }

  /**
   * Retorna se todos os pré-requisitos críticos foram atendidos
   */
  isReady() {
    return this.getMissingCritical().length === 0;
  }
}

// Se executado diretamente, rodar verificação
if (require.main === module) {
  (async () => {
    const checker = new PrerequisitesChecker();
    await checker.checkAll();
    checker.printReport();
    process.exit(checker.isReady() ? 0 : 1);
  })();
}

module.exports = PrerequisitesChecker;
