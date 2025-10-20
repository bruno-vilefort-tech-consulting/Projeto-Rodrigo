/**
 * MOD-7: DatabaseSetup
 *
 * Responsabilidade: Criar banco de dados PostgreSQL e executar migrations
 *
 * Features:
 * - Criação de database idempotente
 * - Concessão de privilégios
 * - Execução de migrations Sequelize (opcional)
 * - Verificação de existência antes de criar
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import EventEmitter from 'events';

const execAsync = promisify(exec);

class DatabaseSetup extends EventEmitter {
  constructor(logCallback = console.log) {
    super();
    this.log = logCallback;
  }

  /**
   * Cria database e concede privilégios
   * @param {Object} config - Configuração do banco
   */
  async createDatabase(config) {
    this.emit('progress', {
      status: 'creating_database',
      message: 'Criando banco de dados...'
    });

    // Verificar se banco já existe
    const exists = await this.databaseExists(config.db.database);

    if (exists) {
      this.log(`⚠️  Database ${config.db.database} já existe`);
      this.emit('warning', {
        message: `Database ${config.db.database} already exists`
      });
    } else {
      // Criar database
      await execAsync(
        `sudo -u postgres psql -c "CREATE DATABASE ${config.db.database};"`
      );

      // Conceder privilégios
      await execAsync(
        `sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${config.db.database} TO ${config.db.user};"`
      );

      this.log(`✅ Database ${config.db.database} criado`);
    }

    this.emit('progress', {
      status: 'database_created',
      database: config.db.database,
      message: `✅ Database ${config.db.database} pronto`
    });

    // Executar migrations se existir
    const backendDir = `/home/deploy/${config.companySlug}/backend`;
    const migrationsDir = path.join(backendDir, 'database/migrations');

    try {
      await fs.access(migrationsDir);
      this.log('🔄 Migrations encontradas, executando...');

      this.emit('progress', {
        status: 'running_migrations',
        message: 'Executando migrations...'
      });

      await this.runMigrations(backendDir, config);
    } catch {
      this.log('ℹ️  Nenhuma migration encontrada, pulando...');
    }
  }

  /**
   * Verifica se database existe
   * @param {string} dbName - Nome do banco
   */
  async databaseExists(dbName) {
    try {
      const { stdout } = await execAsync(
        `sudo -u postgres psql -lqt | cut -d \\| -f 1 | grep -qw ${dbName} && echo "exists" || echo "not-exists"`
      );
      return stdout.trim() === 'exists';
    } catch {
      return false;
    }
  }

  /**
   * Executa migrations do Sequelize
   * @param {string} backendDir - Diretório do backend
   * @param {Object} config - Configuração
   */
  async runMigrations(backendDir, config) {
    // Criar .sequelizerc temporário com configurações
    const sequelizerc = `
const path = require('path');
module.exports = {
  'config': path.resolve('config', 'database.js'),
  'models-path': path.resolve('models'),
  'migrations-path': path.resolve('database', 'migrations'),
  'seeders-path': path.resolve('database', 'seeders')
};
    `;

    await fs.writeFile(
      path.join(backendDir, '.sequelizerc'),
      sequelizerc
    );

    // Executar migrations
    const command = `cd ${backendDir} && npx sequelize-cli db:migrate`;

    try {
      const env = {
        ...process.env,
        DB_HOST: config.db.host,
        DB_PORT: config.db.port,
        DB_USER: config.db.user,
        DB_PASS: config.db.password,
        DB_NAME: config.db.database
      };

      const { stdout, stderr } = await execAsync(command, {
        timeout: 120000,
        env
      });

      this.log('📊 Migrations output:');
      if (stdout) this.log(stdout);

      this.emit('progress', {
        status: 'migrations_completed',
        message: '✅ Migrations executadas'
      });

    } catch (err) {
      this.log(`⚠️  Migrations failed: ${err.message}`);
      this.emit('warning', {
        message: `Migrations failed: ${err.message}`,
        details: 'Database created but migrations not run. You may need to run them manually.'
      });
    }
  }

  /**
   * Executa seeds do Sequelize (dados iniciais)
   * @param {string} backendDir - Diretório do backend
   * @param {Object} config - Configuração
   */
  async runSeeds(backendDir, config) {
    const seedersDir = path.join(backendDir, 'database/seeders');

    try {
      await fs.access(seedersDir);
    } catch {
      this.log('ℹ️  Nenhum seeder encontrado, pulando...');
      return;
    }

    this.emit('progress', {
      status: 'running_seeds',
      message: 'Executando seeders (dados iniciais)...'
    });

    const command = `cd ${backendDir} && npx sequelize-cli db:seed:all`;

    try {
      const env = {
        ...process.env,
        DB_HOST: config.db.host,
        DB_PORT: config.db.port,
        DB_USER: config.db.user,
        DB_PASS: config.db.password,
        DB_NAME: config.db.database
      };

      const { stdout, stderr } = await execAsync(command, {
        timeout: 120000,
        env
      });

      this.log('🌱 Seeds output:');
      if (stdout) this.log(stdout);

      this.emit('progress', {
        status: 'seeds_completed',
        message: '✅ Seeders executados'
      });

    } catch (err) {
      this.log(`⚠️  Seeds failed: ${err.message}`);
      this.emit('warning', {
        message: `Seeds failed: ${err.message}`,
        details: 'Database and migrations OK, but seeders failed. You may need to run them manually.'
      });
    }
  }

  /**
   * Importa backup SQL (arquivo .sql)
   * @param {string} sqlFilePath - Caminho do arquivo SQL
   * @param {Object} config - Configuração do banco
   */
  async importSqlBackup(sqlFilePath, config) {
    try {
      await fs.access(sqlFilePath);
    } catch {
      throw new Error(`Arquivo SQL não encontrado: ${sqlFilePath}`);
    }

    this.emit('progress', {
      status: 'importing_sql',
      message: `Importando backup SQL: ${path.basename(sqlFilePath)}`
    });

    this.log(`📥 Importando backup SQL: ${sqlFilePath}`);

    const command = `sudo -u postgres psql -d ${config.db.database} < ${sqlFilePath}`;

    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: 1800000, // 30 minutos
        maxBuffer: 50 * 1024 * 1024 // 50MB
      });

      if (stderr && stderr.includes('ERROR')) {
        throw new Error(stderr);
      }

      this.log('✅ Backup SQL importado com sucesso');

      this.emit('progress', {
        status: 'sql_imported',
        message: '✅ Backup SQL importado'
      });

    } catch (err) {
      this.log(`❌ Erro ao importar SQL: ${err.message}`);
      throw err;
    }
  }
}

export default DatabaseSetup;
