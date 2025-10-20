/**
 * MOD-4: FileExtractor
 *
 * Responsabilidade: Extrair arquivos tar.gz com stripComponents correto
 *
 * Features:
 * - Extração com --strip-components
 * - Substituição de __EMPRESA__ pelo slug
 * - Validação pós-extração específica por artefato
 * - Contagem de arquivos extraídos
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import EventEmitter from 'events';

const execAsync = promisify(exec);

class FileExtractor extends EventEmitter {
  constructor(logCallback = console.log) {
    super();
    this.log = logCallback;
  }

  /**
   * Extrai todos os artefatos para seus diretórios destino
   * @param {Object} manifest - Manifest com artifacts
   * @param {string} downloadDir - Diretório onde estão os tar.gz
   * @param {string} companySlug - Nome da empresa (ex: v2)
   */
  async extractArtifacts(manifest, downloadDir, companySlug) {
    for (const artifact of manifest.artifacts) {
      this.emit('progress', {
        artifact: artifact.name,
        status: 'extracting',
        message: `Extraindo ${artifact.name}...`
      });

      try {
        const archivePath = path.join(downloadDir, `${artifact.name}.tar.gz`);
        const targetDir = artifact.targetDir.replace('__EMPRESA__', companySlug);

        // Criar diretório de destino
        await fs.mkdir(targetDir, { recursive: true });

        // Extrair com stripComponents
        await this.extractTarGz(
          archivePath,
          targetDir,
          artifact.stripComponents || 0
        );

        // VALIDAÇÃO CRÍTICA: Verificar se extração foi bem-sucedida
        const files = await fs.readdir(targetDir);
        if (files.length === 0) {
          throw new Error(`Extraction failed for ${artifact.name}: no files extracted`);
        }

        // Contar arquivos extraídos
        const fileCount = await this.countFiles(targetDir);

        // Validação específica por tipo
        await this.validateExtraction(artifact.name, targetDir);

        this.emit('progress', {
          artifact: artifact.name,
          status: 'extracted',
          filesCount: fileCount,
          message: `${artifact.name} extraído (${fileCount} arquivos)`
        });

      } catch (error) {
        throw new Error(`Failed to extract ${artifact.name}: ${error.message}`);
      }
    }
  }

  /**
   * Extrai tar.gz com stripComponents
   * @param {string} archivePath - Caminho do arquivo .tar.gz
   * @param {string} targetDir - Diretório destino
   * @param {number} stripComponents - Número de níveis a remover
   */
  async extractTarGz(archivePath, targetDir, stripComponents) {
    // Comando: tar -xzf <archive> -C <targetDir> --strip-components=<N>
    const command = `tar -xzf "${archivePath}" -C "${targetDir}" --strip-components=${stripComponents}`;

    this.log(`Executando: ${command}`);

    try {
      const { stdout, stderr } = await execAsync(command, { timeout: 300000 }); // 5 minutos

      if (stderr && !stderr.includes('Removing leading')) {
        this.log(`⚠️  tar stderr: ${stderr}`);
      }

      return true;
    } catch (error) {
      throw new Error(`tar extraction failed: ${error.message}`);
    }
  }

  /**
   * Valida extração específica por tipo de artefato
   * @param {string} artifactName - Nome do artefato
   * @param {string} targetDir - Diretório onde foi extraído
   */
  async validateExtraction(artifactName, targetDir) {
    switch (artifactName) {
      case 'backend_dist':
        // Validar arquivos críticos do backend
        const backendFiles = ['server.js', 'app.js', 'bootstrap.js', 'package.json'];
        for (const file of backendFiles) {
          const filePath = path.join(targetDir, file);
          try {
            await fs.access(filePath);
          } catch {
            throw new Error(`Backend validation failed: ${file} not found`);
          }
        }

        // Validar diretórios
        const backendDirs = ['controllers', 'models', 'services', 'config'];
        for (const dir of backendDirs) {
          const dirPath = path.join(targetDir, dir);
          try {
            const stats = await fs.stat(dirPath);
            if (!stats.isDirectory()) {
              throw new Error(`Backend validation failed: ${dir}/ is not a directory`);
            }
          } catch (error) {
            throw new Error(`Backend validation failed: ${dir}/ directory not found`);
          }
        }
        this.log('✅ Backend validation passed');
        break;

      case 'backend_node_modules':
        // Validar .pnpm/ store
        const pnpmDir = path.join(targetDir, '.pnpm');
        try {
          await fs.access(pnpmDir);
        } catch {
          throw new Error('Node_modules validation failed: .pnpm/ directory not found');
        }

        // Contar pacotes no .pnpm/
        const pnpmPackages = await fs.readdir(pnpmDir);
        if (pnpmPackages.length < 500) {
          throw new Error(`Node_modules validation failed: only ${pnpmPackages.length} packages found, expected > 500`);
        }

        this.log(`✅ Found ${pnpmPackages.length} packages in .pnpm/`);
        break;

      case 'frontend_build':
        // Validar index.html
        const indexPath = path.join(targetDir, 'index.html');
        try {
          await fs.access(indexPath);
        } catch {
          throw new Error('Frontend validation failed: index.html not found');
        }

        // Validar static/
        const staticDir = path.join(targetDir, 'static');
        try {
          const stats = await fs.stat(staticDir);
          if (!stats.isDirectory()) {
            throw new Error('Frontend validation failed: static/ is not a directory');
          }
        } catch {
          throw new Error('Frontend validation failed: static/ directory not found');
        }

        this.log('✅ Frontend validation passed');
        break;

      default:
        // Validação genérica: verificar se tem arquivos
        const files = await fs.readdir(targetDir);
        if (files.length === 0) {
          throw new Error(`Validation failed: ${targetDir} is empty`);
        }
        this.log(`✅ Generic validation passed (${files.length} files/dirs)`);
    }

    return true;
  }

  /**
   * Conta recursivamente número de arquivos em diretório
   * @param {string} dir - Diretório para contar
   */
  async countFiles(dir) {
    let count = 0;

    const items = await fs.readdir(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);

      if (item.isDirectory()) {
        count += await this.countFiles(fullPath);
      } else {
        count++;
      }
    }

    return count;
  }
}

export default FileExtractor;
