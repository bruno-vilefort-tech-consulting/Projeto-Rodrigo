# 🚀 Ordem de Implementação - ChatIA Flow v2.2.2v-26

**Total Tasks:** 14 | **Tempo Total:** 40h30min | **Prazo:** 2 semanas com squad

---

## 🎯 Estratégia de Execução

### Princípios da Ordem Escolhida:
1. **Segurança Primeiro:** Vazamentos de dados são bloqueadores legais (LGPD/GDPR)
2. **Críticas Antes:** Bugs que impedem operação normal do sistema
3. **Alta Prioridade:** Funcionalidades quebradas reportadas por usuários
4. **Dependências:** Tarefas que desbloqueiam outras
5. **Risco vs Impacto:** Minimizar tempo de exposição a vulnerabilidades

---

## 📊 FASE 1: EMERGÊNCIA (Dia 1-2) - 16h

### 🚨 TASK-09 - Contatos Estranhos (Segurança Multi-Tenant)
**Prioridade:** EMERGÊNCIA
**Tempo:** 16h
**Risco:** 🔴 CRÍTICO - Exposição de dados entre empresas

**Por que primeiro:**
- **Vulnerabilidade LGPD/GDPR:** Multas de até 2% do faturamento
- **19 pontos de vazamento:** Dados de contatos, tickets, usuários, tags, campanhas
- **Impacto:** Todas as empresas afetadas

**Dependências:** Nenhuma (pode ser feito imediatamente)

**Equipe Sugerida:**
- 2 Devs Backend Sênior (conhecimento de Sequelize + Multi-tenant)
- 1 QA para testes de isolamento
- 1 Security Reviewer

**Testes Críticos:**
```bash
# Validar isolamento entre Empresa A e Empresa B
# Tentar acessar contato da Empresa B estando logado na Empresa A
# Deve retornar 403 Forbidden ou não encontrar o recurso
```

**Rollout:**
- Deploy em ambiente de staging
- Testes de regressão completos
- Deploy em produção fora do horário de pico
- Monitorar logs de acesso negado

---

## 📊 FASE 2: CORREÇÕES CRÍTICAS (Dia 3-5) - 14h

### 🔴 TASK-03 - Race Condition em Aceitar Ticket (Dia 3)
**Prioridade:** CRÍTICA
**Tempo:** 6h
**Risco:** 🟠 ALTO - Perda de tickets ou duplicação

**Por que agora:**
- **Bug de concorrência:** Múltiplos atendentes aceitam mesmo ticket
- **4 race conditions identificadas:** UpdateTicket, CreateTicket, Queue, WhatsApp
- **Bloqueia operação:** Tickets perdidos = clientes sem atendimento

**Dependências:**
- ✅ TASK-09 completa (garante validação companyId nas transações)

**Equipe Sugerida:**
- 1 Dev Backend Sênior (experiência com transações)
- 1 QA para testes de carga/concorrência

**Testes Críticos:**
```bash
# Simular 3 atendentes aceitando mesmo ticket simultaneamente
# Apenas 1 deve ter sucesso
# Os outros 2 devem receber erro 409 Conflict
```

---

### 🔴 TASK-14 - FlowBuilder Perde Variáveis (Dia 4 manhã)
**Prioridade:** CRÍTICA
**Tempo:** 4h
**Risco:** 🟠 ALTO - Feature principal quebrada

**Por que agora:**
- **Feature core:** FlowBuilder é diferencial do produto
- **2 bugs de navegação:** Perde variáveis entre nodes + navegação errada
- **Bloqueia automação:** Clientes não conseguem criar flows complexos

**Dependências:**
- ⚠️ Recomendado após TASK-03 (evita conflitos em wbotMessageListener)

**Equipe Sugerida:**
- 1 Dev Backend Sênior (conhecimento de flows)
- 1 Dev Frontend (testar UI do FlowBuilder)
- 1 QA para testes end-to-end

**Testes Críticos:**
```javascript
// Flow com 3 nodes de pergunta em sequência:
// Node 1: "Qual seu nome?" → salva em variável "nome"
// Node 2: "Qual seu email?" → salva em variável "email"
// Node 3: "Qual seu telefone?" → salva em variável "telefone"
// ✅ Ao final, dataWebhook deve conter as 3 variáveis
```

---

### 🔴 TASK-10 - WhiteLabel Reverte no Reload (Dia 4 tarde)
**Prioridade:** CRÍTICA
**Tempo:** 3h
**Risco:** 🟡 MÉDIO - Experiência ruim mas não quebra funcionalidade

**Por que agora:**
- **Primeira impressão:** Cliente vê "ChatIA" ao invés da marca dele
- **Solução simples:** localStorage + script no index.html
- **Rápido de testar:** Basta recarregar a página

**Dependências:** Nenhuma (frontend isolado)

**Equipe Sugerida:**
- 1 Dev Frontend (30min código + 2h30 testes de navegadores)

**Testes Críticos:**
```bash
# Configurar appName como "MeuSistema"
# Recarregar página (F5)
# ✅ Título nunca deve mostrar "ChatIA"
# Testar em: Chrome, Firefox, Safari, Edge
```

---

### 🔴 TASK-01 - Idioma Árabe no Seletor (Dia 5)
**Prioridade:** CRÍTICA
**Tempo:** 1h
**Risco:** 🟢 BAIXO - Cosmético mas bloqueia mercado árabe

**Por que agora:**
- **Rápido de fazer:** Adicionar opção + ajustar spacing
- **Desbloqueia mercado:** Clientes árabes estão esperando
- **Sem riscos:** Mudança apenas no frontend

**Dependências:** Nenhuma

**Equipe Sugerida:**
- 1 Dev Frontend (1h)

**Testes Críticos:**
```bash
# Clicar no seletor de idioma
# ✅ "العربية" aparece na lista
# Selecionar árabe
# ✅ Interface muda para RTL (right-to-left)
# ✅ Espaçamento entre ícone e texto = 12px
```

---

## 📊 FASE 3: ALTA PRIORIDADE (Dia 6-7) - 5h

### 🟠 TASK-02 - Usuário Demo Não Criado (Dia 6 manhã)
**Prioridade:** ALTA
**Tempo:** 2h
**Risco:** 🟢 BAIXO - Feature nova, não quebra nada existente

**Por que agora:**
- **Facilita onboarding:** Novas empresas já vêm com usuário demo
- **Hook de model:** Mudança isolada no backend
- **Rápido de testar:** Criar empresa e verificar

**Dependências:**
- ✅ TASK-09 completa (garante companyId no User.create)

**Equipe Sugerida:**
- 1 Dev Backend (2h)

**Testes Críticos:**
```typescript
// Criar nova empresa "Acme Corp"
// Configurar createDemoUser = 'enabled'
// ✅ Usuário "Usuário Demo" deve ser criado automaticamente
// ✅ Email: demo@acmecorp.com
// ✅ Profile: 'user'
```

---

### 🟠 TASK-11 - 3 Erros na Tela de Contatos (Dia 6 tarde)
**Prioridade:** ALTA
**Tempo:** 2h
**Risco:** 🟡 MÉDIO - Tela usada frequentemente

**Por que agora:**
- **Múltiplos bugs:** Título errado, traduções, erro 500
- **Alta visibilidade:** Contatos é uma das telas mais usadas
- **Fix rápido:** Mudanças pontuais

**Dependências:** Nenhuma

**Equipe Sugerida:**
- 1 Dev Fullstack (1h backend + 1h frontend)

**Testes Críticos:**
```bash
# 1. Verificar coluna "WhatsApp" (não "Conexão")
# 2. Trocar idioma para português - traduções corretas
# 3. Importar CSV com erro - deve retornar mensagem amigável (não 500)
```

---

### 🟠 TASK-12 - Erro Automação Kanban (Dia 7)
**Prioridade:** ALTA
**Tempo:** 1h
**Risco:** 🟡 MÉDIO - Automações falham silenciosamente

**Por que agora:**
- **Automação quebrada:** Tickets não movem entre colunas
- **Fix rápido:** Adicionar companyId + transação
- **Desbloqueia workflows:** Clientes usam Kanban para gestão

**Dependências:**
- ✅ TASK-09 completa (padrão de validação companyId)

**Equipe Sugerida:**
- 1 Dev Backend (1h)

**Testes Críticos:**
```typescript
// Criar automação: "Mover ticket para coluna Resolvido quando status = closed"
// Fechar ticket
// ✅ Ticket deve mover para coluna Resolvido
// ✅ Não deve dar erro se tentar mover de volta
```

---

## 📊 FASE 4: MÉDIA PRIORIDADE (Dia 8-9) - 7h15min

### 🟡 TASK-13 - Recuperar Senha + SMTP (Dia 8)
**Prioridade:** MÉDIA
**Tempo:** 4h
**Risco:** 🟠 ALTO - Configuração SMTP pode ter problemas

**Por que agora:**
- **Feature importante:** Usuários esquecem senhas
- **Requer configuração:** SMTP precisa de credenciais reais
- **Testes manuais:** Enviar emails reais para testar

**Dependências:** Nenhuma

**Equipe Sugerida:**
- 1 Dev Fullstack (2h código + 2h configuração SMTP)
- 1 DevOps para configurar credenciais em produção

**Testes Críticos:**
```bash
# 1. Clicar em "Esqueci minha senha"
# 2. Digitar email válido
# 3. ✅ Email deve chegar em até 1 minuto
# 4. Clicar no link do email
# 5. ✅ Página de redefinir senha deve abrir
# 6. Definir nova senha
# 7. ✅ Login com nova senha deve funcionar
```

---

### 🟡 TASK-06 - Buscador Empresas + Senha (Dia 9 manhã)
**Prioridade:** MÉDIA
**Tempo:** 2h30min
**Risco:** 🟢 BAIXO - Melhorias de UX

**Por que agora:**
- **2 melhorias relacionadas:** Busca + toggle senha
- **Tela administrativa:** Usada por superadmins
- **Não bloqueia:** Sistema funciona sem, mas melhora UX

**Dependências:** Nenhuma

**Equipe Sugerida:**
- 1 Dev Frontend (2h30min)

**Testes Críticos:**
```javascript
// 1. Buscar por "Acme" → filtra empresas
// 2. Buscar por "contato@acme.com" → filtra por email
// 3. Buscar por "12345678000190" → filtra por CNPJ
// 4. Clicar em editar empresa → modal abre
// 5. Clicar no ícone de olho no campo senha → senha aparece
```

---

### 🟡 TASK-04 - Remover "Lista de Arquivos" (Dia 9 tarde)
**Prioridade:** MÉDIA
**Tempo:** 45min
**Risco:** 🟢 BAIXO - Remover código obsoleto

**Por que agora:**
- **Limpeza de código:** Remove item não usado
- **Rápido:** Comentar 10 linhas
- **Sem riscos:** Não afeta funcionalidades ativas

**Dependências:** Nenhuma

**Equipe Sugerida:**
- 1 Dev Frontend (45min)

**Testes Críticos:**
```bash
# 1. Abrir menu lateral
# ✅ "Lista de arquivos" não deve aparecer
# 2. Navegar para /files
# ✅ Deve retornar 404
# 3. Console do navegador
# ✅ Sem erros
```

---

## 📊 FASE 5: BAIXA PRIORIDADE (Dia 10) - 2h45min

### 🟢 TASK-05 - Título "Empresas" (Dia 10 manhã)
**Prioridade:** BAIXA
**Tempo:** 30min
**Risco:** 🟢 BAIXO - Mudança de texto

**Por que agora:**
- **Melhoria de UX:** Título mais claro
- **Rápido:** Alterar 5 arquivos de tradução
- **Sem riscos:** Apenas texto

**Dependências:** Nenhuma

**Equipe Sugerida:**
- 1 Dev Frontend (30min)

**Testes Críticos:**
```bash
# Testar nos 5 idiomas:
# pt: "Empresas" ✅
# en: "Companies" ✅
# es: "Empresas" ✅
# tr: "Şirketler" ✅
# ar: "الشركات" ✅
```

---

### 🟢 TASK-07 - Ícone Olho Senha Usuários (Dia 10 meio-dia)
**Prioridade:** BAIXA
**Tempo:** 45min
**Risco:** 🟢 BAIXO - Melhoria de UX

**Por que agora:**
- **Consistência:** Mesmo padrão do TASK-06
- **Rápido:** Copy-paste do código de TASK-06
- **UX melhorado:** Usuário vê senha digitada

**Dependências:**
- ✅ Recomendado após TASK-06 (reaproveitar código)

**Equipe Sugerida:**
- 1 Dev Frontend (45min)

**Testes Críticos:**
```javascript
// 1. Criar/editar usuário
// 2. Clicar no ícone de olho no campo senha
// ✅ Senha aparece em texto plano
// 3. Clicar novamente
// ✅ Senha oculta com bullets (•••)
```

---

### 🟢 TASK-08 - Configurações Planos (Dia 10 tarde)
**Prioridade:** BAIXA
**Tempo:** 1h30min
**Risco:** 🟢 BAIXO - Mudanças cosméticas

**Por que agora:**
- **2 ajustes pequenos:** Ocultar campo + renomear texto
- **Tela administrativa:** Baixo impacto
- **Últimas melhorias:** Fechar sprint com pequenos ajustes

**Dependências:** Nenhuma

**Equipe Sugerida:**
- 1 Dev Frontend (1h30min)

**Testes Críticos:**
```bash
# 1. Abrir modal de criar/editar plano
# ✅ Campo "Público" não aparece
# 2. Verificar textos da interface
# ✅ "Prompts" aparece (não "Talk.ia")
```

---

## 📋 Resumo da Ordem

```
FASE 1 (Dia 1-2): EMERGÊNCIA
└─ TASK-09 (16h) 🚨 Segurança Multi-Tenant

FASE 2 (Dia 3-5): CRÍTICAS
├─ TASK-03 (6h)  🔴 Race Conditions
├─ TASK-14 (4h)  🔴 FlowBuilder
├─ TASK-10 (3h)  🔴 WhiteLabel
└─ TASK-01 (1h)  🔴 Idioma Árabe

FASE 3 (Dia 6-7): ALTA
├─ TASK-02 (2h)  🟠 Demo User
├─ TASK-11 (2h)  🟠 Tela Contatos
└─ TASK-12 (1h)  🟠 Kanban Automação

FASE 4 (Dia 8-9): MÉDIA
├─ TASK-13 (4h)      🟡 SMTP
├─ TASK-06 (2h30min) 🟡 Empresas Busca
└─ TASK-04 (45min)   🟡 Remover Menu

FASE 5 (Dia 10): BAIXA
├─ TASK-05 (30min)   🟢 Título Empresas
├─ TASK-07 (45min)   🟢 Senha Usuários
└─ TASK-08 (1h30min) 🟢 Planos Config
```

**Total:** 40h30min (~10 dias úteis com testes)

---

## 🧪 Estratégia de Testes

### Testes de Regressão (Após cada FASE):
```bash
# 1. Rodar suite de testes automatizados
npm test

# 2. Testes manuais críticos
- Login multi-tenant (Empresa A não vê dados da Empresa B)
- Criar/aceitar ticket
- Criar flow no FlowBuilder
- Enviar mensagem WhatsApp
- Importar contatos

# 3. Testes de carga (Após FASE 2)
- 100 atendentes aceitando tickets simultaneamente
- 1000 mensagens em fila
```

### Checklist de Deploy:
- [ ] Branch testada em staging
- [ ] Code review aprovado
- [ ] Testes automatizados passando
- [ ] Testes manuais validados
- [ ] Backup do banco de dados
- [ ] Deploy em horário de baixo tráfego
- [ ] Monitorar logs por 1h após deploy
- [ ] Rollback pronto se necessário

---

## 👥 Alocação de Recursos

### Squad Recomendado:
- **2 Devs Backend Sênior** (TASK-09, 03, 14, 02, 12)
- **2 Devs Frontend** (TASK-01, 10, 04, 05, 06, 07, 08)
- **1 Dev Fullstack** (TASK-11, 13)
- **1 QA** (Testes de todas as tasks)
- **1 Security Reviewer** (TASK-09)
- **1 DevOps** (SMTP config, deploys)

### Timeline Realista:
- **Com squad completo:** 10 dias úteis
- **Com 2 devs:** 4 semanas
- **Com 1 dev:** 8 semanas

---

## ⚠️ Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| SMTP não configurado | 🟡 Média | 🟠 Alto | Testar com Gmail antes de produção |
| Race conditions persistem | 🟢 Baixa | 🔴 Crítico | Testes de carga com 100+ usuários |
| Rollback necessário | 🟢 Baixa | 🟠 Alto | Backup antes de cada deploy |
| Dependências quebradas | 🟡 Média | 🟡 Médio | Rodar npm install antes de cada task |
| Vazamento de dados não corrigido | 🟢 Baixa | 🔴 Crítico | Auditoria de segurança após TASK-09 |

---

## 📈 Métricas de Sucesso

### KPIs Após Conclusão:
- ✅ **0 vazamentos** de dados multi-tenant
- ✅ **0 tickets duplicados** em race conditions
- ✅ **100% dos flows** mantêm variáveis corretamente
- ✅ **0 segundos** de "ChatIA" visível no WhiteLabel
- ✅ **5 idiomas** disponíveis no seletor
- ✅ **< 1 minuto** para receber email de recuperação
- ✅ **0 erros 500** na tela de Contatos

---

**Última Atualização:** 2025-10-12
**Versão:** 1.0
**Aprovado por:** Squad de Desenvolvimento
