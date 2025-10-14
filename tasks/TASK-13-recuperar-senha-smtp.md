# TASK-13: Ajustar Recuperar Senha e Configurar SMTP

**Prioridade:** 🟡 Média (3)
**Tempo Estimado:** 4h
**Categoria:** Full-stack
**Status:** [ ] Pendente

---

## 📋 Problema

"Ajustar tela de recuperar senha e fazer aula de SMTP"

1. Tela de recuperação de senha pode estar quebrada
2. SMTP precisa ser configurado para enviar emails

---

## ✅ Solução

### Frontend: Tela de Recuperação

**Arquivo:** `frontend/src/pages/ForgotPassword/index.js`

```javascript
const handleSubmit = async (values) => {
  try {
    await api.post('/auth/forgot-password', { email: values.email });
    toast.success('Email de recuperação enviado!');
  } catch (err) {
    toast.error('Erro ao enviar email');
  }
};

return (
  <Formik
    initialValues={{ email: '' }}
    validationSchema={Yup.object({
      email: Yup.string().email('Email inválido').required('Obrigatório')
    })}
    onSubmit={handleSubmit}
  >
    {/* Form UI */}
  </Formik>
);
```

### Backend: SMTP Service

**Arquivo:** `backend/src/services/EmailService/SendResetPasswordEmail.ts`

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const SendResetPasswordEmail = async (email: string, token: string) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Recuperação de Senha',
    html: `
      <p>Clique no link para redefinir sua senha:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Link válido por 1 hora.</p>
    `
  });
};

export default SendResetPasswordEmail;
```

### .env Configuration

```bash
# SMTP Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
SMTP_FROM="ChatIA <noreply@chatia.com>"

FRONTEND_URL=http://localhost:3000
```

---

## 📂 Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `frontend/src/pages/ForgotPassword/index.js` | Verificar/corrigir |
| `backend/src/services/EmailService/SendResetPasswordEmail.ts` | Criar |
| `backend/src/controllers/AuthController.ts` | Adicionar rota forgot-password |
| `backend/.env` | Adicionar configs SMTP |

---

## ✓ Critérios de Aceitação

- [ ] Usuário digita email e recebe link de recuperação
- [ ] Email entregue via SMTP
- [ ] Link válido por 1 hora
- [ ] Redefinição de senha funciona

---

**Tempo:** 4h
