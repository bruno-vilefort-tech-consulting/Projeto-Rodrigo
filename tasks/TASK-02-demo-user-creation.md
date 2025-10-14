# TASK-02: Corrigir Criação de Usuário Demo nas Configurações

**Prioridade:** 🟠 Alta (4)
**Tempo Estimado:** 3h
**Categoria:** Backend
**Status:** [ ] Pendente
**Complexidade:** Média
**Risco:** Médio

---

## 📋 Descrição do Problema

**Sintoma**: "Ao ativar nas configurações para o usuário criar a demo, mesmo estando 'Habilitado' não funciona"

**Impacto**:
- Novos clientes não recebem usuário demo conforme configurado
- Onboarding prejudicado (clientes não conseguem testar rapidamente)
- Configuração enganosa (diz "Habilitado" mas não funciona)

---

## 🔍 Análise Técnica (Causa Raiz)

**Hipóteses:**
1. Setting não está sendo lida no processo de criação de empresa
2. Lógica de criação de usuário demo comentada ou com erro
3. Hook/trigger não está executando

**Investigar:**
- Hook `AfterCreate` no modelo `Company`
- Service de criação de empresa
- Setting `createDemoUser` em `CompaniesSettings`

---

## ✅ Solução Proposta

### Implementar Hook AfterCreate

**Arquivo:** `backend/src/models/Company.ts`

```typescript
import { AfterCreate, Table, Column, Model } from 'sequelize-typescript';
import CompaniesSettings from './CompaniesSettings';
import User from './User';
import logger from '../utils/logger';

@Table
class Company extends Model<Company> {
  @Column
  name: string;

  // ... outros campos ...

  @AfterCreate
  static async createDemoUser(company: Company) {
    try {
      // 1. Buscar setting de demo user
      const setting = await CompaniesSettings.findOne({
        where: {
          companyId: company.id,
          key: 'createDemoUser'
        }
      });

      // 2. Se habilitado, criar usuário demo
      if (setting?.value === 'enabled' || setting?.value === 'true') {
        await User.create({
          name: 'Usuário Demo',
          email: `demo@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
          password: 'demo123', // Será hasheado pelo hook BeforeCreate do User
          profile: 'user',
          companyId: company.id
        });

        logger.info({
          message: 'Demo user created',
          companyId: company.id,
          companyName: company.name
        });
      }
    } catch (err) {
      logger.error({
        message: 'Error creating demo user',
        error: err.message,
        companyId: company.id
      });
      // Não lançar erro para não quebrar criação da empresa
    }
  }
}

export default Company;
```

### Usar Transação no Service

**Arquivo:** `backend/src/services/CompanyService/CreateCompanyService.ts`

```typescript
import { sequelize } from '../../database';
import Company from '../../models/Company';
import CompaniesSettings from '../../models/CompaniesSettings';

const CreateCompanyService = async (companyData: any) => {
  return await sequelize.transaction(async (t) => {
    // 1. Criar empresa
    const company = await Company.create(companyData, { transaction: t });

    // 2. Criar settings iniciais
    await CompaniesSettings.create({
      companyId: company.id,
      key: 'createDemoUser',
      value: 'enabled' // ou pegar de companyData
    }, { transaction: t });

    // Hook AfterCreate será executado após commit
    // e criará o usuário demo automaticamente

    return company;
  });
};

export default CreateCompanyService;
```

---

## 📂 Arquivos a Modificar

| Arquivo | Ação | Prioridade |
|---------|------|------------|
| `backend/src/models/Company.ts` | Adicionar hook `@AfterCreate` | ⚠️ OBRIGATÓRIO |
| `backend/src/services/CompanyService/CreateCompanyService.ts` | Adicionar transação + setting | ⚠️ OBRIGATÓRIO |
| `backend/src/models/CompaniesSettings.ts` | Verificar estrutura (leitura) | ℹ️ Info |

---

## 🧪 Casos de Teste

### Teste 1: Demo User Criado Quando Habilitado
**Entrada:** Criar empresa com `createDemoUser: 'enabled'`
**Esperado:**
- Empresa criada com sucesso
- Usuário demo existe no banco com:
  - `name: "Usuário Demo"`
  - `profile: "user"`
  - `companyId: {empresaId}`
  - `email: demo@{empresaNome}.com`

### Teste 2: Demo User NÃO Criado Quando Desabilitado
**Entrada:** Criar empresa com `createDemoUser: 'disabled'`
**Esperado:**
- Empresa criada com sucesso
- Nenhum usuário demo criado

### Teste 3: Senha Hasheada
**Entrada:** Verificar usuário demo no banco
**Esperado:** Campo `password` contém hash bcrypt, não "demo123"

---

## ✓ Critérios de Aceitação

- [ ] **AC1:** Empresa com setting "enabled" → usuário demo criado
- [ ] **AC2:** Empresa com setting "disabled" → usuário demo NÃO criado
- [ ] **AC3:** Senha do demo user está hasheada (bcrypt)
- [ ] **AC4:** Email do demo user é único (não conflita)
- [ ] **AC5:** Logs registram criação do demo user
- [ ] **AC6:** Transação garante atomicidade

---

## 📊 Estimativa

| Atividade | Tempo |
|-----------|-------|
| Implementar hook AfterCreate | 1h |
| Adicionar transação no service | 45min |
| Testes (2 cenários) | 1h |
| Code review | 15min |
| **TOTAL** | **3h** |

---

**Prompt Gerado por:** Claude Code
**Data:** 2025-10-12
