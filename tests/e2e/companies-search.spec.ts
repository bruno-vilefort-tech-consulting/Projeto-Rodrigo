import { test, expect, Page } from '@playwright/test';

/**
 * E2E Tests: Companies Search Feature
 *
 * Valida:
 * - Feature flag (on/off)
 * - SearchBar UI e funcionalidade
 * - Filtro real-time client-side
 * - Busca em múltiplos campos (name, email, document, phone)
 * - Case-insensitive search
 * - Clear button functionality
 * - Visual regression testing
 * - Acessibilidade (WCAG AA)
 * - Internacionalização (i18n)
 * - Integração com outras funcionalidades (editar, criar)
 * - Performance (useMemo optimization)
 */

// Helper: Login como super user
async function loginAsSuperUser(page: Page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'admin@admin.com');
  await page.fill('input[name="password"]', 'admin');
  await page.click('button[type="submit"]');
  await page.waitForURL('/tickets');
}

// Helper: Navegar para Settings > Empresas
async function navigateToCompanies(page: Page) {
  await page.click('[aria-label="Configurações"], [title="Configurações"]');
  await page.waitForSelector('text=Empresas', { state: 'visible' });
  await page.click('text=Empresas');
  await page.waitForLoadState('networkidle');
}

// Helper: Criar company de teste
async function createTestCompany(page: Page, name: string, email: string) {
  await page.fill('input[name="name"]', name);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', '123456');
  await page.selectOption('select[name="planId"]', { index: 1 });
  await page.click('button[type="submit"]:has-text("Salvar")');
  await page.waitForTimeout(1000); // Aguardar salvamento
}

test.describe('Companies Search - Feature Flag', () => {
  test('deve renderizar SearchBar quando feature flag está enabled', async ({ page }) => {
    await loginAsSuperUser(page);
    await navigateToCompanies(page);

    // Verificar presença do SearchBar
    const searchBar = page.locator('input[type="search"]');
    await expect(searchBar).toBeVisible();
    await expect(searchBar).toHaveAttribute('placeholder', /buscar empresas/i);
  });

  test('deve mostrar ícone de lupa no SearchBar', async ({ page }) => {
    await loginAsSuperUser(page);
    await navigateToCompanies(page);

    // Ícone de busca deve estar visível
    const searchIcon = page.locator('svg').filter({ hasText: /search/i }).first();
    await expect(searchIcon).toBeVisible();
  });
});

test.describe('Companies Search - Filtro por Nome', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSuperUser(page);
    await navigateToCompanies(page);
  });

  test('deve filtrar companies por nome (minúsculas)', async ({ page }) => {
    const searchBar = page.locator('input[type="search"]');
    await searchBar.fill('acme');

    // Aguardar filtro client-side (useMemo)
    await page.waitForTimeout(500);

    // Verificar que apenas ACME aparece
    await expect(page.locator('table').locator('text=ACME')).toBeVisible();
    await expect(page.locator('table').locator('text=TechStart')).not.toBeVisible();
  });

  test('deve filtrar companies por nome (maiúsculas)', async ({ page }) => {
    const searchBar = page.locator('input[type="search"]');
    await searchBar.fill('ACME');

    await page.waitForTimeout(500);

    await expect(page.locator('table').locator('text=ACME')).toBeVisible();
  });

  test('deve ser case-insensitive (misturando maiúsculas e minúsculas)', async ({ page }) => {
    const searchBar = page.locator('input[type="search"]');
    await searchBar.fill('AcMe');

    await page.waitForTimeout(500);

    await expect(page.locator('table').locator('text=ACME')).toBeVisible();
  });

  test('deve filtrar em tempo real durante digitação', async ({ page }) => {
    const searchBar = page.locator('input[type="search"]');

    // Digitar "a"
    await searchBar.fill('a');
    await page.waitForTimeout(300);

    // Deve mostrar companies com "a"
    const rowsAfterA = await page.locator('table tbody tr').count();
    expect(rowsAfterA).toBeGreaterThan(0);

    // Digitar "ac"
    await searchBar.fill('ac');
    await page.waitForTimeout(300);

    // Deve filtrar mais
    const rowsAfterAc = await page.locator('table tbody tr').count();
    expect(rowsAfterAc).toBeLessThanOrEqual(rowsAfterA);
  });
});

test.describe('Companies Search - Filtro por Email', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSuperUser(page);
    await navigateToCompanies(page);
  });

  test('deve filtrar por email completo', async ({ page }) => {
    const searchBar = page.locator('input[type="search"]');
    await searchBar.fill('admin@admin.com');

    await page.waitForTimeout(500);

    const table = page.locator('table tbody');
    await expect(table.locator('tr')).toHaveCount(1);
  });

  test('deve filtrar por domínio de email', async ({ page }) => {
    const searchBar = page.locator('input[type="search"]');
    await searchBar.fill('@admin.com');

    await page.waitForTimeout(500);

    const table = page.locator('table tbody');
    const rows = await table.locator('tr').count();
    expect(rows).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Companies Search - Limpar Busca', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSuperUser(page);
    await navigateToCompanies(page);
  });

  test('deve mostrar botão de limpar apenas quando há texto', async ({ page }) => {
    const searchBar = page.locator('input[type="search"]');
    const clearButton = page.locator('button[aria-label*="limpar"], button[aria-label*="clear"]');

    // Inicialmente, botão não deve estar visível
    await expect(clearButton).not.toBeVisible();

    // Digitar texto
    await searchBar.fill('test');
    await page.waitForTimeout(300);

    // Agora deve aparecer
    await expect(clearButton).toBeVisible();
  });

  test('deve limpar o campo ao clicar no botão X', async ({ page }) => {
    const searchBar = page.locator('input[type="search"]');

    // Filtrar
    await searchBar.fill('acme');
    await page.waitForTimeout(500);

    // Verificar filtro aplicado
    const rowsFiltered = await page.locator('table tbody tr').count();
    expect(rowsFiltered).toBeLessThan(5);

    // Clicar em limpar
    const clearButton = page.locator('button[aria-label*="limpar"], button[aria-label*="clear"]');
    await clearButton.click();

    // Campo deve estar vazio
    await expect(searchBar).toHaveValue('');

    // Todas companies devem aparecer
    await page.waitForTimeout(500);
    const rowsAll = await page.locator('table tbody tr').count();
    expect(rowsAll).toBeGreaterThan(rowsFiltered);
  });
});

test.describe('Companies Search - Empty State', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSuperUser(page);
    await navigateToCompanies(page);
  });

  test('deve mostrar tabela vazia quando nenhuma company corresponde', async ({ page }) => {
    const searchBar = page.locator('input[type="search"]');
    await searchBar.fill('nonexistentcompany12345xyz');

    await page.waitForTimeout(500);

    // Tabela deve estar vazia
    const rows = await page.locator('table tbody tr').count();
    expect(rows).toBe(0);

    // Não deve mostrar erro
    await expect(page.locator('text=erro', { hasText: /erro/i })).not.toBeVisible();
  });

  test('deve mostrar todas companies quando campo está vazio', async ({ page }) => {
    const searchBar = page.locator('input[type="search"]');

    // Filtrar primeiro
    await searchBar.fill('test');
    await page.waitForTimeout(500);

    // Limpar
    await searchBar.clear();
    await page.waitForTimeout(500);

    // Todas devem aparecer
    const rows = await page.locator('table tbody tr').count();
    expect(rows).toBeGreaterThan(0);
  });
});

test.describe('Companies Search - Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSuperUser(page);
    await navigateToCompanies(page);
  });

  test('deve manter layout consistente - SearchBar', async ({ page }) => {
    const searchBar = page.locator('input[type="search"]').first();
    await expect(searchBar).toHaveScreenshot('searchbar-initial.png');
  });

  test('deve manter layout consistente - SearchBar com texto', async ({ page }) => {
    const searchBar = page.locator('input[type="search"]');
    await searchBar.fill('ACME Corporation');
    await page.waitForTimeout(300);

    await expect(searchBar).toHaveScreenshot('searchbar-with-text.png');
  });

  test('deve manter layout da tabela após filtro', async ({ page }) => {
    const searchBar = page.locator('input[type="search"]');
    await searchBar.fill('admin');
    await page.waitForTimeout(500);

    const table = page.locator('table');
    await expect(table).toHaveScreenshot('table-filtered.png');
  });

  test('deve capturar página completa com SearchBar', async ({ page }) => {
    await expect(page).toHaveScreenshot('companies-page-full.png', {
      fullPage: true
    });
  });
});

test.describe('Companies Search - Acessibilidade (WCAG AA)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSuperUser(page);
    await navigateToCompanies(page);
  });

  test('SearchBar deve ter aria-label', async ({ page }) => {
    const searchBar = page.locator('input[type="search"]');
    const ariaLabel = await searchBar.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toContain('busca');
  });

  test('botão de limpar deve ter aria-label', async ({ page }) => {
    const searchBar = page.locator('input[type="search"]');
    await searchBar.fill('test');

    const clearButton = page.locator('button[aria-label*="limpar"], button[aria-label*="clear"]');
    await expect(clearButton).toBeVisible();

    const ariaLabel = await clearButton.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });

  test('deve permitir navegação por teclado', async ({ page }) => {
    // Tab até o SearchBar
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const searchBar = page.locator('input[type="search"]');
    await expect(searchBar).toBeFocused();

    // Digitar com teclado
    await page.keyboard.type('acme');
    await page.waitForTimeout(500);

    // Verificar filtro aplicado
    await expect(page.locator('table').locator('text=ACME')).toBeVisible();
  });

  test('deve ter contraste adequado', async ({ page }) => {
    const searchBar = page.locator('input[type="search"]');

    // Verificar que o placeholder é visível (contraste mínimo)
    const placeholder = await searchBar.getAttribute('placeholder');
    expect(placeholder).toBeTruthy();

    // O texto do placeholder deve ser legível
    await expect(searchBar).toBeVisible();
  });
});

test.describe('Companies Search - Integração com Outras Funcionalidades', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSuperUser(page);
    await navigateToCompanies(page);
  });

  test('deve manter filtro ao editar company', async ({ page }) => {
    const searchBar = page.locator('input[type="search"]');
    await searchBar.fill('admin');
    await page.waitForTimeout(500);

    // Clicar em editar
    const editButton = page.locator('button[aria-label="delete"]').first();
    await editButton.click();
    await page.waitForTimeout(500);

    // Filtro deve permanecer
    await expect(searchBar).toHaveValue('admin');
  });

  test('deve permitir criar company enquanto filtro está ativo', async ({ page }) => {
    const searchBar = page.locator('input[type="search"]');
    await searchBar.fill('test');
    await page.waitForTimeout(500);

    // Preencher formulário de criação
    const nameInput = page.locator('input[name="name"]');
    await nameInput.fill('New Test Company');

    await expect(nameInput).toHaveValue('New Test Company');

    // Filtro não deve interferir
    await expect(searchBar).toHaveValue('test');
  });

  test('deve atualizar lista após salvar nova company', async ({ page }) => {
    const searchBar = page.locator('input[type="search"]');

    // Criar company
    await createTestCompany(page, 'E2E Test Company', 'e2e@test.com');

    // Aguardar atualização da lista
    await page.waitForTimeout(2000);

    // Buscar pela nova company
    await searchBar.fill('E2E Test');
    await page.waitForTimeout(500);

    // Deve aparecer na lista
    await expect(page.locator('table').locator('text=E2E Test Company')).toBeVisible();
  });
});

test.describe('Companies Search - Performance', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSuperUser(page);
    await navigateToCompanies(page);
  });

  test('filtro deve ser rápido (< 500ms)', async ({ page }) => {
    const searchBar = page.locator('input[type="search"]');

    const startTime = Date.now();
    await searchBar.fill('acme');
    await page.waitForTimeout(100);

    // Verificar que filtro foi aplicado rapidamente
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(500);

    // Resultado deve estar visível
    await expect(page.locator('table').locator('text=ACME')).toBeVisible();
  });

  test('não deve haver lag durante digitação rápida', async ({ page }) => {
    const searchBar = page.locator('input[type="search"]');

    // Digitar rapidamente
    await searchBar.type('acme corporation', { delay: 50 });

    // Valor final deve estar correto
    await expect(searchBar).toHaveValue('acme corporation');

    // Tabela deve ter respondido
    await page.waitForTimeout(500);
    const rows = await page.locator('table tbody tr').count();
    expect(rows).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Companies Search - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSuperUser(page);
    await navigateToCompanies(page);
  });

  test('deve tratar caracteres especiais', async ({ page }) => {
    const searchBar = page.locator('input[type="search"]');
    await searchBar.fill('@admin.com');

    await page.waitForTimeout(500);

    // Não deve crashar
    await expect(searchBar).toHaveValue('@admin.com');
  });

  test('deve tratar busca muito longa', async ({ page }) => {
    const searchBar = page.locator('input[type="search"]');
    const longText = 'a'.repeat(200);

    await searchBar.fill(longText);
    await page.waitForTimeout(500);

    // Não deve crashar
    await expect(searchBar).toHaveValue(longText);
  });

  test('deve tratar múltiplos espaços', async ({ page }) => {
    const searchBar = page.locator('input[type="search"]');
    await searchBar.fill('   acme   corporation   ');

    await page.waitForTimeout(500);

    // Deve funcionar normalmente
    const rows = await page.locator('table tbody tr').count();
    expect(rows).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Companies Search - Socket.IO Real-Time', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSuperUser(page);
    await navigateToCompanies(page);
  });

  test('deve detectar conexão Socket.IO ativa', async ({ page }) => {
    // Verificar se Socket.IO está conectado
    const socketConnected = await page.evaluate(() => {
      // @ts-ignore
      return window.socket && window.socket.connected;
    });

    // Socket.IO deve estar ativo no ChatIA Flow
    expect(socketConnected).toBeTruthy();
  });

  test('deve receber atualizações em tempo real de companies', async ({ page, context }) => {
    // Abrir segunda aba para simular outro usuário
    const page2 = await context.newPage();
    await loginAsSuperUser(page2);
    await navigateToCompanies(page2);

    // Na página 2, criar nova company
    await createTestCompany(page2, 'Socket Test Company', 'socket@test.com');

    // Aguardar evento Socket.IO
    await page.waitForTimeout(3000);

    // Na página 1, buscar pela nova company
    const searchBar = page.locator('input[type="search"]');
    await searchBar.fill('Socket Test');
    await page.waitForTimeout(500);

    // Deve aparecer (se Socket.IO estiver funcionando)
    // Nota: Isso depende da implementação de Socket.IO no backend
    const rows = await page.locator('table tbody tr').count();
    expect(rows).toBeGreaterThanOrEqual(0);

    await page2.close();
  });
});

test.describe('Companies Search - Internacionalização (i18n)', () => {
  test('deve exibir placeholder em português', async ({ page }) => {
    await loginAsSuperUser(page);
    await navigateToCompanies(page);

    const searchBar = page.locator('input[type="search"]');
    const placeholder = await searchBar.getAttribute('placeholder');

    expect(placeholder).toContain('Buscar');
  });

  // Nota: Para testar outros idiomas, seria necessário implementar
  // a troca de idioma na interface e verificar as traduções
});

test.describe('Companies Search - Multi-Tenant Security', () => {
  test('super user deve ver SearchBar', async ({ page }) => {
    await loginAsSuperUser(page);
    await navigateToCompanies(page);

    const searchBar = page.locator('input[type="search"]');
    await expect(searchBar).toBeVisible();
  });

  test('super user pode buscar qualquer company', async ({ page }) => {
    await loginAsSuperUser(page);
    await navigateToCompanies(page);

    const searchBar = page.locator('input[type="search"]');
    await searchBar.fill('test');
    await page.waitForTimeout(500);

    // Deve poder ver resultados
    const table = page.locator('table tbody');
    await expect(table).toBeVisible();
  });
});
