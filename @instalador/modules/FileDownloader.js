/**
 * MOD-3: FileDownloader
 *
 * Responsabilidade: Baixar artefatos do GitHub Release com validação SHA256
 *
 * Features:
 * - Download com callback de progresso
 * - Verificação de tamanho mínimo (detectar "Not Found")
 * - Validação de checksum SHA256
 * - Retry automático (3 tentativas)
 * - Timeout configurável
 * - Limpeza de arquivos corrompidos
 */

import https from 'https';
import http from 'http';
import fs from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import path from 'path';
import crypto from 'crypto';
import EventEmitter from 'events';

class FileDownloader extends EventEmitter {
  constructor(logCallback = console.log) {
    super();
    this.log = logCallback;
  }

  /**
   * Baixa todos os artefatos definidos no manifest.json
   * @param {Object} manifest - Manifest com lista de artifacts
   * @param {string} targetDir - Diretório de download
   */
  async downloadArtifacts(manifest, targetDir) {
    // Criar diretório se não existir
    await fs.mkdir(targetDir, { recursive: true });

    for (const artifact of manifest.artifacts) {
      this.emit('progress', {
        artifact: artifact.name,
        status: 'downloading',
        progress: 0
      });

      const filePath = path.join(targetDir, `${artifact.name}.tar.gz`);

      // Retry loop (3 tentativas)
      let lastError = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          // Download com progresso
          await this.downloadFile(artifact.url, filePath, (progress) => {
            this.emit('progress', {
              artifact: artifact.name,
              status: 'downloading',
              progress: Math.round(progress * 100),
              attempt
            });
          });

          // Verificar tamanho mínimo (detectar "Not Found")
          const stats = await fs.stat(filePath);
          if (stats.size < 100) {
            // Arquivo muito pequeno, provavelmente erro
            const content = await fs.readFile(filePath, 'utf8');
            throw new Error(`Downloaded file is corrupted (${stats.size} bytes): ${content}`);
          }

          // Verificar checksum SHA256
          this.emit('progress', {
            artifact: artifact.name,
            status: 'verifying',
            message: 'Verificando checksum SHA256...'
          });

          const valid = await this.verifyChecksum(filePath, artifact.sha256);
          if (!valid) {
            throw new Error(`Checksum verification failed for ${artifact.name}`);
          }

          this.emit('progress', {
            artifact: artifact.name,
            status: 'downloaded',
            progress: 100,
            size: this.formatBytes(stats.size)
          });

          // Sucesso! Sair do retry loop
          break;

        } catch (error) {
          lastError = error;
          this.log(`❌ Tentativa ${attempt}/3 falhou para ${artifact.name}: ${error.message}`);

          // Limpar arquivo corrompido
          try {
            await fs.unlink(filePath);
          } catch {}

          // Se não é a última tentativa, aguardar antes de retry
          if (attempt < 3) {
            await this.sleep(2000 * attempt); // Backoff exponencial
          }
        }
      }

      // Se todas as 3 tentativas falharam, lançar erro
      if (lastError) {
        throw new Error(`Failed to download ${artifact.name} after 3 attempts: ${lastError.message}`);
      }
    }
  }

  /**
   * Baixa arquivo com callback de progresso
   * @param {string} url - URL do arquivo
   * @param {string} filePath - Caminho de destino
   * @param {function} onProgress - Callback de progresso (recebe 0.0 a 1.0)
   */
  async downloadFile(url, filePath, onProgress) {
    return new Promise((resolve, reject) => {
      const file = createWriteStream(filePath);
      const protocol = url.startsWith('https:') ? https : http;

      const request = protocol.get(url, (response) => {
        // Seguir redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          this.log(`↪️  Redirect para ${redirectUrl}`);

          // Fechar stream e tentar novamente com novo URL
          file.close();
          return this.downloadFile(redirectUrl, filePath, onProgress)
            .then(resolve)
            .catch(reject);
        }

        if (response.statusCode !== 200) {
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
          file.close();
          resolve();
        });
      });

      request.on('error', (err) => {
        fs.unlink(filePath).catch(() => {});
        reject(err);
      });

      file.on('error', (err) => {
        fs.unlink(filePath).catch(() => {});
        reject(err);
      });

      // Timeout de 10 minutos
      request.setTimeout(600000, () => {
        request.abort();
        fs.unlink(filePath).catch(() => {});
        reject(new Error('Download timeout (10 minutes)'));
      });
    });
  }

  /**
   * Verifica SHA256 do arquivo baixado
   * @param {string} filePath - Caminho do arquivo
   * @param {string} expectedSha256 - Hash esperado
   */
  async verifyChecksum(filePath, expectedSha256) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = createReadStream(filePath);

      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => {
        const actualSha256 = hash.digest('hex');
        const match = actualSha256.toLowerCase() === expectedSha256.toLowerCase();

        if (match) {
          this.log(`✅ Checksum válido: ${actualSha256.substring(0, 16)}...`);
        } else {
          this.log(`❌ Checksum inválido:`);
          this.log(`   Esperado: ${expectedSha256}`);
          this.log(`   Obtido:   ${actualSha256}`);
        }

        resolve(match);
      });
      stream.on('error', reject);
    });
  }

  /**
   * Formata bytes em formato legível
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Helper: Sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default FileDownloader;
