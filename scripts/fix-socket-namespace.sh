#!/bin/bash

# Script de correção do Socket.IO namespace mismatch
# Problema: Frontend usa /${companyId} mas backend espera /workspace-${companyId}
# Data: 2025-10-13

set -e

echo "========================================="
echo "Socket.IO Namespace Fix Script"
echo "========================================="
echo ""

# Definir caminhos
SOCKET_WORKER="frontend/src/services/SocketWorker.js"
BACKUP_FILE="${SOCKET_WORKER}.backup.$(date +%Y%m%d_%H%M%S)"

# Verificar se o arquivo existe
if [ ! -f "$SOCKET_WORKER" ]; then
    echo "❌ Erro: Arquivo $SOCKET_WORKER não encontrado!"
    exit 1
fi

echo "📄 Arquivo: $SOCKET_WORKER"
echo "💾 Backup: $BACKUP_FILE"
echo ""

# Criar backup
echo "Criando backup..."
cp "$SOCKET_WORKER" "$BACKUP_FILE"
echo "✅ Backup criado com sucesso"
echo ""

# Mostrar linha antes da correção
echo "📌 Linha ANTES da correção:"
grep -n "BACKEND_URL.*companyId" "$SOCKET_WORKER" || echo "Padrão não encontrado"
echo ""

# Aplicar correção
echo "Aplicando correção..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' 's|\${BACKEND_URL}/\${this?.companyId}|${BACKEND_URL}/workspace-${this?.companyId}|g' "$SOCKET_WORKER"
else
    # Linux
    sed -i 's|\${BACKEND_URL}/\${this?.companyId}|${BACKEND_URL}/workspace-${this?.companyId}|g' "$SOCKET_WORKER"
fi

# Verificar se a correção foi aplicada
if grep -q "workspace-\${this?.companyId}" "$SOCKET_WORKER"; then
    echo "✅ Correção aplicada com sucesso!"
    echo ""
    echo "📌 Linha DEPOIS da correção:"
    grep -n "BACKEND_URL.*workspace.*companyId" "$SOCKET_WORKER"
    echo ""
    echo "========================================="
    echo "✅ Fix completo! Namespace corrigido."
    echo "========================================="
    echo ""
    echo "Próximos passos:"
    echo "1. Revisar as mudanças: git diff $SOCKET_WORKER"
    echo "2. Testar a conexão Socket.IO"
    echo "3. Commitar: git add $SOCKET_WORKER && git commit -m 'fix: Socket.IO namespace mismatch'"
    echo ""
    echo "Para reverter: cp $BACKUP_FILE $SOCKET_WORKER"
else
    echo "❌ Erro: Correção não foi aplicada!"
    echo "Restaurando backup..."
    cp "$BACKUP_FILE" "$SOCKET_WORKER"
    exit 1
fi
