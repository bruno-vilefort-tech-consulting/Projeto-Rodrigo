# TASK-07: Adicionar Ícone de Olho no Campo Senha (Usuários)

**Prioridade:** 🟢 Baixa (2)
**Tempo Estimado:** 45min
**Categoria:** Frontend
**Status:** [ ] Pendente

---

## 📋 Problema

"Em usuários deixar um ícone de olho para ver a senha que está sendo colocada"

Campo de senha no modal de usuários sem toggle de visibilidade.

---

## ✅ Solução

**Arquivo:** `frontend/src/components/UserModal/index.js`

```javascript
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";

const [showPassword, setShowPassword] = useState(false);

<TextField
  name="password"
  label="Senha"
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
```

---

## 📂 Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `frontend/src/components/UserModal/index.js` | Adicionar toggle senha |

---

## ✓ Critérios de Aceitação

- [ ] Ícone de olho aparece no campo senha
- [ ] Clicar no ícone revela/oculta senha
- [ ] Ícone alterna entre aberto/fechado
- [ ] Criar/editar usuário continua funcionando

---

**Tempo:** 45min
