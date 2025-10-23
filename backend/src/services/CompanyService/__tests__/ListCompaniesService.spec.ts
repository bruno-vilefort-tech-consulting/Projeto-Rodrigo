import ListCompaniesService from "../ListCompaniesService";
import Company from "../../../models/Company";
import Plan from "../../../models/Plan";
import { Op } from "sequelize";

// Mock dos modelos
jest.mock("../../../models/Company");
jest.mock("../../../models/Plan");

const MockCompany = Company as jest.Mocked<typeof Company>;

describe("ListCompaniesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Filtro de busca", () => {
    it("deve retornar todas as companies quando searchParam está vazio", async () => {
      const mockCompanies = [
        { id: 1, name: "Company A", email: "a@test.com", document: "111", phone: "1111" },
        { id: 2, name: "Company B", email: "b@test.com", document: "222", phone: "2222" }
      ];

      MockCompany.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockCompanies as any
      });

      const result = await ListCompaniesService({
        searchParam: "",
        pageNumber: "1"
      });

      expect(result.companies).toHaveLength(2);
      expect(result.count).toBe(2);
      expect(result.hasMore).toBe(false);

      // Verifica que whereClause está vazio
      expect(MockCompany.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {}
        })
      );
    });

    it("deve retornar todas as companies quando searchParam é undefined", async () => {
      const mockCompanies = [
        { id: 1, name: "Company A", email: "a@test.com", document: "111", phone: "1111" }
      ];

      MockCompany.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockCompanies as any
      });

      const result = await ListCompaniesService({
        pageNumber: "1"
      });

      expect(result.companies).toHaveLength(1);

      // Verifica que whereClause está vazio (retrocompatibilidade)
      expect(MockCompany.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {}
        })
      );
    });

    it("deve filtrar companies por name (case-insensitive)", async () => {
      const mockCompanies = [
        { id: 1, name: "ACME Corporation", email: "acme@test.com", document: "123", phone: "1234" }
      ];

      MockCompany.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockCompanies as any
      });

      const result = await ListCompaniesService({
        searchParam: "acme",
        pageNumber: "1"
      });

      expect(result.companies).toHaveLength(1);
      expect(result.count).toBe(1);

      // Verifica que whereClause tem Op.or com Op.iLike
      expect(MockCompany.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            [Op.or]: expect.arrayContaining([
              { name: { [Op.iLike]: "%acme%" } },
              { email: { [Op.iLike]: "%acme%" } },
              { document: { [Op.iLike]: "%acme%" } },
              { phone: { [Op.iLike]: "%acme%" } }
            ])
          })
        })
      );
    });

    it("deve filtrar companies por email", async () => {
      const mockCompanies = [
        { id: 1, name: "Test Company", email: "john@example.com", document: "456", phone: "5678" }
      ];

      MockCompany.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockCompanies as any
      });

      const result = await ListCompaniesService({
        searchParam: "john@example",
        pageNumber: "1"
      });

      expect(result.companies).toHaveLength(1);

      // Verifica que whereClause inclui filtro por email
      expect(MockCompany.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            [Op.or]: expect.arrayContaining([
              { email: { [Op.iLike]: "%john@example%" } }
            ])
          })
        })
      );
    });

    it("deve filtrar companies por document", async () => {
      const mockCompanies = [
        { id: 1, name: "Doc Company", email: "doc@test.com", document: "12345678901", phone: "9999" }
      ];

      MockCompany.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockCompanies as any
      });

      const result = await ListCompaniesService({
        searchParam: "123456",
        pageNumber: "1"
      });

      expect(result.companies).toHaveLength(1);

      // Verifica que whereClause inclui filtro por document
      expect(MockCompany.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            [Op.or]: expect.arrayContaining([
              { document: { [Op.iLike]: "%123456%" } }
            ])
          })
        })
      );
    });

    it("deve filtrar companies por phone", async () => {
      const mockCompanies = [
        { id: 1, name: "Phone Company", email: "phone@test.com", document: "789", phone: "5511999998888" }
      ];

      MockCompany.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockCompanies as any
      });

      const result = await ListCompaniesService({
        searchParam: "5511",
        pageNumber: "1"
      });

      expect(result.companies).toHaveLength(1);

      // Verifica que whereClause inclui filtro por phone
      expect(MockCompany.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            [Op.or]: expect.arrayContaining([
              { phone: { [Op.iLike]: "%5511%" } }
            ])
          })
        })
      );
    });

    it("deve fazer trim no searchParam para evitar espaços desnecessários", async () => {
      const mockCompanies = [
        { id: 1, name: "Trimmed Company", email: "trim@test.com", document: "999", phone: "8888" }
      ];

      MockCompany.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockCompanies as any
      });

      const result = await ListCompaniesService({
        searchParam: "   trimmed   ",
        pageNumber: "1"
      });

      expect(result.companies).toHaveLength(1);

      // Verifica que trimmed foi aplicado
      expect(MockCompany.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            [Op.or]: expect.arrayContaining([
              { name: { [Op.iLike]: "%trimmed%" } }
            ])
          })
        })
      );
    });

    it("deve retornar lista vazia quando nenhuma company corresponde ao filtro", async () => {
      MockCompany.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: []
      });

      const result = await ListCompaniesService({
        searchParam: "nonexistent",
        pageNumber: "1"
      });

      expect(result.companies).toHaveLength(0);
      expect(result.count).toBe(0);
      expect(result.hasMore).toBe(false);
    });
  });

  describe("Paginação", () => {
    it("deve respeitar paginação com pageNumber=1", async () => {
      const mockCompanies = Array(20).fill(null).map((_, i) => ({
        id: i + 1,
        name: `Company ${i + 1}`,
        email: `company${i + 1}@test.com`,
        document: `${i + 1}`,
        phone: `${i + 1}`
      }));

      MockCompany.findAndCountAll.mockResolvedValue({
        count: 50,
        rows: mockCompanies as any
      });

      const result = await ListCompaniesService({
        searchParam: "",
        pageNumber: "1"
      });

      expect(result.companies).toHaveLength(20);
      expect(result.count).toBe(50);
      expect(result.hasMore).toBe(true);

      // Verifica offset e limit corretos
      expect(MockCompany.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          offset: 0,
          limit: 20
        })
      );
    });

    it("deve respeitar paginação com pageNumber=2", async () => {
      const mockCompanies = Array(20).fill(null).map((_, i) => ({
        id: i + 21,
        name: `Company ${i + 21}`,
        email: `company${i + 21}@test.com`,
        document: `${i + 21}`,
        phone: `${i + 21}`
      }));

      MockCompany.findAndCountAll.mockResolvedValue({
        count: 50,
        rows: mockCompanies as any
      });

      const result = await ListCompaniesService({
        searchParam: "",
        pageNumber: "2"
      });

      expect(result.companies).toHaveLength(20);
      expect(result.count).toBe(50);
      expect(result.hasMore).toBe(true);

      // Verifica offset correto para página 2
      expect(MockCompany.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          offset: 20,
          limit: 20
        })
      );
    });

    it("deve indicar hasMore=false na última página", async () => {
      const mockCompanies = Array(10).fill(null).map((_, i) => ({
        id: i + 41,
        name: `Company ${i + 41}`,
        email: `company${i + 41}@test.com`,
        document: `${i + 41}`,
        phone: `${i + 41}`
      }));

      MockCompany.findAndCountAll.mockResolvedValue({
        count: 50,
        rows: mockCompanies as any
      });

      const result = await ListCompaniesService({
        searchParam: "",
        pageNumber: "3"
      });

      expect(result.companies).toHaveLength(10);
      expect(result.count).toBe(50);
      expect(result.hasMore).toBe(false); // 40 + 10 = 50, não há mais
    });

    it("deve combinar filtro e paginação corretamente", async () => {
      const mockCompanies = Array(20).fill(null).map((_, i) => ({
        id: i + 1,
        name: `Test Company ${i + 1}`,
        email: `test${i + 1}@test.com`,
        document: `test${i + 1}`,
        phone: `test${i + 1}`
      }));

      MockCompany.findAndCountAll.mockResolvedValue({
        count: 35,
        rows: mockCompanies as any
      });

      const result = await ListCompaniesService({
        searchParam: "test",
        pageNumber: "1"
      });

      expect(result.companies).toHaveLength(20);
      expect(result.count).toBe(35);
      expect(result.hasMore).toBe(true);

      // Verifica que filtro e paginação foram aplicados
      expect(MockCompany.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            [Op.or]: expect.any(Array)
          }),
          offset: 0,
          limit: 20
        })
      );
    });
  });

  describe("Ordenação e includes", () => {
    it("deve incluir Plan association", async () => {
      const mockCompanies = [
        {
          id: 1,
          name: "Company With Plan",
          email: "plan@test.com",
          document: "111",
          phone: "2222",
          plan: { name: "Premium Plan" }
        }
      ];

      MockCompany.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockCompanies as any
      });

      const result = await ListCompaniesService({
        searchParam: "",
        pageNumber: "1"
      });

      expect(result.companies).toHaveLength(1);

      // Verifica include do Plan
      expect(MockCompany.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: [
            {
              model: Plan,
              as: "plan",
              attributes: ["name"]
            }
          ]
        })
      );
    });

    it("deve ordenar por name ASC", async () => {
      const mockCompanies = [
        { id: 1, name: "A Company", email: "a@test.com", document: "1", phone: "1" },
        { id: 2, name: "B Company", email: "b@test.com", document: "2", phone: "2" }
      ];

      MockCompany.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: mockCompanies as any
      });

      const result = await ListCompaniesService({
        searchParam: "",
        pageNumber: "1"
      });

      expect(result.companies).toHaveLength(2);

      // Verifica ordenação
      expect(MockCompany.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          order: [["name", "ASC"]]
        })
      );
    });
  });

  describe("Retrocompatibilidade", () => {
    it("deve manter comportamento atual quando searchParam não é fornecido", async () => {
      const mockCompanies = [
        { id: 1, name: "Legacy Company", email: "legacy@test.com", document: "999", phone: "9999" }
      ];

      MockCompany.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockCompanies as any
      });

      // Chamada sem searchParam (comportamento antigo)
      const result = await ListCompaniesService({
        pageNumber: "1"
      });

      expect(result.companies).toHaveLength(1);

      // Verifica que whereClause está vazio (comportamento original)
      expect(MockCompany.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {}
        })
      );
    });

    it("deve tratar searchParam como string vazia quando for apenas espaços", async () => {
      const mockCompanies = [
        { id: 1, name: "All Companies", email: "all@test.com", document: "777", phone: "7777" }
      ];

      MockCompany.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockCompanies as any
      });

      const result = await ListCompaniesService({
        searchParam: "   ",
        pageNumber: "1"
      });

      expect(result.companies).toHaveLength(1);

      // Verifica que whereClause está vazio (trim resultou em string vazia)
      expect(MockCompany.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {}
        })
      );
    });
  });

  describe("Tratamento de erros", () => {
    it("deve propagar erro do banco de dados", async () => {
      const dbError = new Error("Database connection failed");
      MockCompany.findAndCountAll.mockRejectedValue(dbError);

      await expect(
        ListCompaniesService({
          searchParam: "test",
          pageNumber: "1"
        })
      ).rejects.toThrow("Database connection failed");
    });
  });
});
