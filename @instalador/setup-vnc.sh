#!/bin/bash

#############################################
# ChatIA Installer - VNC Setup Script
# Configuração automática de VNC + Instalador
#############################################

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
    if [ ! -f "$FILE" ] || [ $(stat -f%z "$FILE" 2>/dev/null || stat -c%s "$FILE" 2>/dev/null) -lt 1000 ]; then
        echo "  Baixando $FILE..."

        # Tentar curl primeiro (mais confiável para GitHub)
        if curl -f -L -o "$FILE" "$BASE_URL/$FILE" 2>/dev/null; then
            echo "  ✓ $FILE baixado com sucesso"
        else
            echo "  ⚠️  Falha ao baixar com curl, tentando wget..."
            if wget -q --show-progress --max-redirect=5 -L "$BASE_URL/$FILE" 2>/dev/null; then
                echo "  ✓ $FILE baixado com sucesso"
            else
                echo "  ❌ Erro: não foi possível baixar $FILE"
                echo "     A release v5.0.0 pode ainda não estar pronta."
                echo "     Aguarde alguns minutos e tente novamente."
            fi
        fi
    else
        SIZE=$(du -h "$FILE" | cut -f1)
        echo "  ✓ $FILE já existe ($SIZE)"
    fi
done

# 3. Instalar o instalador .deb
if [ -f "chatia-installer.deb" ]; then
    echo "[3/8] Instalando chatia-installer.deb..."
    dpkg -i chatia-installer.deb 2>/dev/null || apt-get install -f -y
else
    echo "[3/8] ⚠️  chatia-installer.deb não encontrado, pulando instalação..."
fi

# 4. Instalar ambiente desktop e VNC
echo "[4/8] Instalando XFCE e TigerVNC..."
echo "  Atualizando repositórios..."
apt update -qq 2>&1 | grep -v "packages can be upgraded" || true
echo "  Instalando pacotes (isso pode levar alguns minutos)..."
DEBIAN_FRONTEND=noninteractive apt install -y xfce4 xfce4-goodies tigervnc-standalone-server tigervnc-common 2>&1 | grep -E "(Setting up|Unpacking)" || echo "  Instalação em andamento..."

# 5. Configurar senha VNC automaticamente
echo "[5/8] Configurando senha VNC..."
VNC_PASSWORD="chatia2025"
mkdir -p /home/deploy/.vnc
echo "$VNC_PASSWORD" | vncpasswd -f > /home/deploy/.vnc/passwd
chmod 600 /home/deploy/.vnc/passwd

# Criar arquivo .Xresources vazio para evitar erro
touch /home/deploy/.Xresources
chown deploy:deploy /home/deploy/.Xresources

chown -R deploy:deploy /home/deploy/.vnc

# 6. Criar xstartup para XFCE
echo "[6/8] Configurando XFCE como desktop padrão..."
cat > /home/deploy/.vnc/xstartup << 'EOF'
#!/bin/bash
unset SESSION_MANAGER
unset DBUS_SESSION_BUS_ADDRESS

[ -r $HOME/.Xresources ] && xrdb $HOME/.Xresources
xsetroot -solid grey

# Iniciar XFCE
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
# Matar qualquer sessão existente
sudo -u deploy vncserver -kill :1 > /dev/null 2>&1 || true
sudo -u deploy vncserver -kill :2 > /dev/null 2>&1 || true
sleep 2

# Iniciar VNC com display :1
echo "  Iniciando servidor VNC..."
sudo -u deploy vncserver :1 -localhost no -geometry 1920x1080 -depth 24 > /tmp/vnc-start.log 2>&1

# Verificar se iniciou
sleep 3
if pgrep -u deploy Xtigervnc > /dev/null; then
    echo "  ✓ VNC iniciado com sucesso"
else
    echo "  ⚠️  VNC pode não ter iniciado corretamente"
    echo "  Veja os logs: tail -f /home/deploy/.vnc/*.log"
fi

# Descobrir IP
echo ""
echo "Detectando IP público..."
IP=$(curl -s -4 ifconfig.me 2>/dev/null || curl -s -4 icanhazip.com 2>/dev/null || hostname -I | awk '{print $1}')

# Verificar se VNC está rodando
sleep 2
if pgrep -u deploy Xvnc > /dev/null; then
    VNC_STATUS="✅ Rodando"
else
    VNC_STATUS="⚠️  Verificar logs"
fi

# Exibir informações de conexão
echo ""
echo "========================================="
echo "  ✅ CONFIGURAÇÃO CONCLUÍDA!"
echo "========================================="
echo ""
echo "📊 STATUS:"
echo "   VNC Server: $VNC_STATUS"
echo "   IP Público: $IP"
echo "   Porta VNC:  5901"
echo ""
echo "========================================="
echo "  📱 CONECTAR VIA FINDER (macOS)"
echo "========================================="
echo ""
echo "   1. No Mac, pressione: Cmd + K"
echo ""
echo "   2. Cole este endereço:"
echo ""
echo "      vnc://$IP:5901"
echo ""
echo "   3. Senha VNC:"
echo ""
echo "      $VNC_PASSWORD"
echo ""
echo "========================================="
echo "  🖥️  EXECUTAR INSTALADOR GRÁFICO"
echo "========================================="
echo ""
echo "   Após conectar no VNC:"
echo ""
echo "   1. Clique com botão direito no desktop"
echo "   2. Selecione: Open Terminal"
echo "   3. Digite: chatia-installer"
echo ""
echo "========================================="
echo "  🔐 COMANDOS ÚTEIS"
echo "========================================="
echo ""
echo "   Parar VNC:"
echo "   sudo -u deploy vncserver -kill :1"
echo ""
echo "   Iniciar VNC:"
echo "   sudo -u deploy vncserver -localhost no"
echo ""
echo "   Ver logs:"
echo "   tail -f /home/deploy/.vnc/*.log"
echo ""
echo "   Status VNC:"
echo "   ps aux | grep Xvnc"
echo ""
echo "========================================="
echo ""

# Verificar arquivos baixados
echo "📦 ARTEFATOS BAIXADOS:"
echo ""
cd /home/deploy/chatia-install
for FILE in manifest.json backend_dist.tar.gz backend_node_modules.tar.gz frontend_build.tar.gz chatia-installer.deb; do
    if [ -f "$FILE" ]; then
        SIZE=$(du -h "$FILE" | cut -f1)
        echo "   ✓ $FILE ($SIZE)"
    else
        echo "   ✗ $FILE (não baixado)"
    fi
done
echo ""
echo "========================================="
