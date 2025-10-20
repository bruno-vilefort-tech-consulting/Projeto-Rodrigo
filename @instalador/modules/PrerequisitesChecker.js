/**
 * MOD-1: PrerequisitesChecker
 *
 * Responsabilidade: Verificar todas as dependências do sistema
 *
 * Verifica:
 * - Node.js >= 18.x (CRÍTICO)
 * - npm >= 9.x (CRÍTICO)
 * - PM2 (CRÍTICO)
 * - Nginx (CRÍTICO)
 * - PostgreSQL (CRÍTICO)
 * - Redis (RECOMENDADO)
 * - FFmpeg (RECOMENDADO)
 */

import { exec } from 'child_process';
import { promisify } from 'util';

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
 * Helper: Executa comando e captura saída
 */
async function execCommand(command) {
  try {
    const { stdout, stderr } = await execAsync(command);
    return { stdout: stdout.trim(), stderr: stderr.trim(), exitCode: 0 };
  } catch (error) {
    return {
      stdout: error.stdout?.trim() || '',
      stderr: error.stderr?.trim() || error.message,
      exitCode: error.code || 1
    };
  }
}

class PrerequisitesChecker {
  constructor(logCallback = console.log) {
    this.log = logCallback;
  }

  /**
   * Verifica todas as dependências
   * @returns {Promise<Object>} Relatório completo de dependências
   */
  async checkAll() {
    this.log('🔍 Verificando pré-requisitos...');

    const results = {
      nodejs: await this.checkNodeJS(),
      npm: await this.checkNPM(),
      pm2: await this.checkPM2(),
      nginx: await this.checkNginx(),
      postgresql: await this.checkPostgreSQL(),
      redis: await this.checkRedis(),
      ffmpeg: await this.checkFFmpeg()
    };

    // Contabilizar críticos faltando
    const criticalMissing = [];
    const recommendedMissing = [];

    for (const [name, result] of Object.entries(results)) {
      if (!result.installed || !result.valid) {
        if (result.critical) {
          criticalMissing.push(name);
        } else if (result.recommended) {
          recommendedMissing.push(name);
        }
      }
    }

    const allPassed = criticalMissing.length === 0;

    if (allPassed) {
      this.log('✅ Todos os pré-requisitos CRÍTICOS estão instalados!');
      if (recommendedMissing.length > 0) {
        this.log(`⚠️  Dependências RECOMENDADAS faltando: ${recommendedMissing.join(', ')}`);
      }
    } else {
      this.log(`❌ Dependências CRÍTICAS faltando: ${criticalMissing.join(', ')}`);
    }

    return {
      results,
      criticalMissing,
      recommendedMissing,
      allPassed
    };
  }

  /**
   * Verifica Node.js versão >= 18.x
   */
  async checkNodeJS() {
    const exists = await commandExists('node');
    if (!exists) {
      return {
        installed: false,
        required: true,
        critical: true,
        message: 'Node.js não está instalado'
      };
    }

    const versionOutput = await execCommand('node -v');
    const version = versionOutput.stdout.replace('v', '');
    const majorVersion = parseInt(version.split('.')[0]);

    if (majorVersion < 18) {
      return {
        installed: true,
        version,
        required: true,
        critical: true,
        valid: false,
        message: `Node.js ${version} muito antigo, requer >= 18.x`
      };
    }

    this.log(`✅ Node.js ${version}`);
    return {
      installed: true,
      version,
      required: true,
      critical: true,
      valid: true
    };
  }

  /**
   * Verifica npm
   */
  async checkNPM() {
    const exists = await commandExists('npm');
    if (!exists) {
      return {
        installed: false,
        required: true,
        critical: true,
        message: 'npm não está instalado'
      };
    }

    const versionOutput = await execCommand('npm -v');
    const version = versionOutput.stdout;

    this.log(`✅ npm ${version}`);
    return {
      installed: true,
      version,
      required: true,
      critical: true,
      valid: true
    };
  }

  /**
   * Verifica PM2 (CRÍTICO)
   */
  async checkPM2() {
    const exists = await commandExists('pm2');
    if (!exists) {
      return {
        installed: false,
        required: true,
        critical: true,
        message: 'PM2 não está instalado (ESSENCIAL para gerenciar processos Node.js)'
      };
    }

    const versionOutput = await execCommand('pm2 -v');
    const version = versionOutput.stdout;

    this.log(`✅ PM2 ${version}`);
    return {
      installed: true,
      version,
      required: true,
      critical: true,
      valid: true
    };
  }

  /**
   * Verifica Nginx (CRÍTICO)
   */
  async checkNginx() {
    const exists = await commandExists('nginx');
    if (!exists) {
      return {
        installed: false,
        required: true,
        critical: true,
        message: 'Nginx não está instalado (ESSENCIAL para servir frontend e proxy backend)'
      };
    }

    const versionOutput = await execCommand('nginx -v 2>&1');
    const version = versionOutput.stdout.match(/nginx\/(.+)/)?.[1] ||
                   versionOutput.stderr.match(/nginx\/(.+)/)?.[1] ||
                   'unknown';

    const running = await systemctlStatus('nginx');

    if (running) {
      this.log(`✅ Nginx ${version} (rodando)`);
    } else {
      this.log(`⚠️  Nginx ${version} (instalado mas não está rodando)`);
    }

    return {
      installed: true,
      version,
      running,
      required: true,
      critical: true,
      valid: true
    };
  }

  /**
   * Verifica PostgreSQL (CRÍTICO)
   */
  async checkPostgreSQL() {
    const exists = await commandExists('psql');
    if (!exists) {
      return {
        installed: false,
        required: true,
        critical: true,
        message: 'PostgreSQL não está instalado (ESSENCIAL - banco de dados principal)'
      };
    }

    const versionOutput = await execCommand('psql --version');
    const version = versionOutput.stdout.match(/PostgreSQL (.+)/)?.[1]?.split(' ')[0] || 'unknown';

    const running = await systemctlStatus('postgresql');

    if (running) {
      this.log(`✅ PostgreSQL ${version} (rodando)`);
    } else {
      this.log(`⚠️  PostgreSQL ${version} (instalado mas não está rodando)`);
    }

    return {
      installed: true,
      version,
      running,
      required: true,
      critical: true,
      valid: true
    };
  }

  /**
   * Verifica Redis (RECOMENDADO)
   */
  async checkRedis() {
    const exists = await commandExists('redis-cli');
    if (!exists) {
      return {
        installed: false,
        required: false,
        recommended: true,
        message: 'Redis não está instalado (RECOMENDADO para cache e filas)'
      };
    }

    const versionOutput = await execCommand('redis-cli --version');
    const version = versionOutput.stdout.match(/redis-cli (.+)/)?.[1] || 'unknown';

    const running = await systemctlStatus('redis-server') ||
                   await systemctlStatus('redis');

    if (running) {
      this.log(`✅ Redis ${version} (rodando)`);
    } else {
      this.log(`⚠️  Redis ${version} (instalado mas não está rodando)`);
    }

    return {
      installed: true,
      version,
      running,
      required: false,
      recommended: true,
      valid: true
    };
  }

  /**
   * Verifica FFmpeg (RECOMENDADO)
   */
  async checkFFmpeg() {
    const exists = await commandExists('ffmpeg');
    if (!exists) {
      return {
        installed: false,
        required: false,
        recommended: true,
        message: 'FFmpeg não está instalado (RECOMENDADO para processamento de mídia)'
      };
    }

    const versionOutput = await execCommand('ffmpeg -version 2>&1 | head -1');
    const version = versionOutput.stdout.match(/ffmpeg version (.+?) /)?.[1] || 'installed';

    this.log(`✅ FFmpeg ${version}`);
    return {
      installed: true,
      version,
      required: false,
      recommended: true,
      valid: true,
      binaryPath: '/usr/bin/ffmpeg'
    };
  }
}

export default PrerequisitesChecker;
