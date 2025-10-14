# 🚀 Prompts Otimizados - ChatIA Flow Tasks

> Prompts estruturados com XML tags, subtasks detalhadas e specialized agents para cada task do backlog

**Projeto:** ChatIA Flow v2.2.2v-26
**Data:** 2025-10-12
**Total de Tasks:** 14

---

## 📋 Índice por Categoria

### 🎨 Frontend (7 tasks)
1. [TASK-01: Seletor de idioma com árabe e espaçamento](#task-01-frontend--crítico-5)
2. [TASK-04: Remover aba lateral "Lista de arquivos"](#task-04-frontend--média-3)
3. [TASK-05: Alterar título "Cadastrar empresa" para "Empresas"](#task-05-frontend--baixa-2)
4. [TASK-06: Buscador na tela de Empresas e campo de senha com ícone](#task-06-frontend--média-3)
5. [TASK-07: Campo de senha com ícone de olho em Usuários](#task-07-frontend--baixa-2)
6. [TASK-10: Nome do sistema muda para ChatIA (WhiteLabel)](#task-10-frontend--crítico-5)
7. [TASK-11: Erros de tradução e "internal error" em Contatos](#task-11-frontend--alta-4)

### ⚙️ Backend (5 tasks)
8. [TASK-02: Demo user creation não funciona](#task-02-backend--alta-4)
9. [TASK-03: Erro ao aceitar contato em fila](#task-03-backend--crítico-5)
10. [TASK-08: Configurações de Planos - ocultar "Público" e renomear "Talk.ia"](#task-08-backend--baixa-2)
11. [TASK-09: Contatos estranhos e ajuste para busca global](#task-09-backend--alta-4)
12. [TASK-12: Erro no kanban ao automatizar retorno de coluna](#task-12-backend--alta-4)

### 🔄 Full-stack (2 tasks)
13. [TASK-13: Recuperar senha e configurar SMTP](#task-13-fullstack--média-3)
14. [TASK-14: FlowBuilder com dois blocos de perguntas não funciona](#task-14-fullstack--crítico-5)

---

## 🎯 Tasks Ordenadas por Prioridade

### Crítico (5) - 4 tasks
- TASK-01: Seletor de idioma
- TASK-03: Erro ao aceitar contato em fila
- TASK-10: WhiteLabel nome do sistema
- TASK-14: FlowBuilder blocos de perguntas

### Alta (4) - 4 tasks
- TASK-02: Demo user creation
- TASK-09: Contatos estranhos
- TASK-11: Erros em Contatos
- TASK-12: Kanban automação

### Média (3) - 3 tasks
- TASK-04: Remover aba lateral
- TASK-06: Buscador Empresas
- TASK-13: Recuperar senha

### Baixa (2) - 3 tasks
- TASK-05: Título Empresas
- TASK-07: Ícone senha Usuários
- TASK-08: Configurações Planos

---

# 📝 Prompts Detalhados

---

## TASK-01: Frontend | Crítico (5)

### 🎯 Título
**Corrigir seletor de idioma interno: adicionar árabe e ajustar espaçamento com ícone Lua/Sol**

### 📦 Contexto
```xml
<context>
  <project>ChatIA Flow v2.2.2v-26</project>
  <stack>React 17.0.2, Material-UI v4/v5, i18next</stack>
  <location>frontend/src/layout/</location>
  <feature>Sistema de internacionalização (5 idiomas)</feature>
  <current_languages>pt, en, es, tr</current_languages>
  <missing_language>ar (árabe)</missing_language>
  <ui_issue>Seletor muito colado com ícone de tema (Lua/Sol)</ui_issue>
</context>
```

### 🔴 Problema
```xml
<problem>
  <description>
    O seletor de idioma interno da aplicação apresenta dois problemas:
    1. Falta o idioma árabe (ar) na lista de opções, apesar de existir o arquivo de tradução
    2. O componente está visualmente muito próximo do ícone de toggle de tema (Lua/Sol), causando UX ruim
  </description>

  <impact>
    - Usuários que falam árabe não conseguem selecionar seu idioma nativo
    - UI confusa com elementos muito próximos
    - Inconsistência: o arquivo ar.js existe mas não está disponível na UI
  </impact>

  <location>
    Componente de layout que contém o seletor de idiomas e o toggle de tema,
    provavelmente em MainLayout ou AppBar
  </location>
</problem>
```

### ✅ Requisitos
```xml
<requirements>
  <functional>
    <requirement id="F1">Adicionar opção de idioma árabe (ar) no seletor</requirement>
    <requirement id="F2">Manter todos os idiomas existentes: pt, en, es, tr</requirement>
    <requirement id="F3">Tradução deve funcionar imediatamente ao selecionar árabe</requirement>
    <requirement id="F4">Aumentar espaçamento entre seletor e ícone Lua/Sol</requirement>
  </functional>

  <technical>
    <requirement id="T1">Usar i18next para gerenciar idiomas</requirement>
    <requirement id="T2">Carregar arquivo frontend/src/translate/languages/ar.js</requirement>
    <requirement id="T3">Adicionar marginRight ou padding no componente Select</requirement>
    <requirement id="T4">Verificar se o ícone Lua/Sol tem marginLeft adequado</requirement>
    <requirement id="T5">Manter acessibilidade (WCAG AA)</requirement>
  </technical>

  <visual>
    <requirement id="V1">Mínimo 16px de espaçamento entre seletor e ícone</requirement>
    <requirement id="V2">Alinhamento vertical centralizado</requirement>
    <requirement id="V3">Não quebrar layout em mobile</requirement>
  </visual>
</requirements>
```

### 📋 Subtasks
```xml
<subtasks>
  <subtask id="1" priority="high" estimated_time="15min">
    <title>Localizar componente do seletor de idiomas</title>
    <description>Encontrar o componente React que renderiza o Select de idiomas</description>
    <acceptance>Arquivo identificado e aberto no editor</acceptance>
    <hints>
      - Buscar por "language" ou "i18n" em frontend/src/layout/
      - Pode estar em MainListItems.js ou no AppBar
      - Procurar por Select ou FormControl do Material-UI
    </hints>
  </subtask>

  <subtask id="2" priority="high" estimated_time="10min">
    <title>Adicionar opção árabe no array de idiomas</title>
    <description>Incluir { value: 'ar', label: 'العربية' } no array de opções</description>
    <acceptance>Opção árabe visível no Select</acceptance>
    <code_example>
      const languages = [
        { value: 'pt', label: 'Português' },
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Español' },
        { value: 'tr', label: 'Türkçe' },
        { value: 'ar', label: 'العربية' } // ADICIONAR ESTA LINHA
      ];
    </code_example>
  </subtask>

  <subtask id="3" priority="high" estimated_time="10min">
    <title>Verificar carregamento do arquivo ar.js</title>
    <description>Garantir que frontend/src/translate/languages/ar.js está sendo importado</description>
    <acceptance>Sem erros no console ao selecionar árabe</acceptance>
    <hints>
      - Verificar frontend/src/translate/i18n.js
      - Deve ter import de todos os 5 idiomas
    </hints>
  </subtask>

  <subtask id="4" priority="medium" estimated_time="15min">
    <title>Ajustar espaçamento visual</title>
    <description>Adicionar marginRight no Select OU marginLeft no IconButton do tema</description>
    <acceptance>Mínimo 16px de espaço entre os elementos</acceptance>
    <code_example>
      // Opção 1: No Select
      <Select
        style={{ marginRight: 16 }}
        // ...
      />

      // Opção 2: No IconButton (Lua/Sol)
      <IconButton
        style={{ marginLeft: 16 }}
        onClick={colorMode.toggleColorMode}
      >
        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </code_example>
  </subtask>

  <subtask id="5" priority="medium" estimated_time="10min">
    <title>Testar em todos os idiomas</title>
    <description>Selecionar cada idioma e verificar se as traduções funcionam</description>
    <acceptance>Todas as 5 opções funcionam corretamente</acceptance>
  </subtask>

  <subtask id="6" priority="low" estimated_time="10min">
    <title>Testar responsividade</title>
    <description>Verificar layout em mobile (320px), tablet (768px) e desktop (1920px)</description>
    <acceptance>Sem quebra de layout em nenhuma resolução</acceptance>
  </subtask>
</subtasks>
```

### 📂 Arquivos
```xml
<files>
  <file action="read" priority="high">
    <path>frontend/src/layout/index.js</path>
    <reason>Componente principal do layout</reason>
  </file>

  <file action="read" priority="high">
    <path>frontend/src/layout/MainListItems.js</path>
    <reason>Menu lateral com possível seletor de idiomas</reason>
  </file>

  <file action="modify" priority="high">
    <path>[COMPONENTE_DO_SELETOR].js</path>
    <reason>Adicionar opção árabe e ajustar espaçamento</reason>
  </file>

  <file action="read" priority="medium">
    <path>frontend/src/translate/i18n.js</path>
    <reason>Verificar configuração do i18next</reason>
  </file>

  <file action="read" priority="medium">
    <path>frontend/src/translate/languages/ar.js</path>
    <reason>Confirmar que arquivo de tradução árabe existe</reason>
  </file>

  <file action="read" priority="low">
    <path>docs/frontend/ARCHITECTURE.md</path>
    <reason>Entender estrutura do layout</reason>
  </file>
</files>
```

### 🤖 Specialized Agents
```xml
<specialized_agents>
  <agent name="frontend-analyst" usage="initial">
    <purpose>Analisar estrutura do layout e localizar seletor de idiomas</purpose>
    <task>Encontrar todos os componentes relacionados a idiomas e tema</task>
  </agent>

  <agent name="lint-type-fix" usage="after_changes">
    <purpose>Garantir que código passa em ESLint e TypeScript</purpose>
    <task>Executar npm run lint no frontend</task>
  </agent>

  <agent name="docs-sync" usage="final">
    <purpose>Atualizar documentação se necessário</purpose>
    <task>Verificar se docs/frontend/ precisa de atualização</task>
  </agent>
</specialized_agents>
```

### ✓ Critérios de Aceitação
```xml
<acceptance_criteria>
  <criterion id="AC1" type="functional">
    <description>Opção "العربية" (árabe) aparece no seletor de idiomas</description>
    <validation>Manual: Abrir app, clicar no seletor, verificar presença</validation>
  </criterion>

  <criterion id="AC2" type="functional">
    <description>Ao selecionar árabe, todas as traduções mudam para árabe</description>
    <validation>Manual: Selecionar árabe e navegar por várias páginas</validation>
  </criterion>

  <criterion id="AC3" type="functional">
    <description>Todos os 5 idiomas funcionam: pt, en, es, tr, ar</description>
    <validation>Manual: Testar cada idioma individualmente</validation>
  </criterion>

  <criterion id="AC4" type="visual">
    <description>Espaçamento mínimo de 16px entre seletor e ícone Lua/Sol</description>
    <validation>Manual: Inspecionar elemento no DevTools</validation>
  </criterion>

  <criterion id="AC5" type="visual">
    <description>Layout não quebra em mobile (320px de largura)</description>
    <validation>Manual: Testar no Chrome DevTools em resolução mobile</validation>
  </criterion>

  <criterion id="AC6" type="technical">
    <description>Sem erros no console do navegador</description>
    <validation>Automático: Console limpo ao trocar idiomas</validation>
  </criterion>

  <criterion id="AC7" type="accessibility">
    <description>Seletor acessível via teclado (Tab + Enter/Space)</description>
    <validation>Manual: Navegação apenas com teclado</validation>
  </criterion>
</acceptance_criteria>
```

### 📚 Referências
```xml
<references>
  <doc type="internal">
    <title>Frontend Architecture</title>
    <path>docs/frontend/ARCHITECTURE.md</path>
    <section>Layout e Estrutura de Diretórios</section>
  </doc>

  <doc type="internal">
    <title>Internationalization</title>
    <path>docs/frontend/ARCHITECTURE.md</path>
    <section>Stack Tecnológico - Utilities</section>
  </doc>

  <doc type="external">
    <title>i18next Documentation</title>
    <url>https://www.i18next.com/</url>
  </doc>

  <doc type="external">
    <title>Material-UI Select</title>
    <url>https://v4.mui.com/components/selects/</url>
  </doc>
</references>
```

---

## TASK-02: Backend | Alta (4)

### 🎯 Título
**Corrigir criação de usuário demo nas configurações**

### 📦 Contexto
```xml
<context>
  <project>ChatIA Flow v2.2.2v-26</project>
  <stack>Node.js, Express, Sequelize, PostgreSQL</stack>
  <location>backend/src/</location>
  <feature>Configuração de usuário demo para novos clientes</feature>
  <current_state>Opção "Habilitado" não funciona</current_state>
  <expected_behavior>Ao habilitar, novos clientes devem receber usuário demo automaticamente</expected_behavior>
</context>
```

### 🔴 Problema
```xml
<problem>
  <description>
    Existe uma configuração nas Settings que permite habilitar a criação automática
    de usuários demo para novos clientes. Apesar de aparecer como "Habilitado" na UI,
    nenhum usuário demo é criado quando uma nova empresa se registra.
  </description>

  <impact>
    - Novos clientes não recebem usuário demo conforme configurado
    - Onboarding prejudicado (clientes não conseguem testar o sistema rapidamente)
    - Configuração enganosa (diz "Habilitado" mas não funciona)
  </impact>

  <hypothesis>
    - Setting não está sendo lida no processo de criação de empresa
    - Lógica de criação de usuário demo pode estar comentada ou com erro
    - Trigger/hook pode não estar executando
  </hypothesis>
</problem>
```

### ✅ Requisitos
```xml
<requirements>
  <functional>
    <requirement id="F1">Ao criar nova empresa, verificar setting de demo user</requirement>
    <requirement id="F2">Se habilitado, criar usuário demo automaticamente</requirement>
    <requirement id="F3">Usuário demo deve ter:
      - email: demo@{company_domain}
      - senha: demo123
      - profile: user (não admin)
      - nome: "Usuário Demo"
    </requirement>
    <requirement id="F4">Não criar usuário demo se setting estiver desabilitado</requirement>
  </functional>

  <technical>
    <requirement id="T1">Verificar CompaniesSettings no hook AfterCreate de Company</requirement>
    <requirement id="T2">Criar usuário dentro de transação (rollback se falhar)</requirement>
    <requirement id="T3">Logar criação de usuário demo (winston/pino)</requirement>
    <requirement id="T4">Enviar email de boas-vindas com credenciais</requirement>
  </technical>

  <security>
    <requirement id="S1">Hash da senha com bcrypt</requirement>
    <requirement id="S2">Não expor senha no log</requirement>
    <requirement id="S3">Usuário demo isolado por companyId</requirement>
  </security>
</requirements>
```

### 📋 Subtasks
```xml
<subtasks>
  <subtask id="1" priority="high" estimated_time="20min">
    <title>Localizar setting de criação de demo user</title>
    <description>Encontrar a chave da setting nas CompaniesSettings</description>
    <acceptance>Setting identificada (provavelmente "createDemoUser" ou similar)</acceptance>
    <hints>
      - Buscar em backend/src/database/migrations/
      - Buscar por "demo" em CompaniesSettings
      - Pode estar em frontend/src/pages/Settings também
    </hints>
  </subtask>

  <subtask id="2" priority="high" estimated_time="30min">
    <title>Analisar fluxo de criação de empresa</title>
    <description>Entender onde e como empresas são criadas</description>
    <acceptance>Service/Controller de criação de empresa identificado</acceptance>
    <files_to_check>
      - backend/src/controllers/CompanyController.ts
      - backend/src/services/CompanyService.ts
      - backend/src/models/Company.ts (hooks)
    </files_to_check>
  </subtask>

  <subtask id="3" priority="high" estimated_time="45min">
    <title>Implementar lógica de criação de demo user</title>
    <description>Criar ou corrigir hook AfterCreate no model Company</description>
    <acceptance>Usuário demo criado automaticamente quando setting está ativada</acceptance>
    <code_example>
      // backend/src/models/Company.ts
      @AfterCreate
      static async createDemoUser(company: Company) {
        // 1. Buscar setting
        const setting = await CompaniesSettings.findOne({
          where: {
            companyId: company.id,
            key: 'createDemoUser'
          }
        });

        // 2. Se habilitado, criar usuário
        if (setting?.value === 'enabled') {
          await User.create({
            name: 'Usuário Demo',
            email: `demo@${company.name.toLowerCase()}.com`,
            password: 'demo123',
            profile: 'user',
            companyId: company.id
          });

          logger.info(`Demo user created for company ${company.id}`);
        }
      }
    </code_example>
  </subtask>

  <subtask id="4" priority="medium" estimated_time="30min">
    <title>Adicionar transação para atomicidade</title>
    <description>Garantir que criação de empresa e usuário demo sejam atômicas</description>
    <acceptance>Rollback se criação de usuário demo falhar</acceptance>
    <code_example>
      // backend/src/services/CompanyService.ts
      async createCompany(data) {
        return await sequelize.transaction(async (t) => {
          const company = await Company.create(data, { transaction: t });

          // Criar settings
          await CompaniesSettings.create({
            companyId: company.id,
            createDemoUser: 'enabled'
          }, { transaction: t });

          // Hook AfterCreate criará o demo user automaticamente

          return company;
        });
      }
    </code_example>
  </subtask>

  <subtask id="5" priority="medium" estimated_time="20min">
    <title>Adicionar logs estruturados</title>
    <description>Logar criação de demo user para auditoria</description>
    <acceptance>Log aparece no winston/pino quando demo user é criado</acceptance>
  </subtask>

  <subtask id="6" priority="low" estimated_time="30min">
    <title>Enviar email de boas-vindas (opcional)</title>
    <description>Enviar email com credenciais do usuário demo</description>
    <acceptance>Email recebido com email e senha do demo user</acceptance>
  </subtask>

  <subtask id="7" priority="high" estimated_time="30min">
    <title>Testar criação completa</title>
    <description>Criar empresa de teste e verificar se usuário demo é criado</description>
    <acceptance>
      1. Setting habilitado → usuário demo criado
      2. Setting desabilitado → usuário demo NÃO criado
    </acceptance>
  </subtask>
</subtasks>
```

### 📂 Arquivos
```xml
<files>
  <file action="read" priority="high">
    <path>backend/src/models/Company.ts</path>
    <reason>Verificar hooks existentes</reason>
  </file>

  <file action="read" priority="high">
    <path>backend/src/models/CompaniesSettings.ts</path>
    <reason>Verificar structure da setting de demo user</reason>
  </file>

  <file action="modify" priority="high">
    <path>backend/src/models/Company.ts</path>
    <reason>Adicionar/corrigir hook AfterCreate</reason>
  </file>

  <file action="read" priority="medium">
    <path>backend/src/controllers/CompanyController.ts</path>
    <reason>Entender fluxo de criação</reason>
  </file>

  <file action="read" priority="medium">
    <path>backend/src/services/CompanyService.ts</path>
    <reason>Verificar se há lógica de demo user no service</reason>
  </file>

  <file action="create_if_missing" priority="medium">
    <path>backend/src/database/migrations/XXXXXX-add-demo-user-setting.ts</path>
    <reason>Migration para adicionar setting se não existir</reason>
  </file>

  <file action="read" priority="low">
    <path>docs/backend/MODELS.md</path>
    <reason>Documentação dos models</reason>
  </file>
</files>
```

### 🤖 Specialized Agents
```xml
<specialized_agents>
  <agent name="backend-analyst" usage="initial">
    <purpose>Analisar arquitetura backend e fluxo de criação de empresa</purpose>
    <task>Mapear todos os arquivos envolvidos na criação de Company</task>
  </agent>

  <agent name="db-schema-architect" usage="if_needed">
    <purpose>Criar migration se setting não existir</purpose>
    <task>Adicionar coluna createDemoUser em CompaniesSettings</task>
  </agent>

  <agent name="unit-test-synthesizer" usage="after_implementation">
    <purpose>Criar testes unitários para criação de demo user</purpose>
    <task>Testar hook AfterCreate com setting habilitado/desabilitado</task>
  </agent>

  <agent name="integration-test-synthesizer" usage="final">
    <purpose>Criar testes de integração E2E</purpose>
    <task>Testar fluxo completo de criação de empresa + demo user</task>
  </agent>
</specialized_agents>
```

### ✓ Critérios de Aceitação
```xml
<acceptance_criteria>
  <criterion id="AC1" type="functional">
    <description>Ao criar empresa com setting habilitado, usuário demo é criado</description>
    <validation>
      1. POST /companies com createDemoUser: enabled
      2. Verificar existência de usuário demo no banco
    </validation>
  </criterion>

  <criterion id="AC2" type="functional">
    <description>Ao criar empresa com setting desabilitado, usuário demo NÃO é criado</description>
    <validation>
      1. POST /companies com createDemoUser: disabled
      2. Verificar que não existe usuário demo
    </validation>
  </criterion>

  <criterion id="AC3" type="technical">
    <description>Usuário demo criado com dados corretos</description>
    <validation>
      - profile: "user"
      - email: formato válido
      - passwordHash: bcrypt
      - companyId: mesmo da empresa
    </validation>
  </criterion>

  <criterion id="AC4" type="technical">
    <description>Logs estruturados registram criação</description>
    <validation>Verificar logs do winston/pino</validation>
  </criterion>

  <criterion id="AC5" type="technical">
    <description>Transação atômica (rollback se falhar)</description>
    <validation>Forçar erro na criação de demo user e verificar rollback</validation>
  </criterion>

  <criterion id="AC6" type="security">
    <description>Senha não aparece em logs</description>
    <validation>Verificar que logs não contêm "demo123"</validation>
  </criterion>
</acceptance_criteria>
```

### 📚 Referências
```xml
<references>
  <doc type="internal">
    <title>Models Documentation</title>
    <path>docs/backend/MODELS.md</path>
    <section>Company, User, CompaniesSettings</section>
  </doc>

  <doc type="internal">
    <title>Backend Services</title>
    <path>docs/backend/SERVICES.md</path>
    <section>CompanyService</section>
  </doc>

  <doc type="external">
    <title>Sequelize Hooks</title>
    <url>https://sequelize.org/docs/v6/other-topics/hooks/</url>
  </doc>
</references>
```

---

## TASK-03: Backend | Crítico (5)

### 🎯 Título
**Corrigir erro ao aceitar contato em fila**

### 📦 Contexto
```xml
<context>
  <project>ChatIA Flow v2.2.2v-26</project>
  <stack>Node.js, Express, Sequelize, Socket.IO</stack>
  <location>backend/src/services/TicketService.ts</location>
  <feature>Atribuição de tickets a atendentes</feature>
  <bug_type>Runtime error durante atribuição de ticket</bug_type>
  <impact>Atendente não consegue assumir tickets ou fica sem fila após erro</impact>
</context>
```

### 🔴 Problema
```xml
<problem>
  <description>
    Ao tentar aceitar um contato (assumir um ticket) em uma fila, o sistema gera um erro.
    Após o erro, o ticket pode:
    1. Ficar sem fila atribuída (queueId = null)
    2. Ficar com fila mas exibir mensagem de erro

    Isso impede que atendentes assumam tickets normalmente, quebrando o fluxo de atendimento.
  </description>

  <impact>
    - CRÍTICO: Atendentes não conseguem trabalhar
    - Tickets ficam órfãos (sem fila ou sem atendente)
    - Perda de atendimentos
    - Experiência ruim para cliente final
  </impact>

  <error_hypothesis>
    - Validação de fila/usuário falhando
    - Socket.IO emitindo evento antes do commit no banco
    - Race condition em múltiplas atribuições
    - Foreign key constraint violada
    - companyId não sendo validado corretamente (multi-tenant)
  </error_hypothesis>
</problem>
```

### ✅ Requisitos
```xml
<requirements>
  <functional>
    <requirement id="F1">Atendente deve poder aceitar ticket de forma confiável</requirement>
    <requirement id="F2">Ticket deve ser atribuído ao atendente e à fila simultaneamente</requirement>
    <requirement id="F3">Outros atendentes não devem ver o ticket após atribuição</requirement>
    <requirement id="F4">Status do ticket deve mudar para "open"</requirement>
    <requirement id="F5">Socket.IO deve notificar mudança em tempo real</requirement>
  </functional>

  <technical>
    <requirement id="T1">Validar que fila existe e pertence à empresa</requirement>
    <requirement id="T2">Validar que atendente pertence à empresa</requirement>
    <requirement id="T3">Validar que atendente tem acesso à fila</requirement>
    <requirement id="T4">Usar transação para atomicidade</requirement>
    <requirement id="T5">Lock pessimista para evitar race condition</requirement>
    <requirement id="T6">Emitir Socket.IO apenas após commit</requirement>
    <requirement id="T7">Rollback completo em caso de erro</requirement>
  </technical>

  <multi_tenant>
    <requirement id="M1">Filtrar por companyId em todas as queries</requirement>
    <requirement id="M2">Não permitir atribuição entre empresas diferentes</requirement>
  </multi_tenant>
</requirements>
```

### 📋 Subtasks
```xml
<subtasks>
  <subtask id="1" priority="critical" estimated_time="30min">
    <title>Reproduzir o erro</title>
    <description>Tentar aceitar ticket e capturar stack trace completo</description>
    <acceptance>Erro reproduzido de forma consistente com stack trace salvo</acceptance>
    <steps>
      1. Criar ticket em estado "pending"
      2. Tentar aceitar como atendente
      3. Capturar erro do console do backend
      4. Verificar estado do ticket no banco após erro
    </steps>
  </subtask>

  <subtask id="2" priority="critical" estimated_time="30min">
    <title>Analisar código de atribuição de ticket</title>
    <description>Localizar o método que atribui ticket a atendente</description>
    <acceptance>Método identificado em TicketService ou UpdateTicketService</acceptance>
    <files_to_check>
      - backend/src/services/UpdateTicketService.ts
      - backend/src/services/TicketService/UpdateTicketService.ts
      - backend/src/controllers/TicketController.ts
    </files_to_check>
  </subtask>

  <subtask id="3" priority="critical" estimated_time="60min">
    <title>Corrigir lógica de atribuição</title>
    <description>Implementar atribuição segura com validações e transação</description>
    <acceptance>Ticket atribuído sem erros</acceptance>
    <code_example>
      // backend/src/services/TicketService/UpdateTicketService.ts
      interface UpdateTicketRequest {
        ticketId: number;
        userId: number;
        queueId: number;
        companyId: number;
      }

      export const updateTicket = async ({
        ticketId,
        userId,
        queueId,
        companyId
      }: UpdateTicketRequest) => {

        return await sequelize.transaction(async (t) => {
          // 1. Lock ticket para evitar race condition
          const ticket = await Ticket.findOne({
            where: { id: ticketId, companyId },
            lock: t.LOCK.UPDATE,
            transaction: t
          });

          if (!ticket) {
            throw new AppError('Ticket não encontrado', 404);
          }

          // 2. Validar fila
          const queue = await Queue.findOne({
            where: { id: queueId, companyId },
            transaction: t
          });

          if (!queue) {
            throw new AppError('Fila não encontrada', 404);
          }

          // 3. Validar usuário
          const user = await User.findOne({
            where: { id: userId, companyId },
            include: [{ model: Queue, as: 'queues', where: { id: queueId } }],
            transaction: t
          });

          if (!user) {
            throw new AppError('Usuário sem acesso à fila', 403);
          }

          // 4. Atualizar ticket
          ticket.userId = userId;
          ticket.queueId = queueId;
          ticket.status = 'open';
          await ticket.save({ transaction: t });

          // 5. Emitir Socket.IO APÓS commit
          await t.afterCommit(() => {
            const io = getIO();
            io.to(`company-${companyId}`).emit('ticket', {
              action: 'update',
              ticket
            });
          });

          return ticket;
        });
      };
    </code_example>
  </subtask>

  <subtask id="4" priority="high" estimated_time="30min">
    <title>Adicionar logs detalhados</title>
    <description>Logar cada etapa da atribuição para debugging</description>
    <acceptance>Logs mostram fluxo completo de atribuição</acceptance>
    <log_example>
      logger.info({
        ticketId,
        userId,
        queueId,
        companyId,
        step: 'ticket_assignment_start'
      });

      // ... validações ...

      logger.info({
        ticketId,
        userId,
        queueId,
        step: 'ticket_assignment_success'
      });
    </log_example>
  </subtask>

  <subtask id="5" priority="high" estimated_time="45min">
    <title>Adicionar tratamento de erros específico</title>
    <description>Capturar e tratar erros comuns (foreign key, race condition, etc)</description>
    <acceptance>Mensagens de erro claras para cada tipo de falha</acceptance>
    <code_example>
      try {
        // ... lógica de atribuição ...
      } catch (error) {
        if (error.name === 'SequelizeForeignKeyConstraintError') {
          throw new AppError('Fila ou usuário inválido', 400);
        }

        if (error.name === 'SequelizeTimeoutError') {
          throw new AppError('Timeout ao atribuir ticket. Tente novamente.', 408);
        }

        logger.error({
          error: error.message,
          stack: error.stack,
          ticketId,
          userId
        });

        throw new AppError('Erro ao atribuir ticket', 500);
      }
    </code_example>
  </subtask>

  <subtask id="6" priority="medium" estimated_time="30min">
    <title>Testar cenários de erro</title>
    <description>Testar atribuição com dados inválidos</description>
    <acceptance>Erros tratados gracefully sem deixar ticket órfão</acceptance>
    <test_cases>
      1. Ticket inexistente
      2. Fila inexistente
      3. Usuário inexistente
      4. Usuário sem acesso à fila
      5. Ticket de outra empresa (companyId diferente)
      6. Atribuição simultânea (race condition)
    </test_cases>
  </subtask>

  <subtask id="7" priority="medium" estimated_time="30min">
    <title>Testar fluxo completo E2E</title>
    <description>Testar atribuição via frontend + backend + Socket.IO</description>
    <acceptance>
      1. Atendente aceita ticket
      2. Ticket muda status para "open"
      3. Ticket some da lista de outros atendentes
      4. Nenhum erro no console
    </acceptance>
  </subtask>
</subtasks>
```

### 📂 Arquivos
```xml
<files>
  <file action="read" priority="critical">
    <path>backend/src/services/TicketService/UpdateTicketService.ts</path>
    <reason>Serviço principal de atualização de tickets</reason>
  </file>

  <file action="modify" priority="critical">
    <path>backend/src/services/TicketService/UpdateTicketService.ts</path>
    <reason>Corrigir lógica de atribuição</reason>
  </file>

  <file action="read" priority="high">
    <path>backend/src/controllers/TicketController.ts</path>
    <reason>Verificar validações no controller</reason>
  </file>

  <file action="read" priority="high">
    <path>backend/src/models/Ticket.ts</path>
    <reason>Verificar relações e hooks</reason>
  </file>

  <file action="read" priority="medium">
    <path>backend/src/models/Queue.ts</path>
    <reason>Verificar relações com User</reason>
  </file>

  <file action="read" priority="medium">
    <path>backend/src/models/User.ts</path>
    <reason>Verificar relações com Queue</reason>
  </file>

  <file action="read" priority="low">
    <path>docs/backend/SERVICES.md</path>
    <reason>Documentação dos services</reason>
  </file>
</files>
```

### 🤖 Specialized Agents
```xml
<specialized_agents>
  <agent name="backend-analyst" usage="initial">
    <purpose>Analisar fluxo de atribuição de tickets</purpose>
    <task>Mapear todos os arquivos envolvidos na atribuição</task>
  </agent>

  <agent name="policy-enforcer" usage="during_fix">
    <purpose>Validar multi-tenancy e isolamento</purpose>
    <task>Garantir que todas as queries filtram por companyId</task>
  </agent>

  <agent name="unit-test-synthesizer" usage="after_fix">
    <purpose>Criar testes unitários para UpdateTicketService</purpose>
    <task>Testar todos os cenários de erro</task>
  </agent>

  <agent name="integration-test-synthesizer" usage="final">
    <purpose>Criar testes de integração E2E</purpose>
    <task>Testar fluxo completo de atribuição com Socket.IO</task>
  </agent>

  <agent name="chatiafow-code-reviewer" usage="before_merge">
    <purpose>Review completo antes de merge</purpose>
    <task>Validar arquitetura, segurança e multi-tenancy</task>
  </agent>
</specialized_agents>
```

### ✓ Critérios de Aceitação
```xml
<acceptance_criteria>
  <criterion id="AC1" type="functional">
    <description>Atendente aceita ticket sem erros</description>
    <validation>
      1. Criar ticket pending
      2. Atendente aceita
      3. Ticket muda para "open" com userId e queueId
    </validation>
  </criterion>

  <criterion id="AC2" type="functional">
    <description>Ticket não fica órfão após erro</description>
    <validation>
      Forçar erro e verificar que ticket mantém estado anterior
    </validation>
  </criterion>

  <criterion id="AC3" type="functional">
    <description>Socket.IO notifica mudança em tempo real</description>
    <validation>
      Verificar que evento "ticket" é emitido com action: "update"
    </validation>
  </criterion>

  <criterion id="AC4" type="technical">
    <description>Transação garante atomicidade</description>
    <validation>
      Forçar erro no meio da transação e verificar rollback completo
    </validation>
  </criterion>

  <criterion id="AC5" type="technical">
    <description>Race condition tratada com lock pessimista</description>
    <validation>
      Simular 2 atendentes aceitando mesmo ticket simultaneamente
    </validation>
  </criterion>

  <criterion id="AC6" type="security">
    <description>Multi-tenancy respeitado (companyId validado)</description>
    <validation>
      Tentar atribuir ticket de empresa A para atendente de empresa B
    </validation>
  </criterion>

  <criterion id="AC7" type="logs">
    <description>Logs estruturados registram atribuição</description>
    <validation>
      Verificar logs do winston/pino com todos os campos
    </validation>
  </criterion>
</acceptance_criteria>
```

### 📚 Referências
```xml
<references>
  <doc type="internal">
    <title>Ticket Service Documentation</title>
    <path>docs/backend/SERVICES.md</path>
    <section>TicketService</section>
  </doc>

  <doc type="internal">
    <title>Models Documentation</title>
    <path>docs/backend/MODELS.md</path>
    <section>Ticket, Queue, User</section>
  </doc>

  <doc type="internal">
    <title>Socket.IO Documentation</title>
    <path>docs/backend/WEBSOCKET.md</path>
    <section>Ticket Events</section>
  </doc>

  <doc type="external">
    <title>Sequelize Transactions</title>
    <url>https://sequelize.org/docs/v6/other-topics/transactions/</url>
  </doc>

  <doc type="external">
    <title>Sequelize Lock</title>
    <url>https://sequelize.org/docs/v6/other-topics/transactions/#locks</url>
  </doc>
</references>
```

---

## TASK-04: Frontend | Média (3)

### 🎯 Título
**Remover aba lateral "Lista de arquivos" do menu**

### 📦 Contexto
```xml
<context>
  <project>ChatIA Flow v2.2.2v-26</project>
  <stack>React 17.0.2, Material-UI v4</stack>
  <location>frontend/src/layout/MainListItems.js</location>
  <feature>Menu lateral de navegação</feature>
  <change_type>Remoção de item de menu</change_type>
</context>
```

### 🔴 Problema
```xml
<problem>
  <description>
    Existe um item "Lista de arquivos" no menu lateral que não é mais utilizado
    ou não deveria ser exibido. Este item precisa ser removido permanentemente.
  </description>

  <impact>
    - Menu poluído com opção desnecessária
    - Usuários podem clicar e ir para página vazia/quebrada
    - UX ruim
  </impact>
</problem>
```

### ✅ Requisitos
```xml
<requirements>
  <functional>
    <requirement id="F1">Remover item "Lista de arquivos" do menu lateral</requirement>
    <requirement id="F2">Remover rota associada se existir</requirement>
    <requirement id="F3">Menu deve continuar funcionando normalmente após remoção</requirement>
  </functional>

  <technical>
    <requirement id="T1">Não quebrar layout do menu</requirement>
    <requirement id="T2">Não deixar rotas orfãs</requirement>
    <requirement id="T3">Verificar se há permissões associadas</requirement>
  </technical>
</requirements>
```

### 📋 Subtasks
```xml
<subtasks>
  <subtask id="1" priority="high" estimated_time="10min">
    <title>Localizar item no MainListItems.js</title>
    <description>Encontrar o ListItem com "Lista de arquivos"</description>
    <acceptance>Linha do código identificada</acceptance>
    <search_pattern>
      - "Lista de arquivos"
      - "File" ou "Files"
      - "Arquivos"
    </search_pattern>
  </subtask>

  <subtask id="2" priority="high" estimated_time="5min">
    <title>Remover ListItem do menu</title>
    <description>Deletar ou comentar o bloco do ListItem</description>
    <acceptance>Item não aparece mais no menu</acceptance>
  </subtask>

  <subtask id="3" priority="medium" estimated_time="15min">
    <title>Verificar e remover rota associada</title>
    <description>Buscar e remover rota /files ou /file-list em routes/index.js</description>
    <acceptance>Rota removida ou comentada</acceptance>
  </subtask>

  <subtask id="4" priority="low" estimated_time="10min">
    <title>Verificar permissões RBAC</title>
    <description>Verificar se há permissão "files:view" em rules.js</description>
    <acceptance>Permissão removida se existir</acceptance>
  </subtask>

  <subtask id="5" priority="medium" estimated_time="10min">
    <title>Testar menu</title>
    <description>Navegar pelo menu e verificar que tudo funciona</description>
    <acceptance>Menu sem erros no console</acceptance>
  </subtask>
</subtasks>
```

### 📂 Arquivos
```xml
<files>
  <file action="modify" priority="high">
    <path>frontend/src/layout/MainListItems.js</path>
    <reason>Remover ListItem de "Lista de arquivos"</reason>
  </file>

  <file action="read" priority="medium">
    <path>frontend/src/routes/index.js</path>
    <reason>Verificar se existe rota para arquivos</reason>
  </file>

  <file action="modify_if_exists" priority="medium">
    <path>frontend/src/routes/index.js</path>
    <reason>Remover rota se existir</reason>
  </file>

  <file action="read" priority="low">
    <path>frontend/src/rules.js</path>
    <reason>Verificar permissões RBAC</reason>
  </file>
</files>
```

### 🤖 Specialized Agents
```xml
<specialized_agents>
  <agent name="frontend-analyst" usage="initial">
    <purpose>Localizar todos os usos de "Lista de arquivos" no frontend</purpose>
    <task>Buscar por "file" ou "arquivo" em todo o frontend</task>
  </agent>

  <agent name="lint-type-fix" usage="final">
    <purpose>Garantir que código passa em linting</purpose>
    <task>Executar npm run lint</task>
  </agent>
</specialized_agents>
```

### ✓ Critérios de Aceitação
```xml
<acceptance_criteria>
  <criterion id="AC1" type="visual">
    <description>Item "Lista de arquivos" não aparece no menu lateral</description>
    <validation>Manual: Abrir app e verificar menu</validation>
  </criterion>

  <criterion id="AC2" type="functional">
    <description>Menu funciona normalmente após remoção</description>
    <validation>Manual: Navegar por todos os itens do menu</validation>
  </criterion>

  <criterion id="AC3" type="technical">
    <description>Sem erros no console</description>
    <validation>Verificar console do navegador</validation>
  </criterion>

  <criterion id="AC4" type="technical">
    <description>Rota /files retorna 404 ou redireciona</description>
    <validation>Acessar diretamente /files na URL</validation>
  </criterion>
</acceptance_criteria>
```

### 📚 Referências
```xml
<references>
  <doc type="internal">
    <title>Frontend Architecture</title>
    <path>docs/frontend/ARCHITECTURE.md</path>
    <section>Layout</section>
  </doc>

  <doc type="internal">
    <title>Routing</title>
    <path>docs/frontend/ROUTING.md</path>
  </doc>
</references>
```

---

## TASK-05: Frontend | Baixa (2)

### 🎯 Título
**Alterar título de "Cadastrar empresa" para "Empresas"**

### 📦 Contexto
```xml
<context>
  <project>ChatIA Flow v2.2.2v-26</project>
  <stack>React 17.0.2, Material-UI v4, i18next</stack>
  <location>frontend/src/pages/Companies/ ou settings</location>
  <feature>Tela de gerenciamento de empresas (super user)</feature>
  <change_type>Correção de nomenclatura</change_type>
</context>
```

### 🔴 Problema
```xml
<problem>
  <description>
    A tela possui título "Cadastrar empresa" mas a funcionalidade real é "Empresas",
    que serve tanto para cadastrar quanto para gerenciar e pesquisar empresas existentes.
    O título atual é enganoso pois sugere que é apenas cadastro.
  </description>

  <impact>
    - Título confuso (diz "Cadastrar" mas faz mais que isso)
    - UX ruim (usuário não entende que pode gerenciar empresas ali)
  </impact>
</problem>
```

### ✅ Requisitos
```xml
<requirements>
  <functional>
    <requirement id="F1">Alterar título de "Cadastrar empresa" para "Empresas"</requirement>
    <requirement id="F2">Manter funcionalidades existentes (cadastrar, editar, pesquisar, deletar)</requirement>
    <requirement id="F3">Atualizar traduções em todos os 5 idiomas</requirement>
  </functional>

  <technical>
    <requirement id="T1">Atualizar arquivo de tradução pt.js</requirement>
    <requirement id="T2">Atualizar arquivos en.js, es.js, tr.js, ar.js</requirement>
    <requirement id="T3">Verificar se título está hardcoded ou via i18next</requirement>
  </technical>
</requirements>
```

### 📋 Subtasks
```xml
<subtasks>
  <subtask id="1" priority="high" estimated_time="10min">
    <title>Localizar componente da página de empresas</title>
    <description>Encontrar o arquivo da página (provavelmente frontend/src/pages/Companies/)</description>
    <acceptance>Arquivo identificado</acceptance>
  </subtask>

  <subtask id="2" priority="high" estimated_time="10min">
    <title>Atualizar chave de tradução</title>
    <description>Alterar chave em frontend/src/translate/languages/pt.js</description>
    <acceptance>Chave companies.title atualizada de "Cadastrar empresa" para "Empresas"</acceptance>
    <code_example>
      // frontend/src/translate/languages/pt.js
      companies: {
        title: "Empresas", // Era: "Cadastrar empresa"
        add: "Adicionar Empresa",
        // ...
      }
    </code_example>
  </subtask>

  <subtask id="3" priority="medium" estimated_time="15min">
    <title>Atualizar traduções em outros idiomas</title>
    <description>Alterar chave em en.js, es.js, tr.js, ar.js</description>
    <acceptance>Todas as traduções atualizadas</acceptance>
    <translations>
      en: "Companies"
      es: "Empresas"
      tr: "Şirketler"
      ar: "الشركات"
    </translations>
  </subtask>

  <subtask id="4" priority="low" estimated_time="5min">
    <title>Testar em todos os idiomas</title>
    <description>Trocar idioma e verificar título correto</description>
    <acceptance>Título "Empresas" aparece em todos os 5 idiomas</acceptance>
  </subtask>
</subtasks>
```

### 📂 Arquivos
```xml
<files>
  <file action="modify" priority="high">
    <path>frontend/src/translate/languages/pt.js</path>
    <reason>Atualizar tradução em português</reason>
  </file>

  <file action="modify" priority="medium">
    <path>frontend/src/translate/languages/en.js</path>
    <reason>Atualizar tradução em inglês</reason>
  </file>

  <file action="modify" priority="medium">
    <path>frontend/src/translate/languages/es.js</path>
    <reason>Atualizar tradução em espanhol</reason>
  </file>

  <file action="modify" priority="medium">
    <path>frontend/src/translate/languages/tr.js</path>
    <reason>Atualizar tradução em turco</reason>
  </file>

  <file action="modify" priority="medium">
    <path>frontend/src/translate/languages/ar.js</path>
    <reason>Atualizar tradução em árabe</reason>
  </file>

  <file action="read" priority="low">
    <path>frontend/src/pages/Companies/index.js</path>
    <reason>Verificar uso do i18n</reason>
  </file>
</files>
```

### 🤖 Specialized Agents
```xml
<specialized_agents>
  <agent name="frontend-analyst" usage="initial">
    <purpose>Localizar todas as ocorrências de "Cadastrar empresa"</purpose>
    <task>Buscar em todo o frontend por "Cadastrar empresa" ou chave de tradução</task>
  </agent>

  <agent name="lint-type-fix" usage="final">
    <purpose>Verificar sintaxe dos arquivos de tradução</purpose>
    <task>Executar npm run lint</task>
  </agent>
</specialized_agents>
```

### ✓ Critérios de Aceitação
```xml
<acceptance_criteria>
  <criterion id="AC1" type="visual">
    <description>Título da página muda para "Empresas" em português</description>
    <validation>Manual: Abrir página com idioma pt</validation>
  </criterion>

  <criterion id="AC2" type="visual">
    <description>Título correto em todos os 5 idiomas</description>
    <validation>Manual: Testar cada idioma</validation>
  </criterion>

  <criterion id="AC3" type="functional">
    <description>Funcionalidades continuam funcionando (cadastrar, editar, etc)</description>
    <validation>Manual: Testar cada ação</validation>
  </criterion>
</acceptance_criteria>
```

### 📚 Referências
```xml
<references>
  <doc type="internal">
    <title>Internationalization</title>
    <path>docs/frontend/ARCHITECTURE.md</path>
    <section>Utilities - i18next</section>
  </doc>
</references>
```

---

## TASK-06: Frontend | Média (3)

### 🎯 Título
**Implementar buscador na tela de Empresas e adicionar ícone de olho no campo de senha**

### 📦 Contexto
```xml
<context>
  <project>ChatIA Flow v2.2.2v-26</project>
  <stack>React 17.0.2, Material-UI v4/v5, Formik</stack>
  <location>frontend/src/pages/Companies/</location>
  <feature>Tela de gerenciamento de empresas</feature>
  <issues>
    1. Buscador não funciona
    2. Campo de senha sem toggle visibility
    3. Modal de editar senha não funcional
  </issues>
</context>
```

### 🔴 Problema
```xml
<problem>
  <description>
    Três problemas na tela de Empresas:

    1. **Buscador não funciona**: Existe um campo de busca mas não filtra empresas
    2. **Sem toggle de senha**: Ao clicar em "Editar", abre modal para mudar senha mas
       não tem ícone de olho para ver a senha digitada
    3. **Facilitar busca**: Buscador deve buscar por nome, email, CNPJ, telefone, etc
  </description>

  <impact>
    - Super user não consegue buscar empresas facilmente
    - Difícil alterar senha (não vê o que está digitando)
    - UX ruim
  </impact>
</problem>
```

### ✅ Requisitos
```xml
<requirements>
  <functional>
    <requirement id="F1">Buscador deve filtrar empresas em tempo real</requirement>
    <requirement id="F2">Buscar por: nome, email, CNPJ, telefone, status</requirement>
    <requirement id="F3">Campo de senha com ícone de olho (toggle visibility)</requirement>
    <requirement id="F4">Modal de editar senha deve funcionar corretamente</requirement>
  </functional>

  <technical>
    <requirement id="T1">Usar useState para gerenciar termo de busca</requirement>
    <requirement id="T2">Filtrar array de empresas com .filter()</requirement>
    <requirement id="T3">Adicionar InputAdornment com IconButton (VisibilityIcon)</requirement>
    <requirement id="T4">State local para toggle showPassword</requirement>
    <requirement id="T5">Debounce de 300ms na busca (opcional)</requirement>
  </technical>

  <ux>
    <requirement id="U1">Busca case-insensitive</requirement>
    <requirement id="U2">Highlight de resultados (opcional)</requirement>
    <requirement id="U3">Mensagem "Nenhuma empresa encontrada" se busca vazia</requirement>
  </ux>
</requirements>
```

### 📋 Subtasks
```xml
<subtasks>
  <subtask id="1" priority="high" estimated_time="30min">
    <title>Implementar lógica de busca</title>
    <description>Adicionar state searchTerm e filtrar empresas</description>
    <acceptance>Empresas filtradas conforme texto digitado</acceptance>
    <code_example>
      const [searchTerm, setSearchTerm] = useState("");

      const filteredCompanies = useMemo(() => {
        if (!searchTerm) return companies;

        const term = searchTerm.toLowerCase();
        return companies.filter(company =>
          company.name?.toLowerCase().includes(term) ||
          company.email?.toLowerCase().includes(term) ||
          company.document?.includes(term) ||
          company.phone?.includes(term)
        );
      }, [companies, searchTerm]);
    </code_example>
  </subtask>

  <subtask id="2" priority="high" estimated_time="20min">
    <title>Adicionar TextField de busca na UI</title>
    <description>Adicionar campo de busca no topo da lista</description>
    <acceptance>Campo de busca visível e funcional</acceptance>
    <code_example>
      <TextField
        placeholder={i18n.t("companies.search")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        fullWidth
        variant="outlined"
      />
    </code_example>
  </subtask>

  <subtask id="3" priority="high" estimated_time="30min">
    <title>Localizar modal de edição de senha</title>
    <description>Encontrar componente do modal (provavelmente CompanyModal ou EditPasswordModal)</description>
    <acceptance>Arquivo do modal identificado</acceptance>
  </subtask>

  <subtask id="4" priority="high" estimated_time="20min">
    <title>Adicionar ícone de olho no campo senha</title>
    <description>Implementar toggle de visibilidade da senha</description>
    <acceptance>Senha visível/oculta ao clicar no ícone</acceptance>
    <code_example>
      const [showPassword, setShowPassword] = useState(false);

      <TextField
        type={showPassword ? "text" : "password"}
        label="Nova Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </code_example>
  </subtask>

  <subtask id="5" priority="medium" estimated_time="15min">
    <title>Corrigir funcionalidade de editar senha</title>
    <description>Garantir que modal salva senha corretamente no backend</description>
    <acceptance>Senha alterada com sucesso e toast de confirmação</acceptance>
  </subtask>

  <subtask id="6" priority="low" estimated_time="15min">
    <title>Adicionar debounce na busca (opcional)</title>
    <description>Usar useDebounce para evitar re-renders excessivos</description>
    <acceptance>Busca executa 300ms após usuário parar de digitar</acceptance>
  </subtask>

  <subtask id="7" priority="medium" estimated_time="20min">
    <title>Testar fluxo completo</title>
    <description>Testar busca e edição de senha</description>
    <acceptance>
      1. Buscar empresa por nome: funciona
      2. Buscar por CNPJ: funciona
      3. Editar senha: funciona
      4. Ver senha digitada: funciona
    </acceptance>
  </subtask>
</subtasks>
```

### 📂 Arquivos
```xml
<files>
  <file action="read" priority="high">
    <path>frontend/src/pages/Companies/index.js</path>
    <reason>Página principal de empresas</reason>
  </file>

  <file action="modify" priority="high">
    <path>frontend/src/pages/Companies/index.js</path>
    <reason>Adicionar lógica de busca</reason>
  </file>

  <file action="read" priority="high">
    <path>frontend/src/components/CompanyModal/index.js</path>
    <reason>Modal de criação/edição de empresa</reason>
  </file>

  <file action="modify" priority="high">
    <path>frontend/src/components/CompanyModal/index.js</path>
    <reason>Adicionar toggle de senha</reason>
  </file>

  <file action="modify" priority="medium">
    <path>frontend/src/translate/languages/pt.js</path>
    <reason>Adicionar tradução para "Buscar empresas"</reason>
  </file>
</files>
```

### 🤖 Specialized Agents
```xml
<specialized_agents>
  <agent name="frontend-analyst" usage="initial">
    <purpose>Analisar componentes de empresas</purpose>
    <task>Mapear todos os componentes relacionados a Companies</task>
  </agent>

  <agent name="frontend-implementer" usage="implementation">
    <purpose>Implementar busca e toggle de senha</purpose>
    <task>Adicionar lógica e UI components</task>
  </agent>

  <agent name="lint-type-fix" usage="final">
    <purpose>Verificar linting</purpose>
    <task>npm run lint</task>
  </agent>
</specialized_agents>
```

### ✓ Critérios de Aceitação
```xml
<acceptance_criteria>
  <criterion id="AC1" type="functional">
    <description>Buscador filtra empresas por nome</description>
    <validation>Digitar nome parcial e ver lista filtrada</validation>
  </criterion>

  <criterion id="AC2" type="functional">
    <description>Buscador filtra por CNPJ, email, telefone</description>
    <validation>Testar cada tipo de busca</validation>
  </criterion>

  <criterion id="AC3" type="functional">
    <description>Ícone de olho toggle visibilidade da senha</description>
    <validation>Clicar no ícone e ver senha revelada</validation>
  </criterion>

  <criterion id="AC4" type="functional">
    <description>Editar senha funciona corretamente</description>
    <validation>Alterar senha de empresa e verificar no banco</validation>
  </criterion>

  <criterion id="AC5" type="ux">
    <description>Busca case-insensitive</description>
    <validation>Buscar "EMPRESA" e "empresa" retornam mesmo resultado</validation>
  </criterion>
</acceptance_criteria>
```

### 📚 Referências
```xml
<references>
  <doc type="internal">
    <title>Components Documentation</title>
    <path>docs/frontend/COMPONENTS.md</path>
    <section>Modals</section>
  </doc>

  <doc type="external">
    <title>Material-UI TextField</title>
    <url>https://v4.mui.com/components/text-fields/</url>
  </doc>

  <doc type="external">
    <title>Material-UI InputAdornment</title>
    <url>https://v4.mui.com/api/input-adornment/</url>
  </doc>
</references>
```

---

## TASK-07: Frontend | Baixa (2)

### 🎯 Título
**Adicionar ícone de olho no campo de senha na tela de Usuários**

### 📦 Contexto
```xml
<context>
  <project>ChatIA Flow v2.2.2v-26</project>
  <stack>React 17.0.2, Material-UI v4/v5, Formik</stack>
  <location>frontend/src/components/UserModal/</location>
  <feature>Modal de criação/edição de usuários</feature>
  <issue>Campo de senha sem toggle de visibilidade</issue>
</context>
```

### 🔴 Problema
```xml
<problem>
  <description>
    No modal de criação/edição de usuários, o campo de senha não possui ícone de olho
    para alternar entre mostrar e ocultar a senha digitada.
  </description>

  <impact>
    - Admin não consegue ver senha que está digitando
    - Maior chance de erro ao cadastrar senha
    - UX inferior
  </impact>
</problem>
```

### ✅ Requisitos
```xml
<requirements>
  <functional>
    <requirement id="F1">Campo de senha com ícone de olho</requirement>
    <requirement id="F2">Clicar no ícone alterna entre texto/password</requirement>
    <requirement id="F3">Ícone muda conforme estado (aberto/fechado)</requirement>
  </functional>

  <technical>
    <requirement id="T1">State local showPassword (useState)</requirement>
    <requirement id="T2">InputAdornment com IconButton</requirement>
    <requirement id="T3">VisibilityIcon e VisibilityOffIcon do Material-UI</requirement>
    <requirement id="T4">Campo password vs text type</requirement>
  </technical>

  <ux>
    <requirement id="U1">Ícone posicionado à direita (end)</requirement>
    <requirement id="U2">Tooltip "Mostrar senha" / "Ocultar senha" (opcional)</requirement>
  </ux>
</requirements>
```

### 📋 Subtasks
```xml
<subtasks>
  <subtask id="1" priority="high" estimated_time="10min">
    <title>Localizar UserModal component</title>
    <description>Encontrar frontend/src/components/UserModal/index.js</description>
    <acceptance>Arquivo aberto no editor</acceptance>
  </subtask>

  <subtask id="2" priority="high" estimated_time="15min">
    <title>Adicionar state de toggle</title>
    <description>Criar useState para showPassword</description>
    <acceptance>State criado e funcional</acceptance>
    <code_example>
      const [showPassword, setShowPassword] = useState(false);
    </code_example>
  </subtask>

  <subtask id="3" priority="high" estimated_time="20min">
    <title>Adicionar InputAdornment no TextField</title>
    <description>Modificar campo password para incluir ícone</description>
    <acceptance>Ícone de olho aparece no campo senha</acceptance>
    <code_example>
      import Visibility from "@material-ui/icons/Visibility";
      import VisibilityOff from "@material-ui/icons/VisibilityOff";
      import InputAdornment from "@material-ui/core/InputAdornment";
      import IconButton from "@material-ui/core/IconButton";

      <TextField
        name="password"
        label={i18n.t("users.form.password")}
        type={showPassword ? "text" : "password"}
        value={formik.values.password}
        onChange={formik.handleChange}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
        variant="outlined"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </code_example>
  </subtask>

  <subtask id="4" priority="medium" estimated_time="10min">
    <title>Testar funcionalidade</title>
    <description>Abrir modal e testar toggle</description>
    <acceptance>
      1. Clicar ícone: senha vira texto
      2. Clicar novamente: texto vira senha
      3. Ícone muda conforme estado
    </acceptance>
  </subtask>

  <subtask id="5" priority="low" estimated_time="10min">
    <title>Adicionar tooltip (opcional)</title>
    <description>Adicionar Tooltip no IconButton</description>
    <acceptance>Hover mostra "Mostrar senha" ou "Ocultar senha"</acceptance>
  </subtask>
</subtasks>
```

### 📂 Arquivos
```xml
<files>
  <file action="read" priority="high">
    <path>frontend/src/components/UserModal/index.js</path>
    <reason>Modal de usuários</reason>
  </file>

  <file action="modify" priority="high">
    <path>frontend/src/components/UserModal/index.js</path>
    <reason>Adicionar toggle de senha</reason>
  </file>

  <file action="modify" priority="low">
    <path>frontend/src/translate/languages/pt.js</path>
    <reason>Adicionar tradução para tooltip (opcional)</reason>
  </file>
</files>
```

### 🤖 Specialized Agents
```xml
<specialized_agents>
  <agent name="frontend-implementer" usage="implementation">
    <purpose>Implementar toggle de senha</purpose>
    <task>Adicionar InputAdornment e lógica</task>
  </agent>

  <agent name="lint-type-fix" usage="final">
    <purpose>Verificar linting</purpose>
    <task>npm run lint</task>
  </agent>
</specialized_agents>
```

### ✓ Critérios de Aceitação
```xml
<acceptance_criteria>
  <criterion id="AC1" type="functional">
    <description>Ícone de olho aparece no campo senha</description>
    <validation>Abrir UserModal e verificar ícone</validation>
  </criterion>

  <criterion id="AC2" type="functional">
    <description>Clicar no ícone revela/oculta senha</description>
    <validation>Testar toggle múltiplas vezes</validation>
  </criterion>

  <criterion id="AC3" type="visual">
    <description>Ícone muda entre aberto/fechado</description>
    <validation>Verificar que ícone alterna</validation>
  </criterion>

  <criterion id="AC4" type="functional">
    <description>Funcionalidade de criar/editar usuário não quebrou</description>
    <validation>Criar usuário e verificar no banco</validation>
  </criterion>
</acceptance_criteria>
```

### 📚 Referências
```xml
<references>
  <doc type="internal">
    <title>Components Documentation</title>
    <path>docs/frontend/COMPONENTS.md</path>
    <section>UserModal</section>
  </doc>

  <doc type="external">
    <title>Material-UI InputAdornment</title>
    <url>https://v4.mui.com/api/input-adornment/</url>
  </doc>
</references>
```

---

## TASK-08: Backend | Baixa (2)

### 🎯 Título
**Configurações de Planos: ocultar campo "Público" e renomear "Talk.ia" para "Prompts"**

### 📦 Contexto
```xml
<context>
  <project>ChatIA Flow v2.2.2v-26</project>
  <stack>React 17.0.2, Material-UI v4/v5, Node.js, Sequelize</stack>
  <location>frontend/src/pages/Plans/ e backend/src/models/Plan.ts</location>
  <feature>Gerenciamento de planos de assinatura</feature>
  <changes>
    1. Ocultar campo "Público" (não se cria mais trial)
    2. Renomear "Talk.ia" para "Prompts"
  </changes>
</context>
```

### 🔴 Problema
```xml
<problem>
  <description>
    Na tela de Configurações >> Planos, existem dois problemas:

    1. **Campo "Público" obsoleto**: Existe um select/checkbox "Público" que permitia criar
       planos trial públicos. Este recurso não é mais utilizado e confunde admins.

    2. **Nomenclatura desatualizada**: Campo ou label "Talk.ia" precisa ser renomeado para
       "Prompts" para refletir funcionalidade real.
  </description>

  <impact>
    - Admin pode criar planos trial acidentalmente
    - Nomenclatura confusa ("Talk.ia" não é mais usado)
    - UI poluída com campo obsoleto
  </impact>
</problem>
```

### ✅ Requisitos
```xml
<requirements>
  <functional>
    <requirement id="F1">Ocultar campo/select "Público" da UI</requirement>
    <requirement id="F2">Não remover campo do banco (manter compatibilidade)</requirement>
    <requirement id="F3">Renomear label "Talk.ia" para "Prompts" em todos os idiomas</requirement>
    <requirement id="F4">Funcionalidade de criar/editar planos não deve quebrar</requirement>
  </functional>

  <technical>
    <requirement id="T1">Remover do formulário, não da migration/model</requirement>
    <requirement id="T2">Atualizar arquivos de tradução (5 idiomas)</requirement>
    <requirement id="T3">Validações do backend devem continuar funcionando</requirement>
  </technical>

  <data_integrity>
    <requirement id="D1">Planos existentes com isPublic=true não devem quebrar</requirement>
    <requirement id="D2">Novos planos criados devem ter isPublic=false por padrão</requirement>
  </data_integrity>
</requirements>
```

### 📋 Subtasks
```xml
<subtasks>
  <subtask id="1" priority="high" estimated_time="15min">
    <title>Localizar página de Planos</title>
    <description>Encontrar frontend/src/pages/Plans/ ou Settings/Plans</description>
    <acceptance>Arquivo do formulário identificado</acceptance>
    <hints>
      - frontend/src/pages/Plans/index.js
      - frontend/src/components/PlanModal/
      - Buscar por "isPublic" ou "público"
    </hints>
  </subtask>

  <subtask id="2" priority="high" estimated_time="15min">
    <title>Ocultar campo "Público" na UI</title>
    <description>Comentar ou remover FormControlLabel/Select de "Público"</description>
    <acceptance>Campo não aparece mais no formulário</acceptance>
    <code_example>
      // Comentar ou remover:
      {/*
      <FormControlLabel
        control={
          <Checkbox
            checked={formik.values.isPublic}
            onChange={formik.handleChange}
            name="isPublic"
          />
        }
        label={i18n.t("plans.form.isPublic")}
      />
      */}

      // OU: Definir valor padrão hidden
      <input type="hidden" name="isPublic" value={false} />
    </code_example>
  </subtask>

  <subtask id="3" priority="high" estimated_time="10min">
    <title>Definir isPublic=false por padrão</title>
    <description>No formik initialValues, setar isPublic: false</description>
    <acceptance>Novos planos criados com isPublic=false</acceptance>
    <code_example>
      const initialValues = {
        name: "",
        users: 0,
        connections: 0,
        queues: 0,
        isPublic: false, // SEMPRE FALSE
        // ...
      };
    </code_example>
  </subtask>

  <subtask id="4" priority="high" estimated_time="20min">
    <title>Renomear "Talk.ia" para "Prompts" nas traduções</title>
    <description>Atualizar pt.js, en.js, es.js, tr.js, ar.js</description>
    <acceptance>Todas as ocorrências de "Talk.ia" substituídas por equivalente de "Prompts"</acceptance>
    <translations>
      pt: "Prompts"
      en: "Prompts"
      es: "Prompts"
      tr: "İstemler"
      ar: "المطالبات"
    </translations>
    <search_in_files>
      - frontend/src/translate/languages/pt.js
      - frontend/src/translate/languages/en.js
      - frontend/src/translate/languages/es.js
      - frontend/src/translate/languages/tr.js
      - frontend/src/translate/languages/ar.js
    </search_in_files>
  </subtask>

  <subtask id="5" priority="medium" estimated_time="15min">
    <title>Verificar backend validation</title>
    <description>Garantir que backend aceita isPublic=false sem erros</description>
    <acceptance>POST /plans com isPublic=false funciona</acceptance>
    <files_to_check>
      - backend/src/controllers/PlanController.ts
      - backend/src/services/PlanService.ts
      - backend/src/models/Plan.ts
    </files_to_check>
  </subtask>

  <subtask id="6" priority="low" estimated_time="10min">
    <title>Testar criação de plano</title>
    <description>Criar plano de teste e verificar no banco</description>
    <acceptance>
      1. Campo "Público" não aparece na UI
      2. "Prompts" aparece em vez de "Talk.ia"
      3. Plano criado com isPublic=false
    </acceptance>
  </subtask>
</subtasks>
```

### 📂 Arquivos
```xml
<files>
  <file action="read" priority="high">
    <path>frontend/src/pages/Plans/index.js</path>
    <reason>Página de gerenciamento de planos</reason>
  </file>

  <file action="read" priority="high">
    <path>frontend/src/components/PlanModal/index.js</path>
    <reason>Modal de criação/edição de planos</reason>
  </file>

  <file action="modify" priority="high">
    <path>[PLAN_FORM_COMPONENT].js</path>
    <reason>Ocultar campo "Público" e ajustar initialValues</reason>
  </file>

  <file action="modify" priority="high">
    <path>frontend/src/translate/languages/pt.js</path>
    <reason>Renomear "Talk.ia" para "Prompts"</reason>
  </file>

  <file action="modify" priority="medium">
    <path>frontend/src/translate/languages/en.js</path>
    <reason>Atualizar tradução inglês</reason>
  </file>

  <file action="modify" priority="medium">
    <path>frontend/src/translate/languages/es.js</path>
    <reason>Atualizar tradução espanhol</reason>
  </file>

  <file action="modify" priority="medium">
    <path>frontend/src/translate/languages/tr.js</path>
    <reason>Atualizar tradução turco</reason>
  </file>

  <file action="modify" priority="medium">
    <path>frontend/src/translate/languages/ar.js</path>
    <reason>Atualizar tradução árabe</reason>
  </file>

  <file action="read" priority="low">
    <path>backend/src/models/Plan.ts</path>
    <reason>Verificar model e validações</reason>
  </file>
</files>
```

### 🤖 Specialized Agents
```xml
<specialized_agents>
  <agent name="frontend-analyst" usage="initial">
    <purpose>Localizar componentes de Planos</purpose>
    <task>Mapear formulários e modais de planos</task>
  </agent>

  <agent name="backend-analyst" usage="verification">
    <purpose>Verificar impacto no backend</purpose>
    <task>Validar que isPublic=false não quebra nada</task>
  </agent>

  <agent name="lint-type-fix" usage="final">
    <purpose>Linting e type checking</purpose>
    <task>npm run lint no frontend</task>
  </agent>
</specialized_agents>
```

### ✓ Critérios de Aceitação
```xml
<acceptance_criteria>
  <criterion id="AC1" type="visual">
    <description>Campo "Público" não aparece na UI de criação/edição de planos</description>
    <validation>Manual: Abrir modal de criar plano</validation>
  </criterion>

  <criterion id="AC2" type="visual">
    <description>Label "Prompts" aparece em vez de "Talk.ia" em todos os idiomas</description>
    <validation>Manual: Trocar idiomas e verificar</validation>
  </criterion>

  <criterion id="AC3" type="functional">
    <description>Criar plano funciona normalmente</description>
    <validation>Criar plano de teste e verificar no banco</validation>
  </criterion>

  <criterion id="AC4" type="data">
    <description>Novos planos têm isPublic=false por padrão</description>
    <validation>Query: SELECT isPublic FROM Plans WHERE createdAt > NOW()</validation>
  </criterion>

  <criterion id="AC5" type="backward_compatibility">
    <description>Planos antigos com isPublic=true continuam funcionando</description>
    <validation>Verificar planos existentes no ambiente de produção</validation>
  </criterion>
</acceptance_criteria>
```

### 📚 Referências
```xml
<references>
  <doc type="internal">
    <title>Models Documentation</title>
    <path>docs/backend/MODELS.md</path>
    <section>Plan</section>
  </doc>

  <doc type="internal">
    <title>Internationalization</title>
    <path>docs/frontend/ARCHITECTURE.md</path>
    <section>i18next</section>
  </doc>
</references>
```

---

## TASK-09: Backend | Alta (4)

### 🎯 Título
**Corrigir contatos estranhos na tela e ajustar para busca global**

### 📦 Contexto
```xml
<context>
  <project>ChatIA Flow v2.2.2v-26</project>
  <stack>Node.js, Express, Sequelize, PostgreSQL, Socket.IO</stack>
  <location>backend/src/services/ContactService/</location>
  <feature>Listagem e gerenciamento de contatos</feature>
  <issues>
    1. Contatos estranhos aparecem na listagem (vazamento multi-tenant?)
    2. Busca não é global (falta buscar por múltiplos campos)
  </issues>
</context>
```

### 🔴 Problema
```xml
<problem>
  <description>
    Dois problemas críticos na tela de Contatos:

    1. **Contatos estranhos**: Aparecem contatos que não pertencem à empresa do usuário logado.
       HIPÓTESE: Falta filtro por companyId em alguma query ou vazamento de dados multi-tenant.

    2. **Busca limitada**: A busca atual provavelmente só busca por nome. Precisa buscar de
       forma global por: nome, telefone, email, tags, notes, etc.
  </description>

  <impact>
    - CRÍTICO: Vazamento de dados entre empresas (violação multi-tenant)
    - Usuários veem contatos de outras empresas
    - Busca ineficaz (não encontra contatos por telefone/email)
    - Possível violação LGPD/GDPR
  </impact>

  <security_risk>
    Se companyId não está sendo filtrado, isso é uma vulnerabilidade de segurança grave.
  </security_risk>
</problem>
```

### ✅ Requisitos
```xml
<requirements>
  <functional>
    <requirement id="F1">Listar APENAS contatos da empresa do usuário logado</requirement>
    <requirement id="F2">Busca global por: nome, telefone, email, tags, notes</requirement>
    <requirement id="F3">Paginação deve ser mantida</requirement>
    <requirement id="F4">Ordenação por nome (alfabética) ou data (mais recente)</requirement>
  </functional>

  <technical>
    <requirement id="T1">SEMPRE filtrar por companyId em todas as queries</requirement>
    <requirement id="T2">Usar Sequelize Op.or para busca em múltiplos campos</requirement>
    <requirement id="T3">Usar Sequelize Op.iLike para busca case-insensitive</requirement>
    <requirement id="T4">Adicionar índices no banco para campos de busca</requirement>
  </technical>

  <security>
    <requirement id="S1">Validar companyId do usuário logado em TODA query</requirement>
    <requirement id="S2">Nunca confiar em companyId vindo do frontend</requirement>
    <requirement id="S3">Usar middleware isAuthCompany</requirement>
    <requirement id="S4">Logs de auditoria para buscas de contatos</requirement>
  </security>
</requirements>
```

### 📋 Subtasks
```xml
<subtasks>
  <subtask id="1" priority="critical" estimated_time="30min">
    <title>Auditar queries de listagem de contatos</title>
    <description>Verificar TODAS as queries em ContactService para garantir filtro por companyId</description>
    <acceptance>Lista de queries identificadas com/sem filtro companyId</acceptance>
    <files_to_check>
      - backend/src/services/ContactService/ListContactsService.ts
      - backend/src/services/ContactService/ShowContactService.ts
      - backend/src/controllers/ContactController.ts
    </files_to_check>
    <search_pattern>
      - Contact.findAll
      - Contact.findOne
      - Contact.findAndCountAll
      - WHERE clauses sem companyId
    </search_pattern>
  </subtask>

  <subtask id="2" priority="critical" estimated_time="45min">
    <title>Adicionar filtro companyId em todas as queries</title>
    <description>Corrigir queries que não filtram por companyId</description>
    <acceptance>TODAS as queries de Contact têm where: { companyId }</acceptance>
    <code_example>
      // ANTES (ERRADO - vazamento multi-tenant)
      const contacts = await Contact.findAll({
        where: { name: { [Op.like]: `%${searchParam}%` } }
      });

      // DEPOIS (CORRETO)
      const contacts = await Contact.findAll({
        where: {
          companyId: req.user.companyId, // OBRIGATÓRIO
          name: { [Op.like]: `%${searchParam}%` }
        }
      });
    </code_example>
  </subtask>

  <subtask id="3" priority="high" estimated_time="30min">
    <title>Implementar busca global</title>
    <description>Modificar query para buscar em múltiplos campos</description>
    <acceptance>Busca funciona por nome, telefone, email</acceptance>
    <code_example>
      // backend/src/services/ContactService/ListContactsService.ts
      import { Op } from "sequelize";

      const whereCondition = {
        companyId: req.user.companyId, // SEMPRE OBRIGATÓRIO
      };

      if (searchParam) {
        whereCondition[Op.or] = [
          { name: { [Op.iLike]: `%${searchParam}%` } },
          { number: { [Op.iLike]: `%${searchParam}%` } },
          { email: { [Op.iLike]: `%${searchParam}%` } },
          { "$tags.name$": { [Op.iLike]: `%${searchParam}%` } },
        ];
      }

      const { count, rows: contacts } = await Contact.findAndCountAll({
        where: whereCondition,
        include: [
          { model: Tag, as: "tags" },
          { model: Ticket, as: "tickets" }
        ],
        limit: pageSize,
        offset: (page - 1) * pageSize,
        order: [["name", "ASC"]],
      });
    </code_example>
  </subtask>

  <subtask id="4" priority="high" estimated_time="20min">
    <title>Verificar middleware isAuthCompany</title>
    <description>Garantir que rotas de Contact usam isAuthCompany</description>
    <acceptance>Todas as rotas /contacts/* têm middleware isAuthCompany</acceptance>
    <file_to_check>
      backend/src/routes/contactRoutes.ts
    </file_to_check>
    <code_example>
      import { isAuthCompany } from "../middleware/isAuthCompany";

      router.get("/contacts", isAuth, isAuthCompany, ContactController.index);
      router.get("/contacts/:id", isAuth, isAuthCompany, ContactController.show);
      router.post("/contacts", isAuth, isAuthCompany, ContactController.store);
      router.put("/contacts/:id", isAuth, isAuthCompany, ContactController.update);
      router.delete("/contacts/:id", isAuth, isAuthCompany, ContactController.remove);
    </code_example>
  </subtask>

  <subtask id="5" priority="medium" estimated_time="30min">
    <title>Adicionar índices para performance</title>
    <description>Criar migration para índices em name, number, email, companyId</description>
    <acceptance>Queries rápidas mesmo com muitos contatos</acceptance>
    <code_example>
      // backend/src/database/migrations/XXXXXX-add-contact-search-indexes.ts
      module.exports = {
        up: (queryInterface) => {
          return Promise.all([
            queryInterface.addIndex("Contacts", ["companyId", "name"], {
              name: "idx_contacts_company_name",
            }),
            queryInterface.addIndex("Contacts", ["companyId", "number"], {
              name: "idx_contacts_company_number",
            }),
            queryInterface.addIndex("Contacts", ["companyId", "email"], {
              name: "idx_contacts_company_email",
            }),
          ]);
        },
        down: (queryInterface) => {
          return Promise.all([
            queryInterface.removeIndex("Contacts", "idx_contacts_company_name"),
            queryInterface.removeIndex("Contacts", "idx_contacts_company_number"),
            queryInterface.removeIndex("Contacts", "idx_contacts_company_email"),
          ]);
        },
      };
    </code_example>
  </subtask>

  <subtask id="6" priority="high" estimated_time="30min">
    <title>Testar isolamento multi-tenant</title>
    <description>Criar contatos em 2 empresas diferentes e verificar isolamento</description>
    <acceptance>
      1. Empresa A vê apenas seus contatos
      2. Empresa B vê apenas seus contatos
      3. Não há vazamento entre empresas
    </acceptance>
    <test_scenario>
      1. Login como empresa A
      2. Criar contato "João Silva - Empresa A"
      3. Login como empresa B
      4. Criar contato "Maria Santos - Empresa B"
      5. Login novamente como empresa A
      6. Listar contatos e verificar que NÃO aparece "Maria Santos"
    </test_scenario>
  </subtask>

  <subtask id="7" priority="medium" estimated_time="20min">
    <title>Adicionar logs de auditoria</title>
    <description>Logar todas as buscas de contatos para auditoria</description>
    <acceptance>Logs mostram quem buscou o quê e quando</acceptance>
    <code_example>
      logger.info({
        action: "contact_search",
        userId: req.user.id,
        companyId: req.user.companyId,
        searchParam,
        resultsCount: count,
        timestamp: new Date(),
      });
    </code_example>
  </subtask>
</subtasks>
```

### 📂 Arquivos
```xml
<files>
  <file action="read" priority="critical">
    <path>backend/src/services/ContactService/ListContactsService.ts</path>
    <reason>Serviço principal de listagem</reason>
  </file>

  <file action="modify" priority="critical">
    <path>backend/src/services/ContactService/ListContactsService.ts</path>
    <reason>Adicionar filtro companyId e busca global</reason>
  </file>

  <file action="read" priority="high">
    <path>backend/src/controllers/ContactController.ts</path>
    <reason>Verificar validações no controller</reason>
  </file>

  <file action="read" priority="high">
    <path>backend/src/routes/contactRoutes.ts</path>
    <reason>Verificar middlewares de auth</reason>
  </file>

  <file action="read" priority="high">
    <path>backend/src/models/Contact.ts</path>
    <reason>Verificar relações e scopes</reason>
  </file>

  <file action="create" priority="medium">
    <path>backend/src/database/migrations/XXXXXX-add-contact-search-indexes.ts</path>
    <reason>Adicionar índices para performance</reason>
  </file>

  <file action="read" priority="low">
    <path>docs/backend/MODELS.md</path>
    <reason>Documentação do model Contact</reason>
  </file>
</files>
```

### 🤖 Specialized Agents
```xml
<specialized_agents>
  <agent name="backend-analyst" usage="initial">
    <purpose>Auditar queries de Contact</purpose>
    <task>Encontrar TODAS as queries sem filtro companyId</task>
  </agent>

  <agent name="policy-enforcer" usage="critical">
    <purpose>Validar isolamento multi-tenant</purpose>
    <task>Garantir que TODAS as queries filtram por companyId</task>
  </agent>

  <agent name="db-schema-architect" usage="indexes">
    <purpose>Criar migration de índices</purpose>
    <task>Adicionar índices compostos para busca rápida</task>
  </agent>

  <agent name="unit-test-synthesizer" usage="after_fix">
    <purpose>Criar testes de isolamento</purpose>
    <task>Testar que empresa A não vê contatos de empresa B</task>
  </agent>

  <agent name="chatiafow-code-reviewer" usage="before_merge">
    <purpose>Review de segurança</purpose>
    <task>Validar que não há mais vazamento multi-tenant</task>
  </agent>
</specialized_agents>
```

### ✓ Critérios de Aceitação
```xml
<acceptance_criteria>
  <criterion id="AC1" type="security">
    <description>NENHUM contato de outra empresa aparece na listagem</description>
    <validation>Teste com 2 empresas diferentes</validation>
  </criterion>

  <criterion id="AC2" type="security">
    <description>TODAS as queries de Contact têm filtro por companyId</description>
    <validation>Code review + busca por "Contact.find" sem companyId</validation>
  </criterion>

  <criterion id="AC3" type="functional">
    <description>Busca global funciona por nome, telefone, email</description>
    <validation>
      1. Buscar por nome parcial: encontra
      2. Buscar por telefone: encontra
      3. Buscar por email: encontra
    </validation>
  </criterion>

  <criterion id="AC4" type="performance">
    <description>Busca retorna em menos de 500ms com 10k contatos</description>
    <validation>Seed de 10k contatos e medir tempo de query</validation>
  </criterion>

  <criterion id="AC5" type="audit">
    <description>Logs de auditoria registram todas as buscas</description>
    <validation>Verificar logs após fazer busca</validation>
  </criterion>
</acceptance_criteria>
```

### 📚 Referências
```xml
<references>
  <doc type="internal">
    <title>Models Documentation</title>
    <path>docs/backend/MODELS.md</path>
    <section>Contact</section>
  </doc>

  <doc type="internal">
    <title>Multi-tenant Architecture</title>
    <path>docs/backend/ARCHITECTURE.md</path>
    <section>Data Isolation</section>
  </doc>

  <doc type="external">
    <title>Sequelize Operators</title>
    <url>https://sequelize.org/docs/v6/core-concepts/model-querying-basics/#operators</url>
  </doc>

  <doc type="external">
    <title>PostgreSQL Full-text Search</title>
    <url>https://www.postgresql.org/docs/current/textsearch.html</url>
  </doc>
</references>
```

---

## TASK-10: Frontend | Crítico (5)

### 🎯 Título
**Corrigir WhiteLabel: nome do sistema muda para "ChatIA" após reload**

### 📦 Contexto
```xml
<context>
  <project>ChatIA Flow v2.2.2v-26</project>
  <stack>React 17.0.2, Material-UI v4/v5, Context API</stack>
  <location>frontend/src/context/WhiteLabel/</location>
  <feature>Sistema de WhiteLabel (rebrand personalizado)</feature>
  <bug>Nome do sistema volta para "ChatIA" após reload da página</bug>
</context>
```

### 🔴 Problema
```xml
<problem>
  <description>
    Mesmo com WhiteLabel configurado para outro nome (ex: "MeuSistema"), após recarregar
    a página o título volta para "ChatIA". Isso ocorre provavelmente porque:

    1. WhiteLabel Context não está sendo carregado antes do render inicial
    2. Configuração não está persistida ou não está sendo lida do backend
    3. document.title está sendo setado com valor hardcoded antes do Context carregar
  </description>

  <impact>
    - CRÍTICO: Cliente paga por WhiteLabel mas vê "ChatIA"
    - Perda de identidade de marca
    - Reclamações de clientes
    - Violação de contrato de WhiteLabel
  </impact>

  <when_happens>
    - Ao recarregar página (F5)
    - Ao abrir nova aba
    - Após login
  </when_happens>
</problem>
```

### ✅ Requisitos
```xml
<requirements>
  <functional>
    <requirement id="F1">Nome do sistema deve ser o configurado no WhiteLabel</requirement>
    <requirement id="F2">Nome deve persistir após reload da página</requirement>
    <requirement id="F3">document.title deve refletir WhiteLabel</requirement>
    <requirement id="F4">Favicon deve refletir WhiteLabel (se configurado)</requirement>
  </functional>

  <technical>
    <requirement id="T1">Carregar WhiteLabel do backend na inicialização</requirement>
    <requirement id="T2">Usar useEffect para atualizar document.title</requirement>
    <requirement id="T3">Cache de WhiteLabel no localStorage (opcional)</requirement>
    <requirement id="T4">Loader/Splash screen enquanto carrega WhiteLabel</requirement>
  </technical>

  <fallback>
    <requirement id="FB1">Se WhiteLabel não configurado, usar "ChatIA" como padrão</requirement>
    <requirement id="FB2">Não quebrar se API de WhiteLabel falhar</requirement>
  </fallback>
</requirements>
```

### 📋 Subtasks
```xml
<subtasks>
  <subtask id="1" priority="critical" estimated_time="20min">
    <title>Analisar WhiteLabelContext</title>
    <description>Verificar como WhiteLabel é carregado e armazenado</description>
    <acceptance>Entendimento completo do fluxo de WhiteLabel</acceptance>
    <files_to_check>
      - frontend/src/context/WhiteLabel/WhiteLabelContext.js
      - frontend/src/hooks/useWhiteLabel.js
      - frontend/src/App.js (onde Context é provido)
    </files_to_check>
  </subtask>

  <subtask id="2" priority="critical" estimated_time="30min">
    <title>Verificar API de WhiteLabel</title>
    <description>Confirmar que backend retorna configuração correta</description>
    <acceptance>GET /settings/whitelabel retorna { name, logo, colors, ... }</acceptance>
    <test_api>
      curl -H "Authorization: Bearer TOKEN" \
        http://localhost:8080/settings/whitelabel
    </test_api>
  </subtask>

  <subtask id="3" priority="high" estimated_time="45min">
    <title>Implementar carregamento no App.js</title>
    <description>Carregar WhiteLabel antes de renderizar rotas</description>
    <acceptance>WhiteLabel carregado ANTES do primeiro render</acceptance>
    <code_example>
      // frontend/src/App.js
      import { WhiteLabelProvider } from "./context/WhiteLabel/WhiteLabelContext";

      function App() {
        const [whiteLabelLoaded, setWhiteLabelLoaded] = useState(false);

        useEffect(() => {
          // Carregar WhiteLabel do backend ou localStorage
          const loadWhiteLabel = async () => {
            try {
              const cached = localStorage.getItem("whiteLabel");
              if (cached) {
                // Usar cache temporariamente
                setWhiteLabelLoaded(true);
              }

              const response = await api.get("/settings/whitelabel");
              localStorage.setItem("whiteLabel", JSON.stringify(response.data));
              setWhiteLabelLoaded(true);
            } catch (error) {
              console.error("Erro ao carregar WhiteLabel:", error);
              setWhiteLabelLoaded(true); // Continuar mesmo com erro
            }
          };

          loadWhiteLabel();
        }, []);

        if (!whiteLabelLoaded) {
          return <SplashScreen />; // Loader enquanto carrega
        }

        return (
          <WhiteLabelProvider>
            {/* Rotas */}
          </WhiteLabelProvider>
        );
      }
    </code_example>
  </subtask>

  <subtask id="4" priority="high" estimated_time="20min">
    <title>Atualizar document.title dinamicamente</title>
    <description>Usar useEffect no WhiteLabelContext para setar document.title</description>
    <acceptance>document.title muda assim que WhiteLabel carrega</acceptance>
    <code_example>
      // frontend/src/context/WhiteLabel/WhiteLabelContext.js
      export const WhiteLabelProvider = ({ children }) => {
        const [whiteLabel, setWhiteLabel] = useState({
          name: "ChatIA", // fallback
          logo: "",
          colors: {},
        });

        useEffect(() => {
          // Carregar do localStorage ou API
          const cached = JSON.parse(localStorage.getItem("whiteLabel") || "{}");
          if (cached.name) {
            setWhiteLabel(cached);
          }
        }, []);

        // IMPORTANTE: Atualizar document.title sempre que whiteLabel mudar
        useEffect(() => {
          document.title = whiteLabel.name || "ChatIA";

          // Atualizar favicon se configurado
          if (whiteLabel.favicon) {
            const link = document.querySelector("link[rel='icon']");
            if (link) {
              link.href = whiteLabel.favicon;
            }
          }
        }, [whiteLabel]);

        return (
          <WhiteLabelContext.Provider value={{ whiteLabel, setWhiteLabel }}>
            {children}
          </WhiteLabelContext.Provider>
        );
      };
    </code_example>
  </subtask>

  <subtask id="5" priority="medium" estimated_time="15min">
    <title>Adicionar SplashScreen component</title>
    <description>Criar loader simples para exibir enquanto carrega WhiteLabel</description>
    <acceptance>Tela de loading aparece por ~500ms até WhiteLabel carregar</acceptance>
    <code_example>
      // frontend/src/components/SplashScreen/index.js
      import { CircularProgress, Box } from "@material-ui/core";

      const SplashScreen = () => (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="100vh"
        >
          <CircularProgress />
        </Box>
      );
    </code_example>
  </subtask>

  <subtask id="6" priority="low" estimated_time="15min">
    <title>Limpar cache de WhiteLabel ao logout</title>
    <description>Remover localStorage("whiteLabel") no logout</description>
    <acceptance>Após logout, WhiteLabel é recarregado do backend no próximo login</acceptance>
  </subtask>

  <subtask id="7" priority="high" estimated_time="30min">
    <title>Testar reload em diversos cenários</title>
    <description>Testar F5, nova aba, login/logout</description>
    <acceptance>Nome correto em TODOS os cenários</acceptance>
    <test_scenarios>
      1. Configurar WhiteLabel para "MeuSistema"
      2. F5 na página: deve continuar "MeuSistema"
      3. Abrir nova aba: deve mostrar "MeuSistema"
      4. Logout e login novamente: deve mostrar "MeuSistema"
      5. Limpar localStorage: deve buscar do backend e mostrar "MeuSistema"
    </test_scenarios>
  </subtask>
</subtasks>
```

### 📂 Arquivos
```xml
<files>
  <file action="read" priority="critical">
    <path>frontend/src/context/WhiteLabel/WhiteLabelContext.js</path>
    <reason>Context principal do WhiteLabel</reason>
  </file>

  <file action="modify" priority="critical">
    <path>frontend/src/context/WhiteLabel/WhiteLabelContext.js</path>
    <reason>Adicionar useEffect para document.title</reason>
  </file>

  <file action="modify" priority="high">
    <path>frontend/src/App.js</path>
    <reason>Carregar WhiteLabel antes do render</reason>
  </file>

  <file action="create" priority="medium">
    <path>frontend/src/components/SplashScreen/index.js</path>
    <reason>Loader durante carregamento</reason>
  </file>

  <file action="read" priority="medium">
    <path>backend/src/controllers/SettingsController.ts</path>
    <reason>Verificar endpoint de WhiteLabel</reason>
  </file>

  <file action="read" priority="low">
    <path>docs/frontend/WHITELABEL.md</path>
    <reason>Documentação do sistema WhiteLabel</reason>
  </file>
</files>
```

### 🤖 Specialized Agents
```xml
<specialized_agents>
  <agent name="frontend-analyst" usage="initial">
    <purpose>Analisar fluxo de WhiteLabel</purpose>
    <task>Mapear como WhiteLabel é carregado e usado</task>
  </agent>

  <agent name="backend-analyst" usage="verification">
    <purpose>Verificar API de WhiteLabel</purpose>
    <task>Confirmar que endpoint retorna dados corretos</task>
  </agent>

  <agent name="frontend-implementer" usage="implementation">
    <purpose>Implementar carregamento no App.js</purpose>
    <task>Adicionar lógica de loading e SplashScreen</task>
  </agent>

  <agent name="integration-validator" usage="testing">
    <purpose>Validar integração FE-BE</purpose>
    <task>Testar que WhiteLabel persiste após reload</task>
  </agent>
</specialized_agents>
```

### ✓ Critérios de Aceitação
```xml
<acceptance_criteria>
  <criterion id="AC1" type="visual">
    <description>Nome do sistema correto no título da página</description>
    <validation>Verificar document.title no navegador</validation>
  </criterion>

  <criterion id="AC2" type="persistence">
    <description>Nome persiste após F5 (reload)</description>
    <validation>
      1. Configurar WhiteLabel para "MeuSistema"
      2. F5
      3. Verificar que continua "MeuSistema"
    </validation>
  </criterion>

  <criterion id="AC3" type="persistence">
    <description>Nome correto ao abrir nova aba</description>
    <validation>Abrir nova aba e verificar título</validation>
  </criterion>

  <criterion id="AC4" type="functional">
    <description>Favicon atualizado se configurado</description>
    <validation>Verificar ícone na aba do navegador</validation>
  </criterion>

  <criterion id="AC5" type="fallback">
    <description>Se WhiteLabel não configurado, usar "ChatIA" como padrão</description>
    <validation>Remover configuração e verificar fallback</validation>
  </criterion>

  <criterion id="AC6" type="ux">
    <description>SplashScreen aparece brevemente durante carregamento</description>
    <validation>Limpar cache e verificar loader</validation>
  </criterion>
</acceptance_criteria>
```

### 📚 Referências
```xml
<references>
  <doc type="internal">
    <title>WhiteLabel Documentation</title>
    <path>docs/frontend/WHITELABEL.md</path>
  </doc>

  <doc type="internal">
    <title>Context API Usage</title>
    <path>docs/frontend/ARCHITECTURE.md</path>
    <section>State Management - Context API</section>
  </doc>

  <doc type="external">
    <title>React useEffect Hook</title>
    <url>https://react.dev/reference/react/useEffect</url>
  </doc>
</references>
```

---

## TASK-11: Frontend | Alta (4)

### 🎯 Título
**Corrigir erros de tradução e "internal error" na tela de Contatos**

### 📦 Contexto
```xml
<context>
  <project>ChatIA Flow v2.2.2v-26</project>
  <stack>React 17.0.2, Material-UI v4/v5, i18next, Formik</stack>
  <location>frontend/src/pages/Contacts/</location>
  <feature>Gerenciamento de contatos</feature>
  <issues>
    1. Título do telefone aparece como "conexão"
    2. Erros de tradução ao importar contatos
    3. "Internal error" ao adicionar contato
  </issues>
</context>
```

### 🔴 Problema
```xml
<problem>
  <description>
    Três problemas na tela de Contatos:

    1. **Label errado**: Título do campo telefone aparece como "conexão" (deveria ser "Telefone" ou "WhatsApp")

    2. **Erros de tradução**: Ao clicar em "Importar contatos", os títulos/labels aparecem com
       chave de tradução em vez do texto traduzido (ex: "contacts.import.title" em vez de "Importar Contatos")

    3. **Internal error**: Ao tentar adicionar um novo contato manualmente, aparece "internal error" e
       o contato não é criado
  </description>

  <impact>
    - UX ruim (labels errados)
    - Funcionalidade de importar contatos confusa
    - CRÍTICO: Não consegue adicionar contatos (internal error)
  </impact>
</problem>
```

### ✅ Requisitos
```xml
<requirements>
  <functional>
    <requirement id="F1">Label de telefone deve ser "Telefone" ou "WhatsApp"</requirement>
    <requirement id="F2">Todas as traduções devem funcionar corretamente</requirement>
    <requirement id="F3">Adicionar contato deve funcionar sem erros</requirement>
    <requirement id="F4">Importar contatos deve exibir labels corretos</requirement>
  </functional>

  <technical>
    <requirement id="T1">Corrigir chaves de tradução em pt.js, en.js, es.js, tr.js, ar.js</requirement>
    <requirement id="T2">Investigar erro no backend ao criar contato</requirement>
    <requirement id="T3">Validações do Formik devem estar corretas</requirement>
    <requirement id="T4">API POST /contacts deve retornar erro específico, não genérico</requirement>
  </technical>

  <debugging>
    <requirement id="D1">Capturar stack trace do "internal error"</requirement>
    <requirement id="D2">Verificar logs do backend</requirement>
    <requirement id="D3">Validar payload enviado ao backend</requirement>
  </debugging>
</requirements>
```

### 📋 Subtasks
```xml
<subtasks>
  <subtask id="1" priority="high" estimated_time="15min">
    <title>Corrigir label "conexão" para "Telefone"</title>
    <description>Localizar e corrigir label do campo de telefone</description>
    <acceptance>Label correto em todos os idiomas</acceptance>
    <files_to_check>
      - frontend/src/pages/Contacts/index.js
      - frontend/src/components/ContactModal/
      - frontend/src/translate/languages/pt.js
    </files_to_check>
  </subtask>

  <subtask id="2" priority="high" estimated_time="30min">
    <title>Corrigir traduções de "Importar contatos"</title>
    <description>Verificar e corrigir chaves de tradução no modal de importação</description>
    <acceptance>Todos os textos traduzidos corretamente</acceptance>
    <code_example>
      // Verificar se há uso correto de i18n.t()
      // ERRADO:
      <Typography>contacts.import.title</Typography>

      // CORRETO:
      <Typography>{i18n.t("contacts.import.title")}</Typography>
    </code_example>
  </subtask>

  <subtask id="3" priority="critical" estimated_time="45min">
    <title>Reproduzir e debugar "internal error"</title>
    <description>Tentar adicionar contato e capturar erro completo</description>
    <acceptance>Stack trace completo identificado</acceptance>
    <debugging_steps>
      1. Abrir DevTools → Network
      2. Tentar adicionar contato
      3. Verificar response do POST /contacts
      4. Copiar erro completo
      5. Verificar logs do backend
    </debugging_steps>
  </subtask>

  <subtask id="4" priority="critical" estimated_time="60min">
    <title>Corrigir causa do internal error</title>
    <description>Corrigir bug no backend ou frontend que causa o erro</description>
    <acceptance>Contato é criado sem erros</acceptance>
    <possible_causes>
      - Validação do Formik incorreta
      - Campo obrigatório faltando no payload
      - Erro de foreign key (companyId, queueId, etc)
      - Erro de duplicação (unique constraint)
      - Formato de telefone inválido
    </possible_causes>
    <code_example>
      // Verificar payload enviado:
      const payload = {
        name: "João Silva",
        number: "5511999999999", // Formato correto?
        email: "joao@example.com",
        companyId: user.companyId, // Está sendo enviado?
      };

      // Backend: adicionar try-catch específico
      try {
        const contact = await Contact.create(payload);
        return res.json(contact);
      } catch (error) {
        logger.error({ error: error.message, stack: error.stack });

        if (error.name === 'SequelizeUniqueConstraintError') {
          return res.status(400).json({ error: "Contato já existe" });
        }

        if (error.name === 'SequelizeValidationError') {
          return res.status(400).json({ error: error.errors[0].message });
        }

        return res.status(500).json({ error: "Erro ao criar contato" });
      }
    </code_example>
  </subtask>

  <subtask id="5" priority="medium" estimated_time="20min">
    <title>Adicionar tratamento de erros no frontend</title>
    <description>Exibir mensagem de erro específica ao usuário</description>
    <acceptance>Toast com mensagem clara ao invés de "internal error"</acceptance>
    <code_example>
      try {
        const response = await api.post("/contacts", contactData);
        toast.success(i18n.t("contacts.toasts.success"));
        handleClose();
      } catch (error) {
        const errorMessage = error.response?.data?.error ||
                            i18n.t("contacts.toasts.error");
        toast.error(errorMessage);
      }
    </code_example>
  </subtask>

  <subtask id="6" priority="medium" estimated_time="20min">
    <title>Testar fluxo completo</title>
    <description>Testar adicionar e importar contatos</description>
    <acceptance>
      1. Label "Telefone" correto
      2. Importar contatos com labels traduzidos
      3. Adicionar contato funciona
      4. Erros específicos (não "internal error")
    </acceptance>
  </subtask>
</subtasks>
```

### 📂 Arquivos
```xml
<files>
  <file action="read" priority="high">
    <path>frontend/src/pages/Contacts/index.js</path>
    <reason>Página principal de contatos</reason>
  </file>

  <file action="read" priority="high">
    <path>frontend/src/components/ContactModal/index.js</path>
    <reason>Modal de criação/edição de contatos</reason>
  </file>

  <file action="modify" priority="high">
    <path>frontend/src/components/ContactModal/index.js</path>
    <reason>Corrigir labels e tratamento de erro</reason>
  </file>

  <file action="modify" priority="high">
    <path>frontend/src/translate/languages/pt.js</path>
    <reason>Corrigir/adicionar traduções</reason>
  </file>

  <file action="read" priority="critical">
    <path>backend/src/controllers/ContactController.ts</path>
    <reason>Investigar erro ao criar contato</reason>
  </file>

  <file action="modify" priority="critical">
    <path>backend/src/controllers/ContactController.ts</path>
    <reason>Adicionar tratamento de erros específico</reason>
  </file>

  <file action="read" priority="medium">
    <path>backend/src/services/ContactService/CreateContactService.ts</path>
    <reason>Verificar lógica de criação</reason>
  </file>
</files>
```

### 🤖 Specialized Agents
```xml
<specialized_agents>
  <agent name="frontend-analyst" usage="initial">
    <purpose>Analisar componentes de Contatos</purpose>
    <task>Mapear formulários e traduções</task>
  </agent>

  <agent name="backend-analyst" usage="debugging">
    <purpose>Investigar internal error</purpose>
    <task>Analisar logs e stack trace do erro</task>
  </agent>

  <agent name="backend-implementer" usage="fix">
    <purpose>Corrigir bug de criação de contato</purpose>
    <task>Adicionar validações e tratamento de erro</task>
  </agent>

  <agent name="integration-validator" usage="testing">
    <purpose>Testar fluxo E2E</purpose>
    <task>Validar criação e importação de contatos</task>
  </agent>
</specialized_agents>
```

### ✓ Critérios de Aceitação
```xml
<acceptance_criteria>
  <criterion id="AC1" type="visual">
    <description>Label de telefone correto ("Telefone" ou "WhatsApp")</description>
    <validation>Verificar label na tela</validation>
  </criterion>

  <criterion id="AC2" type="functional">
    <description>Traduções funcionam em "Importar contatos"</description>
    <validation>Abrir modal de importação e verificar textos</validation>
  </criterion>

  <criterion id="AC3" type="functional">
    <description>Adicionar contato funciona sem erros</description>
    <validation>
      1. Preencher formulário de novo contato
      2. Salvar
      3. Verificar que contato foi criado no banco
    </validation>
  </criterion>

  <criterion id="AC4" type="error_handling">
    <description>Erros específicos em vez de "internal error"</description>
    <validation>
      Tentar criar contato duplicado e verificar mensagem clara
    </validation>
  </criterion>

  <criterion id="AC5" type="i18n">
    <description>Todas as traduções funcionam nos 5 idiomas</description>
    <validation>Testar em pt, en, es, tr, ar</validation>
  </criterion>
</acceptance_criteria>
```

### 📚 Referências
```xml
<references>
  <doc type="internal">
    <title>Components Documentation</title>
    <path>docs/frontend/COMPONENTS.md</path>
    <section>ContactModal</section>
  </doc>

  <doc type="internal">
    <title>Backend Services</title>
    <path>docs/backend/SERVICES.md</path>
    <section>ContactService</section>
  </doc>

  <doc type="external">
    <title>i18next Documentation</title>
    <url>https://www.i18next.com/</url>
  </doc>
</references>
```

---

## TASK-12: Backend | Alta (4)

### 🎯 Título
**Corrigir erro no kanban ao automatizar retorno para coluna**

### 📦 Contexto
```xml
<context>
  <project>ChatIA Flow v2.2.2v-26</project>
  <stack>Node.js, Express, Sequelize, PostgreSQL, Socket.IO</stack>
  <location>backend/src/services/TicketService/</location>
  <feature>Sistema de Kanban com automações de tickets</feature>
  <bug>Erro ao automatizar movimento de ticket de volta para coluna anterior</bug>
</context>
```

### 🔴 Problema
```xml
<problem>
  <description>
    No sistema de Kanban, existe funcionalidade de automação que move tickets entre colunas
    automaticamente baseado em regras (ex: após X tempo, após resposta, etc).

    Quando a automação tenta RETORNAR um ticket para uma coluna anterior (ex: de "Em Andamento"
    para "Aguardando"), o sistema gera um erro e o ticket fica travado.
  </description>

  <impact>
    - Automações de kanban não funcionam corretamente
    - Tickets ficam travados
    - Fluxo de atendimento interrompido
    - Usuários precisam mover manualmente
  </impact>

  <hypothesis>
    - Validação impedindo movimento "para trás"
    - Erro de ordem/posição na coluna
    - Conflito de Socket.IO ao emitir mudança
    - Race condition com múltiplas automações
  </hypothesis>
</problem>
```

### ✅ Requisitos
```xml
<requirements>
  <functional>
    <requirement id="F1">Permitir movimento de ticket para qualquer coluna (forward e backward)</requirement>
    <requirement id="F2">Automação deve funcionar igual a movimento manual</requirement>
    <requirement id="F3">Atualizar posição do ticket na nova coluna</requirement>
    <requirement id="F4">Socket.IO deve notificar mudança em tempo real</requirement>
  </functional>

  <technical>
    <requirement id="T1">Remover validação que impede movimento backward</requirement>
    <requirement id="T2">Usar transação para atomicidade</requirement>
    <requirement id="T3">Recalcular posições de todos os tickets nas colunas afetadas</requirement>
    <requirement id="T4">Logs detalhados para debugging de automações</requirement>
  </technical>

  <automation>
    <requirement id="A1">Automação deve registrar histórico no ticket</requirement>
    <requirement id="A2">Não executar mesma automação múltiplas vezes</requirement>
    <requirement id="A3">Validar que coluna de destino existe</requirement>
  </automation>
</requirements>
```

### 📋 Subtasks
```xml
<subtasks>
  <subtask id="1" priority="critical" estimated_time="30min">
    <title>Reproduzir o erro</title>
    <description>Criar automação que move ticket para coluna anterior e executar</description>
    <acceptance>Erro reproduzido de forma consistente com stack trace</acceptance>
    <steps>
      1. Criar automação: "Se ticket em 'Em Andamento' por 1h, mover para 'Aguardando'"
      2. Criar ticket e mover para "Em Andamento"
      3. Esperar automação executar ou forçar execução
      4. Capturar erro do console/logs
    </steps>
  </subtask>

  <subtask id="2" priority="high" estimated_time="30min">
    <title>Analisar código de automação de kanban</title>
    <description>Localizar serviço que executa automações de movimento</description>
    <acceptance>Código identificado e analisado</acceptance>
    <files_to_check>
      - backend/src/services/TicketService/UpdateTicketService.ts
      - backend/src/services/AutomationService/
      - backend/src/services/KanbanService/
      - backend/src/jobs/TicketAutomationJob.ts (Bull Queue)
    </files_to_check>
  </subtask>

  <subtask id="3" priority="critical" estimated_time="60min">
    <title>Remover/corrigir validação que bloqueia movimento backward</title>
    <description>Permitir movimento em qualquer direção</description>
    <acceptance>Ticket pode ser movido para qualquer coluna</acceptance>
    <code_example>
      // ANTES (possível validação bloqueando):
      if (newColumn.order < currentColumn.order) {
        throw new AppError("Não é possível mover ticket para trás", 400);
      }

      // DEPOIS (permitir qualquer movimento):
      // Remover validação ou torná-la opcional
      if (allowBackwardMovement || newColumn.order >= currentColumn.order) {
        // Permitir movimento
      }
    </code_example>
  </subtask>

  <subtask id="4" priority="high" estimated_time="45min">
    <title>Implementar movimento de ticket com recálculo de posições</title>
    <description>Atualizar posições corretas ao mover ticket</description>
    <acceptance>Tickets mantêm ordem correta nas colunas</acceptance>
    <code_example>
      // backend/src/services/KanbanService/MoveTicketService.ts
      const moveTicket = async ({ ticketId, targetColumnId, companyId }) => {
        return await sequelize.transaction(async (t) => {
          // 1. Buscar ticket
          const ticket = await Ticket.findOne({
            where: { id: ticketId, companyId },
            transaction: t,
            lock: t.LOCK.UPDATE
          });

          // 2. Buscar coluna de destino
          const targetColumn = await KanbanColumn.findOne({
            where: { id: targetColumnId, companyId },
            transaction: t
          });

          if (!targetColumn) {
            throw new AppError("Coluna não encontrada", 404);
          }

          // 3. Recalcular posições da coluna antiga
          await Ticket.update(
            { position: sequelize.literal('position - 1') },
            {
              where: {
                kanbanColumnId: ticket.kanbanColumnId,
                position: { [Op.gt]: ticket.position }
              },
              transaction: t
            }
          );

          // 4. Obter última posição da coluna nova
          const maxPosition = await Ticket.max('position', {
            where: { kanbanColumnId: targetColumnId },
            transaction: t
          }) || 0;

          // 5. Atualizar ticket
          ticket.kanbanColumnId = targetColumnId;
          ticket.position = maxPosition + 1;
          await ticket.save({ transaction: t });

          // 6. Registrar no histórico
          await TicketHistory.create({
            ticketId: ticket.id,
            action: 'kanban_move',
            fromColumn: ticket.kanbanColumnId,
            toColumn: targetColumnId,
            userId: null, // Automação
            isAutomation: true,
            companyId
          }, { transaction: t });

          // 7. Emitir Socket.IO após commit
          await t.afterCommit(() => {
            const io = getIO();
            io.to(`company-${companyId}`).emit('ticket:kanban:move', {
              ticketId: ticket.id,
              fromColumn: ticket.kanbanColumnId,
              toColumn: targetColumnId
            });
          });

          return ticket;
        });
      };
    </code_example>
  </subtask>

  <subtask id="5" priority="medium" estimated_time="30min">
    <title>Adicionar validação de idempotência</title>
    <description>Evitar que mesma automação execute múltiplas vezes</description>
    <acceptance>Automação só executa uma vez por ticket</acceptance>
    <code_example>
      // Verificar se automação já foi executada recentemente
      const recentExecution = await AutomationExecution.findOne({
        where: {
          ticketId,
          automationId,
          executedAt: { [Op.gte]: moment().subtract(1, 'hour') }
        }
      });

      if (recentExecution) {
        logger.info({ ticketId, automationId, msg: 'Automação já executada' });
        return;
      }

      // Executar automação...

      // Registrar execução
      await AutomationExecution.create({
        ticketId,
        automationId,
        executedAt: new Date()
      });
    </code_example>
  </subtask>

  <subtask id="6" priority="medium" estimated_time="20min">
    <title>Adicionar logs detalhados</title>
    <description>Logar todas as automações de kanban</description>
    <acceptance>Logs mostram origem, destino, motivo da automação</acceptance>
  </subtask>

  <subtask id="7" priority="high" estimated_time="30min">
    <title>Testar automações de kanban</title>
    <description>Testar movimento forward e backward</description>
    <acceptance>
      1. Automação forward funciona
      2. Automação backward funciona
      3. Posições corretas em ambas as colunas
      4. Socket.IO notifica mudanças
    </acceptance>
  </subtask>
</subtasks>
```

### 📂 Arquivos
```xml
<files>
  <file action="read" priority="critical">
    <path>backend/src/services/TicketService/UpdateTicketService.ts</path>
    <reason>Serviço de atualização de tickets</reason>
  </file>

  <file action="read" priority="high">
    <path>backend/src/services/KanbanService/MoveTicketService.ts</path>
    <reason>Serviço específico de movimento no kanban</reason>
  </file>

  <file action="modify" priority="critical">
    <path>backend/src/services/KanbanService/MoveTicketService.ts</path>
    <reason>Corrigir lógica de movimento</reason>
  </file>

  <file action="read" priority="high">
    <path>backend/src/jobs/TicketAutomationJob.ts</path>
    <reason>Job do Bull Queue para automações</reason>
  </file>

  <file action="read" priority="medium">
    <path>backend/src/models/KanbanColumn.ts</path>
    <reason>Model de colunas do kanban</reason>
  </file>

  <file action="read" priority="medium">
    <path>backend/src/models/Ticket.ts</path>
    <reason>Verificar relações com kanban</reason>
  </file>
</files>
```

### 🤖 Specialized Agents
```xml
<specialized_agents>
  <agent name="backend-analyst" usage="initial">
    <purpose>Analisar arquitetura do kanban</purpose>
    <task>Mapear serviços e jobs de automação</task>
  </agent>

  <agent name="bull-queue-architect" usage="automation">
    <purpose>Verificar jobs de automação</purpose>
    <task>Analisar TicketAutomationJob e retry strategies</task>
  </agent>

  <agent name="socket-io-architect" usage="realtime">
    <purpose>Garantir notificações em tempo real</purpose>
    <task>Validar eventos de kanban move</task>
  </agent>

  <agent name="unit-test-synthesizer" usage="testing">
    <purpose>Criar testes de movimento</purpose>
    <task>Testar forward, backward e edge cases</task>
  </agent>
</specialized_agents>
```

### ✓ Critérios de Aceitação
```xml
<acceptance_criteria>
  <criterion id="AC1" type="functional">
    <description>Automação move ticket para frente (forward) sem erros</description>
    <validation>Criar automação forward e verificar execução</validation>
  </criterion>

  <criterion id="AC2" type="functional">
    <description>Automação move ticket para trás (backward) sem erros</description>
    <validation>Criar automação backward e verificar execução</validation>
  </criterion>

  <criterion id="AC3" type="data_integrity">
    <description>Posições dos tickets mantêm ordem correta</description>
    <validation>Verificar campo position de todos os tickets nas colunas</validation>
  </criterion>

  <criterion id="AC4" type="realtime">
    <description>Socket.IO notifica mudança de coluna</description>
    <validation>Verificar evento ticket:kanban:move emitido</validation>
  </criterion>

  <criterion id="AC5" type="idempotency">
    <description>Mesma automação não executa múltiplas vezes</description>
    <validation>Executar automação 2x e verificar que só move uma vez</validation>
  </criterion>
</acceptance_criteria>
```

### 📚 Referências
```xml
<references>
  <doc type="internal">
    <title>Kanban System</title>
    <path>docs/backend/KANBAN.md</path>
  </doc>

  <doc type="internal">
    <title>Bull Queue Jobs</title>
    <path>docs/backend/QUEUES.md</path>
    <section>TicketAutomationJob</section>
  </doc>

  <doc type="internal">
    <title>Socket.IO Events</title>
    <path>docs/backend/WEBSOCKET.md</path>
    <section>Ticket Events</section>
  </doc>
</references>
```

---

## TASK-13: Full-stack | Média (3)

### 🎯 Título
**Ajustar tela de recuperar senha e configurar SMTP**

### 📦 Contexto
```xml
<context>
  <project>ChatIA Flow v2.2.2v-26</project>
  <stack_frontend>React 17.0.2, Material-UI v4/v5, Formik</stack_frontend>
  <stack_backend>Node.js, Nodemailer, SMTP</stack_backend>
  <location>
    - frontend/src/pages/ForgotPassword/
    - backend/src/services/EmailService/
  </location>
  <feature>Recuperação de senha via email</feature>
  <tasks>
    1. Ajustar UI da tela de recuperar senha
    2. Configurar serviço SMTP para envio de emails
    3. Documentar configuração SMTP (tutorial)
  </tasks>
</context>
```

### 🔴 Problema
```xml
<problem>
  <description>
    Dois problemas relacionados à recuperação de senha:

    1. **Tela de recuperar senha**: Precisa de ajustes de UI/UX (provavelmente layout quebrado,
       traduções faltando, ou feedback visual inadequado)

    2. **SMTP não configurado**: Sistema não consegue enviar emails de recuperação de senha
       porque o serviço SMTP não está configurado corretamente. Falta também documentação/tutorial
       de como configurar SMTP.
  </description>

  <impact>
    - Usuários não conseguem recuperar senha esquecida
    - Sistema não envia emails
    - Falta documentação para admins configurarem SMTP
  </impact>
</problem>
```

### ✅ Requisitos
```xml
<requirements>
  <functional>
    <requirement id="F1">Tela de recuperar senha funcional e com boa UX</requirement>
    <requirement id="F2">Envio de email de recuperação funciona</requirement>
    <requirement id="F3">Email contém link válido com token</requirement>
    <requirement id="F4">Token expira em 1 hora</requirement>
    <requirement id="F5">Tela de reset de senha (após clicar no link)</requirement>
  </functional>

  <technical>
    <requirement id="T1">Nodemailer configurado com SMTP</requirement>
    <requirement id="T2">Suporte para Gmail, Outlook, SMTP customizado</requirement>
    <requirement id="T3">Variáveis de ambiente para credenciais SMTP</requirement>
    <requirement id="T4">Template HTML para email de recuperação</requirement>
    <requirement id="T5">Token JWT com expiração de 1h</requirement>
  </technical>

  <documentation>
    <requirement id="D1">Tutorial de configuração SMTP no docs/</requirement>
    <requirement id="D2">Exemplos para Gmail, Outlook, SendGrid</requirement>
    <requirement id="D3">Troubleshooting de erros comuns</requirement>
  </documentation>
</requirements>
```

### 📋 Subtasks
```xml
<subtasks>
  <subtask id="1" priority="high" estimated_time="30min">
    <title>Analisar tela de recuperar senha</title>
    <description>Identificar problemas na UI atual</description>
    <acceptance>Lista de problemas identificados</acceptance>
    <files_to_check>
      - frontend/src/pages/ForgotPassword/index.js
      - frontend/src/pages/ResetPassword/index.js
    </files_to_check>
  </subtask>

  <subtask id="2" priority="high" estimated_time="45min">
    <title>Ajustar UI de recuperar senha</title>
    <description>Melhorar layout, traduções, feedback visual</description>
    <acceptance>Tela com boa UX e todas as traduções funcionando</acceptance>
    <ui_improvements>
      - Layout responsivo
      - Feedback visual ao enviar (loading spinner)
      - Mensagem de sucesso/erro clara
      - Link para voltar ao login
      - Validação de email (formato)
    </ui_improvements>
  </subtask>

  <subtask id="3" priority="critical" estimated_time="60min">
    <title>Configurar serviço SMTP com Nodemailer</title>
    <description>Implementar envio de emails com Nodemailer</description>
    <acceptance>Emails sendo enviados com sucesso</acceptance>
    <code_example>
      // backend/src/config/email.ts
      import nodemailer from "nodemailer";

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true", // true para 465, false para outros
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      export default transporter;
    </code_example>
  </subtask>

  <subtask id="4" priority="high" estimated_time="45min">
    <title>Implementar fluxo de recuperação de senha</title>
    <description>Backend: gerar token, enviar email, validar token</description>
    <acceptance>Fluxo completo funcionando</acceptance>
    <code_example>
      // backend/src/services/AuthService/ForgotPasswordService.ts
      import jwt from "jsonwebtoken";
      import transporter from "../../config/email";

      const forgotPassword = async (email: string) => {
        // 1. Verificar se usuário existe
        const user = await User.findOne({ where: { email } });
        if (!user) {
          // Por segurança, não revelar se email existe
          return { message: "Se o email existir, você receberá um link" };
        }

        // 2. Gerar token JWT com expiração de 1h
        const token = jwt.sign(
          { userId: user.id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        // 3. Montar URL de reset
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        // 4. Enviar email
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: email,
          subject: "Recuperação de Senha - ChatIA Flow",
          html: `
            <h1>Recuperação de Senha</h1>
            <p>Você solicitou a recuperação de senha.</p>
            <p>Clique no link abaixo para criar uma nova senha:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>Este link expira em 1 hora.</p>
          `,
        });

        return { message: "Email enviado com sucesso" };
      };
    </code_example>
  </subtask>

  <subtask id="5" priority="high" estimated_time="30min">
    <title>Implementar reset de senha com token</title>
    <description>Backend: validar token e atualizar senha</description>
    <acceptance>Senha atualizada após validar token</acceptance>
    <code_example>
      // backend/src/services/AuthService/ResetPasswordService.ts
      const resetPassword = async (token: string, newPassword: string) => {
        // 1. Validar token
        let decoded;
        try {
          decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
          throw new AppError("Token inválido ou expirado", 401);
        }

        // 2. Buscar usuário
        const user = await User.findByPk(decoded.userId);
        if (!user) {
          throw new AppError("Usuário não encontrado", 404);
        }

        // 3. Hash da nova senha
        const passwordHash = await bcrypt.hash(newPassword, 10);

        // 4. Atualizar senha
        user.passwordHash = passwordHash;
        await user.save();

        return { message: "Senha atualizada com sucesso" };
      };
    </code_example>
  </subtask>

  <subtask id="6" priority="high" estimated_time="60min">
    <title>Criar tutorial de configuração SMTP</title>
    <description>Documentar como configurar SMTP no projeto</description>
    <acceptance>Documento completo em docs/tutorials/SMTP-SETUP.md</acceptance>
    <tutorial_structure>
      # Configuração de SMTP para Envio de Emails

      ## 1. Variáveis de Ambiente

      ## 2. Gmail
      - Habilitar "App Passwords"
      - Configurar variáveis

      ## 3. Outlook/Office 365
      - Configurações específicas

      ## 4. SendGrid
      - API Key setup

      ## 5. SMTP Customizado
      - Qualquer provedor SMTP

      ## 6. Troubleshooting
      - Erros comuns e soluções
    </tutorial_structure>
  </subtask>

  <subtask id="7" priority="medium" estimated_time="30min">
    <title>Criar template HTML de email</title>
    <description>Template responsivo e profissional</description>
    <acceptance>Email bonito em desktop e mobile</acceptance>
  </subtask>

  <subtask id="8" priority="high" estimated_time="30min">
    <title>Testar fluxo completo</title>
    <description>Testar recuperação de senha E2E</description>
    <acceptance>
      1. Solicitar recuperação: email enviado
      2. Clicar no link: abre tela de reset
      3. Definir nova senha: senha atualizada
      4. Login com nova senha: funciona
    </acceptance>
  </subtask>
</subtasks>
```

### 📂 Arquivos
```xml
<files>
  <file action="read" priority="high">
    <path>frontend/src/pages/ForgotPassword/index.js</path>
    <reason>Tela de solicitar recuperação</reason>
  </file>

  <file action="modify" priority="high">
    <path>frontend/src/pages/ForgotPassword/index.js</path>
    <reason>Ajustar UI e UX</reason>
  </file>

  <file action="read" priority="high">
    <path>frontend/src/pages/ResetPassword/index.js</path>
    <reason>Tela de criar nova senha</reason>
  </file>

  <file action="create" priority="critical">
    <path>backend/src/config/email.ts</path>
    <reason>Configuração do Nodemailer</reason>
  </file>

  <file action="create" priority="high">
    <path>backend/src/services/AuthService/ForgotPasswordService.ts</path>
    <reason>Serviço de gerar token e enviar email</reason>
  </file>

  <file action="create" priority="high">
    <path>backend/src/services/AuthService/ResetPasswordService.ts</path>
    <reason>Serviço de validar token e resetar senha</reason>
  </file>

  <file action="create" priority="high">
    <path>docs/tutorials/SMTP-SETUP.md</path>
    <reason>Tutorial de configuração SMTP</reason>
  </file>

  <file action="create" priority="medium">
    <path>backend/src/templates/emails/forgot-password.html</path>
    <reason>Template HTML do email</reason>
  </file>
</files>
```

### 🤖 Specialized Agents
```xml
<specialized_agents>
  <agent name="frontend-implementer" usage="ui">
    <purpose>Ajustar tela de recuperar senha</purpose>
    <task>Melhorar UX e traduções</task>
  </agent>

  <agent name="backend-implementer" usage="smtp">
    <purpose>Configurar Nodemailer e implementar serviços</purpose>
    <task>ForgotPasswordService e ResetPasswordService</task>
  </agent>

  <agent name="integration-validator" usage="testing">
    <purpose>Testar fluxo E2E de recuperação</purpose>
    <task>Validar envio de email e reset de senha</task>
  </agent>

  <agent name="docs-sync" usage="documentation">
    <purpose>Criar e validar tutorial SMTP</purpose>
    <task>Escrever docs/tutorials/SMTP-SETUP.md</task>
  </agent>
</specialized_agents>
```

### ✓ Critérios de Aceitação
```xml
<acceptance_criteria>
  <criterion id="AC1" type="ui">
    <description>Tela de recuperar senha com boa UX</description>
    <validation>Revisão visual da tela</validation>
  </criterion>

  <criterion id="AC2" type="functional">
    <description>Email de recuperação enviado com sucesso</description>
    <validation>
      1. Solicitar recuperação
      2. Verificar caixa de entrada
      3. Email recebido com link válido
    </validation>
  </criterion>

  <criterion id="AC3" type="functional">
    <description>Link de reset funciona</description>
    <validation>Clicar no link abre tela de reset</validation>
  </criterion>

  <criterion id="AC4" type="functional">
    <description>Senha é atualizada após reset</description>
    <validation>Login com nova senha funciona</validation>
  </criterion>

  <criterion id="AC5" type="security">
    <description>Token expira em 1 hora</description>
    <validation>Usar link expirado retorna erro</validation>
  </criterion>

  <criterion id="AC6" type="documentation">
    <description>Tutorial SMTP completo e funcional</description>
    <validation>Seguir tutorial e configurar SMTP com sucesso</validation>
  </criterion>
</acceptance_criteria>
```

### 📚 Referências
```xml
<references>
  <doc type="external">
    <title>Nodemailer Documentation</title>
    <url>https://nodemailer.com/</url>
  </doc>

  <doc type="external">
    <title>Gmail SMTP with App Passwords</title>
    <url>https://support.google.com/accounts/answer/185833</url>
  </doc>

  <doc type="external">
    <title>JWT Documentation</title>
    <url>https://jwt.io/</url>
  </doc>
</references>
```

---

## TASK-14: Full-stack | Crítico (5)

### 🎯 Título
**Corrigir FlowBuilder: sistema não funciona com dois blocos de perguntas**

### 📦 Contexto
```xml
<context>
  <project>ChatIA Flow v2.2.2v-26</project>
  <stack_frontend>React 17.0.2, React Flow, Zustand</stack_frontend>
  <stack_backend>Node.js, Express, Sequelize</stack_backend>
  <location>
    - frontend/src/pages/FlowBuilder/
    - backend/src/services/FlowService/
  </location>
  <feature>FlowBuilder - Editor visual de fluxos conversacionais</feature>
  <bug>Sistema não funciona quando há dois ou mais blocos de perguntas sequenciais</bug>
</context>
```

### 🔴 Problema
```xml
<problem>
  <description>
    O FlowBuilder é um editor visual que permite criar fluxos conversacionais com diversos
    tipos de nós (mensagem, pergunta, condição, API, etc).

    Quando um fluxo contém DOIS BLOCOS DE PERGUNTAS sequenciais (ex: Pergunta 1 → Pergunta 2),
    o sistema para de funcionar. O chatbot trava ou não avança para a segunda pergunta.

    Possíveis causas:
    - Estado do Zustand não gerenciando múltiplas perguntas
    - Backend não processando respostas sequenciais
    - Validação de fluxo impedindo múltiplas perguntas
    - Problema no parser/executor de fluxo
  </description>

  <impact>
    - CRÍTICO: FlowBuilder não funciona para casos de uso comuns
    - Clientes não conseguem criar fluxos complexos
    - Funcionalidade principal quebrada
  </impact>

  <when_fails>
    - Ao criar fluxo: Pergunta 1 → Pergunta 2
    - Durante execução: sistema trava após responder Pergunta 1
    - Não salva resposta da Pergunta 2
  </when_fails>
</problem>
```

### ✅ Requisitos
```xml
<requirements>
  <functional>
    <requirement id="F1">Permitir múltiplos blocos de pergunta em sequência</requirement>
    <requirement id="F2">Salvar resposta de cada pergunta corretamente</requirement>
    <requirement id="F3">Avançar automaticamente para próxima pergunta</requirement>
    <requirement id="F4">Armazenar respostas em variáveis do fluxo</requirement>
  </functional>

  <technical>
    <requirement id="T1">Zustand store deve gerenciar estado de múltiplas perguntas</requirement>
    <requirement id="T2">Backend deve processar respostas sequenciais</requirement>
    <requirement id="T3">Parser de fluxo deve validar múltiplas perguntas</requirement>
    <requirement id="T4">Executor deve manter contexto entre perguntas</requirement>
  </technical>

  <flow_execution>
    <requirement id="E1">Manter historico de respostas do usuário</requirement>
    <requirement id="E2">Validar resposta antes de avançar (se houver validação configurada)</requirement>
    <requirement id="E3">Timeout configurável para resposta</requirement>
  </flow_execution>
</requirements>
```

### 📋 Subtasks
```xml
<subtasks>
  <subtask id="1" priority="critical" estimated_time="30min">
    <title>Reproduzir o bug</title>
    <description>Criar fluxo simples com 2 perguntas e executar</description>
    <acceptance>Bug reproduzido de forma consistente</acceptance>
    <test_flow>
      NODE 1: [Mensagem] "Olá!"
      NODE 2: [Pergunta] "Qual seu nome?"
      NODE 3: [Pergunta] "Qual sua idade?"
      NODE 4: [Mensagem] "Obrigado!"
    </test_flow>
    <expected_behavior>
      1. Bot envia "Olá!"
      2. Bot pergunta nome
      3. Usuário responde nome
      4. Bot pergunta idade
      5. Usuário responde idade
      6. Bot envia "Obrigado!"
    </expected_behavior>
    <actual_behavior>
      Sistema trava no passo 4 (não pergunta idade)
    </actual_behavior>
  </subtask>

  <subtask id="2" priority="critical" estimated_time="45min">
    <title>Analisar código do FlowBuilder</title>
    <description>Mapear arquitetura do FlowBuilder</description>
    <acceptance>Entendimento completo do fluxo de execução</acceptance>
    <files_to_analyze>
      - frontend/src/pages/FlowBuilder/index.tsx
      - frontend/src/stores/flowBuilderStore.ts (Zustand)
      - frontend/src/pages/FlowBuilder/nodes/QuestionNode.tsx
      - backend/src/services/FlowService/ExecuteFlowService.ts
      - backend/src/services/FlowService/FlowParser.ts
    </files_to_analyze>
  </subtask>

  <subtask id="3" priority="critical" estimated_time="60min">
    <title>Debugar executor de fluxo no backend</title>
    <description>Identificar onde o fluxo para de executar</description>
    <acceptance>Ponto exato do erro identificado</acceptance>
    <debugging_steps>
      1. Adicionar logs em cada passo da execução
      2. Executar fluxo com 2 perguntas
      3. Analisar logs e identificar onde para
      4. Verificar estado do fluxo no banco após cada resposta
    </debugging_steps>
  </subtask>

  <subtask id="4" priority="critical" estimated_time="90min">
    <title>Corrigir gerenciamento de estado de múltiplas perguntas</title>
    <description>Garantir que estado mantém contexto entre perguntas</description>
    <acceptance>Fluxo avança corretamente entre múltiplas perguntas</acceptance>
    <code_example>
      // backend/src/services/FlowService/ExecuteFlowService.ts
      interface FlowExecution {
        flowId: number;
        contactId: number;
        currentNodeId: string;
        variables: Record<string, any>; // Respostas salvas aqui
        history: FlowHistoryItem[];
      }

      const executeNode = async (execution: FlowExecution, userMessage: string) => {
        const currentNode = findNodeById(execution.flowId, execution.currentNodeId);

        if (currentNode.type === 'question') {
          // Salvar resposta do usuário
          execution.variables[currentNode.variableName] = userMessage;

          // Logar execução
          execution.history.push({
            nodeId: currentNode.id,
            nodeType: 'question',
            question: currentNode.question,
            answer: userMessage,
            timestamp: new Date()
          });

          // Avançar para próximo nó
          const nextNode = findNextNode(currentNode);
          execution.currentNodeId = nextNode.id;

          // Salvar estado atualizado no banco
          await FlowExecution.update(
            {
              currentNodeId: nextNode.id,
              variables: execution.variables,
              history: execution.history
            },
            { where: { id: execution.id } }
          );

          // Se próximo nó também é pergunta, enviar pergunta
          if (nextNode.type === 'question') {
            await sendMessage(execution.contactId, nextNode.question);
          }

          return execution;
        }

        // ... outros tipos de nós
      };
    </code_example>
  </subtask>

  <subtask id="5" priority="high" estimated_time="45min">
    <title>Corrigir Zustand store no frontend</title>
    <description>Garantir que store mantém estado de múltiplas perguntas</description>
    <acceptance>UI do FlowBuilder reflete estado correto</acceptance>
    <code_example>
      // frontend/src/stores/flowBuilderStore.ts
      interface FlowBuilderStore {
        nodes: Node[];
        edges: Edge[];
        currentExecution: {
          currentNodeId: string;
          variables: Record<string, any>;
          awaitingResponse: boolean;
        };

        // Ação para avançar entre perguntas
        processUserResponse: (response: string) => void;
      }

      const useFlowBuilderStore = create<FlowBuilderStore>((set, get) => ({
        // ...

        processUserResponse: (response: string) => {
          const { currentExecution, nodes } = get();
          const currentNode = nodes.find(n => n.id === currentExecution.currentNodeId);

          if (currentNode?.type === 'question') {
            // Salvar resposta
            const variableName = currentNode.data.variableName;
            const newVariables = {
              ...currentExecution.variables,
              [variableName]: response
            };

            // Encontrar próximo nó
            const nextNode = findNextNode(currentNode);

            set({
              currentExecution: {
                currentNodeId: nextNode.id,
                variables: newVariables,
                awaitingResponse: nextNode.type === 'question'
              }
            });
          }
        }
      }));
    </code_example>
  </subtask>

  <subtask id="6" priority="medium" estimated_time="30min">
    <title>Adicionar validação de fluxo</title>
    <description>Validar que fluxo pode ter múltiplas perguntas</description>
    <acceptance>Validador não bloqueia múltiplas perguntas</acceptance>
  </subtask>

  <subtask id="7" priority="medium" estimated_time="30min">
    <title>Adicionar logs detalhados</title>
    <description>Logar execução de cada nó do fluxo</description>
    <acceptance>Logs mostram fluxo completo de execução</acceptance>
  </subtask>

  <subtask id="8" priority="high" estimated_time="60min">
    <title>Testar cenários complexos</title>
    <description>Testar diversos cenários com múltiplas perguntas</description>
    <acceptance>Todos os cenários funcionam</acceptance>
    <test_scenarios>
      1. Fluxo com 2 perguntas sequenciais
      2. Fluxo com 3 perguntas sequenciais
      3. Fluxo: Pergunta → Mensagem → Pergunta
      4. Fluxo: Pergunta → Condição → Pergunta
      5. Fluxo com validação de resposta
      6. Fluxo com timeout
    </test_scenarios>
  </subtask>

  <subtask id="9" priority="low" estimated_time="30min">
    <title>Documentar limitações (se houver)</title>
    <description>Atualizar docs/frontend/FLOWBUILDER.md</description>
    <acceptance>Documentação atualizada</acceptance>
  </subtask>
</subtasks>
```

### 📂 Arquivos
```xml
<files>
  <file action="read" priority="critical">
    <path>frontend/src/pages/FlowBuilder/index.tsx</path>
    <reason>Página principal do FlowBuilder</reason>
  </file>

  <file action="read" priority="critical">
    <path>frontend/src/stores/flowBuilderStore.ts</path>
    <reason>Zustand store do FlowBuilder</reason>
  </file>

  <file action="modify" priority="critical">
    <path>frontend/src/stores/flowBuilderStore.ts</path>
    <reason>Corrigir gerenciamento de estado</reason>
  </file>

  <file action="read" priority="critical">
    <path>backend/src/services/FlowService/ExecuteFlowService.ts</path>
    <reason>Executor de fluxos no backend</reason>
  </file>

  <file action="modify" priority="critical">
    <path>backend/src/services/FlowService/ExecuteFlowService.ts</path>
    <reason>Corrigir execução de múltiplas perguntas</reason>
  </file>

  <file action="read" priority="high">
    <path>backend/src/services/FlowService/FlowParser.ts</path>
    <reason>Parser que valida fluxos</reason>
  </file>

  <file action="read" priority="high">
    <path>frontend/src/pages/FlowBuilder/nodes/QuestionNode.tsx</path>
    <reason>Componente do nó de pergunta</reason>
  </file>

  <file action="modify" priority="low">
    <path>docs/frontend/FLOWBUILDER.md</path>
    <reason>Atualizar documentação</reason>
  </file>
</files>
```

### 🤖 Specialized Agents
```xml
<specialized_agents>
  <agent name="frontend-analyst" usage="initial">
    <purpose>Analisar FlowBuilder frontend</purpose>
    <task>Mapear Zustand store e componentes de nós</task>
  </agent>

  <agent name="backend-analyst" usage="initial">
    <purpose>Analisar executor de fluxos</purpose>
    <task>Mapear FlowService e FlowParser</task>
  </agent>

  <agent name="frontend-implementer" usage="fix_frontend">
    <purpose>Corrigir Zustand store</purpose>
    <task>Implementar gerenciamento correto de múltiplas perguntas</task>
  </agent>

  <agent name="backend-implementer" usage="fix_backend">
    <purpose>Corrigir executor de fluxos</purpose>
    <task>Garantir processamento sequencial de perguntas</task>
  </agent>

  <agent name="integration-validator" usage="testing">
    <purpose>Testar fluxos E2E</purpose>
    <task>Validar execução de fluxos complexos com múltiplas perguntas</task>
  </agent>

  <agent name="docs-sync" usage="documentation">
    <purpose>Atualizar documentação do FlowBuilder</purpose>
    <task>Documentar comportamento correto e limitações</task>
  </agent>
</specialized_agents>
```

### ✓ Critérios de Aceitação
```xml
<acceptance_criteria>
  <criterion id="AC1" type="functional">
    <description>Fluxo com 2 perguntas sequenciais funciona</description>
    <validation>
      1. Criar fluxo: Pergunta 1 → Pergunta 2
      2. Executar no chatbot
      3. Responder ambas as perguntas
      4. Verificar que respostas foram salvas
    </validation>
  </criterion>

  <criterion id="AC2" type="functional">
    <description>Fluxo com 3+ perguntas sequenciais funciona</description>
    <validation>Testar fluxo com 3 perguntas</validation>
  </criterion>

  <criterion id="AC3" type="data">
    <description>Respostas salvas em variáveis do fluxo</description>
    <validation>Verificar execution.variables no banco</validation>
  </criterion>

  <criterion id="AC4" type="ux">
    <description>UI do FlowBuilder mostra estado correto</description>
    <validation>Nó atual destacado durante execução</validation>
  </criterion>

  <criterion id="AC5" type="complex_flows">
    <description>Fluxos complexos funcionam (com condições, API calls, etc)</description>
    <validation>Testar: Pergunta → Condição → Pergunta → API</validation>
  </criterion>
</acceptance_criteria>
```

### 📚 Referências
```xml
<references>
  <doc type="internal">
    <title>FlowBuilder Documentation</title>
    <path>docs/frontend/FLOWBUILDER.md</path>
  </doc>

  <doc type="internal">
    <title>Flow Service Documentation</title>
    <path>docs/backend/SERVICES.md</path>
    <section>FlowService</section>
  </doc>

  <doc type="external">
    <title>React Flow Documentation</title>
    <url>https://reactflow.dev/</url>
  </doc>

  <doc type="external">
    <title>Zustand Documentation</title>
    <url>https://zustand-demo.pmnd.rs/</url>
  </doc>
</references>
```

---

## Resumo das 14 Tasks

| ID | Título | Categoria | Prioridade | Tempo Est. |
|----|--------|-----------|------------|------------|
| 01 | Seletor de idioma (árabe + espaçamento) | Frontend | 5 | 1h30min |
| 02 | Demo user creation não funciona | Backend | 4 | 3h |
| 03 | Erro ao aceitar contato em fila | Backend | 5 | 4h |
| 04 | Remover aba "Lista de arquivos" | Frontend | 3 | 1h |
| 05 | Alterar título "Cadastrar empresa" | Frontend | 2 | 30min |
| 06 | Buscador Empresas + senha com olho | Frontend | 3 | 2h |
| 07 | Senha com olho em Usuários | Frontend | 2 | 1h |
| 08 | Config Planos: ocultar "Público" | Backend | 2 | 1h |
| 09 | Contatos estranhos + busca global | Backend | 4 | 3h |
| 10 | WhiteLabel nome do sistema | Frontend | 5 | 2h |
| 11 | Erros tradução + internal error Contatos | Frontend | 4 | 2h30min |
| 12 | Kanban automação erro retorno coluna | Backend | 4 | 3h |
| 13 | Recuperar senha + SMTP | Full-stack | 3 | 4h |
| 14 | FlowBuilder dois blocos pergunta | Full-stack | 5 | 4h |

**Total Estimado:** ~32 horas de desenvolvimento

---

**Próximos Passos:**

1. Priorizar tasks críticas (5) primeiro
2. Depois tasks de alta prioridade (4)
3. Por fim, tasks de média e baixa

**Observações:**

- Todas as tasks têm subtasks detalhadas
- Specialized agents recomendados para cada task
- Critérios de aceitação claros e testáveis
- Referências aos docs do projeto
- Código de exemplo quando aplicável

**Versionamento:**

Este documento deve ser atualizado conforme tasks são completadas.
Marcar tasks concluídas com ✅ e data de conclusão.
