#!/usr/bin/env node

/**
 * Script de Lock para Execução Única de Testes (Jest)
 *
 * OBJETIVO: Garantir que apenas UMA instância do Jest rode por vez
 * Previne condições de corrida em:
 * - Migrations de banco (Sequelize)
 * - Seeds de dados
 * - Conexões Socket.io
 * - Testes que compartilham recursos
 *
 * USO:
 *   npm run test:once
 *   node scripts/test_lock.js
 *
 * COMPORTAMENTO:
 * 1. Verifica se .test.lock existe
 * 2. Se existe → Aborta com erro (outro teste rodando)
 * 3. Se não existe → Cria lock, executa Jest, remove lock
 * 4. Lock é SEMPRE removido (mesmo se teste falhar)
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Caminho do arquivo de lock (na raiz do projeto)
const LOCK_FILE = path.join(__dirname, '..', '.test.lock');

// Cores para output (opcional, mas ajuda na leitura)
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

/**
 * Log colorido com timestamp
 */
function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  console.log(`${COLORS[color]}[${timestamp}] ${message}${COLORS.reset}`);
}

/**
 * Verifica se lock existe
 */
function checkLock() {
  if (fs.existsSync(LOCK_FILE)) {
    const lockContent = fs.readFileSync(LOCK_FILE, 'utf8');
    log(`❌ ERRO: Testes já estão em execução!`, 'red');
    log(`   Lock file: ${LOCK_FILE}`, 'red');
    log(`   PID em execução: ${lockContent}`, 'red');
    log(`   Aguarde o término ou remova manualmente o lock se houver erro.`, 'yellow');
    process.exit(1);
  }
}

/**
 * Cria lock file com PID atual
 */
function createLock() {
  try {
    const lockData = {
      pid: process.pid,
      startedAt: new Date().toISOString(),
      command: process.argv.slice(2).join(' ') || 'jest'
    };
    fs.writeFileSync(LOCK_FILE, JSON.stringify(lockData, null, 2), 'utf8');
    log(`🔒 Lock criado: PID ${process.pid}`, 'blue');
  } catch (error) {
    log(`❌ Erro ao criar lock: ${error.message}`, 'red');
    process.exit(1);
  }
}

/**
 * Remove lock file
 */
function removeLock() {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      fs.unlinkSync(LOCK_FILE);
      log(`🔓 Lock removido com sucesso`, 'green');
    }
  } catch (error) {
    log(`⚠️  Erro ao remover lock: ${error.message}`, 'yellow');
    log(`   Remova manualmente: rm ${LOCK_FILE}`, 'yellow');
  }
}

/**
 * Executa Jest com argumentos customizados
 */
function runJest() {
  return new Promise((resolve, reject) => {
    log(`🧪 Iniciando testes Jest...`, 'magenta');

    // Argumentos do Jest
    // --runInBand: Executa testes sequencialmente (não paralelo)
    // --forceExit: Força saída após testes (evita processos pendurados)
    // --detectOpenHandles: Detecta handles abertos (útil para debug)
    const jestArgs = [
      '--runInBand',        // Equivalente ao --no-threads do Vitest
      '--forceExit',        // Força saída
      '--detectOpenHandles', // Debug de handles
      ...process.argv.slice(2) // Argumentos adicionais passados ao script
    ];

    log(`   Comando: jest ${jestArgs.join(' ')}`, 'blue');

    // Spawn do processo Jest
    const jestProcess = spawn('npx', ['jest', ...jestArgs], {
      stdio: 'inherit', // Herda stdout/stderr/stdin do processo pai
      env: {
        ...process.env,
        NODE_ENV: 'test'
      }
    });

    // Listener de saída do processo
    jestProcess.on('exit', (code) => {
      if (code === 0) {
        log(`✅ Testes finalizados com sucesso (exit code: ${code})`, 'green');
        resolve(code);
      } else {
        log(`❌ Testes falharam (exit code: ${code})`, 'red');
        reject(new Error(`Jest exited with code ${code}`));
      }
    });

    // Listener de erro do processo
    jestProcess.on('error', (error) => {
      log(`❌ Erro ao executar Jest: ${error.message}`, 'red');
      reject(error);
    });
  });
}

/**
 * Main: Fluxo principal
 */
async function main() {
  log(`🚀 Iniciando Test Lock Script`, 'magenta');
  log(`   Projeto: ChatIA Flow`, 'blue');
  log(`   Test Runner: Jest`, 'blue');
  log(`   Modo: Single Instance (lock-based)`, 'blue');

  // Passo 1: Verificar lock
  checkLock();

  // Passo 2: Criar lock
  createLock();

  try {
    // Passo 3: Executar Jest
    await runJest();

    // Passo 4: Sucesso
    log(`🎉 Todos os testes passaram!`, 'green');
    process.exit(0);

  } catch (error) {
    // Passo 4: Falha
    log(`💥 Testes falharam ou foram interrompidos`, 'red');
    log(`   Erro: ${error.message}`, 'red');
    process.exit(1);

  } finally {
    // Passo 5: SEMPRE remover lock
    removeLock();
  }
}

// Capturar sinais de interrupção (Ctrl+C, kill, etc)
process.on('SIGINT', () => {
  log(`⚠️  Recebido SIGINT (Ctrl+C). Limpando lock...`, 'yellow');
  removeLock();
  process.exit(130); // 128 + 2 (SIGINT)
});

process.on('SIGTERM', () => {
  log(`⚠️  Recebido SIGTERM. Limpando lock...`, 'yellow');
  removeLock();
  process.exit(143); // 128 + 15 (SIGTERM)
});

process.on('uncaughtException', (error) => {
  log(`💥 Exceção não capturada: ${error.message}`, 'red');
  removeLock();
  process.exit(1);
});

// Executar main
main().catch((error) => {
  log(`💥 Erro fatal: ${error.message}`, 'red');
  removeLock();
  process.exit(1);
});
