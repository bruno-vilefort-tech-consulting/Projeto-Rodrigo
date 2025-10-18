# ChatIA Instalador - VNC Setup Simplificado

## 🚀 Instalação em 2 Comandos

### 1️⃣ Na VPS (via SSH):

```bash
# Baixar o script
wget https://raw.githubusercontent.com/bruno-vilefort-tech-consulting/Projeto-Rodrigo/v5.0.0/@instalador/setup-vnc.sh

# Executar (requer root)
sudo bash setup-vnc.sh
```

O script irá:
- ✅ Criar usuário `deploy`
- ✅ Baixar todos os artefatos do ChatIA
- ✅ Instalar o instalador gráfico
- ✅ Configurar XFCE + VNC
- ✅ Liberar firewall
- ✅ Exibir IP e senha para conexão

### 2️⃣ No Mac (via Finder):

Após o script terminar, ele mostrará algo como:

```
📱 CONECTAR VIA FINDER (macOS):

   1. No Mac, pressione: Cmd + K

   2. Cole este endereço:
      vnc://138.201.123.45:5901

   3. Senha VNC:
      chatia2025
```

**Copie o endereço VNC e cole no Finder!**

---

## 🖥️ Executar o Instalador

Depois de conectar via VNC:

1. Você verá o desktop XFCE
2. Clique com botão direito → **Open Terminal**
3. Digite no terminal:

```bash
chatia-installer
```

A interface gráfica do instalador abrirá! 🎉

---

## 📋 Informações Padrão

| Item | Valor |
|------|-------|
| **Usuário VNC** | `deploy` |
| **Senha VNC** | `chatia2025` |
| **Porta VNC** | `5901` |
| **Desktop** | XFCE4 |

⚠️ **Atenção:** Mude a senha VNC depois! Execute na VPS:
```bash
sudo -u deploy vncpasswd
```

---

## 🔧 Comandos Úteis

```bash
# Parar VNC
sudo -u deploy vncserver -kill :1

# Iniciar VNC
sudo -u deploy vncserver -localhost no

# Ver logs
tail -f /home/deploy/.vnc/*.log

# Listar sessões
sudo -u deploy vncserver -list
```

---

## 🔐 Segurança

Depois de usar o instalador, **pare o VNC**:

```bash
sudo -u deploy vncserver -kill :1
sudo ufw deny 5901/tcp
```

---

## ❌ Troubleshooting

### VNC não conecta?

```bash
# Verificar se está rodando
ps aux | grep vnc

# Ver porta aberta
netstat -tuln | grep 5901

# Reiniciar VNC
sudo -u deploy vncserver -kill :1
sudo -u deploy vncserver -localhost no
```

### Esqueceu a senha?

```bash
# Redefinir senha VNC
sudo -u deploy vncpasswd
```

### Firewall bloqueando?

```bash
# Liberar porta
sudo ufw allow 5901/tcp
sudo iptables -I INPUT -p tcp --dport 5901 -j ACCEPT
```

---

## 📦 O que o Script Faz?

1. Cria usuário `deploy` (senha: `chatia2025`)
2. Baixa artefatos do GitHub Release v5.0.0
3. Instala `chatia-installer.deb`
4. Instala XFCE4 + TigerVNC
5. Configura senha VNC automaticamente
6. Inicia VNC server na porta 5901
7. Exibe IP e credenciais

**Pronto para usar!** 🎉
