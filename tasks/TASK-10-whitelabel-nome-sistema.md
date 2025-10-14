# TASK-10: Corrigir Nome do Sistema que Reverte para "ChatIA" (WhiteLabel)

**Prioridade:** 🔴 Crítico (5)
**Tempo Estimado:** 3h
**Categoria:** Frontend
**Status:** [ ] Pendente
**Complexidade:** Média
**Risco:** Médio (afeta branding contratual)

---

## 📋 Descrição do Problema

**Sintoma**: "Ao carregar o nome do sistema muda para ChatIA mesmo estando configurado outro no WhiteLabel"

**Impacto**:
- 100% dos clientes WhiteLabel afetados
- **Violação contratual**: Clientes pagam por WhiteLabel mas veem "ChatIA"
- Branding personalizado perdido após reload (F5)
- Usuário vê "ChatIA" por ~1-2 segundos antes do nome correto aparecer

---

## 🔍 Análise Técnica (Causa Raiz)

### Race Condition de Carregamento + Ausência de Cache

**Timeline do Problema:**
```
t=0ms    → index.html carrega: <title>ChatIA · Carregando</title> ❌
t=50ms   → React App monta
t=100ms  → App.js inicia 6 API calls SEQUENCIAIS:
           1. GET /public-settings/appName         (~120ms)
           2. GET /public-settings/favicon         (~120ms)
           3. GET /public-settings/logo            (~130ms)
           4. GET /public-settings/primaryColor    (~110ms)
           5. GET /public-settings/secondaryColor  (~110ms)
           6. GET /public-settings/loginImg        (~160ms)
t=750ms  → API calls terminam
t=800ms  → document.title finalmente atualizado com appName
           ❌ Usuário viu "ChatIA" por 800ms
```

**Arquivos Identificados:**
1. **`frontend/public/index.html:12`** - Título hardcoded "ChatIA · Carregando"
2. **`frontend/src/App.js:220-227`** - 6 chamadas sequenciais (não usa cache)
3. **`frontend/src/hooks/useSettings/index.js:31-42`** - Hook getPublicSetting()

---

## ✅ Solução em 3 Etapas

### Etapa 1: Cache localStorage (PRIORITÁRIO - 5 minutos)

#### 1.1 Script no index.html

**Arquivo:** `frontend/public/index.html`
**Ação:** Adicionar script ANTES de `</head>`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <!-- ... outros meta tags ... -->

    <!-- ✅ ADICIONAR ESTE SCRIPT -->
    <script>
      // Ler appName do cache ANTES do React montar
      const cachedAppName = localStorage.getItem('appName');
      if (cachedAppName) {
        document.title = cachedAppName;
      } else {
        document.title = 'Carregando...'; // Genérico
      }
    </script>

    <title>Carregando...</title> <!-- Fallback -->
  </head>
  <body>
    <!-- ... -->
  </body>
</html>
```

#### 1.2 Modificar App.js para Usar Cache

**Arquivo:** `frontend/src/App.js`
**Ação:** Modificar linhas 220-227

**ANTES (❌ SEM CACHE):**
```javascript
useEffect(() => {
  const fetchAppName = async () => {
    try {
      const { data } = await api.get('/public-settings/appName');
      setAppName(data.value);
    } catch (err) {
      console.error('Erro ao carregar appName:', err);
    }
  };
  fetchAppName();
}, []);
```

**DEPOIS (✅ COM CACHE):**
```javascript
useEffect(() => {
  const loadAppName = async () => {
    // ✅ 1. Tentar carregar do cache PRIMEIRO (síncrono)
    const cachedAppName = localStorage.getItem('appName');
    if (cachedAppName) {
      setAppName(cachedAppName);
      document.title = cachedAppName; // Atualiza imediatamente
    }

    // ✅ 2. Depois buscar atualizado da API (assíncrono)
    try {
      const { data } = await api.get('/public-settings/appName');
      const newAppName = data.value;

      setAppName(newAppName);
      localStorage.setItem('appName', newAppName);
      document.title = newAppName;
    } catch (err) {
      console.error('Erro ao carregar appName:', err);
      // Se falhar, mantém o cache
    }
  };

  loadAppName();
}, []);

// ✅ 3. Adicionar useEffect reativo
useEffect(() => {
  if (appName) {
    document.title = appName;
  }
}, [appName]);
```

**Resultado:** Título correto em **~50ms** (vs ~1000ms atual) = **20x mais rápido**

---

### Etapa 2: Paralelização (OTIMIZAÇÃO - 10 minutos)

**Arquivo:** `frontend/src/App.js`
**Ação:** Refatorar 6 chamadas sequenciais para paralelas

```javascript
useEffect(() => {
  const loadWhiteLabelSettings = async () => {
    const settingsKeys = [
      'appName',
      'favicon',
      'logo',
      'primaryColor',
      'secondaryColor',
      'loginImg'
    ];

    // ✅ 1. Carregar cache instantaneamente
    const cachedAppName = localStorage.getItem('appName');
    if (cachedAppName) {
      setAppName(cachedAppName);
      document.title = cachedAppName;
    }

    // ✅ 2. Executar chamadas EM PARALELO
    const results = await Promise.allSettled(
      settingsKeys.map(key => api.get(`/public-settings/${key}`))
    );

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const key = settingsKeys[index];
        const value = result.value.data.value;

        localStorage.setItem(key, value);

        if (key === 'appName') {
          setAppName(value);
          document.title = value;
        } else if (key === 'favicon') {
          const link = document.querySelector("link[rel='icon']");
          if (link) link.href = value;
        } else if (key === 'primaryColor') {
          setPrimaryColor(value);
        }
        // ... demais configurações
      }
    });
  };

  loadWhiteLabelSettings();
}, []);
```

**Resultado:** Carregamento total de **~750ms** para **~150ms** = **5x mais rápido**

---

### Etapa 3: Socket.IO Listener (FUTURO - 15 minutos)

**Arquivo:** `frontend/src/App.js`
**Ação:** Adicionar listener para atualizar dinamicamente

```javascript
useEffect(() => {
  const socket = getSocket();

  socket.on('whitelabel:update', (data) => {
    if (data.key === 'appName') {
      setAppName(data.value);
      localStorage.setItem('appName', data.value);
      document.title = data.value;
    }
    // Demais configurações...
  });

  return () => socket.off('whitelabel:update');
}, []);
```

**Resultado:** Usuários veem mudança sem precisar dar F5

---

## 📂 Arquivos a Modificar

| Arquivo | Ação | Linha(s) | Prioridade |
|---------|------|----------|------------|
| `frontend/public/index.html` | Adicionar script cache | Antes `</head>` | ⚠️ OBRIGATÓRIO |
| `frontend/src/App.js` | Modificar useEffect (cache + reativo) | 220-227 | ⚠️ OBRIGATÓRIO |
| `frontend/src/App.js` | Paralelizar chamadas API (opcional) | 220-250 | 🔹 Otimização |
| `frontend/src/hooks/useSettings/index.js` | Verificar (apenas leitura) | 31-42 | ℹ️ Info |

---

## 🧪 Casos de Teste

### Teste 1: Título Correto Instantâneo
**Entrada:** F5 na página (com cache populado)
**Esperado:** Título correto aparece em < 100ms
**Validação:** DevTools Performance tab

### Teste 2: Título Correto Sem Cache
**Entrada:** Limpar localStorage + F5
**Esperado:**
1. Vê "Carregando..." por ~150ms
2. Título correto aparece após API retornar
**Validação:** Não vê "ChatIA" em nenhum momento

### Teste 3: Persistência Após Reload
**Entrada:** Admin muda appName, usuário dá F5
**Esperado:**
1. Vê título antigo (cache) instantaneamente
2. Título atualiza para novo após API (< 200ms)
**Validação:** Sem "flash" de "ChatIA"

### Teste 4: Favicon Também Atualiza
**Entrada:** Verificar ícone da aba
**Esperado:** Favicon customizado, não default
**Validação:** Inspecionar `<link rel="icon">`

---

## ✓ Critérios de Aceitação

- [ ] **AC1:** Título correto aparece em < 100ms (com cache)
- [ ] **AC2:** Usuário nunca vê "ChatIA" se WhiteLabel configurado
- [ ] **AC3:** Sem "flash" ou "blink" do título
- [ ] **AC4:** Cache atualizado quando admin muda configuração
- [ ] **AC5:** Funciona offline (com cache)
- [ ] **AC6:** Performance: 6 API calls terminam em < 200ms (paralelas)
- [ ] **AC7:** Favicon, logo, cores também usam cache
- [ ] **AC8:** localStorage não estoura (verificar tamanho)

---

## 📊 Estimativa Detalhada

| Etapa | Atividade | Tempo | Detalhes |
|-------|-----------|-------|----------|
| **Etapa 1** | Script index.html | 10 min | 5 linhas JS |
| **Etapa 1** | Modificar App.js (cache) | 20 min | useEffect + localStorage |
| **Etapa 1** | useEffect reativo | 10 min | Atualizar document.title |
| **Etapa 2** | Paralelizar API calls | 30 min | Promise.allSettled |
| **Etapa 2** | Refatorar setters | 30 min | appName, favicon, colors |
| **Testes** | Validar 4 cenários | 30 min | Manual + DevTools |
| **Code Review** | Revisar + aprovar | 30 min | 1 revisor |
| **TOTAL** | | **3h** | Média complexidade |

---

## Performance Esperada

| Métrica | Atual | Após Etapa 1 | Após Etapa 2 |
|---------|-------|--------------|--------------|
| Título correto aparece | ~1000ms | **~50ms** ✅ | **~50ms** ✅ |
| Carregamento total (6 settings) | ~750ms | ~750ms | **~150ms** ✅ |
| Cache hit | ❌ Não | ✅ Sim | ✅ Sim |
| API calls concorrentes | ❌ Não (sequencial) | ❌ Não | ✅ Sim (paralelo) |

---

## 📚 Referências

- **Análise Completa:** `docs/analysis/TASK-10-whitelabel-persistence-analysis.md` (~1,200 linhas)
- **Relatório Consolidado:** `docs/analysis/CRITICAL-TASKS-EXECUTIVE-REPORT.md`

---

**Prompt Gerado por:** Claude Code
**Data:** 2025-10-12
