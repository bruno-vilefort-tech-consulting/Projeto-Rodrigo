# PhoneNumberDisplay Component

Componente React para exibir números de telefone formatados com a bandeira do país correspondente.

## ✨ Características

- 🌍 Exibe a bandeira do país automaticamente baseado no código do número
- 📱 Formata o número de acordo com a máscara internacional do país
- ⚠️ **NOVO:** Detecta e exibe números inválidos com indicador visual
- 🔍 **NOVO:** Valida comprimento e formato do número
- 💡 **NOVO:** Tooltip explicativo para números inválidos
- 🔄 Fallback inteligente para números que não podem ser parseados
- ✅ Suporta todos os países com códigos DDI válidos

## 🎯 Uso

```jsx
import PhoneNumberDisplay from "../../components/PhoneNumberDisplay";

// No seu componente
<PhoneNumberDisplay phoneNumber={contact.number} />
```

## 📊 Exemplos de números suportados

### ✅ Números Válidos (com bandeira do país)

| País | Número de entrada | Exibição formatada |
|------|------------------|-------------------|
| 🇧🇷 Brasil | 5511999999999 | 🇧🇷 +55 11 99999-9999 |
| 🇺🇸 EUA | 12025551234 | 🇺🇸 +1 202 555 1234 |
| 🇵🇹 Portugal | 351912345678 | 🇵🇹 +351 912 345 678 |
| 🇪🇸 Espanha | 34612345678 | 🇪🇸 +34 612 34 56 78 |
| 🇩🇪 Alemanha | 491234567890 | 🇩🇪 +49 123 4567890 |
| 🇫🇷 França | 33612345678 | 🇫🇷 +33 6 12 34 56 78 |
| 🇮🇹 Itália | 393331234567 | 🇮🇹 +39 333 123 4567 |
| 🇬🇧 Reino Unido | 447700900123 | 🇬🇧 +44 7700 900123 |
| 🇦🇷 Argentina | 5491112345678 | 🇦🇷 +54 9 11 1234-5678 |
| 🇲🇽 México | 525512345678 | 🇲🇽 +52 55 1234 5678 |

### ⚠️ Números Inválidos (com indicador de aviso)

| Número de entrada | Exibição | Motivo |
|------------------|----------|--------|
| 199544365162594 | ⚠️ +1 9954 4365 1625 94 | Muito longo (15 dígitos) |
| 192736690987087 | ⚠️ +1 9273 6690 9870 87 | Muito longo (15 dígitos) |
| 17484962885664 | ⚠️ +1 7484 9628 8566 4 | Muito longo (14 dígitos) |
| 120363209384863694 | ⚠️ 1203 6320 9384 8636 94 | Muito longo (18 dígitos) |
| 1234 | ⚠️ 1234 | Muito curto (4 dígitos) |
| +10204926238916 | ⚠️ +1 0204 9262 3891 6 | Começa com 0 após código |

**Indicador Visual:**
- Ícone de aviso (⚠️) na cor laranja
- Número em cor laranja (opacidade 0.7)
- Tooltip ao passar o mouse explicando o problema
- Texto: "Este é um 'contato fantasma' que deve ser removido"

## 🛡️ Validação de Números

O componente valida automaticamente:

1. **Comprimento mínimo:** 8 dígitos
2. **Comprimento máximo:** 15 dígitos (padrão E.164)
3. **Formato inválido:** Números que começam com 0 após o código do país
4. **Parsing inválido:** Números que não podem ser interpretados pela libphonenumber-js

### Regras de Validação:

```javascript
// Válido: 8 a 15 dígitos
✅ 5511999999999 (13 dígitos)
✅ 12025551234 (11 dígitos)

// Inválido: Menos de 8 dígitos
❌ 1234567 (7 dígitos)

// Inválido: Mais de 15 dígitos
❌ 199544365162594 (15 dígitos)

// Inválido: Começa com 0 após código
❌ +10204926238916 (0 após +1)
```

## 📦 Props

| Prop | Tipo | Obrigatório | Descrição |
|------|------|------------|-----------|
| phoneNumber | string | Sim | Número de telefone no formato internacional (com ou sem +) |
| style | object | Não | Estilos customizados opcionais para o container |

## 🔧 Dependências

- `react-country-flag`: Para exibir as bandeiras dos países
- `libphonenumber-js`: Para parsing e formatação de números telefônicos
- `@material-ui/core/Tooltip`: Para tooltip explicativo
- `@material-ui/icons/Warning`: Para ícone de aviso

## 🎨 Personalização

### Estilos customizados:

```jsx
<PhoneNumberDisplay
    phoneNumber={contact.number}
    style={{
        fontSize: '14px',
        fontWeight: 'bold',
        padding: '4px'
    }}
/>
```

## 🧪 Testes

### Testar número válido:
```jsx
<PhoneNumberDisplay phoneNumber="5511999999999" />
// Resultado: 🇧🇷 +55 11 99999-9999
```

### Testar número inválido:
```jsx
<PhoneNumberDisplay phoneNumber="199544365162594" />
// Resultado: ⚠️ +1 9954 4365 1625 94
// Tooltip: "Número muito longo (15 dígitos, máximo 15)"
```

## 📝 Notas Técnicas

- O componente adiciona automaticamente o prefixo "+" se o número não tiver
- Utiliza `parsePhoneNumber` da biblioteca libphonenumber-js para parsing
- Validação pré-parsing para detectar números claramente inválidos
- Formatação inteligente em grupos de 4 dígitos para números inválidos
- A bandeira é exibida como SVG para melhor qualidade e performance
- Números inválidos são exibidos com 70% de opacidade para indicar problema
- Tooltip com explicação detalhada do problema ao passar o mouse

## ⚠️ Contatos Fantasmas

Números inválidos geralmente são **"contatos fantasmas"** criados automaticamente pelo sistema:

1. **Origem:** Mensagens de números não salvos na agenda
2. **Problema:** Aparecem na lista de contatos sem serem reais
3. **Solução:** Executar script SQL de limpeza:

```bash
cd backend
psql -U chatia -d chatia -f scripts/cleanup-ghost-contacts.sql
```

Ver documentação completa em:
- `backend/scripts/README-CLEANUP.md`
- `docs/BACKEND_FIXES_CONTACTS_GHOST.md`

## 🐛 Troubleshooting

### Números não aparecem formatados:
- Verificar se o número tem formato válido (8-15 dígitos)
- Ver console do navegador para erros de parsing
- Verificar se libphonenumber-js está instalada

### Todos os números aparecem com aviso:
- Verificar formato dos números no banco de dados
- Executar script de limpeza de contatos fantasmas
- Verificar se números têm código de país correto

### Bandeiras não aparecem:
- Verificar se react-country-flag está instalada
- Verificar conexão com internet (bandeiras são SVG)
- Ver console para erros de renderização
