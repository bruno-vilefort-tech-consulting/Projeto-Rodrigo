/**
 * Testes de integração para CompanyService
 *
 * Valida comportamento end-to-end dos services com validação de documentos,
 * UNIQUE constraint, e isolamento multi-tenant.
 */

import CreateCompanyService from '../CreateCompanyService';
import UpdateCompanyService from '../UpdateCompanyService';
import ShowCompanyService from '../ShowCompanyService';
import AppError from '../../../errors/AppError';
import sequelize from '../../../database';
import Company from '../../../models/Company';
import User from '../../../models/User';
import CompaniesSettings from '../../../models/CompaniesSettings';

describe('CompanyService Integration - Document Validation', () => {
  beforeAll(async () => {
    // Sincronizar banco de dados para testes (usar em memória ou DB de teste)
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Limpar dados entre testes
    await User.destroy({ where: {}, force: true });
    await CompaniesSettings.destroy({ where: {}, force: true });
    await Company.destroy({ where: {}, force: true });
  });

  describe('CreateCompanyService', () => {
    it('deve criar empresa sem document (NULL)', async () => {
      const company = await CreateCompanyService({
        name: 'Test Company',
        email: 'test@test.com',
        password: 'pass123'
      });

      expect(company).toBeDefined();
      expect(company.name).toBe('Test Company');
      expect(company.document).toBeNull();
    });

    it('deve criar empresa com CPF válido normalizado', async () => {
      const company = await CreateCompanyService({
        name: 'Test CPF',
        email: 'cpf@test.com',
        password: 'pass123',
        document: '111.444.777-35' // CPF válido formatado
      });

      expect(company).toBeDefined();
      expect(company.document).toBe('11144477735'); // Normalizado (sem pontuação)
    });

    it('deve criar empresa com CNPJ válido normalizado', async () => {
      const company = await CreateCompanyService({
        name: 'Test CNPJ',
        email: 'cnpj@test.com',
        password: 'pass123',
        document: '11.222.333/0001-81' // CNPJ válido formatado
      });

      expect(company).toBeDefined();
      expect(company.document).toBe('11222333000181'); // Normalizado
    });

    it('deve criar empresa com CPF já normalizado', async () => {
      const company = await CreateCompanyService({
        name: 'Test CPF Normalizado',
        email: 'cpfnorm@test.com',
        password: 'pass123',
        document: '12345678909' // CPF válido sem formatação
      });

      expect(company).toBeDefined();
      expect(company.document).toBe('12345678909');
    });

    it('deve rejeitar empresa com CPF inválido (dígito verificador errado)', async () => {
      await expect(
        CreateCompanyService({
          name: 'Invalid CPF',
          email: 'invalid@test.com',
          password: 'pass123',
          document: '123.456.789-00' // CPF inválido
        })
      ).rejects.toThrow('ERR_COMPANY_INVALID_DOCUMENT');
    });

    it('deve rejeitar empresa com CNPJ inválido (dígito verificador errado)', async () => {
      await expect(
        CreateCompanyService({
          name: 'Invalid CNPJ',
          email: 'invalidcnpj@test.com',
          password: 'pass123',
          document: '11.222.333/0001-80' // CNPJ inválido
        })
      ).rejects.toThrow('ERR_COMPANY_INVALID_DOCUMENT');
    });

    it('deve rejeitar CPF com sequência repetida (11111111111)', async () => {
      await expect(
        CreateCompanyService({
          name: 'Repeated CPF',
          email: 'repeated@test.com',
          password: 'pass123',
          document: '111.111.111-11' // Sequência repetida
        })
      ).rejects.toThrow('ERR_COMPANY_INVALID_DOCUMENT');
    });

    it('deve rejeitar CNPJ com sequência repetida (00000000000000)', async () => {
      await expect(
        CreateCompanyService({
          name: 'Repeated CNPJ',
          email: 'repeatedcnpj@test.com',
          password: 'pass123',
          document: '00.000.000/0000-00' // Sequência repetida
        })
      ).rejects.toThrow('ERR_COMPANY_INVALID_DOCUMENT');
    });

    it('deve rejeitar documento com comprimento inválido (não é CPF nem CNPJ)', async () => {
      await expect(
        CreateCompanyService({
          name: 'Invalid Length',
          email: 'invalidlen@test.com',
          password: 'pass123',
          document: '123456' // Comprimento inválido
        })
      ).rejects.toThrow('ERR_COMPANY_INVALID_DOCUMENT');
    });

    it('deve criar empresa com string vazia convertida para NULL', async () => {
      const company = await CreateCompanyService({
        name: 'Empty Doc',
        email: 'emptydoc@test.com',
        password: 'pass123',
        document: '' // String vazia
      });

      expect(company).toBeDefined();
      expect(company.document).toBeNull();
    });

    it('deve criar empresa com espaços convertidos para NULL', async () => {
      const company = await CreateCompanyService({
        name: 'Spaces Doc',
        email: 'spacesdoc@test.com',
        password: 'pass123',
        document: '   ' // Apenas espaços
      });

      expect(company).toBeDefined();
      expect(company.document).toBeNull();
    });

    it('deve permitir múltiplas empresas sem document (NULL)', async () => {
      const company1 = await CreateCompanyService({
        name: 'No Doc 1',
        email: 'nodoc1@test.com',
        password: 'pass123'
      });

      const company2 = await CreateCompanyService({
        name: 'No Doc 2',
        email: 'nodoc2@test.com',
        password: 'pass123'
      });

      const company3 = await CreateCompanyService({
        name: 'No Doc 3',
        email: 'nodoc3@test.com',
        password: 'pass123'
      });

      expect(company1.document).toBeNull();
      expect(company2.document).toBeNull();
      expect(company3.document).toBeNull();

      // Verificar que foram criados 3 registros
      const companies = await Company.findAll();
      expect(companies.length).toBe(3);
    });

    it('deve rejeitar documento duplicado (UNIQUE constraint)', async () => {
      // Criar primeira empresa com CPF
      await CreateCompanyService({
        name: 'First Company',
        email: 'first@test.com',
        password: 'pass123',
        document: '11144477735'
      });

      // Tentar criar segunda empresa com mesmo CPF (formatado diferente)
      await expect(
        CreateCompanyService({
          name: 'Second Company',
          email: 'second@test.com',
          password: 'pass123',
          document: '111.444.777-35' // Mesmo CPF, formatação diferente
        })
      ).rejects.toThrow(); // Sequelize lançará erro de UNIQUE constraint
    });
  });

  describe('UpdateCompanyService', () => {
    it('deve atualizar document para NULL (remover)', async () => {
      const company = await CreateCompanyService({
        name: 'With Doc',
        email: 'withdoc@test.com',
        password: 'pass123',
        document: '11144477735'
      });

      const updated = await UpdateCompanyService({
        id: company.id,
        name: company.name,
        email: company.email,
        document: null as any // Remover document
      });

      expect(updated.document).toBeNull();
    });

    it('deve atualizar document de NULL para CPF válido', async () => {
      const company = await CreateCompanyService({
        name: 'No Doc Initially',
        email: 'nodocinit@test.com',
        password: 'pass123'
      });

      expect(company.document).toBeNull();

      const updated = await UpdateCompanyService({
        id: company.id,
        name: company.name,
        email: company.email,
        document: '52998224725' // Adicionar CPF
      });

      expect(updated.document).toBe('52998224725');
    });

    it('deve atualizar document de CPF para CNPJ', async () => {
      const company = await CreateCompanyService({
        name: 'CPF Company',
        email: 'cpfcomp@test.com',
        password: 'pass123',
        document: '11144477735'
      });

      const updated = await UpdateCompanyService({
        id: company.id,
        name: company.name,
        email: company.email,
        document: '11222333000181' // Trocar para CNPJ
      });

      expect(updated.document).toBe('11222333000181');
    });

    it('deve rejeitar atualização com CPF inválido', async () => {
      const company = await CreateCompanyService({
        name: 'Valid CPF',
        email: 'validcpf@test.com',
        password: 'pass123',
        document: '11144477735'
      });

      await expect(
        UpdateCompanyService({
          id: company.id,
          name: company.name,
          email: company.email,
          document: '12345678900' // CPF inválido
        })
      ).rejects.toThrow('ERR_COMPANY_INVALID_DOCUMENT');
    });

    it('deve rejeitar atualização com documento duplicado', async () => {
      // Criar duas empresas
      const company1 = await CreateCompanyService({
        name: 'Company 1',
        email: 'comp1@test.com',
        password: 'pass123',
        document: '11144477735'
      });

      const company2 = await CreateCompanyService({
        name: 'Company 2',
        email: 'comp2@test.com',
        password: 'pass123',
        document: '52998224725'
      });

      // Tentar atualizar company2 com document de company1
      await expect(
        UpdateCompanyService({
          id: company2.id,
          name: company2.name,
          email: company2.email,
          document: '11144477735' // Duplicado
        })
      ).rejects.toThrow(); // UNIQUE constraint violation
    });

    it('deve normalizar document formatado no update', async () => {
      const company = await CreateCompanyService({
        name: 'Company Update',
        email: 'compupdate@test.com',
        password: 'pass123'
      });

      const updated = await UpdateCompanyService({
        id: company.id,
        name: company.name,
        email: company.email,
        document: '111.444.777-35' // CPF formatado
      });

      expect(updated.document).toBe('11144477735'); // Normalizado
    });

    it('deve converter string vazia para NULL no update', async () => {
      const company = await CreateCompanyService({
        name: 'Company Empty',
        email: 'compempty@test.com',
        password: 'pass123',
        document: '11144477735'
      });

      const updated = await UpdateCompanyService({
        id: company.id,
        name: company.name,
        email: company.email,
        document: '' // String vazia
      });

      expect(updated.document).toBeNull();
    });
  });

  describe('ShowCompanyService - Verificação de dados', () => {
    it('deve retornar empresa com document NULL', async () => {
      const created = await CreateCompanyService({
        name: 'No Doc Show',
        email: 'nodocshow@test.com',
        password: 'pass123'
      });

      const company = await ShowCompanyService(created.id);

      expect(company).toBeDefined();
      expect(company.document).toBeNull();
    });

    it('deve retornar empresa com document normalizado', async () => {
      const created = await CreateCompanyService({
        name: 'With Doc Show',
        email: 'withdocshow@test.com',
        password: 'pass123',
        document: '111.444.777-35'
      });

      const company = await ShowCompanyService(created.id);

      expect(company).toBeDefined();
      expect(company.document).toBe('11144477735'); // Sem formatação
    });
  });

  describe('Feature Flag - FEATURE_COMPANY_DOCUMENT_OPTIONAL', () => {
    const originalEnv = process.env.FEATURE_COMPANY_DOCUMENT_OPTIONAL;

    afterEach(() => {
      // Restaurar valor original
      process.env.FEATURE_COMPANY_DOCUMENT_OPTIONAL = originalEnv;
    });

    it('deve validar documento quando flag está ON (padrão)', async () => {
      process.env.FEATURE_COMPANY_DOCUMENT_OPTIONAL = 'true';

      await expect(
        CreateCompanyService({
          name: 'Flag On Invalid',
          email: 'flagoninvalid@test.com',
          password: 'pass123',
          document: '12345678900' // CPF inválido
        })
      ).rejects.toThrow('ERR_COMPANY_INVALID_DOCUMENT');
    });

    it('deve permitir documento inválido quando flag está OFF', async () => {
      process.env.FEATURE_COMPANY_DOCUMENT_OPTIONAL = 'false';

      const company = await CreateCompanyService({
        name: 'Flag Off Invalid',
        email: 'flagoffinvalid@test.com',
        password: 'pass123',
        document: '12345678900' // CPF inválido (mas flag OFF aceita)
      });

      expect(company).toBeDefined();
      expect(company.document).toBe('12345678900'); // Normalizado mas não validado
    });
  });

  describe('Edge Cases e Casos Especiais', () => {
    it('deve criar empresa com CPF edge case: 00000000191', async () => {
      const company = await CreateCompanyService({
        name: 'CPF Edge Case',
        email: 'cpfedge@test.com',
        password: 'pass123',
        document: '00000000191'
      });

      expect(company).toBeDefined();
      expect(company.document).toBe('00000000191');
    });

    it('deve criar empresa com CNPJ edge case: 00000000000191', async () => {
      const company = await CreateCompanyService({
        name: 'CNPJ Edge Case',
        email: 'cnpjedge@test.com',
        password: 'pass123',
        document: '00000000000191'
      });

      expect(company).toBeDefined();
      expect(company.document).toBe('00000000000191');
    });

    it('deve manter document NULL ao atualizar outros campos', async () => {
      const company = await CreateCompanyService({
        name: 'Keep NULL',
        email: 'keepnull@test.com',
        password: 'pass123'
      });

      const updated = await UpdateCompanyService({
        id: company.id,
        name: 'Keep NULL Updated',
        email: company.email
        // Não passa document
      });

      expect(updated.document).toBeNull();
    });
  });
});
