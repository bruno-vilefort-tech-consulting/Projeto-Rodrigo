# E2E Test Checklist: Companies Search Feature

## Informações do Teste

**Feature:** Busca de Empresas (Companies Search)
**Data do Teste:** _______________
**Testador:** _______________
**Ambiente:** Development / Staging / Production
**Versão:** _______________
**Browsers Testados:** Chrome / Firefox / Safari / Edge

---

## Pré-requisitos

- [ ] Backend rodando em http://localhost:8080
- [ ] Frontend rodando em http://localhost:3000
- [ ] Banco de dados populado com pelo menos 5 companies diferentes
- [ ] Super user disponível (admin@admin.com / senha: admin)
- [ ] Regular user disponível para testes de multi-tenant
- [ ] Feature flag `REACT_APP_FEATURE_COMPANY_SEARCH=enabled` no frontend/.env

---

## 1. Feature Flag - Renderização Condicional

### 1.1 Feature Flag Enabled (Padrão)
- [ ] Acessar /login e fazer login como super user
- [ ] Navegar para /settings
- [ ] Clicar na aba "Empresas"
- [ ] **Verificar:** SearchBar aparece acima do formulário de empresas
- [ ] **Verificar:** Ícone de lupa (🔍) está visível dentro do SearchBar
- [ ] **Verificar:** Placeholder diz "Buscar empresas..." (ou tradução equivalente)
- [ ] **Verificar:** Campo é do tipo "search" (tem estilo de busca do navegador)

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

### 1.2 Feature Flag Disabled
- [ ] Parar o frontend (Ctrl+C)
- [ ] Editar `frontend/.env` e definir `REACT_APP_FEATURE_COMPANY_SEARCH=false`
- [ ] Reiniciar o frontend (`npm start`)
- [ ] Fazer login e navegar para /settings → Empresas
- [ ] **Verificar:** SearchBar NÃO aparece
- [ ] **Verificar:** Tabela de empresas funciona normalmente
- [ ] **Verificar:** Criar/editar/deletar empresas funciona normalmente
- [ ] Reverter `REACT_APP_FEATURE_COMPANY_SEARCH=enabled` e reiniciar

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

---

## 2. Busca por Nome

### 2.1 Nome Completo
- [ ] Digitar nome completo de uma company existente (ex: "ACME Corporation")
- [ ] **Verificar:** Apenas essa company aparece na tabela
- [ ] **Verificar:** Contador de empresas atualiza (se houver)
- [ ] **Verificar:** Filtro acontece em tempo real (não precisa clicar em buscar)

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

### 2.2 Nome Parcial
- [ ] Limpar busca
- [ ] Digitar parte de um nome (ex: "tech")
- [ ] **Verificar:** Todas companies com "tech" no nome aparecem
- [ ] **Verificar:** Companies sem "tech" não aparecem

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

### 2.3 Case-Insensitive (Maiúsculas)
- [ ] Limpar busca
- [ ] Digitar "ACME" (tudo maiúsculo)
- [ ] **Verificar:** Encontra "ACME Corporation", "acme corp", "Acme Inc", etc.

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

### 2.4 Case-Insensitive (Minúsculas)
- [ ] Limpar busca
- [ ] Digitar "acme" (tudo minúsculo)
- [ ] **Verificar:** Encontra "ACME Corporation", "Acme Inc", etc.

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

### 2.5 Case-Insensitive (Misto)
- [ ] Limpar busca
- [ ] Digitar "AcMe" (misturando maiúsculas e minúsculas)
- [ ] **Verificar:** Encontra todas variações de "acme"

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

---

## 3. Busca por Email

### 3.1 Email Completo
- [ ] Limpar busca
- [ ] Digitar email completo (ex: "contact@acme.com")
- [ ] **Verificar:** Company com esse email aparece

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

### 3.2 Parte do Email
- [ ] Limpar busca
- [ ] Digitar parte do email (ex: "contact@")
- [ ] **Verificar:** Companies com emails que contenham "contact@" aparecem

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

### 3.3 Domínio do Email
- [ ] Limpar busca
- [ ] Digitar domínio (ex: "@test.com")
- [ ] **Verificar:** Todas companies com emails terminando em "@test.com" aparecem

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

---

## 4. Busca por Documento (CNPJ/CPF)

### 4.1 Documento Completo
- [ ] Limpar busca
- [ ] Digitar CNPJ/CPF completo (ex: "12345678000199")
- [ ] **Verificar:** Company com esse documento aparece

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

### 4.2 Parte do Documento
- [ ] Limpar busca
- [ ] Digitar parte do documento (ex: "123456")
- [ ] **Verificar:** Companies com documentos contendo "123456" aparecem

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

---

## 5. Busca por Telefone

### 5.1 Telefone Completo
- [ ] Limpar busca
- [ ] Digitar telefone completo (ex: "5511999999999")
- [ ] **Verificar:** Company com esse telefone aparece

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

### 5.2 Parte do Telefone
- [ ] Limpar busca
- [ ] Digitar DDD ou parte do número (ex: "5511")
- [ ] **Verificar:** Companies com telefones iniciando com "5511" aparecem

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

---

## 6. Limpar Busca

### 6.1 Botão de Limpar Aparece
- [ ] Digitar qualquer termo no SearchBar
- [ ] **Verificar:** Botão "X" (ClearIcon) aparece no lado direito do campo

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

### 6.2 Limpar Campo
- [ ] Clicar no botão "X"
- [ ] **Verificar:** Campo de busca fica vazio
- [ ] **Verificar:** Tabela volta ao estado original (todas companies aparecem)
- [ ] **Verificar:** Botão "X" desaparece

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

---

## 7. Empty State

### 7.1 Busca Sem Resultados
- [ ] Digitar termo que não existe (ex: "xyzabc123nonexistent")
- [ ] **Verificar:** Tabela fica vazia (0 linhas)
- [ ] **Verificar:** Não há mensagem de erro no console (F12)
- [ ] **Verificar:** Não há crash da aplicação
- [ ] **Verificar:** Cabeçalho da tabela ainda está visível

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

### 7.2 Retornar ao Estado Normal
- [ ] Limpar busca
- [ ] **Verificar:** Todas companies voltam a aparecer

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

---

## 8. Acessibilidade (WCAG AA)

### 8.1 Aria-Label
- [ ] Inspecionar elemento do SearchBar (F12)
- [ ] **Verificar:** Tem atributo `aria-label` definido
- [ ] **Verificar:** Aria-label é descritivo (ex: "Campo de busca de empresas")

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

### 8.2 Navegação por Teclado
- [ ] Recarregar página
- [ ] Pressionar Tab várias vezes até chegar ao SearchBar
- [ ] **Verificar:** SearchBar recebe foco visível (outline/border destacado)
- [ ] Digitar texto usando apenas teclado
- [ ] **Verificar:** Filtro funciona normalmente

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

### 8.3 Leitor de Tela (Opcional)
- [ ] Ativar leitor de tela (NVDA no Windows, VoiceOver no Mac)
- [ ] Navegar até o SearchBar
- [ ] **Verificar:** Leitor de tela anuncia "Campo de busca" ou similar
- [ ] **Verificar:** Leitor de tela lê o placeholder

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas / ⏭️ Pulado
**Observações:** _______________

### 8.4 Contraste de Cores
- [ ] Inspecionar cores do SearchBar
- [ ] **Verificar:** Contraste entre texto e fundo é de pelo menos 4.5:1
- [ ] **Verificar:** Placeholder tem contraste suficiente (mínimo 3:1)

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

---

## 9. Internacionalização (i18n)

### 9.1 Português (pt-BR)
- [ ] Garantir que idioma está em Português
- [ ] **Verificar:** Placeholder = "Buscar empresas..."
- [ ] **Verificar:** Aria-label em português

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

### 9.2 Inglês (en)
- [ ] Trocar idioma para English (se disponível)
- [ ] **Verificar:** Placeholder = "Search companies..."
- [ ] **Verificar:** Todos os textos traduzidos

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas / ⏭️ Pulado
**Observações:** _______________

### 9.3 Espanhol (es)
- [ ] Trocar idioma para Español
- [ ] **Verificar:** Placeholder = "Buscar empresas..." (ou variação)

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas / ⏭️ Pulado
**Observações:** _______________

### 9.4 Turco (tr)
- [ ] Trocar idioma para Türkçe
- [ ] **Verificar:** Tradução apropriada

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas / ⏭️ Pulado
**Observações:** _______________

### 9.5 Árabe (ar)
- [ ] Trocar idioma para العربية
- [ ] **Verificar:** Tradução apropriada
- [ ] **Verificar:** Layout RTL (right-to-left) funciona corretamente

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas / ⏭️ Pulado
**Observações:** _______________

---

## 10. Performance

### 10.1 Filtro em Tempo Real
- [ ] Digitar rapidamente no SearchBar (ex: "acme corporation")
- [ ] **Verificar:** Não há lag perceptível (< 100ms)
- [ ] **Verificar:** Tabela não "pisca" durante digitação

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

### 10.2 Grande Volume de Dados
- [ ] Criar pelo menos 50 companies no banco (script ou manualmente)
- [ ] Recarregar página
- [ ] Digitar busca
- [ ] **Verificar:** Filtro ainda é rápido (< 500ms)
- [ ] **Verificar:** Sem travamentos

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas / ⏭️ Pulado
**Observações:** _______________

### 10.3 Console de Erros
- [ ] Abrir Console do navegador (F12 → Console)
- [ ] Realizar várias buscas
- [ ] **Verificar:** Não há erros ou warnings no console
- [ ] **Verificar:** Não há memory leaks (verificar com DevTools → Memory)

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

---

## 11. Integração com Outras Funcionalidades

### 11.1 Filtrar e Editar
- [ ] Filtrar companies (ex: digitar "acme")
- [ ] Clicar em Editar (ícone de lápis) em uma company da lista filtrada
- [ ] **Verificar:** Modal/formulário de edição abre corretamente
- [ ] Salvar alterações
- [ ] **Verificar:** Filtro é mantido após salvar
- [ ] **Verificar:** Company editada ainda aparece na lista filtrada

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

### 11.2 Filtrar e Criar Nova
- [ ] Filtrar companies (ex: digitar "test")
- [ ] Preencher formulário de criação de nova company
- [ ] Salvar
- [ ] **Verificar:** Nova company é adicionada à lista
- [ ] **Verificar:** Se o filtro atual corresponder, a nova company aparece
- [ ] **Verificar:** Filtro não é resetado

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

### 11.3 Filtrar e Deletar
- [ ] Filtrar companies (ex: digitar "delete")
- [ ] Clicar em Deletar em uma company da lista filtrada
- [ ] Confirmar exclusão
- [ ] **Verificar:** Company é removida da lista
- [ ] **Verificar:** Filtro continua ativo
- [ ] **Verificar:** Lista é atualizada corretamente

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

### 11.4 Paginação (Se Houver)
- [ ] Se houver paginação, filtrar companies
- [ ] Navegar entre páginas
- [ ] **Verificar:** Filtro é mantido durante navegação
- [ ] **Verificar:** Apenas companies que correspondem ao filtro aparecem em todas as páginas

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas / ⏭️ Não Aplicável
**Observações:** _______________

---

## 12. Multi-Tenant Security

### 12.1 Super User - Acesso Total
- [ ] Login como super user (admin@admin.com)
- [ ] Navegar para /settings → Empresas
- [ ] **Verificar:** SearchBar está visível
- [ ] Buscar por qualquer company
- [ ] **Verificar:** Pode ver todas as companies do sistema

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

### 12.2 Regular User - Acesso Limitado
- [ ] Logout
- [ ] Login como usuário regular (não super)
- [ ] Tentar acessar /settings → Empresas
- [ ] **Cenário A:** Não tem acesso à aba
  - [ ] **Verificar:** Aba "Empresas" não aparece ou redireciona
- [ ] **Cenário B:** Tem acesso mas vê apenas sua company
  - [ ] **Verificar:** Vê apenas sua própria company
  - [ ] **Verificar:** SearchBar pode ou não estar visível
  - [ ] **Verificar:** Não pode editar outras companies

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

---

## 13. Regressão - Funcionalidades Antigas

### 13.1 Criar Company (Sem Busca)
- [ ] Limpar campo de busca (garantir que está vazio)
- [ ] Preencher formulário de criação:
  - Nome: "Test Regression Company"
  - Email: "regression@test.com"
  - Senha: "123456"
  - Plano: Selecionar qualquer
- [ ] Clicar em Salvar
- [ ] **Verificar:** Company é criada com sucesso
- [ ] **Verificar:** Aparece na tabela
- [ ] **Verificar:** Toast de sucesso aparece

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

### 13.2 Editar Company (Sem Busca)
- [ ] Limpar campo de busca
- [ ] Clicar em Editar em qualquer company
- [ ] Alterar o nome
- [ ] Clicar em Salvar
- [ ] **Verificar:** Alteração é salva
- [ ] **Verificar:** Nome atualizado aparece na tabela

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

### 13.3 Deletar Company (Sem Busca)
- [ ] Limpar campo de busca
- [ ] Clicar em Deletar em uma company de teste
- [ ] Confirmar exclusão
- [ ] **Verificar:** Modal de confirmação aparece
- [ ] **Verificar:** Company é deletada
- [ ] **Verificar:** Não aparece mais na tabela

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

### 13.4 Todas as Colunas da Tabela
- [ ] Limpar campo de busca
- [ ] **Verificar:** Todas colunas estão visíveis:
  - [ ] # (ID)
  - [ ] Nome
  - [ ] Email
  - [ ] Telefone
  - [ ] Plano
  - [ ] Valor
  - [ ] Ativo (Sim/Não)
  - [ ] Criado em
  - [ ] Vencimento
  - [ ] Último Login
- [ ] **Verificar:** Dados são exibidos corretamente

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

---

## 14. Edge Cases e Testes Negativos

### 14.1 Caracteres Especiais
- [ ] Digitar caracteres especiais: `!@#$%^&*()_+-=[]{}|;':",.<>?/`
- [ ] **Verificar:** Não há crash
- [ ] **Verificar:** Busca funciona ou retorna vazio

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

### 14.2 Emojis
- [ ] Digitar emojis: 😀🎉🚀
- [ ] **Verificar:** Não há crash
- [ ] **Verificar:** Busca retorna corretamente

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

### 14.3 SQL Injection (Segurança)
- [ ] Digitar: `' OR '1'='1`
- [ ] **Verificar:** Não há crash
- [ ] **Verificar:** Não retorna dados inesperados
- [ ] **Verificar:** Backend trata corretamente (escapamento)

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

### 14.4 XSS (Segurança)
- [ ] Digitar: `<script>alert('XSS')</script>`
- [ ] **Verificar:** Não executa script
- [ ] **Verificar:** Texto é tratado como string literal

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

### 14.5 Texto Muito Longo
- [ ] Digitar texto com 500+ caracteres
- [ ] **Verificar:** Campo aceita ou limita corretamente
- [ ] **Verificar:** Não há overflow no layout

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

---

## 15. Cross-Browser Testing

### 15.1 Google Chrome
- [ ] Executar todos os testes acima no Chrome
- [ ] **Verificar:** Tudo funciona corretamente

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas
**Observações:** _______________

### 15.2 Mozilla Firefox
- [ ] Executar testes no Firefox
- [ ] **Verificar:** Layout consistente
- [ ] **Verificar:** Funcionalidade idêntica

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas / ⏭️ Pulado
**Observações:** _______________

### 15.3 Safari (Mac)
- [ ] Executar testes no Safari
- [ ] **Verificar:** Funciona corretamente

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas / ⏭️ Pulado
**Observações:** _______________

### 15.4 Microsoft Edge
- [ ] Executar testes no Edge
- [ ] **Verificar:** Funciona corretamente

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas / ⏭️ Pulado
**Observações:** _______________

---

## 16. Responsividade (Opcional)

### 16.1 Mobile (320px)
- [ ] Redimensionar janela para 320px de largura
- [ ] **Verificar:** SearchBar é responsivo
- [ ] **Verificar:** Tabela é scrollável horizontalmente ou adapta

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas / ⏭️ Pulado
**Observações:** _______________

### 16.2 Tablet (768px)
- [ ] Redimensionar para 768px
- [ ] **Verificar:** Layout adequado

**Status:** ✅ Passou / ❌ Falhou / ⚠️ Com Ressalvas / ⏭️ Pulado
**Observações:** _______________

---

## Resumo do Teste

**Total de Testes Executados:** _____
**Testes Passaram:** _____
**Testes Falharam:** _____
**Testes Pulados:** _____
**Taxa de Sucesso:** _____%

### Bugs Críticos Encontrados:
1. _______________
2. _______________
3. _______________

### Bugs Menores Encontrados:
1. _______________
2. _______________

### Melhorias Sugeridas:
1. _______________
2. _______________

### Conclusão:
[ ] APROVADO PARA PRODUÇÃO
[ ] APROVADO COM RESSALVAS
[ ] REPROVADO - REQUER CORREÇÕES

**Assinatura do Testador:** _______________
**Data:** _______________
