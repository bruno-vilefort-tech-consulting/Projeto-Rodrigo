/**
 * MOD-5: PNPMSymlinkCreator (CRÍTICO)
 *
 * Responsabilidade: Criar symlinks PNPM faltando no node_modules
 *
 * PROBLEMA RESOLVIDO:
 * O backend_node_modules.tar.gz contém apenas .pnpm/ store sem symlinks principais.
 * Quando extraído, o backend não consegue carregar módulos:
 *   - Error: Cannot find module 'express'
 *   - Error: Cannot find module '@sentry/node'
 *
 * Este módulo cria todos os symlinks necessários:
 * 1. Módulos normais (express, debug, etc) -> .pnpm/express@4.21.2/node_modules/express
 * 2. Módulos scoped (@sentry/node, etc) -> .pnpm/@sentry+node@8.42.0/node_modules/@sentry/node
 *
 * VALIDAÇÃO: Testa se módulos críticos podem ser carregados via require()
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import EventEmitter from 'events';

const execAsync = promisify(exec);

class PNPMSymlinkCreator extends EventEmitter {
  constructor(logCallback = console.log) {
    super();
    this.log = logCallback;
  }

  /**
   * Cria todos os symlinks PNPM no node_modules
   * @param {string} nodeModulesDir - Caminho para node_modules/
   */
  async createSymlinks(nodeModulesDir) {
    this.emit('progress', {
      status: 'creating_symlinks',
      message: 'Criando symlinks PNPM...'
    });

    const pnpmDir = path.join(nodeModulesDir, '.pnpm');

    // Verificar se .pnpm/ existe
    try {
      await fs.access(pnpmDir);
    } catch {
      throw new Error('.pnpm/ directory not found - cannot create symlinks');
    }

    let totalCreated = 0;

    // 1. Symlinks para módulos normais (express, debug, etc)
    this.log('🔗 Criando symlinks para módulos normais...');
    const normalModules = await this.createNormalSymlinks(nodeModulesDir, pnpmDir);
    totalCreated += normalModules;

    // 2. Symlinks para módulos scoped (@sentry/node, @cacheable/*, etc)
    this.log('🔗 Criando symlinks para módulos scoped...');
    const scopedModules = await this.createScopedSymlinks(nodeModulesDir, pnpmDir);
    totalCreated += scopedModules;

    this.emit('progress', {
      status: 'symlinks_created',
      count: totalCreated,
      message: `✅ ${totalCreated} symlinks criados`
    });

    // Validar módulos críticos
    this.log('🔍 Validando módulos críticos...');
    await this.validateCriticalModules(nodeModulesDir);

    return totalCreated;
  }

  /**
   * Cria symlinks para módulos normais (não scoped)
   * @param {string} nodeModulesDir - node_modules/ principal
   * @param {string} pnpmDir - .pnpm/ store
   */
  async createNormalSymlinks(nodeModulesDir, pnpmDir) {
    let count = 0;

    // Listar diretórios em .pnpm/
    const pnpmPackages = await fs.readdir(pnpmDir);

    for (const packageDir of pnpmPackages) {
      const packagePath = path.join(pnpmDir, packageDir, 'node_modules');

      // Verificar se existe node_modules/ dentro deste pacote
      try {
        await fs.access(packagePath);
      } catch {
        continue; // Não tem node_modules/, pular
      }

      // Listar módulos dentro deste pacote
      const modules = await fs.readdir(packagePath);

      for (const moduleName of modules) {
        // Ignorar .pnpm, .bin, e módulos scoped (começam com @)
        if (moduleName === '.pnpm' ||
            moduleName === '.bin' ||
            moduleName.startsWith('@')) {
          continue;
        }

        const targetLink = path.join(nodeModulesDir, moduleName);

        // Criar symlink se não existir
        try {
          await fs.access(targetLink);
          // Já existe, pular
        } catch {
          // Não existe, criar symlink
          const sourcePath = path.join(packagePath, moduleName);

          try {
            await fs.symlink(sourcePath, targetLink, 'dir');
            count++;
          } catch (err) {
            // Ignorar erro EEXIST (alguém criou entre o check e o symlink)
            if (err.code !== 'EEXIST') {
              this.log(`⚠️  Failed to create symlink for ${moduleName}: ${err.message}`);
            }
          }
        }
      }
    }

    this.log(`  ✅ Criados ${count} symlinks normais`);
    return count;
  }

  /**
   * Cria symlinks para módulos scoped (@org/package)
   * @param {string} nodeModulesDir - node_modules/ principal
   * @param {string} pnpmDir - .pnpm/ store
   */
  async createScopedSymlinks(nodeModulesDir, pnpmDir) {
    let count = 0;

    // Listar diretórios em .pnpm/
    const pnpmPackages = await fs.readdir(pnpmDir);

    for (const packageDir of pnpmPackages) {
      const packagePath = path.join(pnpmDir, packageDir, 'node_modules');

      // Verificar se existe node_modules/ dentro deste pacote
      try {
        await fs.access(packagePath);
      } catch {
        continue; // Não tem node_modules/, pular
      }

      // Procurar por diretórios @ (scoped packages)
      const items = await fs.readdir(packagePath);

      for (const item of items) {
        if (!item.startsWith('@')) {
          continue; // Não é scoped, pular
        }

        const scopeDir = path.join(packagePath, item);

        // Verificar se é diretório
        const scopeStat = await fs.stat(scopeDir);
        if (!scopeStat.isDirectory()) {
          continue;
        }

        // Listar pacotes dentro do scope
        const scopedPackages = await fs.readdir(scopeDir);

        for (const packageName of scopedPackages) {
          const sourcePath = path.join(scopeDir, packageName);

          // Criar diretório scope se não existir
          const targetScopeDir = path.join(nodeModulesDir, item);
          await fs.mkdir(targetScopeDir, { recursive: true });

          // Criar symlink
          const targetLink = path.join(targetScopeDir, packageName);

          try {
            await fs.access(targetLink);
            // Já existe, pular
          } catch {
            // Não existe, criar symlink
            try {
              // Calcular caminho relativo para symlink funcionar corretamente
              const relativePath = path.relative(targetScopeDir, sourcePath);
              await fs.symlink(relativePath, targetLink, 'dir');
              count++;
            } catch (err) {
              if (err.code !== 'EEXIST') {
                this.log(`⚠️  Failed to create symlink for ${item}/${packageName}: ${err.message}`);
              }
            }
          }
        }
      }
    }

    this.log(`  ✅ Criados ${count} symlinks scoped`);
    return count;
  }

  /**
   * Valida que módulos críticos podem ser carregados
   * @param {string} nodeModulesDir - node_modules/ directory
   */
  async validateCriticalModules(nodeModulesDir) {
    const criticalModules = [
      'express',
      'debug',
      'sequelize',
      '@sentry/node',
      '@whiskeysockets/baileys',
      'socket.io',
      'bull',
      'ioredis'
    ];

    this.log('🔍 Validando módulos críticos...');

    for (const moduleName of criticalModules) {
      // Verificar se symlink existe
      const modulePath = moduleName.includes('/')
        ? path.join(nodeModulesDir, ...moduleName.split('/'))
        : path.join(nodeModulesDir, moduleName);

      try {
        await fs.access(modulePath);
      } catch {
        throw new Error(`CRITICAL: Module '${moduleName}' not found after symlink creation`);
      }

      // Testar se pode ser carregado via require
      const backendDir = path.dirname(nodeModulesDir);
      const testCommand = `cd "${backendDir}" && node -e "require('${moduleName}')"`;

      try {
        await execAsync(testCommand, { timeout: 10000 });
        this.log(`  ✅ ${moduleName}`);
      } catch (err) {
        throw new Error(`CRITICAL: Module '${moduleName}' cannot be loaded: ${err.message}`);
      }
    }

    this.log('✅ Todos os módulos críticos validados');
    return true;
  }
}

export default PNPMSymlinkCreator;
