# Testes de Isolamento Multi-Tenant - ChatIA Flow

**Data:** 2025-10-12
**Versão:** 1.0
**Autor:** Claude Code - Security Audit
**Prioridade:** 🔴 CRÍTICA

---

## Visão Geral

Este documento fornece instruções detalhadas para testar o isolamento multi-tenant após as correções de segurança aplicadas aos 15 services vulneráveis.

**Objetivo:** Garantir que a Empresa A não consiga acessar, modificar ou deletar dados da Empresa B.

---

## Pré-requisitos

1. Sistema com pelo menos 2 empresas cadastradas (companyId diferente)
2. Usuários autenticados em cada empresa
3. Dados de teste criados em cada empresa:
   - Contatos
   - Tickets
   - Usuários
   - Tags
   - Campanhas
   - Mensagens Rápidas

---

## Cenários de Teste

### 1. Teste de Isolamento: Contact (4 services)

#### 1.1 DeleteContactService

**Objetivo:** Verificar que Empresa A não pode deletar contato da Empresa B

**Setup:**
```bash
# Criar contato na Empresa B
POST /api/contacts
Authorization: Bearer <token_empresa_B>
{
  "name": "Contato Test B",
  "number": "5511999998888"
}

# Anotar o contactId retornado: <contactId_B>
```

**Teste:**
```bash
# Tentar deletar com token da Empresa A
DELETE /api/contacts/<contactId_B>
Authorization: Bearer <token_empresa_A>
```

**Resultado Esperado:**
- ✅ Status HTTP: `404 Not Found`
- ✅ Mensagem: `ERR_NO_CONTACT_FOUND`
- ✅ Contato da Empresa B permanece intacto

---

#### 1.2 ToggleAcceptAudioContactService

**Objetivo:** Verificar que Empresa A não pode modificar configuração de contato da Empresa B

**Teste:**
```bash
PUT /api/contacts/<contactId_B>/toggleAcceptAudio
Authorization: Bearer <token_empresa_A>
```

**Resultado Esperado:**
- ✅ Status HTTP: `404 Not Found`
- ✅ Configuração do contato B não é alterada

---

#### 1.3 ToggleDisableBotContactService

**Objetivo:** Verificar que Empresa A não pode desabilitar bot de contato da Empresa B

**Teste:**
```bash
PUT /api/contacts/<contactId_B>/toggleDisableBot
Authorization: Bearer <token_empresa_A>
```

**Resultado Esperado:**
- ✅ Status HTTP: `404 Not Found`

---

#### 1.4 BlockUnblockContactService

**Objetivo:** Verificar que Empresa A não pode bloquear/desbloquear contato da Empresa B

**Teste:**
```bash
POST /api/contacts/<contactId_B>/block
Authorization: Bearer <token_empresa_A>
{
  "active": false
}
```

**Resultado Esperado:**
- ✅ Status HTTP: `404 Not Found`

---

### 2. Teste de Isolamento: Ticket (1 service)

#### 2.1 DeleteTicketService

**Setup:**
```bash
# Criar ticket na Empresa B
POST /api/tickets
Authorization: Bearer <token_empresa_B>
{
  "contactId": <contactId_B>,
  "status": "open"
}

# Anotar ticketId retornado: <ticketId_B>
```

**Teste:**
```bash
DELETE /api/tickets/<ticketId_B>
Authorization: Bearer <token_empresa_A>
```

**Resultado Esperado:**
- ✅ Status HTTP: `404 Not Found`
- ✅ Ticket B permanece inalterado

---

### 3. Teste de Isolamento: User (1 service)

#### 3.1 DeleteUserService

**Setup:**
```bash
# Criar usuário na Empresa B (requer admin)
POST /api/users
Authorization: Bearer <token_admin_empresa_B>
{
  "name": "User Test B",
  "email": "test@empresab.com",
  "password": "Test@123"
}

# Anotar userId retornado: <userId_B>
```

**Teste:**
```bash
DELETE /api/users/<userId_B>
Authorization: Bearer <token_admin_empresa_A>
```

**Resultado Esperado:**
- ✅ Status HTTP: `404 Not Found`
- ✅ Usuário B não é deletado

---

### 4. Teste de Isolamento: Tag (3 services)

#### 4.1 ShowService

**Setup:**
```bash
# Criar tag na Empresa B
POST /api/tags
Authorization: Bearer <token_empresa_B>
{
  "name": "Tag Test B",
  "color": "#FF0000"
}

# Anotar tagId: <tagId_B>
```

**Teste:**
```bash
GET /api/tags/<tagId_B>
Authorization: Bearer <token_empresa_A>
```

**Resultado Esperado:**
- ✅ Status HTTP: `404 Not Found`

---

#### 4.2 UpdateService

**Teste:**
```bash
PUT /api/tags/<tagId_B>
Authorization: Bearer <token_empresa_A>
{
  "name": "Tag Modificada",
  "color": "#00FF00"
}
```

**Resultado Esperado:**
- ✅ Status HTTP: `404 Not Found`
- ✅ Tag B permanece com nome original

---

#### 4.3 DeleteService

**Teste:**
```bash
DELETE /api/tags/<tagId_B>
Authorization: Bearer <token_empresa_A>
```

**Resultado Esperado:**
- ✅ Status HTTP: `404 Not Found`

---

### 5. Teste de Isolamento: Campaign (3 services)

#### 5.1 ShowService

**Setup:**
```bash
# Criar campanha na Empresa B
POST /api/campaigns
Authorization: Bearer <token_empresa_B>
{
  "name": "Campaign Test B",
  "status": "INATIVA",
  ...
}

# Anotar campaignId: <campaignId_B>
```

**Teste:**
```bash
GET /api/campaigns/<campaignId_B>
Authorization: Bearer <token_empresa_A>
```

**Resultado Esperado:**
- ✅ Status HTTP: `404 Not Found`

---

#### 5.2 UpdateService

**Teste:**
```bash
PUT /api/campaigns/<campaignId_B>
Authorization: Bearer <token_empresa_A>
{
  "name": "Campaign Modificada"
}
```

**Resultado Esperado:**
- ✅ Status HTTP: `404 Not Found`

---

#### 5.3 DeleteService

**Teste:**
```bash
DELETE /api/campaigns/<campaignId_B>
Authorization: Bearer <token_empresa_A>
```

**Resultado Esperado:**
- ✅ Status HTTP: `404 Not Found`

---

### 6. Teste de Isolamento: QuickMessage (3 services)

#### 6.1 ShowService

**Setup:**
```bash
# Criar mensagem rápida na Empresa B
POST /api/quick-messages
Authorization: Bearer <token_empresa_B>
{
  "shortcode": "/testb",
  "message": "Test Quick Message B"
}

# Anotar quickMessageId: <quickMessageId_B>
```

**Teste:**
```bash
GET /api/quick-messages/<quickMessageId_B>
Authorization: Bearer <token_empresa_A>
```

**Resultado Esperado:**
- ✅ Status HTTP: `404 Not Found`

---

#### 6.2 UpdateService

**Teste:**
```bash
PUT /api/quick-messages/<quickMessageId_B>
Authorization: Bearer <token_empresa_A>
{
  "message": "Mensagem Modificada"
}
```

**Resultado Esperado:**
- ✅ Status HTTP: `404 Not Found`

---

#### 6.3 DeleteService

**Teste:**
```bash
DELETE /api/quick-messages/<quickMessageId_B>
Authorization: Bearer <token_empresa_A>
```

**Resultado Esperado:**
- ✅ Status HTTP: `404 Not Found`

---

## Testes Automatizados (Jest)

### Exemplo de Teste Unitário

```typescript
// backend/__tests__/unit/ContactServices/DeleteContactService.spec.ts

import DeleteContactService from "../../../src/services/ContactServices/DeleteContactService";
import Contact from "../../../src/models/Contact";
import AppError from "../../../src/errors/AppError";

describe("DeleteContactService - Multi-tenant Isolation", () => {
  it("should NOT delete contact from another company", async () => {
    // Arrange
    const companyA = 1;
    const companyB = 2;
    const contactIdB = "123";

    // Mock: Contact existe na empresa B
    jest.spyOn(Contact, "findOne").mockResolvedValue(null);

    // Act & Assert
    await expect(
      DeleteContactService(contactIdB, companyA)
    ).rejects.toThrow(new AppError("ERR_NO_CONTACT_FOUND", 404));
  });

  it("should successfully delete own company contact", async () => {
    // Arrange
    const companyA = 1;
    const contactIdA = "456";

    const mockContact = {
      id: contactIdA,
      companyId: companyA,
      destroy: jest.fn()
    };

    jest.spyOn(Contact, "findOne").mockResolvedValue(mockContact as any);

    // Act
    await DeleteContactService(contactIdA, companyA);

    // Assert
    expect(mockContact.destroy).toHaveBeenCalled();
  });
});
```

---

## Checklist de Validação

### Após Executar Todos os Testes:

- [ ] **Isolamento Contact**: 4/4 testes passaram
- [ ] **Isolamento Ticket**: 1/1 teste passou
- [ ] **Isolamento User**: 1/1 teste passou
- [ ] **Isolamento Tag**: 3/3 testes passaram
- [ ] **Isolamento Campaign**: 3/3 testes passaram
- [ ] **Isolamento QuickMessage**: 3/3 testes passaram

**TOTAL:** 15/15 testes devem passar

---

## Monitoramento em Produção

### Logs a Monitorar (Primeiras 48h após deploy):

```bash
# Buscar tentativas de acesso cross-tenant
grep "ERR_NO_.*_FOUND" logs/production.log | grep -E "404"

# Alertar se houver acessos bem-sucedidos com IDs de outra empresa
# (não deveria acontecer após as correções)
```

### Métricas a Acompanhar:

1. Taxa de erro 404 em endpoints modificados (deve aumentar se usuários tentarem acessos cross-tenant)
2. Tempo de resposta (não deve aumentar significativamente)
3. Volume de requisições bem-sucedidas (deve permanecer estável)

---

## Critérios de Aprovação

✅ **APROVADO PARA PRODUÇÃO SE:**
- Todos os 15 testes de isolamento retornam 404
- Testes automatizados passam
- Nenhum dado é vazado entre empresas
- Performance permanece estável

🔴 **BLOQUEAR DEPLOY SE:**
- Qualquer teste retornar 200 com dados de outra empresa
- Dados forem modificados/deletados cross-tenant
- Erros 500 ocorrerem nos testes

---

## Contatos de Emergência

**Equipe de Segurança:** security@chatia.com.br
**CTO:** cto@chatia.com.br
**DevOps On-call:** +55 11 9999-9999

---

**Última Atualização:** 2025-10-12
**Próxima Revisão:** Após deploy em produção
