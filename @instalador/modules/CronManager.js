/**
 * MOD-16: CronManager
 *
 * Responsabilidade: Gerenciar tarefas agendadas (cron jobs)
 *
 * Features:
 * - Criação de cron jobs
 * - Listagem de crons existentes
 * - Remoção de crons
 * - Backup automático do banco de dados
 * - Limpeza de logs antigos
 * - Renovação de certificados SSL
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import EventEmitter from 'events';

const execAsync = promisify(exec);

class CronManager extends EventEmitter {
  constructor(logCallback = console.log) {
    super();
    this.log = logCallback;
    this.cronDir = '/etc/cron.d';
  }

  /**
   * Cria um cron job
   * @param {string} name - Nome do cron
   * @param {string} schedule - Expressão cron (ex: "0 2 * * *")
   * @param {string} command - Comando a executar
   * @param {string} user - Usuário que executará (default: root)
   */
  async createCron(name, schedule, command, user = 'root') {
    const cronFile = path.join(this.cronDir, name);

    this.emit('progress', {
      status: 'creating_cron',
      name,
      message: `Criando cron: ${name}`
    });

    this.log(`⏰ Criando cron job: ${name}`);
    this.log(`   Schedule: ${schedule}`);
    this.log(`   Command: ${command}`);

    const cronContent = `# ${name} - Managed by ChatIA Installer
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

${schedule} ${user} ${command}
`;

    try {
      await fs.writeFile(cronFile, cronContent, { mode: 0o644 });

      this.log(`✅ Cron job criado: ${cronFile}`);

      this.emit('progress', {
        status: 'cron_created',
        name,
        file: cronFile,
        message: `✅ Cron criado: ${name}`
      });

      return true;

    } catch (err) {
      this.log(`❌ Erro ao criar cron: ${err.message}`);
      throw err;
    }
  }

  /**
   * Lista todos os cron jobs do sistema
   */
  async listCrons() {
    this.log('📋 Listando cron jobs...');

    try {
      // Listar crontabs de usuários
      const { stdout: userCrons } = await execAsync('crontab -l 2>/dev/null || echo "Nenhum cron de usuário"');

      // Listar crons do sistema
      const files = await fs.readdir(this.cronDir);
      const systemCrons = files.filter(f => !f.startsWith('.'));

      this.log('\n📅 Cron jobs de usuário:');
      this.log(userCrons);

      this.log('\n📅 Cron jobs do sistema:');
      for (const file of systemCrons) {
        const content = await fs.readFile(path.join(this.cronDir, file), 'utf-8');
        this.log(`\n--- ${file} ---`);
        this.log(content);
      }

      return { userCrons, systemCrons };

    } catch (err) {
      this.log(`⚠️  Erro ao listar crons: ${err.message}`);
      return { userCrons: '', systemCrons: [] };
    }
  }

  /**
   * Remove um cron job
   * @param {string} name - Nome do cron
   */
  async removeCron(name) {
    const cronFile = path.join(this.cronDir, name);

    this.log(`🗑️  Removendo cron job: ${name}`);

    try {
      await fs.unlink(cronFile);
      this.log(`✅ Cron removido: ${cronFile}`);
      return true;

    } catch (err) {
      if (err.code === 'ENOENT') {
        this.log(`ℹ️  Cron não existe: ${name}`);
        return false;
      }
      throw err;
    }
  }

  /**
   * Configura backup automático do banco de dados
   * @param {Object} config - Configuração
   */
  async setupDatabaseBackup(config) {
    const { companySlug, db, backupDir = '/home/deploy/backups' } = config;

    this.emit('progress', {
      status: 'setting_up_backup',
      message: 'Configurando backup automático do banco...'
    });

    this.log('💾 Configurando backup automático do banco de dados...');

    // Criar diretório de backups
    await execAsync(`mkdir -p ${backupDir}/${companySlug}`);
    await execAsync(`chown -R deploy:deploy ${backupDir}`);

    // Script de backup
    const backupScript = `/home/deploy/${companySlug}/scripts/db-backup.sh`;

    const scriptContent = `#!/bin/bash
# Backup automático do banco de dados - ${companySlug}

BACKUP_DIR="${backupDir}/${companySlug}"
DB_NAME="${db.database}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_\${TIMESTAMP}.sql.gz"

# Criar backup
PGPASSWORD="${db.password}" pg_dump -h ${db.host} -U ${db.user} -d $DB_NAME | gzip > "$BACKUP_FILE"

# Verificar se backup foi criado
if [ -f "$BACKUP_FILE" ]; then
  echo "✅ Backup criado: $BACKUP_FILE"

  # Manter apenas backups dos últimos 7 dias
  find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +7 -delete

  echo "🧹 Backups antigos removidos"
else
  echo "❌ Falha ao criar backup"
  exit 1
fi
`;

    // Criar script
    await execAsync(`mkdir -p /home/deploy/${companySlug}/scripts`);
    await fs.writeFile(backupScript, scriptContent, { mode: 0o755 });

    // Criar cron (todo dia às 2h da manhã)
    await this.createCron(
      `${companySlug}-db-backup`,
      '0 2 * * *',
      backupScript,
      'deploy'
    );

    this.log('✅ Backup automático configurado');
    this.log(`   Backups salvos em: ${backupDir}/${companySlug}`);
    this.log('   Frequência: Diariamente às 2h da manhã');
    this.log('   Retenção: 7 dias');

    this.emit('progress', {
      status: 'backup_configured',
      message: '✅ Backup automático configurado'
    });
  }

  /**
   * Configura limpeza automática de logs
   * @param {string} companySlug - Slug da empresa
   */
  async setupLogCleanup(companySlug) {
    this.emit('progress', {
      status: 'setting_up_log_cleanup',
      message: 'Configurando limpeza automática de logs...'
    });

    this.log('🧹 Configurando limpeza automática de logs...');

    const cleanupScript = `/home/deploy/${companySlug}/scripts/log-cleanup.sh`;

    const scriptContent = `#!/bin/bash
# Limpeza automática de logs - ${companySlug}

LOG_DIR="/home/deploy/${companySlug}/backend/logs"

# Remover logs com mais de 30 dias
find "$LOG_DIR" -name "*.log" -mtime +30 -delete 2>/dev/null

# Comprimir logs com mais de 7 dias
find "$LOG_DIR" -name "*.log" -mtime +7 -exec gzip {} \\; 2>/dev/null

echo "🧹 Logs limpos: $(date)"
`;

    // Criar script
    await fs.writeFile(cleanupScript, scriptContent, { mode: 0o755 });

    // Criar cron (toda segunda-feira às 3h da manhã)
    await this.createCron(
      `${companySlug}-log-cleanup`,
      '0 3 * * 1',
      cleanupScript,
      'deploy'
    );

    this.log('✅ Limpeza automática de logs configurada');
    this.log('   Frequência: Semanalmente (segundas-feiras às 3h)');
    this.log('   Logs > 30 dias: Removidos');
    this.log('   Logs > 7 dias: Comprimidos');

    this.emit('progress', {
      status: 'log_cleanup_configured',
      message: '✅ Limpeza de logs configurada'
    });
  }

  /**
   * Configura limpeza de cache Redis
   * @param {string} companySlug - Slug da empresa
   */
  async setupRedisCacheCleanup(companySlug) {
    this.emit('progress', {
      status: 'setting_up_redis_cleanup',
      message: 'Configurando limpeza de cache Redis...'
    });

    this.log('🗄️  Configurando limpeza de cache Redis...');

    const cleanupScript = `/home/deploy/${companySlug}/scripts/redis-cleanup.sh`;

    const scriptContent = `#!/bin/bash
# Limpeza de cache Redis - ${companySlug}

# Flush caches expirados
redis-cli FLUSHDB ASYNC 2>/dev/null || echo "Redis não disponível"

echo "🗄️  Cache Redis limpo: $(date)"
`;

    // Criar script
    await fs.writeFile(cleanupScript, scriptContent, { mode: 0o755 });

    // Criar cron (todo domingo às 4h da manhã)
    await this.createCron(
      `${companySlug}-redis-cleanup`,
      '0 4 * * 0',
      cleanupScript,
      'deploy'
    );

    this.log('✅ Limpeza de cache Redis configurada');
    this.log('   Frequência: Semanalmente (domingos às 4h)');

    this.emit('progress', {
      status: 'redis_cleanup_configured',
      message: '✅ Limpeza Redis configurada'
    });
  }

  /**
   * Configura todos os crons recomendados
   * @param {Object} config - Configuração completa
   */
  async setupAllCrons(config) {
    this.log('⚙️  Configurando todos os crons recomendados...');

    try {
      // Backup do banco
      await this.setupDatabaseBackup(config);

      // Limpeza de logs
      await this.setupLogCleanup(config.companySlug);

      // Limpeza de cache Redis
      await this.setupRedisCacheCleanup(config.companySlug);

      this.log('✅ Todos os crons configurados com sucesso');

      this.emit('progress', {
        status: 'all_crons_configured',
        message: '✅ Todos os crons configurados'
      });

      return true;

    } catch (err) {
      this.log(`❌ Erro ao configurar crons: ${err.message}`);
      throw err;
    }
  }
}

export default CronManager;
