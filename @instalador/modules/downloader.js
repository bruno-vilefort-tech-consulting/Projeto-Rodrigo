#!/usr/bin/env node

/**
 * MOD-3: FileDownloader
 * Módulo responsável por baixar artefatos do GitHub Release com validação
 */

const { EventEmitter } = require('events');
const https = require('https');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const crypto = require('crypto');

class FileDownloader extends EventEmitter {
  constructor(options = {}) {
    super();
    this.maxRetries = options.maxRetries || 3;
    this.timeout = options.timeout || 600000; // 10 minutos default
    this.verbose = options.verbose || false;
  }

  /**
   * Helper: Formata bytes em formato legível
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Helper: Verifica se arquivo existe
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Baixa arquivo com callback de progresso
   */
  async downloadFile(url, filePath, onProgress) {
    return new Promise((resolve, reject) => {
      const file = fsSync.createWriteStream(filePath);
      let timeout;

      const cleanup = () => {
        if (timeout) clearTimeout(timeout);
      };

      // Timeout handler
      timeout = setTimeout(() => {
        file.close();
        fsSync.unlink(filePath, () => {});
        reject(new Error(`Download timeout after ${this.timeout}ms`));
      }, this.timeout);

      const request = https.get(url, (response) => {
        // Seguir redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
          cleanup();
          file.close();
          fsSync.unlink(filePath, () => {});
          return this.downloadFile(response.headers.location, filePath, onProgress)
            .then(resolve)
            .catch(reject);
        }

        if (response.statusCode !== 200) {
          cleanup();
          file.close();
          fsSync.unlink(filePath, () => {});
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          return;
        }

        const totalBytes = parseInt(response.headers['content-length'], 10);
        let downloadedBytes = 0;

        response.on('data', (chunk) => {
          downloadedBytes += chunk.length;
          if (onProgress && totalBytes) {
            onProgress(downloadedBytes / totalBytes);
          }
        });

        response.pipe(file);

        file.on('finish', () => {
          cleanup();
          file.close();
          resolve();
        });
      });

      request.on('error', (err) => {
        cleanup();
        file.close();
        fsSync.unlink(filePath, () => {});
        reject(err);
      });

      file.on('error', (err) => {
        cleanup();
        fsSync.unlink(filePath, () => {});
        reject(err);
      });
    });
  }

  /**
   * Verifica SHA256 do arquivo baixado
   */
  async verifyChecksum(filePath, expectedSha256) {
    const hash = crypto.createHash('sha256');
    const stream = fsSync.createReadStream(filePath);

    return new Promise((resolve, reject) => {
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => {
        const actualSha256 = hash.digest('hex');
        resolve(actualSha256 === expectedSha256);
      });
      stream.on('error', reject);
    });
  }

  /**
   * Baixa arquivo com retry automático
   */
  async downloadWithRetry(url, filePath, onProgress, retryCount = 0) {
    try {
      await this.downloadFile(url, filePath, onProgress);
    } catch (error) {
      if (retryCount < this.maxRetries) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff

        this.emit('retry', {
          url,
          attempt: retryCount + 1,
          maxRetries: this.maxRetries,
          delay,
          error: error.message
        });

        await new Promise(resolve => setTimeout(resolve, delay));
        return this.downloadWithRetry(url, filePath, onProgress, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Baixa todos os artefatos definidos no manifest.json
   */
  async downloadArtifacts(manifest, targetDir) {
    // Criar diretório se não existir
    await fs.mkdir(targetDir, { recursive: true });

    const results = {
      success: [],
      failed: []
    };

    for (const artifact of manifest.artifacts) {
      this.emit('progress', {
        artifact: artifact.name,
        status: 'downloading',
        progress: 0
      });

      const filePath = path.join(targetDir, `${artifact.name}.tar.gz`);

      try {
        // Download com progresso
        await this.downloadWithRetry(artifact.url, filePath, (progress) => {
          this.emit('progress', {
            artifact: artifact.name,
            status: 'downloading',
            progress: Math.round(progress * 100)
          });
        });

        // Verificar tamanho mínimo (detectar "Not Found")
        const stats = await fs.stat(filePath);
        if (stats.size < 100) {
          // Arquivo muito pequeno, provavelmente erro
          const content = await fs.readFile(filePath, 'utf8');
          throw new Error(`Downloaded file is corrupted: ${content}`);
        }

        // Verificar checksum SHA256
        this.emit('progress', {
          artifact: artifact.name,
          status: 'verifying',
          message: 'Verificando checksum...'
        });

        const valid = await this.verifyChecksum(filePath, artifact.sha256);
        if (!valid) {
          throw new Error(`Checksum verification failed for ${artifact.name}`);
        }

        results.success.push({
          name: artifact.name,
          path: filePath,
          size: this.formatBytes(stats.size)
        });

        this.emit('progress', {
          artifact: artifact.name,
          status: 'downloaded',
          progress: 100,
          size: this.formatBytes(stats.size)
        });

      } catch (error) {
        // Limpar arquivo corrompido
        if (await this.fileExists(filePath)) {
          await fs.unlink(filePath);
        }

        results.failed.push({
          name: artifact.name,
          error: error.message
        });

        this.emit('error', {
          artifact: artifact.name,
          status: 'failed',
          error: error.message
        });

        // Não lançar erro, continuar com próximos artefatos
        // throw new Error(`Failed to download ${artifact.name}: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Baixa um único artefato
   */
  async downloadArtifact(artifact, targetDir) {
    await fs.mkdir(targetDir, { recursive: true });

    const filePath = path.join(targetDir, `${artifact.name}.tar.gz`);

    this.emit('progress', {
      artifact: artifact.name,
      status: 'downloading',
      progress: 0
    });

    try {
      // Download com progresso
      await this.downloadWithRetry(artifact.url, filePath, (progress) => {
        this.emit('progress', {
          artifact: artifact.name,
          status: 'downloading',
          progress: Math.round(progress * 100)
        });
      });

      // Verificar tamanho mínimo
      const stats = await fs.stat(filePath);
      if (stats.size < 100) {
        const content = await fs.readFile(filePath, 'utf8');
        throw new Error(`Downloaded file is corrupted: ${content}`);
      }

      // Verificar checksum SHA256
      if (artifact.sha256) {
        this.emit('progress', {
          artifact: artifact.name,
          status: 'verifying',
          message: 'Verificando checksum...'
        });

        const valid = await this.verifyChecksum(filePath, artifact.sha256);
        if (!valid) {
          throw new Error(`Checksum verification failed`);
        }
      }

      this.emit('progress', {
        artifact: artifact.name,
        status: 'downloaded',
        progress: 100,
        size: this.formatBytes(stats.size)
      });

      return {
        success: true,
        path: filePath,
        size: this.formatBytes(stats.size)
      };

    } catch (error) {
      // Limpar arquivo corrompido
      if (await this.fileExists(filePath)) {
        await fs.unlink(filePath);
      }

      this.emit('error', {
        artifact: artifact.name,
        status: 'failed',
        error: error.message
      });

      throw new Error(`Failed to download ${artifact.name}: ${error.message}`);
    }
  }

  /**
   * Valida manifest.json
   */
  validateManifest(manifest) {
    if (!manifest || !Array.isArray(manifest.artifacts)) {
      throw new Error('Invalid manifest: missing artifacts array');
    }

    for (const artifact of manifest.artifacts) {
      if (!artifact.name) {
        throw new Error('Invalid manifest: artifact missing name');
      }
      if (!artifact.url) {
        throw new Error(`Invalid manifest: artifact ${artifact.name} missing url`);
      }
      if (!artifact.sha256) {
        throw new Error(`Invalid manifest: artifact ${artifact.name} missing sha256`);
      }
    }

    return true;
  }
}

// Se executado diretamente
if (require.main === module) {
  const downloader = new FileDownloader({ verbose: true });

  // Listener para progresso
  downloader.on('progress', (data) => {
    if (data.progress !== undefined) {
      console.log(`📦 ${data.artifact}: ${data.progress}%`);
    }
    if (data.message) {
      console.log(`   ${data.message}`);
    }
  });

  // Listener para retry
  downloader.on('retry', (data) => {
    console.log(`🔄 Tentativa ${data.attempt}/${data.maxRetries} para ${data.url}`);
  });

  // Listener para erro
  downloader.on('error', (data) => {
    console.error(`❌ ${data.artifact}: ${data.error}`);
  });

  // Exemplo de uso
  const exampleManifest = {
    artifacts: [
      {
        name: 'backend',
        url: 'https://github.com/example/repo/releases/download/v1.0.0/backend.tar.gz',
        sha256: 'abc123...'
      }
    ]
  };

  const targetDir = process.argv[2] || '/tmp/downloads';

  (async () => {
    try {
      console.log('📥 Iniciando downloads...\n');
      const results = await downloader.downloadArtifacts(exampleManifest, targetDir);

      console.log('\n============================================');
      console.log(`✅ Sucesso: ${results.success.length}`);
      results.success.forEach(r => {
        console.log(`   - ${r.name} (${r.size})`);
      });

      if (results.failed.length > 0) {
        console.log(`\n❌ Falhas: ${results.failed.length}`);
        results.failed.forEach(r => {
          console.log(`   - ${r.name}: ${r.error}`);
        });
      }

      process.exit(results.failed.length === 0 ? 0 : 1);
    } catch (error) {
      console.error('❌ Erro fatal:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = FileDownloader;
