import request from "supertest";
import app from "../../app";
import Company from "../../models/Company";
import User from "../../models/User";
import Plan from "../../models/Plan";
import { generateAuthToken } from "../../helpers/AuthHelper";
import faker from "faker";

/**
 * Testes de Integração: CompanyController - Companies Search Feature
 *
 * Valida:
 * - Filtro server-side via query parameter searchParam
 * - Validação Yup (max 100 chars)
 * - Multi-tenant security (super user vs regular user)
 * - Retrocompatibilidade (endpoint funciona sem searchParam)
 * - Case-insensitive search em 4 campos (name, email, document, phone)
 * - Paginação combinada com filtro
 */

describe("CompanyController - Integration Tests: Search Feature", () => {
  let superUser: User;
  let regularUser: User;
  let superToken: string;
  let regularToken: string;
  let testCompany: Company;
  let plan: Plan;

  beforeAll(async () => {
    // Criar plano de teste
    plan = await Plan.create({
      name: "Test Plan",
      users: 10,
      connections: 5,
      queues: 3,
      amount: 99.90
    });

    // Criar company de teste
    testCompany = await Company.create({
      name: "Test Company",
      email: "test@company.com",
      status: true,
      planId: plan.id
    });

    // Criar super user
    superUser = await User.create({
      name: "Super Admin",
      email: "super@test.com",
      passwordHash: "$2a$08$WaEmpmFDD/XkDqorkpQ42eUZozOqRCPkPcTkmHHMyuTGUOkI8dHsq", // senha: 123456
      profile: "admin",
      super: true,
      companyId: testCompany.id
    });

    // Criar regular user
    regularUser = await User.create({
      name: "Regular User",
      email: "user@test.com",
      passwordHash: "$2a$08$WaEmpmFDD/XkDqorkpQ42eUZozOqRCPkPcTkmHHMyuTGUOkI8dHsq",
      profile: "user",
      super: false,
      companyId: testCompany.id
    });

    // Gerar tokens (usando a função real do helper)
    superToken = generateAuthToken(superUser);
    regularToken = generateAuthToken(regularUser);

    // Criar companies adicionais para testes de busca
    await Company.bulkCreate([
      {
        name: "ACME Corporation",
        email: "contact@acme.com",
        document: "12345678000199",
        phone: "5511999999999",
        status: true,
        planId: plan.id
      },
      {
        name: "TechStart Innovations",
        email: "info@techstart.com",
        document: "98765432000188",
        phone: "5511988888888",
        status: true,
        planId: plan.id
      },
      {
        name: "Consultech Solutions",
        email: "hello@consultech.com",
        document: "55555555000155",
        phone: "5511977777777",
        status: true,
        planId: plan.id
      },
      {
        name: "Global Services Ltd",
        email: "contact@global.com",
        document: "11111111000111",
        phone: "5511966666666",
        status: false,
        planId: plan.id
      }
    ]);
  });

  afterAll(async () => {
    // Limpeza completa
    await User.destroy({ where: {}, force: true });
    await Company.destroy({ where: {}, force: true });
    await Plan.destroy({ where: {}, force: true });
  });

  describe("GET /companies - Retrocompatibilidade", () => {
    it("deve retornar todas companies quando searchParam não é fornecido", async () => {
      const response = await request(app)
        .get("/companies")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("companies");
      expect(response.body).toHaveProperty("count");
      expect(response.body).toHaveProperty("hasMore");
      expect(Array.isArray(response.body.companies)).toBe(true);
      expect(response.body.companies.length).toBeGreaterThanOrEqual(5);
    });

    it("deve aceitar searchParam vazio e retornar todas companies", async () => {
      const response = await request(app)
        .get("/companies?searchParam=")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      expect(response.body.companies).toBeDefined();
      expect(response.body.companies.length).toBeGreaterThanOrEqual(5);
    });

    it("deve aceitar searchParam com apenas espaços (trim resulta em vazio)", async () => {
      const response = await request(app)
        .get("/companies?searchParam=%20%20%20")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      expect(response.body.companies).toBeDefined();
      expect(response.body.companies.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe("GET /companies - Filtro de Busca", () => {
    it("deve filtrar por nome (case-insensitive)", async () => {
      const response = await request(app)
        .get("/companies?searchParam=acme")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      expect(response.body.companies).toHaveLength(1);
      expect(response.body.companies[0].name).toBe("ACME Corporation");
      expect(response.body.count).toBe(1);
    });

    it("deve filtrar por nome com maiúsculas (case-insensitive)", async () => {
      const response = await request(app)
        .get("/companies?searchParam=TECHSTART")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      expect(response.body.companies).toHaveLength(1);
      expect(response.body.companies[0].name).toContain("TechStart");
    });

    it("deve filtrar por email", async () => {
      const response = await request(app)
        .get("/companies?searchParam=contact@acme")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      expect(response.body.companies).toHaveLength(1);
      expect(response.body.companies[0].email).toBe("contact@acme.com");
    });

    it("deve filtrar por domínio de email", async () => {
      const response = await request(app)
        .get("/companies?searchParam=@global.com")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      expect(response.body.companies).toHaveLength(1);
      expect(response.body.companies[0].name).toBe("Global Services Ltd");
    });

    it("deve filtrar por documento (CNPJ)", async () => {
      const response = await request(app)
        .get("/companies?searchParam=12345678000199")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      expect(response.body.companies).toHaveLength(1);
      expect(response.body.companies[0].document).toBe("12345678000199");
    });

    it("deve filtrar por parte do documento", async () => {
      const response = await request(app)
        .get("/companies?searchParam=987654")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      expect(response.body.companies.length).toBeGreaterThanOrEqual(1);
      expect(response.body.companies.some((c: Company) => c.document?.includes("987654"))).toBe(true);
    });

    it("deve filtrar por telefone completo", async () => {
      const response = await request(app)
        .get("/companies?searchParam=5511999999999")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      expect(response.body.companies).toHaveLength(1);
      expect(response.body.companies[0].phone).toBe("5511999999999");
    });

    it("deve filtrar por parte do telefone", async () => {
      const response = await request(app)
        .get("/companies?searchParam=5511988")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      expect(response.body.companies.length).toBeGreaterThanOrEqual(1);
      expect(response.body.companies.some((c: Company) => c.phone?.includes("5511988"))).toBe(true);
    });

    it("deve fazer trim do searchParam automaticamente", async () => {
      const response = await request(app)
        .get("/companies?searchParam=%20%20consultech%20%20")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      expect(response.body.companies).toHaveLength(1);
      expect(response.body.companies[0].name).toContain("Consultech");
    });

    it("deve retornar lista vazia quando nenhuma company corresponde", async () => {
      const response = await request(app)
        .get("/companies?searchParam=nonexistentcompany12345xyz")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      expect(response.body.companies).toHaveLength(0);
      expect(response.body.count).toBe(0);
      expect(response.body.hasMore).toBe(false);
    });

    it("deve encontrar companies independente do status (ativo/inativo)", async () => {
      const response = await request(app)
        .get("/companies?searchParam=global")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      expect(response.body.companies).toHaveLength(1);
      expect(response.body.companies[0].status).toBe(false); // Está inativa
    });
  });

  describe("GET /companies - Validação de Input", () => {
    it("deve rejeitar searchParam com mais de 100 caracteres", async () => {
      const longParam = "a".repeat(101);

      const response = await request(app)
        .get(`/companies?searchParam=${longParam}`)
        .set("Authorization", `Bearer ${superToken}`)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain("must be at most 100 characters");
    });

    it("deve aceitar searchParam com exatamente 100 caracteres", async () => {
      const maxParam = "a".repeat(100);

      const response = await request(app)
        .get(`/companies?searchParam=${maxParam}`)
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      expect(response.body.companies).toBeDefined();
    });

    it("deve rejeitar pageNumber não numérico", async () => {
      const response = await request(app)
        .get("/companies?pageNumber=abc")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it("deve aceitar pageNumber numérico válido", async () => {
      const response = await request(app)
        .get("/companies?pageNumber=2")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      expect(response.body.companies).toBeDefined();
    });
  });

  describe("GET /companies - Multi-Tenant Security", () => {
    it("super user deve ver todas companies", async () => {
      const response = await request(app)
        .get("/companies")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      expect(response.body.companies.length).toBeGreaterThanOrEqual(5);
    });

    it("regular user deve ver apenas sua própria company", async () => {
      const response = await request(app)
        .get("/companies")
        .set("Authorization", `Bearer ${regularToken}`)
        .expect(200);

      expect(response.body.companies).toBeDefined();
      // Regular user vê filtrado pelo nome da sua company
      expect(response.body.companies.every((c: Company) =>
        c.id === regularUser.companyId || c.name === testCompany.name
      )).toBe(true);
    });

    it("super user pode buscar qualquer company", async () => {
      const response = await request(app)
        .get("/companies?searchParam=techstart")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      expect(response.body.companies).toHaveLength(1);
    });

    it("regular user não pode buscar companies de outras empresas", async () => {
      const response = await request(app)
        .get("/companies?searchParam=acme")
        .set("Authorization", `Bearer ${regularToken}`)
        .expect(200);

      // Regular user não deve ver ACME pois não pertence a ela
      expect(response.body.companies.length).toBe(0);
    });

    it("deve rejeitar requisição sem token de autenticação", async () => {
      const response = await request(app)
        .get("/companies")
        .expect(401);

      expect(response.body.error).toBeDefined();
    });

    it("deve rejeitar token inválido", async () => {
      const response = await request(app)
        .get("/companies")
        .set("Authorization", "Bearer invalid_token_here")
        .expect(401);

      expect(response.body.error).toBeDefined();
    });
  });

  describe("GET /companies - Paginação com Filtro", () => {
    beforeAll(async () => {
      // Criar mais companies para testar paginação
      const companies = Array.from({ length: 25 }, (_, i) => ({
        name: `Test Company ${i + 1}`,
        email: `test${i + 1}@pagination.com`,
        document: `${1000000000000 + i}`,
        phone: `551199${1000000 + i}`,
        status: true,
        planId: plan.id
      }));

      await Company.bulkCreate(companies);
    });

    it("deve respeitar paginação com filtro aplicado", async () => {
      const response = await request(app)
        .get("/companies?searchParam=test&pageNumber=1")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      expect(response.body.companies.length).toBeLessThanOrEqual(20);
      expect(response.body).toHaveProperty("hasMore");
      expect(response.body.count).toBeGreaterThanOrEqual(25);
    });

    it("deve permitir navegação entre páginas com filtro", async () => {
      const page1 = await request(app)
        .get("/companies?searchParam=test&pageNumber=1")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      const page2 = await request(app)
        .get("/companies?searchParam=test&pageNumber=2")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      // Páginas devem ter companies diferentes
      expect(page1.body.companies[0].id).not.toBe(page2.body.companies[0].id);
    });

    it("deve indicar hasMore corretamente com filtro", async () => {
      const response = await request(app)
        .get("/companies?searchParam=test&pageNumber=1")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      if (response.body.count > 20) {
        expect(response.body.hasMore).toBe(true);
      } else {
        expect(response.body.hasMore).toBe(false);
      }
    });
  });

  describe("GET /companies - Associações e Dados Relacionados", () => {
    it("deve incluir dados do plano (Plan) nas companies retornadas", async () => {
      const response = await request(app)
        .get("/companies?searchParam=acme")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      expect(response.body.companies).toHaveLength(1);
      expect(response.body.companies[0]).toHaveProperty("plan");
      expect(response.body.companies[0].plan).toHaveProperty("name");
      expect(response.body.companies[0].plan.name).toBe("Test Plan");
    });

    it("deve retornar companies ordenadas por nome ASC", async () => {
      const response = await request(app)
        .get("/companies")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      const names = response.body.companies.map((c: Company) => c.name);
      const sortedNames = [...names].sort();

      expect(names).toEqual(sortedNames);
    });
  });

  describe("GET /companies - Edge Cases", () => {
    it("deve tratar caracteres especiais no searchParam", async () => {
      const response = await request(app)
        .get("/companies?searchParam=contact@acme.com")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      expect(response.body.companies).toBeDefined();
    });

    it("deve tratar busca com números", async () => {
      const response = await request(app)
        .get("/companies?searchParam=12345")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      expect(response.body.companies).toBeDefined();
    });

    it("deve tratar busca com espaços no meio", async () => {
      const response = await request(app)
        .get("/companies?searchParam=Global%20Services")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      expect(response.body.companies.length).toBeGreaterThanOrEqual(1);
      expect(response.body.companies.some((c: Company) =>
        c.name.toLowerCase().includes("global") && c.name.toLowerCase().includes("services")
      )).toBe(true);
    });

    it("deve retornar resposta rápida mesmo com muitas companies", async () => {
      const startTime = Date.now();

      const response = await request(app)
        .get("/companies?searchParam=test")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      const duration = Date.now() - startTime;

      expect(response.body.companies).toBeDefined();
      expect(duration).toBeLessThan(5000); // Menos de 5 segundos
    });
  });

  describe("GET /companies - Cobertura de Campos de Busca", () => {
    it("deve buscar em todos os 4 campos simultaneamente", async () => {
      // Criar company com termo único em cada campo
      await Company.create({
        name: "Unique Name ABC",
        email: "unique@email.com",
        document: "98765432109876",
        phone: "5511900000000",
        status: true,
        planId: plan.id
      });

      // Buscar por cada campo individualmente
      const searchByName = await request(app)
        .get("/companies?searchParam=unique%20name")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      const searchByEmail = await request(app)
        .get("/companies?searchParam=unique@email")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      const searchByDoc = await request(app)
        .get("/companies?searchParam=98765432109876")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      const searchByPhone = await request(app)
        .get("/companies?searchParam=5511900000000")
        .set("Authorization", `Bearer ${superToken}`)
        .expect(200);

      // Todas as buscas devem encontrar a mesma company
      expect(searchByName.body.companies.some((c: Company) => c.name === "Unique Name ABC")).toBe(true);
      expect(searchByEmail.body.companies.some((c: Company) => c.email === "unique@email.com")).toBe(true);
      expect(searchByDoc.body.companies.some((c: Company) => c.document === "98765432109876")).toBe(true);
      expect(searchByPhone.body.companies.some((c: Company) => c.phone === "5511900000000")).toBe(true);
    });
  });
});
