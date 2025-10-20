#!/usr/bin/env python3
"""
MOD-11: RollbackManager (Python Script)

Responsabilidade: Gerenciar rollback completo da instalação em caso de falha

Features:
- Criar backup completo antes de iniciar instalação
- Salvar estado da instalação em cada passo
- Executar rollback automático em caso de falha
- Restaurar arquivos, configuração Nginx e processos PM2
- Limpar estado de instalação

Uso:
  python3 RollbackManager.py backup [company_slug]
  python3 RollbackManager.py rollback [company_slug]
  python3 RollbackManager.py mark-step [step_name] [company_slug]
"""

import subprocess
import shutil
import json
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict

class RollbackManager:
    def __init__(self, company_slug='chatia', log_callback=None):
        self.log = log_callback or print
        self.company_slug = company_slug
        self.base_path = Path(f"/home/deploy/{company_slug}")
        self.backup_path = Path(f"/home/deploy/{company_slug}_backup")
        self.state_file = Path(f"/tmp/{company_slug}_install_state.json")
        self.state = self._load_state()

    def _load_state(self) -> Dict:
        """Carrega estado da instalação."""
        if self.state_file.exists():
            with open(self.state_file, 'r') as f:
                return json.load(f)
        return {
            'started_at': None,
            'steps_completed': [],
            'backup_created': False,
            'services_stopped': []
        }

    def _save_state(self):
        """Salva estado da instalação."""
        with open(self.state_file, 'w') as f:
            json.dump(self.state, f, indent=2)

    def mark_step_completed(self, step_name: str):
        """Marca um passo como completado."""
        if step_name not in self.state['steps_completed']:
            self.state['steps_completed'].append(step_name)
            self._save_state()
            self.log(f"✅ Passo marcado como concluído: {step_name}")

    def create_backup(self) -> bool:
        """
        Cria backup completo antes de iniciar instalação.
        Retorna True se sucesso.
        """
        try:
            self.log("📦 Criando backup do sistema...")

            # Remover backup antigo se existir
            if self.backup_path.exists():
                shutil.rmtree(self.backup_path)

            # Criar novo backup
            if self.base_path.exists():
                shutil.copytree(
                    self.base_path,
                    self.backup_path,
                    symlinks=True
                )
                self.log(f"✅ Backup criado em: {self.backup_path}")
            else:
                self.log("ℹ️  Nenhum sistema anterior encontrado, pulando backup")

            # Backup de configuração nginx
            nginx_config = Path(f"/etc/nginx/sites-enabled/{self.company_slug}")
            if nginx_config.exists():
                self.backup_path.mkdir(exist_ok=True)
                shutil.copy(nginx_config, self.backup_path / "nginx_config.conf")
                self.log("✅ Backup de configuração Nginx criado")

            # Backup de serviços PM2
            try:
                subprocess.run(
                    ['pm2', 'save'],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
                self.log("✅ Estado PM2 salvo")
            except Exception:
                pass

            self.state['backup_created'] = True
            self.state['started_at'] = datetime.now().isoformat()
            self._save_state()

            return True

        except Exception as e:
            self.log(f"❌ Erro ao criar backup: {e}")
            return False

    def rollback(self):
        """
        Executa rollback completo da instalação.
        """
        self.log("🔄 Iniciando rollback da instalação...")

        # 1. Parar serviços
        self._stop_services()

        # 2. Restaurar arquivos
        self._restore_files()

        # 3. Restaurar nginx
        self._restore_nginx()

        # 4. Restaurar PM2
        self._restore_pm2()

        # 5. Limpar estado
        self._cleanup_state()

        self.log("✅ Rollback concluído")

    def _stop_services(self):
        """Para todos os serviços."""
        try:
            self.log("⏹️  Parando serviços PM2...")
            subprocess.run(['pm2', 'stop', 'all'], timeout=30)
            subprocess.run(['pm2', 'delete', f'{self.company_slug}-backend'], timeout=30)
            self.log("✅ Serviços PM2 parados")
        except Exception as e:
            self.log(f"⚠️  Erro ao parar serviços PM2: {e}")

    def _restore_files(self):
        """Restaura arquivos do backup."""
        try:
            if not self.backup_path.exists():
                self.log("ℹ️  Nenhum backup encontrado, pulando restauração de arquivos")
                return

            self.log("📁 Restaurando arquivos do backup...")

            # Remover instalação atual
            if self.base_path.exists():
                shutil.rmtree(self.base_path)

            # Restaurar backup
            shutil.copytree(self.backup_path, self.base_path, symlinks=True)

            self.log("✅ Arquivos restaurados do backup")

        except Exception as e:
            self.log(f"❌ Erro ao restaurar arquivos: {e}")

    def _restore_nginx(self):
        """Restaura configuração nginx."""
        try:
            backup_nginx = self.backup_path / "nginx_config.conf"
            if backup_nginx.exists():
                self.log("🔧 Restaurando configuração Nginx...")
                shutil.copy(backup_nginx, f"/etc/nginx/sites-enabled/{self.company_slug}")
                subprocess.run(['systemctl', 'reload', 'nginx'], timeout=10)
                self.log("✅ Configuração Nginx restaurada")
            else:
                # Remover configuração se não havia antes
                nginx_config = Path(f"/etc/nginx/sites-enabled/{self.company_slug}")
                if nginx_config.exists():
                    nginx_config.unlink()
                    subprocess.run(['systemctl', 'reload', 'nginx'], timeout=10)
                    self.log("✅ Configuração Nginx removida")

        except Exception as e:
            self.log(f"⚠️  Erro ao restaurar Nginx: {e}")

    def _restore_pm2(self):
        """Restaura processos PM2."""
        try:
            self.log("🔄 Restaurando processos PM2...")
            subprocess.run(['pm2', 'resurrect'], timeout=30)
            self.log("✅ Processos PM2 restaurados")
        except Exception as e:
            self.log(f"⚠️  Erro ao restaurar PM2: {e}")

    def _cleanup_state(self):
        """Limpa arquivos de estado."""
        try:
            if self.state_file.exists():
                self.state_file.unlink()
            self.log("✅ Estado de instalação limpo")
        except Exception as e:
            self.log(f"⚠️  Erro ao limpar estado: {e}")

def main():
    if len(sys.argv) < 2:
        print("Uso: python3 RollbackManager.py [backup|rollback|mark-step] [step_name] [company_slug]")
        sys.exit(1)

    action = sys.argv[1]
    company_slug = sys.argv[-1] if len(sys.argv) > 2 else 'chatia'

    manager = RollbackManager(company_slug)

    if action == 'backup':
        success = manager.create_backup()
        sys.exit(0 if success else 1)
    elif action == 'rollback':
        manager.rollback()
        sys.exit(0)
    elif action == 'mark-step' and len(sys.argv) >= 3:
        step_name = sys.argv[2]
        manager.mark_step_completed(step_name)
        sys.exit(0)
    else:
        print("Ação inválida. Use: backup, rollback ou mark-step")
        sys.exit(1)

if __name__ == '__main__':
    main()
