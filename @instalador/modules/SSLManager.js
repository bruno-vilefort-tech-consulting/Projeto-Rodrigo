/**
 * MOD-15: SSLManager
 *
 * Responsabilidade: Automatizar instalação e renovação de certificados SSL via Certbot
 *
 * Features:
 * - Instalação do Certbot via snap
 * - Geração automática de certificados SSL
 * - Configuração de renovação automática
 * - Suporte a múltiplos domínios
 * - Fallback para HTTP em caso de falha
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import EventEmitter from 'events';

const execAsync = promisify(exec);

class SSLManager extends EventEmitter {
  constructor(logCallback = console.log) {
    super();
    this.log = logCallback;
  }

  /**
   * Verifica se Certbot está instalado
   * @returns {Promise<boolean>}
   */
  async isCertbotInstalled() {
    try {
      await execAsync('which certbot');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Instala Certbot via snap
   */
  async installCertbot() {
    this.emit('progress', {
      status: 'installing_certbot',
      message: 'Instalando Certbot...'
    });

    this.log('📦 Instalando Certbot via snap...');

    try {
      // Instalar snapd se necessário
      await execAsync('apt-get update -qq && apt-get install -y snapd', {
        timeout: 120000
      });

      // Iniciar snapd
      await execAsync('systemctl enable snapd && systemctl start snapd');

      // Aguardar snapd iniciar
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Instalar snap core
      await execAsync('snap install core; snap refresh core', {
        timeout: 120000
      });

      // Instalar certbot
      await execAsync('snap install --classic certbot', {
        timeout: 120000
      });

      // Criar symlink
      await execAsync('ln -sf /snap/bin/certbot /usr/bin/certbot');

      this.log('✅ Certbot instalado com sucesso');

      this.emit('progress', {
        status: 'certbot_installed',
        message: '✅ Certbot instalado'
      });

    } catch (err) {
      this.log(`❌ Erro ao instalar Certbot: ${err.message}`);
      throw err;
    }
  }

  /**
   * Gera certificado SSL para um domínio
   * @param {string} domain - Domínio
   * @param {string} email - Email para notificações
   * @param {boolean} testCert - Usar certificado de teste (staging)
   */
  async generateSSL(domain, email, testCert = false) {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

    this.emit('progress', {
      status: 'generating_ssl',
      domain: cleanDomain,
      message: `Gerando certificado SSL para ${cleanDomain}...`
    });

    this.log(`🔒 Gerando certificado SSL para: ${cleanDomain}`);

    // Verificar se certbot está instalado
    if (!(await this.isCertbotInstalled())) {
      await this.installCertbot();
    }

    const stagingFlag = testCert ? '--test-cert' : '';

    const command = `certbot --nginx \
      -d ${cleanDomain} \
      --non-interactive \
      --agree-tos \
      --email ${email} \
      --redirect \
      ${stagingFlag}`;

    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: 300000 // 5 minutos
      });

      this.log(stdout);

      this.log(`✅ Certificado SSL gerado para ${cleanDomain}`);

      this.emit('progress', {
        status: 'ssl_generated',
        domain: cleanDomain,
        message: `✅ SSL ativo para ${cleanDomain}`
      });

      return true;

    } catch (err) {
      this.log(`❌ Erro ao gerar SSL para ${cleanDomain}: ${err.message}`);

      this.emit('error', {
        status: 'ssl_failed',
        domain: cleanDomain,
        error: err.message,
        message: `❌ Falha ao gerar SSL para ${cleanDomain}`
      });

      return false;
    }
  }

  /**
   * Gera certificados SSL para múltiplos domínios
   * @param {string[]} domains - Lista de domínios
   * @param {string} email - Email para notificações
   * @param {boolean} testCert - Usar certificados de teste
   */
  async generateMultipleSSL(domains, email, testCert = false) {
    const results = {
      success: [],
      failed: []
    };

    for (const domain of domains) {
      const success = await this.generateSSL(domain, email, testCert);

      if (success) {
        results.success.push(domain);
      } else {
        results.failed.push(domain);
      }
    }

    this.emit('progress', {
      status: 'ssl_batch_completed',
      results,
      message: `SSL gerado para ${results.success.length}/${domains.length} domínios`
    });

    return results;
  }

  /**
   * Configura renovação automática de certificados
   */
  async setupAutoRenewal() {
    this.emit('progress', {
      status: 'configuring_renewal',
      message: 'Configurando renovação automática...'
    });

    this.log('🔄 Configurando renovação automática de certificados...');

    try {
      // Certbot já configura renovação automática via systemd timer
      // Vamos apenas testar se está funcionando

      const { stdout } = await execAsync('certbot renew --dry-run', {
        timeout: 60000
      });

      this.log('✅ Renovação automática configurada e testada');
      this.log('   Os certificados serão renovados automaticamente a cada 60 dias');

      this.emit('progress', {
        status: 'renewal_configured',
        message: '✅ Renovação automática configurada'
      });

      return true;

    } catch (err) {
      this.log(`⚠️  Erro ao testar renovação: ${err.message}`);
      this.log('   A renovação automática pode não estar funcionando corretamente');

      this.emit('warning', {
        message: 'Renovação automática pode não estar funcionando',
        details: err.message
      });

      return false;
    }
  }

  /**
   * Lista certificados instalados
   * @returns {Promise<Array>} Lista de certificados
   */
  async listCertificates() {
    try {
      const { stdout } = await execAsync('certbot certificates', {
        timeout: 30000
      });

      this.log('📋 Certificados instalados:');
      this.log(stdout);

      return stdout;

    } catch (err) {
      this.log('ℹ️  Nenhum certificado instalado');
      return '';
    }
  }

  /**
   * Revoga um certificado SSL
   * @param {string} domain - Domínio
   */
  async revokeCertificate(domain) {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

    this.log(`🗑️  Revogando certificado para ${cleanDomain}...`);

    try {
      await execAsync(`certbot revoke --cert-name ${cleanDomain} --non-interactive`, {
        timeout: 60000
      });

      this.log(`✅ Certificado revogado para ${cleanDomain}`);
      return true;

    } catch (err) {
      this.log(`❌ Erro ao revogar certificado: ${err.message}`);
      return false;
    }
  }

  /**
   * Força HTTPS no Nginx para um domínio
   * @param {string} domain - Domínio
   * @param {string} companySlug - Slug da empresa
   */
  async enforceHTTPS(domain, companySlug) {
    const nginxConfig = `/etc/nginx/sites-available/${companySlug}-${domain.includes('api') ? 'backend' : 'frontend'}`;

    try {
      let config = await fs.readFile(nginxConfig, 'utf-8');

      // Adicionar redirecionamento HTTPS se não existir
      if (!config.includes('return 301 https://')) {
        config = config.replace(
          /listen 80;/,
          `listen 80;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;`
        );

        await fs.writeFile(nginxConfig, config);

        // Recarregar Nginx
        await execAsync('nginx -t && systemctl reload nginx');

        this.log(`✅ HTTPS forçado para ${domain}`);
      }

    } catch (err) {
      this.log(`⚠️  Não foi possível forçar HTTPS: ${err.message}`);
    }
  }
}

export default SSLManager;
