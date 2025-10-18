#!/bin/bash

#############################################
# ChatIA Installer - VNC Setup Script
# Configuração automática de VNC + Instalador
#############################################

set -e  # Parar se houver erro

echo "========================================="
echo "  ChatIA Installer - Setup VNC"
echo "========================================="
echo ""

# 1. Criar usuário deploy se não existir
if ! id -u deploy > /dev/null 2>&1; then
    echo "[1/8] Criando usuário 'deploy'..."
    useradd -m -s /bin/bash deploy
    echo "deploy:chatia2025" | chpasswd
else
    echo "[1/8] Usuário 'deploy' já existe"
fi

# 2. Criar diretório e baixar artefatos
echo "[2/8] Baixando artefatos do ChatIA..."
mkdir -p /home/deploy/chatia-install
cd /home/deploy/chatia-install

BASE_URL="https://github.com/bruno-vilefort-tech-consulting/Projeto-Rodrigo/releases/download/v5.0.0"

for FILE in manifest.json backend_dist.tar.gz backend_node_modules.tar.gz frontend_build.tar.gz chatia-installer.deb; do
    if [ ! -f "$FILE" ]; then
        wget -q --show-progress "$BASE_URL/$FILE" || echo "Aviso: Falha ao baixar $FILE"
    fi
done

# 3. Instalar o instalador .deb
echo "[3/8] Instalando chatia-installer.deb..."
dpkg -i chatia-installer.deb 2>/dev/null || apt-get install -f -y

# 4. Instalar ambiente desktop e VNC
echo "[4/8] Instalando XFCE e TigerVNC..."
apt update -qq
DEBIAN_FRONTEND=noninteractive apt install -y -qq xfce4 xfce4-goodies tigervnc-standalone-server tigervnc-common > /dev/null 2>&1

# 5. Configurar senha VNC automaticamente
echo "[5/8] Configurando senha VNC..."
VNC_PASSWORD="chatia2025"
mkdir -p /home/deploy/.vnc
echo "$VNC_PASSWORD" | vncpasswd -f > /home/deploy/.vnc/passwd
chmod 600 /home/deploy/.vnc/passwd
chown -R deploy:deploy /home/deploy/.vnc

# 6. Criar xstartup para XFCE
echo "[6/8] Configurando XFCE como desktop padrão..."
cat > /home/deploy/.vnc/xstartup << 'EOF'
#!/bin/bash
xrdb $HOME/.Xresources
startxfce4 &
EOF
chmod +x /home/deploy/.vnc/xstartup
chown deploy:deploy /home/deploy/.vnc/xstartup

# 7. Configurar firewall
echo "[7/8] Configurando firewall..."
if command -v ufw > /dev/null; then
    ufw allow 5901/tcp > /dev/null 2>&1 || true
fi
iptables -I INPUT -p tcp --dport 5901 -j ACCEPT 2>/dev/null || true

# 8. Iniciar VNC server
echo "[8/8] Iniciando VNC server..."
sudo -u deploy vncserver -kill :1 > /dev/null 2>&1 || true
sudo -u deploy vncserver -localhost no -geometry 1920x1080 -depth 24 > /dev/null 2>&1

# Descobrir IP
IP=$(curl -s -4 ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

# Exibir informações de conexão
echo ""
echo "========================================="
echo "  ✅ VNC CONFIGURADO COM SUCESSO!"
echo "========================================="
echo ""
echo "📱 CONECTAR VIA FINDER (macOS):"
echo ""
echo "   1. No Mac, pressione: Cmd + K"
echo ""
echo "   2. Cole este endereço:"
echo "      vnc://$IP:5901"
echo ""
echo "   3. Senha VNC:"
echo "      $VNC_PASSWORD"
echo ""
echo "========================================="
echo ""
echo "🖥️  EXECUTAR INSTALADOR:"
echo ""
echo "   Após conectar no VNC, abra o terminal"
echo "   no desktop XFCE e execute:"
echo ""
echo "   chatia-installer"
echo ""
echo "========================================="
echo ""
echo "🔐 GERENCIAR VNC:"
echo ""
echo "   Parar:  sudo -u deploy vncserver -kill :1"
echo "   Iniciar: sudo -u deploy vncserver -localhost no"
echo "   Logs:   tail -f /home/deploy/.vnc/*.log"
echo ""
echo "========================================="
