# Kanban V2 - Guia do Usuário

## Visão Geral

Bem-vindo ao Kanban V2! Esta nova versão traz melhorias significativas na experiência de uso, incluindo etiquetas coloridas, drag-and-drop aprimorado e sincronização em tempo real.

**Principais Novidades:**
- Sistema de etiquetas (tags) com cores personalizáveis
- Drag-and-drop mais fluido e responsivo
- Sincronização automática entre usuários
- Interface modernizada
- Performance otimizada

---

## Como Habilitar o Kanban V2

### Para Administradores

O Kanban V2 é habilitado automaticamente durante o rollout gradual. Se você deseja solicitar acesso antecipado:

1. Entre em contato com o suporte: support@chatia.com
2. Informe o ID da sua empresa
3. Solicite participação no programa beta

### Verificar se Está Habilitado

1. Acesse qualquer ticket
2. Procure pelo botão "Etiquetas" no canto superior direito
3. Se o botão estiver visível, o Kanban V2 está ativo

---

## Sistema de Etiquetas

### O Que São Etiquetas?

Etiquetas (tags) são marcadores visuais coloridos que você pode adicionar aos tickets para organizá-los e categorizá-los rapidamente.

**Casos de Uso:**
- Prioridade: Urgente, Alta, Média, Baixa
- Tipo: Bug, Feature, Suporte, Melhoria
- Departamento: Vendas, Suporte, TI, RH
- Status: Aguardando Cliente, Em Análise, Aprovado
- Projeto: Projeto A, Projeto B, etc.

---

### Criar Nova Etiqueta

#### Método 1: Durante Edição do Ticket

1. Abra um ticket
2. Clique em "Editar Ticket"
3. Na seção de etiquetas, clique em "+ Nova Etiqueta"
4. Preencha:
   - **Nome:** Nome descritivo (ex: "Urgente", "Bug", "Cliente VIP")
   - **Cor:** Escolha uma cor para identificação visual
5. Clique em "Salvar"

#### Método 2: Gerenciamento Global

1. Acesse "Configurações" no menu principal
2. Clique em "Etiquetas"
3. Clique em "+ Criar Etiqueta"
4. Preencha nome e cor
5. Clique em "Salvar"

**Dicas:**
- Use cores consistentes (ex: vermelho para urgente, azul para informação)
- Nomes curtos são mais legíveis no Kanban
- Crie etiquetas reutilizáveis para toda a equipe

---

### Adicionar Etiquetas a um Ticket

#### No Kanban Board

1. Passe o mouse sobre o ticket
2. Clique no ícone de etiqueta (tag)
3. Selecione as etiquetas desejadas
4. As etiquetas aparecem instantaneamente no ticket

#### Na Visualização do Ticket

1. Abra o ticket
2. Clique em "Editar Ticket"
3. Na seção "Etiquetas", marque as que deseja
4. Clique em "Salvar"

**Observações:**
- Você pode adicionar múltiplas etiquetas a um ticket
- As alterações são sincronizadas em tempo real para todos os usuários
- Etiquetas são visíveis no Kanban board e na lista de tickets

---

### Editar Etiquetas

1. Acesse "Configurações" > "Etiquetas"
2. Encontre a etiqueta que deseja editar
3. Clique no ícone de edição (lápis)
4. Modifique nome e/ou cor
5. Clique em "Salvar"

**Importante:** Ao editar uma etiqueta, todos os tickets que a utilizam serão atualizados automaticamente.

---

### Excluir Etiquetas

1. Acesse "Configurações" > "Etiquetas"
2. Encontre a etiqueta que deseja excluir
3. Clique no ícone de lixeira
4. Confirme a exclusão

**Atenção:** Ao excluir uma etiqueta, ela será removida de todos os tickets. Esta ação não pode ser desfeita.

---

### Filtrar por Etiquetas

#### No Kanban Board

1. Clique em "Filtros" no topo do board
2. Selecione "Etiquetas"
3. Marque as etiquetas que deseja visualizar
4. O board mostrará apenas tickets com essas etiquetas

#### Na Lista de Tickets

1. Use o campo de busca
2. Digite o nome da etiqueta
3. Ou use o filtro avançado e selecione etiquetas

**Dica:** Você pode combinar múltiplas etiquetas no filtro para encontrar tickets específicos.

---

## Drag and Drop

### Como Mover Tickets

#### Mudança de Lane (Coluna)

1. Clique e segure no ticket
2. Arraste para a lane desejada (Todo, Doing, Done, etc.)
3. Solte o ticket
4. O ticket será movido instantaneamente

**Visual Feedback:**
- O ticket fica semi-transparente durante o arraste
- A lane de destino fica destacada
- Outros usuários veem a movimentação em tempo real

#### Reordenar Tickets na Mesma Lane

1. Clique e segure no ticket
2. Arraste para cima ou para baixo
3. Solte na posição desejada
4. A nova ordem é salva automaticamente

---

### Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Ctrl/Cmd + →` | Move ticket para próxima lane |
| `Ctrl/Cmd + ←` | Move ticket para lane anterior |
| `Ctrl/Cmd + ↑` | Move ticket uma posição acima |
| `Ctrl/Cmd + ↓` | Move ticket uma posição abaixo |
| `Esc` | Cancela operação de drag |

---

### Funcionalidades Avançadas

#### Multi-seleção

1. Segure `Ctrl/Cmd`
2. Clique em múltiplos tickets
3. Arraste todos juntos
4. Todos os tickets selecionados serão movidos

#### Copiar ao Arrastar

1. Segure `Alt/Option` durante o arraste
2. Isso cria uma cópia do ticket na nova posição
3. Útil para duplicar tarefas

---

## Sincronização em Tempo Real

### Como Funciona

O Kanban V2 usa Socket.IO para sincronização em tempo real:

- **Atualizações Instantâneas:** Veja mudanças de outros usuários em tempo real
- **Cursores de Usuários:** Veja quem está editando qual ticket
- **Notificações:** Receba alertas de conflitos ou mudanças importantes
- **Offline Support:** Continue trabalhando offline, sincroniza ao reconectar

### Indicadores Visuais

- **Ponto Verde:** Você está conectado e sincronizando
- **Ponto Amarelo:** Conectando ou sincronizando
- **Ponto Vermelho:** Offline ou erro de conexão
- **Avatar no Ticket:** Outro usuário está editando este ticket

---

## Permissões

### O Que Cada Perfil Pode Fazer

| Ação | Admin | Manager | Agent | Customer |
|------|-------|---------|-------|----------|
| Criar etiquetas | ✅ | ✅ | ❌ | ❌ |
| Editar etiquetas | ✅ | ✅ | ❌ | ❌ |
| Excluir etiquetas | ✅ | ❌ | ❌ | ❌ |
| Adicionar etiquetas a tickets | ✅ | ✅ | ✅ | ❌ |
| Mover tickets (DnD) | ✅ | ✅ | ✅ | ❌ |
| Visualizar Kanban | ✅ | ✅ | ✅ | ✅* |

*Clientes veem apenas seus próprios tickets

---

## Boas Práticas

### Organização de Etiquetas

1. **Crie uma Convenção:**
   - Use prefixos: `P1:`, `P2:` para prioridades
   - Use emojis (opcional): `🔥 Urgente`, `🐛 Bug`

2. **Limite o Número:**
   - Idealmente, 10-15 etiquetas principais
   - Muitas etiquetas confundem ao invés de ajudar

3. **Cores Consistentes:**
   - Vermelho: Urgente/Crítico
   - Laranja: Importante
   - Amarelo: Atenção
   - Verde: OK/Aprovado
   - Azul: Informação
   - Roxo: Especial

4. **Revise Periodicamente:**
   - Exclua etiquetas não utilizadas
   - Consolide etiquetas similares

---

### Uso do Kanban Board

1. **Mantenha WIP Baixo:**
   - Work In Progress: não tenha muitos tickets em "Doing"
   - Recomendado: 3-5 tickets por pessoa

2. **Atualize Regularmente:**
   - Mova tickets conforme progride
   - Não deixe tickets "esquecidos" em lanes

3. **Use Filtros:**
   - Filtre por etiqueta para focar em um tipo de trabalho
   - Filtre por usuário para ver apenas suas tarefas

4. **Sincronize com a Equipe:**
   - Faça daily standups usando o Kanban como referência
   - Comunique mudanças importantes

---

## Troubleshooting Básico

### Problema: Não Consigo Ver as Etiquetas

**Possíveis Causas:**
1. Kanban V2 não está habilitado para sua empresa
2. Você não tem permissão para ver etiquetas
3. Problema de cache do navegador

**Solução:**
```
1. Verifique se vê o botão "Etiquetas" ao editar um ticket
2. Se não vê, entre em contato com o administrador
3. Limpe o cache do navegador: Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)
4. Faça logout e login novamente
```

---

### Problema: Drag and Drop Não Funciona

**Possíveis Causas:**
1. Você não tem permissão para mover tickets
2. Problema de conexão Socket.IO
3. Navegador não suportado

**Solução:**
```
1. Verifique o indicador de conexão (ponto verde/vermelho no canto)
2. Recarregue a página (F5)
3. Verifique sua conexão de internet
4. Use navegador atualizado (Chrome, Firefox, Safari, Edge)
5. Desabilite extensões que possam interferir
```

---

### Problema: Mudanças Não Aparecem para Outros Usuários

**Possíveis Causas:**
1. Problema de sincronização Socket.IO
2. Outro usuário não está conectado
3. Problema temporário de rede

**Solução:**
```
1. Verifique o indicador de conexão (ponto verde)
2. Peça para o outro usuário recarregar a página
3. Aguarde alguns segundos para sincronização
4. Se persistir, recarregue a página
```

---

### Problema: Sistema Está Lento

**Possíveis Causas:**
1. Muitos tickets carregados no board
2. Conexão de internet lenta
3. Computador com recursos limitados

**Solução:**
```
1. Use filtros para reduzir o número de tickets visíveis
2. Feche outras abas do navegador
3. Verifique sua conexão de internet
4. Considere usar visualização de lista ao invés de Kanban para grandes volumes
```

---

### Problema: Ticket "Pula" para Posição Errada

**Possíveis Causas:**
1. Conflito de sincronização com outro usuário
2. Tentou mover muito rápido
3. Problema temporário de conexão

**Solução:**
```
1. Aguarde 2-3 segundos após mover um ticket
2. Recarregue a página para ver a ordem correta
3. Se o problema persistir, use os botões ao invés de drag-and-drop
```

---

### Problema: Etiqueta Não Salva

**Possíveis Causas:**
1. Nome duplicado
2. Caracteres inválidos no nome
3. Limite de etiquetas atingido

**Solução:**
```
1. Use nome único para a etiqueta
2. Evite caracteres especiais (<, >, &, etc.)
3. Verifique se não excedeu o limite (contate administrador)
4. Tente novamente após alguns segundos
```

---

## Suporte

### Precisa de Ajuda?

**Canais de Suporte:**

1. **Chat In-App:**
   - Clique no ícone de ajuda no canto inferior direito
   - Chat ao vivo durante horário comercial

2. **Email:**
   - support@chatia.com
   - Resposta em até 24 horas

3. **Base de Conhecimento:**
   - https://help.chatia.com
   - Artigos e vídeos tutoriais

4. **Comunidade:**
   - https://community.chatia.com
   - Fórum de usuários

---

### Reportar Bug

Se encontrou um problema:

1. Tire um screenshot da tela
2. Anote os passos para reproduzir
3. Envie para: bugs@chatia.com
4. Inclua:
   - Navegador e versão
   - Sistema operacional
   - ID da empresa (se souber)
   - Descrição detalhada

---

### Sugerir Melhorias

Adoramos feedback!

1. Acesse: https://feedback.chatia.com
2. Descreva sua sugestão
3. Vote em sugestões de outros usuários
4. Acompanhe o status das implementações

---

## Vídeos Tutoriais

### Tutoriais Disponíveis

1. **Introdução ao Kanban V2** (3min)
   - Overview das novas funcionalidades
   - https://youtube.com/chatia/kanban-v2-intro

2. **Como Criar e Usar Etiquetas** (5min)
   - Passo a passo completo
   - https://youtube.com/chatia/kanban-tags

3. **Dominando o Drag and Drop** (4min)
   - Técnicas avançadas
   - https://youtube.com/chatia/kanban-dnd

4. **Colaboração em Tempo Real** (6min)
   - Trabalhando em equipe
   - https://youtube.com/chatia/kanban-realtime

---

## Atalhos Rápidos

### Resumo de Atalhos

| Ação | Atalho |
|------|--------|
| Criar novo ticket | `Ctrl/Cmd + N` |
| Buscar ticket | `Ctrl/Cmd + K` |
| Abrir filtros | `Ctrl/Cmd + F` |
| Mover ticket → | `Ctrl/Cmd + →` |
| Mover ticket ← | `Ctrl/Cmd + ←` |
| Mover ticket ↑ | `Ctrl/Cmd + ↑` |
| Mover ticket ↓ | `Ctrl/Cmd + ↓` |
| Selecionar múltiplos | `Ctrl/Cmd + Click` |
| Copiar ticket | `Alt + Arrastar` |
| Cancelar ação | `Esc` |
| Recarregar board | `Ctrl/Cmd + R` |

---

## FAQ

### 1. O Kanban V2 substitui completamente a versão anterior?

Sim, após o rollout completo, o Kanban V1 será descontinuado. Durante a transição, você pode ver ambas as versões dependendo da configuração da sua empresa.

### 2. Minhas etiquetas são compartilhadas com toda a empresa?

Sim, etiquetas criadas por admins e managers ficam disponíveis para toda a empresa. Isso garante consistência na organização.

### 3. Posso criar etiquetas privadas?

No momento, não. Todas as etiquetas são compartilhadas no nível da empresa. Esta funcionalidade pode ser adicionada no futuro.

### 4. Quantos tickets posso ter no Kanban?

Não há limite técnico, mas recomendamos manter até 100-150 tickets visíveis no board para melhor performance. Use filtros para trabalhar com subconjuntos.

### 5. O Kanban funciona offline?

Parcialmente. Você pode visualizar tickets carregados, mas não pode fazer mudanças offline. As mudanças são sincronizadas quando reconectar.

### 6. Posso customizar as lanes (colunas)?

Sim! Acesse Configurações > Kanban > Lanes para adicionar, editar ou remover lanes personalizadas.

### 7. Como desabilitar notificações de sincronização?

Acesse Configurações > Notificações > Kanban e ajuste suas preferências.

### 8. O Kanban V2 funciona em mobile?

Sim! O Kanban V2 é totalmente responsivo. Em dispositivos móveis, use toques longos para arrastar tickets.

### 9. Posso exportar dados do Kanban?

Sim, acesse Relatórios > Exportar > Kanban Board para baixar um snapshot em CSV ou PDF.

### 10. Há limite de etiquetas por ticket?

Não há limite técnico, mas recomendamos 3-5 etiquetas por ticket para manter a clareza visual.

---

## Glossário

- **Lane:** Coluna no Kanban board (ex: Todo, Doing, Done)
- **Ticket:** Item/card no Kanban
- **Tag/Etiqueta:** Marcador colorido para categorizar tickets
- **DnD:** Drag and Drop (arrastar e soltar)
- **WIP:** Work In Progress (trabalho em andamento)
- **Socket.IO:** Tecnologia de sincronização em tempo real
- **Kanban Board:** Quadro visual com lanes e tickets

---

## Changelog

### Versão 2.0.0 (2025-10-13)

**Novidades:**
- Sistema de etiquetas com cores personalizáveis
- Drag-and-drop aprimorado
- Sincronização em tempo real via Socket.IO
- Multi-seleção de tickets
- Filtros avançados por etiqueta
- Interface modernizada
- Performance 3x mais rápida

**Melhorias:**
- Tempo de carregamento reduzido em 60%
- Menos uso de memória
- Melhor suporte mobile
- Animações mais fluidas

**Correções:**
- Tickets não sincronizavam em alguns casos
- Drag-and-drop falhava com muitos tickets
- Filtros não persistiam após reload
- Problemas de performance com 500+ tickets

---

**Versão do Documento:** 1.0
**Última Atualização:** 2025-10-13
**Autor:** Equipe ChatIA
**Feedback:** feedback@chatia.com
