# Testes Manuais - Correção "Números Fantasma"

Documento de testes manuais para validar a correção do bug H3 (números fantasma) e novas funcionalidades de filtros de contatos.

## Pré-requisitos

- Backend rodando com migrations executadas
- Conta de teste com contatos de diferentes origens
- Navegador com console aberto (F12) para verificar logs

## Teste 1: Filtro "Somente Minha Agenda" (Default)

### Objetivo
Verificar que o filtro "Somente minha agenda" funciona corretamente e persiste após refresh

### Passos:
1. Abra a página `/contacts`
2. Verifique que o radio button "Somente minha agenda" está selecionado por default
3. Conte quantos contatos aparecem na lista (ex: 50)
4. Alterne para "Todos os contatos"
5. Conte novamente (deve ser >= 50, pois inclui contatos fora da agenda)
6. Alterne de volta para "Somente minha agenda"
7. Verifique que a lista retornou ao tamanho original
8. Faça refresh da página (F5)
9. Verifique que "Somente minha agenda" ainda está selecionado

### Resultado Esperado:
- Lista atualiza instantaneamente ao alternar filtros
- Preferência persiste após refresh do navegador
- Contador de contatos reflete o filtro ativo

---

## Teste 2: Socket.io NÃO Adiciona Contatos Fora do Filtro

### Objetivo
Validar que o reducer não adiciona contatos novos via Socket.io quando há filtros ativos

### Passos:
1. Abra a página `/contacts` com filtro "Somente minha agenda"
2. Abra o console do navegador (F12)
3. Conte contatos na lista inicial (ex: 50)
4. Em outra aba ou via Postman/Insomnia, crie um contato com `isInAgenda=false`:
   ```json
   POST /contacts
   {
     "name": "Teste Fantasma",
     "number": "+5511999999999",
     "source": "auto_created",
     "isInAgenda": false
   }
   ```
5. Aguarde 2 segundos
6. Verifique o console do navegador - deve aparecer o log:
   ```
   [Contacts Reducer] Socket.io event: New contact created, but NOT added to filtered list.
   Contact ID: [ID]
   Contact Name: Teste Fantasma
   Reason: Active filters may exclude this contact.
   ```
7. Conte contatos na lista (deve continuar 50, sem alteração)
8. Faça refresh da página (F5)
9. Conte contatos novamente (deve continuar 50, pois o novo contato tem `isInAgenda=false`)
10. Alterne para "Todos os contatos"
11. Verifique que "Teste Fantasma" agora aparece na lista

### Resultado Esperado:
- Contato NÃO aparece na lista filtrada automaticamente
- Log de debug aparece no console explicando o motivo
- Contato só aparece após alterar filtro ou fazer refresh E o filtro permitir

---

## Teste 3: Dropdown "Origem" Filtra Corretamente

### Objetivo
Verificar que o filtro por origem funciona e só aparece quando "Todos os contatos" está selecionado

### Passos:
1. Abra `/contacts`
2. Verifique que o dropdown "Origem" **NÃO** aparece (filtro está em "Somente minha agenda")
3. Alterne para "Todos os contatos"
4. Dropdown "Origem" deve aparecer com valor default "Todos"
5. Selecione "Manual" no dropdown
6. Lista deve exibir apenas contatos com badge 🔧
7. Selecione "WhatsApp (agenda)"
8. Lista deve exibir apenas contatos com badge 📱
9. Selecione "Excel/CSV"
10. Lista deve exibir apenas contatos com badge 📊
11. Selecione "Auto-criados"
12. Lista deve exibir apenas contatos com badge 🤖
13. Selecione "Chats"
14. Lista deve exibir apenas contatos com badge 💬
15. Volte para "Todos"
16. Lista deve exibir contatos de todas as origens

### Resultado Esperado:
- Dropdown só aparece quando "Todos os contatos" selecionado
- Lista filtra corretamente por origem
- Badges correspondem à origem filtrada
- Transição entre filtros é instantânea

---

## Teste 4: Badges de Origem Aparecem na Tabela

### Objetivo
Validar que badges de origem aparecem corretamente com tooltips informativos

### Passos:
1. Abra `/contacts`
2. Alterne para "Todos os contatos"
3. Verifique que a coluna "Origem" existe no TableHead
4. Verifique que cada contato tem um emoji na coluna "Origem":
   - 🔧 = Manual
   - 📱 = WhatsApp (agenda)
   - 📊 = Excel/CSV
   - 🤖 = Auto-criados
   - 💬 = Chats
5. Passe o mouse sobre o emoji de um contato manual (🔧)
6. Tooltip deve exibir "Criado manualmente"
7. Passe o mouse sobre outros emojis e verifique tooltips correspondentes

### Resultado Esperado:
- Coluna "Origem" presente e alinhada ao centro
- Emojis corretos para cada tipo de origem
- Tooltips aparecem ao hover com descrição completa
- Cursor muda para "help" (?) ao passar sobre o emoji

---

## Teste 5: Validação E.164 em Criação Manual de Contato

### Objetivo
Verificar que validação de número de telefone funciona no formato E.164

### Passos:
1. Abra `/contacts`
2. Clique em "Adicionar Contato"
3. Preencha nome: "Teste Validação"
4. Preencha número: "123" (inválido)
5. Tente salvar
6. Erro deve aparecer: "Número muito curto (mínimo 10 dígitos)"
7. Corrija para: "12345678901234567" (16 dígitos - inválido)
8. Tente salvar
9. Erro deve aparecer: "Número muito longo (máximo 15 dígitos)"
10. Corrija para: "5511999999999" (válido)
11. Salve
12. Contato deve ser criado com sucesso
13. Verifique que o contato tem badge 🔧 (manual)

### Resultado Esperado:
- Validação rejeita números < 10 dígitos
- Validação rejeita números > 15 dígitos
- Validação aceita números válidos (10-15 dígitos)
- Campo source='manual' é enviado automaticamente
- Contato criado aparece com badge correto

---

## Teste 6: Persistência de Filtros no LocalStorage

### Objetivo
Verificar que preferências de filtros são salvas corretamente

### Passos:
1. Abra `/contacts`
2. Alterne para "Todos os contatos"
3. Selecione "Manual" no dropdown de origem
4. Abra DevTools (F12) → Application → Local Storage → localhost
5. Verifique que existem 2 keys:
   - `contacts_show_only_agenda`: "false"
   - `contacts_source_filter`: "manual"
6. Feche a aba do navegador
7. Abra novamente `/contacts`
8. Verifique que "Todos os contatos" está selecionado
9. Verifique que dropdown "Origem" mostra "Manual"

### Resultado Esperado:
- Filtros são salvos no localStorage
- Filtros são restaurados ao reabrir a página
- Não há reset indesejado dos filtros

---

## Teste 7: Filtragem Combina com Busca e Tags

### Objetivo
Garantir que filtros de agenda/origem funcionam em conjunto com busca e tags

### Passos:
1. Abra `/contacts`
2. Selecione "Todos os contatos"
3. Selecione "Manual" no dropdown de origem
4. Digite "João" no campo de busca
5. Verifique que lista exibe apenas contatos manuais (🔧) com "João" no nome
6. Adicione filtro de Tag (se disponível)
7. Verifique que lista combina TODOS os filtros

### Resultado Esperado:
- Filtros funcionam em conjunto (AND logic)
- Lista atualiza corretamente com múltiplos filtros ativos
- Contagem de contatos reflete filtros combinados

---

## Teste 8: Comportamento em Lista Vazia

### Objetivo
Verificar comportamento quando nenhum contato passa pelos filtros

### Passos:
1. Abra `/contacts`
2. Selecione "Todos os contatos"
3. Selecione uma origem que não tem contatos (ex: "Chats" se não houver importação de chats)
4. Verifique o estado da lista

### Resultado Esperado:
- Lista exibe estado vazio apropriado
- Não há erro no console
- Mensagem clara indicando "Nenhum contato encontrado"

---

## Teste 9: Loading States Durante Mudanças de Filtro

### Objetivo
Verificar que loading states aparecem corretamente

### Passos:
1. Abra `/contacts`
2. Alterne para "Todos os contatos"
3. Observe se skeleton loader aparece durante fetch
4. Alterne rapidamente entre várias origens
5. Verifique que UI responde adequadamente

### Resultado Esperado:
- Skeleton loader aparece durante fetch
- Não há flickering excessivo
- UI permanece responsiva

---

## Teste 10: Acessibilidade (Keyboard Navigation)

### Objetivo
Verificar que todos os filtros são acessíveis via teclado

### Passos:
1. Abra `/contacts`
2. Pressione Tab até chegar ao radio group "Exibir"
3. Use setas ← → para alternar entre "Somente minha agenda" e "Todos"
4. Pressione Tab para ir ao dropdown "Origem"
5. Use setas ↑ ↓ para navegar pelas opções
6. Pressione Enter para selecionar

### Resultado Esperado:
- Todos os elementos são alcançáveis via Tab
- Radio buttons funcionam com setas
- Dropdown funciona com teclado
- Focus indicators visíveis

---

## Checklist de Validação Final

Após executar todos os testes, marque os itens abaixo:

### Funcionalidades Core:
- [ ] Filtro "Somente minha agenda" funciona e persiste
- [ ] Filtro "Todos os contatos" exibe contatos fora da agenda
- [ ] Dropdown "Origem" só aparece quando "Todos" selecionado
- [ ] Socket.io NÃO adiciona contatos fora do filtro
- [ ] Log de debug aparece no console quando contato é ignorado

### UI/UX:
- [ ] Radio group renderiza corretamente
- [ ] Dropdown de origem funciona
- [ ] Badges de origem aparecem com tooltips
- [ ] Loading states aparecem durante fetch
- [ ] Estados vazios tratados adequadamente

### Validação e Persistência:
- [ ] Validação E.164 funciona no ContactModal
- [ ] Campo source='manual' é enviado ao criar contato
- [ ] Filtros persistem no localStorage
- [ ] Filtros são restaurados ao reabrir página

### Acessibilidade:
- [ ] Navegação por teclado funciona
- [ ] ARIA labels presentes
- [ ] Tooltips informativos
- [ ] Focus indicators visíveis

### Integração:
- [ ] Filtros combinam com busca
- [ ] Filtros combinam com tags
- [ ] Paginação funciona com filtros
- [ ] Scroll infinito funciona

---

## Problemas Conhecidos / Limitações

**Limitação 1: Contatos Novos Via Socket.io**
- Contatos criados via Socket.io não aparecem automaticamente se houver filtros ativos
- **Solução manual:** Usuário pode fazer refresh (F5) ou alterar filtros para ver novos contatos
- **Motivo:** Evitar "números fantasma" ao adicionar contatos que não passam pelos filtros

**Limitação 2: COMMIT 5 Não Implementado**
- Modal de importação do WhatsApp (ContactImportWpModal) não foi atualizado com checkboxes de filtros
- **Motivo:** Estrutura atual do modal difere da especificação do plano (é um modal de Excel, não WhatsApp Roster)
- **Próximo passo:** Implementar modal correto de importação Baileys/WhatsApp Roster

---

## Reportar Problemas

Se encontrar bugs durante os testes:

1. Anote o teste que falhou
2. Capture screenshot ou vídeo
3. Copie mensagens de erro do console
4. Documente passos exatos para reproduzir
5. Abra issue no repositório ou notifique equipe de desenvolvimento

---

## Conclusão

Estes testes manuais cobrem as principais funcionalidades implementadas para corrigir o bug H3 (números fantasma). Execute TODOS os testes antes de considerar a feature pronta para produção.

**Tempo estimado de execução:** ~30-40 minutos
**Responsável:** QA Team ou desenvolvedor que implementou
**Data de execução:** ___________
**Status:** ☐ Aprovado  ☐ Reprovado  ☐ Pendente
