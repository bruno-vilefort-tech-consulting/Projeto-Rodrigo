/**
 * MOD-9: PermissionsFixer
 *
 * Responsabilidade: Ajustar permissões de arquivos e diretórios
 *
 * Features:
 * - chown -R deploy:deploy
 * - chmod 755 para diretórios
 * - chmod 644 para arquivos
 * - chmod +x para executáveis
 * - Permitir nginx acessar /home/deploy
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import EventEmitter from 'events';

const execAsync = promisify(exec);

class PermissionsFixer extends EventEmitter {
  constructor(logCallback = console.log) {
    super();
    this.log = logCallback;
  }

  /**
   * Ajusta permissões para deploy:deploy e nginx
   * @param {Object} config - Configuração com companySlug
   */
  async fixPermissions(config) {
    const appDir = `/home/deploy/${config.companySlug}`;

    this.emit('progress', {
      status: 'fixing_permissions',
      message: 'Ajustando permissões...'
    });

    // 1. Proprietário
    await execAsync(`chown -R deploy:deploy ${appDir}`);
    this.log('  ✅ Ownership: deploy:deploy');

    // 2. Permissões de diretórios (755 = rwxr-xr-x)
    await execAsync(`find ${appDir} -type d -exec chmod 755 {} \\;`);
    this.log('  ✅ Directories: 755');

    // 3. Permissões de arquivos (644 = rw-r--r--)
    await execAsync(`find ${appDir} -type f -exec chmod 644 {} \\;`);
    this.log('  ✅ Files: 644');

    // 4. Executáveis
    await execAsync(`chmod +x ${appDir}/backend/server.js || true`);
    await execAsync(`find ${appDir}/backend/node_modules/.bin -type f -exec chmod +x {} \\; 2>/dev/null || true`);
    this.log('  ✅ Executables: +x');

    // 5. Permitir nginx acessar
    await execAsync('chmod 755 /home/deploy');
    await execAsync(`chmod 755 ${appDir}`);
    await execAsync(`chmod 755 ${appDir}/frontend`);
    this.log('  ✅ Nginx access enabled');

    this.emit('progress', {
      status: 'permissions_fixed',
      message: '✅ Permissões ajustadas'
    });

    return true;
  }
}

export default PermissionsFixer;
