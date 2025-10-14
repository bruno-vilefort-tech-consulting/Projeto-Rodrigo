# TASK-06: Buscador em Empresas + Ícone de Olho na Senha

**Prioridade:** 🟡 Média (3)
**Tempo Estimado:** 2h30min
**Categoria:** Frontend
**Status:** [ ] Pendente

---

## 📋 Problema

1. Buscador na tela de Empresas não funciona
2. Modal de editar senha sem ícone de olho (não vê senha digitada)

---

## ✅ Solução

### Correção 1: Implementar Busca

**Arquivo:** `frontend/src/pages/Companies/index.js`

```javascript
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

// Na UI:
<TextField
  placeholder="Buscar empresas..."
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

<Table>
  {filteredCompanies.map(company => (
    // ... renderizar empresa
  ))}
</Table>
```

### Correção 2: Ícone de Olho na Senha

**Arquivo:** `frontend/src/components/CompanyModal/index.js`

```javascript
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";

const [showPassword, setShowPassword] = useState(false);

<TextField
  name="password"
  label="Senha"
  type={showPassword ? "text" : "password"}
  value={formik.values.password}
  onChange={formik.handleChange}
  variant="outlined"
  fullWidth
  InputProps={{
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          onClick={() => setShowPassword(!showPassword)}
          edge="end"
        >
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ),
  }}
/>
```

---

## 📂 Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `frontend/src/pages/Companies/index.js` | Adicionar busca |
| `frontend/src/components/CompanyModal/index.js` | Adicionar toggle senha |

---

## ✓ Critérios de Aceitação

- [ ] Busca filtra por nome, email, CNPJ, telefone
- [ ] Busca case-insensitive
- [ ] Ícone de olho toggle senha
- [ ] Modal de editar senha funcional

---

**Tempo:** 2h30min
