/**
 * Script de teste para endpoint /tags/list
 * Faz login e testa o endpoint que está dando erro 500
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

async function testTagsEndpoint() {
  try {
    console.log('🔐 Step 1: Fazendo login...');

    // Login com credenciais de teste (ajuste conforme necessário)
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@admin.com', // Ajuste se necessário
      password: 'admin' // Ajuste se necessário
    });

    const token = loginResponse.data.token;
    console.log('✅ Login bem-sucedido! Token obtido.');

    console.log('\n📞 Step 2: Testando endpoint /tags/list?kanban=0...\n');

    // Fazer requisição ao endpoint problemático
    const response = await axios.get(`${BASE_URL}/tags/list?kanban=0`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Sucesso! Status:', response.status);
    console.log('📦 Dados retornados:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('\n❌ ERRO CAPTURADO:');
    console.error('Status:', error.response?.status);
    console.error('Mensagem:', error.response?.data);
    console.error('\nStack trace:', error.stack);

    // Verificar se é erro 500
    if (error.response?.status === 500) {
      console.error('\n🚨 CONFIRMADO: Erro 500 - Internal Server Error');
      console.error('Detalhes do erro:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Executar teste
console.log('🧪 Iniciando teste do endpoint /tags/list...\n');
testTagsEndpoint();
