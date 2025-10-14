import { z } from 'zod';

// ============================================================
// SCHEMA: Criar Contato
// ============================================================
export const CreateContactSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  number: z.string().regex(
    /^\+?\d{10,15}$/,
    'Formato de número inválido (E.164 esperado: +5511999999999)'
  ),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  source: z.enum([
    'manual',
    'whatsapp_roster',
    'excel_import',
    'auto_created',
    'chat_import'
  ]).default('manual'),
  isInAgenda: z.boolean().default(true),
  channel: z.enum(['whatsapp', 'instagram', 'facebook']).default('whatsapp'),
  isGroup: z.boolean().default(false),
  disableBot: z.boolean().optional(),
  acceptAudioMessage: z.boolean().optional(),
  remoteJid: z.string().optional(),
  wallets: z.array(z.number()).nullable().optional()
});

export type CreateContactInput = z.infer<typeof CreateContactSchema>;

// ============================================================
// SCHEMA: Atualizar Contato
// ============================================================
export const UpdateContactSchema = z.object({
  name: z.string().min(1).optional(),
  number: z.string().regex(/^\+?\d{10,15}$/).optional(),
  email: z.string().email().optional().or(z.literal('')),
  source: z.enum([
    'manual',
    'whatsapp_roster',
    'excel_import',
    'auto_created',
    'chat_import'
  ]).optional(),
  isInAgenda: z.boolean().optional(),
  disableBot: z.boolean().optional(),
  acceptAudioMessage: z.boolean().optional(),
  active: z.boolean().optional()
});

export type UpdateContactInput = z.infer<typeof UpdateContactSchema>;

// ============================================================
// SCHEMA: Listar Contatos (Query Params)
// ============================================================
export const ListContactsQuerySchema = z.object({
  searchParam: z.string().optional(),
  pageNumber: z.string().regex(/^\d+$/).transform(Number).default('1'),
  contactTag: z.string().optional().transform((val) => {
    if (!val) return [];
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  }),
  isGroup: z.enum(['true', 'false']).optional(),
  source: z.enum([
    'manual',
    'whatsapp_roster',
    'excel_import',
    'auto_created',
    'chat_import'
  ]).optional(),
  onlyAgenda: z.enum(['true', 'false'])
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined)
});

export type ListContactsQuery = z.infer<typeof ListContactsQuerySchema>;

// ============================================================
// SCHEMA: Importar Contatos WhatsApp
// ============================================================
export const ImportContactsSchema = z.object({
  whatsappId: z.number().int().positive('WhatsApp ID é obrigatório'),
  filterGroups: z.boolean().default(true),
  onlyAgenda: z.boolean().default(true)
});

export type ImportContactsInput = z.infer<typeof ImportContactsSchema>;

// ============================================================
// SCHEMA: Importar Contatos de Chats
// ============================================================
export const ImportChatsSchema = z.object({
  whatsappId: z.number().int().positive('WhatsApp ID é obrigatório'),
  hours: z.number().int().positive().max(168, 'Máximo de 7 dias (168 horas)').default(24)
});

export type ImportChatsInput = z.infer<typeof ImportChatsSchema>;

// ============================================================
// SCHEMA: Importar Excel/CSV
// ============================================================
export const ImportXlsSchema = z.object({
  number: z.string().min(1, 'Número é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  validateContact: z.enum(['true', 'false']).default('false'),
  tags: z.string().optional() // Comma-separated tags
});

export type ImportXlsInput = z.infer<typeof ImportXlsSchema>;
