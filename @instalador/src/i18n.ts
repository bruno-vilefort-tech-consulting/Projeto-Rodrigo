export type Language = 'es' | 'pt' | 'en';

export const languages = {
  es: {
    name: 'Espanhol',
    flag: '🇪🇸'
  },
  pt: {
    name: 'Português',
    flag: '🇧🇷'
  },
  en: {
    name: 'Inglês',
    flag: '🇺🇸'
  }
};

export const translations = {
  pt: {
    title: '- Instalador v5',

    // Seção de configuração
    configTitle: 'Configuração',
    manifestUrl: 'URL do Manifest (JSON)',
    manifestUrlPlaceholder: 'https://.../manifest.json',
    backendUrl: 'Backend URL',
    backendUrlPlaceholder: 'https://api.exemplo.com',
    frontendUrl: 'Frontend URL',
    frontendUrlPlaceholder: 'https://app.exemplo.com',
    email: 'E-mail (admin)',
    emailPlaceholder: 'admin@empresa.com',
    emailInvalid: 'Email inválido',
    companyName: 'Nome da Empresa',
    companyNamePlaceholder: 'Minha Empresa',
    deployPass: 'Senha ( deploy - redis - db )',
    deployPassPlaceholder: 'Digite uma senha forte',
    masterPass: 'Senha Painel Master',
    masterPassPlaceholder: 'Digite a senha do painel',
    supportPhone: 'Telefone Suporte (somente números)',
    supportPhonePlaceholder: '5511999999999',
    phoneInvalid: 'Telefone inválido',
    fbAppId: 'FACEBOOK_APP_ID (opcional)',
    fbAppIdPlaceholder: 'ID do app do Facebook',
    fbAppSecret: 'FACEBOOK_APP_SECRET (opcional)',
    fbAppSecretPlaceholder: 'Secret do app do Facebook',
    sqlBackup: 'Backup SQL (opcional)',
    sqlBackupPlaceholder: '/caminho/backup.sql',

    // Botões
    installButton: 'Instalar',

    // Progresso
    progressTitle: 'Progresso',
    phase: 'Fase:',
    artifact: 'Artefato:',
    logs: 'Logs',
    errorPrefix: '⚠️',
    successMessage: '✅ Instalação concluída!'
  },

  en: {
    title: '- Installer v5',

    // Configuration section
    configTitle: 'Configuration',
    manifestUrl: 'Manifest URL (JSON)',
    manifestUrlPlaceholder: 'https://.../manifest.json',
    backendUrl: 'Backend URL',
    backendUrlPlaceholder: 'https://api.example.com',
    frontendUrl: 'Frontend URL',
    frontendUrlPlaceholder: 'https://app.example.com',
    email: 'E-mail (admin)',
    emailPlaceholder: 'admin@company.com',
    emailInvalid: 'Invalid email',
    companyName: 'Company Name',
    companyNamePlaceholder: 'My Company',
    deployPass: 'Password ( deploy - redis - db )',
    deployPassPlaceholder: 'Enter a strong password',
    masterPass: 'Master Panel Password',
    masterPassPlaceholder: 'Enter panel password',
    supportPhone: 'Support Phone (numbers only)',
    supportPhonePlaceholder: '5511999999999',
    phoneInvalid: 'Invalid phone',
    fbAppId: 'FACEBOOK_APP_ID (optional)',
    fbAppIdPlaceholder: 'Facebook app ID',
    fbAppSecret: 'FACEBOOK_APP_SECRET (optional)',
    fbAppSecretPlaceholder: 'Facebook app secret',
    sqlBackup: 'SQL Backup (optional)',
    sqlBackupPlaceholder: '/path/to/backup.sql',

    // Buttons
    installButton: 'Install',

    // Progress
    progressTitle: 'Progress',
    phase: 'Phase:',
    artifact: 'Artifact:',
    logs: 'Logs',
    errorPrefix: '⚠️',
    successMessage: '✅ Installation completed!'
  },

  es: {
    title: '- Instalador v5',

    // Sección de configuración
    configTitle: 'Configuración',
    manifestUrl: 'URL del Manifest (JSON)',
    manifestUrlPlaceholder: 'https://.../manifest.json',
    backendUrl: 'URL del Backend',
    backendUrlPlaceholder: 'https://api.ejemplo.com',
    frontendUrl: 'URL del Frontend',
    frontendUrlPlaceholder: 'https://app.ejemplo.com',
    email: 'E-mail (admin)',
    emailPlaceholder: 'admin@empresa.com',
    emailInvalid: 'Email inválido',
    companyName: 'Nombre de la Empresa',
    companyNamePlaceholder: 'Mi Empresa',
    deployPass: 'Contraseña ( deploy - redis - db )',
    deployPassPlaceholder: 'Ingrese una contraseña fuerte',
    masterPass: 'Contraseña Panel Master',
    masterPassPlaceholder: 'Ingrese la contraseña del panel',
    supportPhone: 'Teléfono de Soporte (solo números)',
    supportPhonePlaceholder: '5511999999999',
    phoneInvalid: 'Teléfono inválido',
    fbAppId: 'FACEBOOK_APP_ID (opcional)',
    fbAppIdPlaceholder: 'ID de la app de Facebook',
    fbAppSecret: 'FACEBOOK_APP_SECRET (opcional)',
    fbAppSecretPlaceholder: 'Secret de la app de Facebook',
    sqlBackup: 'Backup SQL (opcional)',
    sqlBackupPlaceholder: '/ruta/al/backup.sql',

    // Botones
    installButton: 'Instalar',

    // Progreso
    progressTitle: 'Progreso',
    phase: 'Fase:',
    artifact: 'Artefacto:',
    logs: 'Logs',
    errorPrefix: '⚠️',
    successMessage: '✅ ¡Instalación completada!'
  }
};
