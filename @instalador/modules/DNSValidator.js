/**
 * MOD-14: DNSValidator
 *
 * Responsabilidade: Validar apontamento DNS dos domínios
 *
 * Features:
 * - Resolução de domínios para IP
 * - Detecção do IP público da VPS
 * - Validação de apontamento correto
 * - Suporte a retry com backoff
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import EventEmitter from 'events';

const execAsync = promisify(exec);

class DNSValidator extends EventEmitter {
  constructor(logCallback = console.log) {
    super();
    this.log = logCallback;
  }

  /**
   * Obtém o IP público da VPS
   * @returns {Promise<string>} IP público
   */
  async getPublicIP() {
    this.log('🌐 Detectando IP público da VPS...');

    const services = [
      'curl -s https://api.ipify.org',
      'curl -s https://ifconfig.me',
      'curl -s https://icanhazip.com',
      'dig +short myip.opendns.com @resolver1.opendns.com'
    ];

    for (const service of services) {
      try {
        const { stdout } = await execAsync(service, { timeout: 5000 });
        const ip = stdout.trim();

        // Validar formato IPv4
        if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
          this.log(`✅ IP público detectado: ${ip}`);
          return ip;
        }
      } catch {
        continue;
      }
    }

    throw new Error('Não foi possível detectar o IP público da VPS');
  }

  /**
   * Resolve domínio para IP usando dig
   * @param {string} domain - Domínio a resolver
   * @returns {Promise<string|null>} IP resolvido ou null
   */
  async resolveDomain(domain) {
    // Remover protocolo se presente
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

    this.log(`🔍 Resolvendo DNS para: ${cleanDomain}`);

    try {
      // Tentar com dig primeiro (mais confiável)
      const { stdout } = await execAsync(
        `dig +short ${cleanDomain} | grep -E "^[0-9]" | head -1`,
        { timeout: 10000 }
      );

      if (stdout.trim()) {
        const ip = stdout.trim();
        this.log(`  ↳ Resolvido para: ${ip}`);
        return ip;
      }
    } catch {
      // Fallback para nslookup
      try {
        const { stdout } = await execAsync(
          `nslookup ${cleanDomain} | grep "Address:" | tail -n1 | awk '{print $2}'`,
          { timeout: 10000 }
        );

        if (stdout.trim()) {
          const ip = stdout.trim();
          this.log(`  ↳ Resolvido para: ${ip} (via nslookup)`);
          return ip;
        }
      } catch {
        // Ignorar erro
      }
    }

    this.log(`  ↳ Não foi possível resolver`);
    return null;
  }

  /**
   * Valida se o domínio aponta para o IP correto
   * @param {string} domain - Domínio a validar
   * @param {string} expectedIP - IP esperado
   * @param {number} retries - Número de tentativas
   * @returns {Promise<boolean>} True se válido
   */
  async validateDNS(domain, expectedIP = null, retries = 3) {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

    this.emit('progress', {
      status: 'validating_dns',
      domain: cleanDomain,
      message: `Validando DNS: ${cleanDomain}`
    });

    // Se não foi fornecido IP esperado, detectar
    if (!expectedIP) {
      expectedIP = await this.getPublicIP();
    }

    for (let i = 0; i < retries; i++) {
      const resolvedIP = await this.resolveDomain(cleanDomain);

      if (resolvedIP === expectedIP) {
        this.log(`✅ DNS correto para ${cleanDomain} → ${resolvedIP}`);

        this.emit('progress', {
          status: 'dns_valid',
          domain: cleanDomain,
          ip: resolvedIP,
          message: `✅ DNS válido: ${cleanDomain}`
        });

        return true;
      }

      if (i < retries - 1) {
        const waitTime = Math.pow(2, i) * 1000; // Backoff exponencial
        this.log(`⏳ Aguardando ${waitTime / 1000}s antes de tentar novamente...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    this.log(`❌ DNS inválido para ${cleanDomain}`);
    this.log(`   Esperado: ${expectedIP}`);
    this.log(`   Recebido: ${await this.resolveDomain(cleanDomain) || 'não resolvido'}`);

    this.emit('error', {
      status: 'dns_invalid',
      domain: cleanDomain,
      expected: expectedIP,
      received: await this.resolveDomain(cleanDomain),
      message: `❌ DNS inválido: ${cleanDomain} não aponta para ${expectedIP}`
    });

    return false;
  }

  /**
   * Valida múltiplos domínios
   * @param {string[]} domains - Array de domínios
   * @param {string} expectedIP - IP esperado
   * @returns {Promise<Object>} Resultado da validação
   */
  async validateMultipleDomains(domains, expectedIP = null) {
    if (!expectedIP) {
      expectedIP = await this.getPublicIP();
    }

    const results = {
      valid: [],
      invalid: [],
      ip: expectedIP
    };

    for (const domain of domains) {
      const isValid = await this.validateDNS(domain, expectedIP, 3);

      if (isValid) {
        results.valid.push(domain);
      } else {
        results.invalid.push(domain);
      }
    }

    this.emit('progress', {
      status: 'validation_completed',
      results,
      message: `Validação concluída: ${results.valid.length}/${domains.length} válidos`
    });

    return results;
  }

  /**
   * Exibe instruções para configurar DNS
   * @param {string[]} invalidDomains - Domínios inválidos
   * @param {string} ip - IP esperado
   */
  showDNSInstructions(invalidDomains, ip) {
    if (invalidDomains.length === 0) {
      return;
    }

    this.log('\n⚠️  ATENÇÃO: Os seguintes domínios não estão apontando corretamente:\n');

    for (const domain of invalidDomains) {
      this.log(`   • ${domain}`);
    }

    this.log('\n📋 Para corrigir, adicione registros DNS tipo A:\n');
    this.log(`   Nome: @ (ou subdomínio)`);
    this.log(`   Tipo: A`);
    this.log(`   Valor: ${ip}`);
    this.log(`   TTL: 3600\n`);

    this.log('💡 Após configurar, aguarde a propagação DNS (pode levar até 48h, geralmente 5-15 minutos)\n');
  }
}

export default DNSValidator;
