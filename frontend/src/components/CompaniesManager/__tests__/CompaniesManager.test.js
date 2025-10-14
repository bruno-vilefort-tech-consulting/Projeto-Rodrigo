import React from "react";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import CompaniesManager from "../index";
import useCompanies from "../../../hooks/useCompanies";
import usePlans from "../../../hooks/usePlans";
import { toast } from "react-toastify";

// Mocks
jest.mock("../../../hooks/useCompanies");
jest.mock("../../../hooks/usePlans");
jest.mock("react-toastify");
jest.mock("../../../translate/i18n", () => ({
  i18n: {
    t: (key) => {
      const translations = {
        "compaies.searchPlaceholder": "Buscar empresas...",
        "compaies.clearSearch": "Limpar busca",
        "compaies.searchLabel": "Campo de busca de empresas",
        "compaies.table.name": "Nome",
        "compaies.table.email": "Email",
        "compaies.table.phone": "Telefone",
        "compaies.table.plan": "Plano",
        "compaies.table.value": "Valor",
        "compaies.table.active": "Ativo",
        "compaies.table.createdAt": "Criado em",
        "compaies.table.dueDate": "Vencimento",
        "compaies.table.lastLogin": "Último Login",
        "compaies.table.yes": "Sim",
        "compaies.table.no": "Não",
        "compaies.table.document": "Documento",
        "compaies.table.clear": "Limpar",
        "compaies.table.delete": "Excluir",
        "compaies.table.save": "Salvar",
        "compaies.table.password": "Senha",
        "compaies.table.recurrence": "Recorrência",
        "compaies.table.monthly": "Mensal",
        "compaies.table.bimonthly": "Bimestral",
        "compaies.table.quarterly": "Trimestral",
        "compaies.table.semester": "Semestral",
        "compaies.table.yearly": "Anual",
        "settings.managers.common.yes": "Sim",
        "settings.managers.common.no": "Não",
        "settings.toasts.recordsLoadError": "Erro ao carregar registros",
        "settings.toasts.operationSuccess": "Operação realizada com sucesso",
        "settings.toasts.companyOperationError": "Erro ao realizar operação",
        "settings.toasts.operationDeleteError": "Erro ao excluir registro",
        "settings.modals.deleteTitle": "Confirmar exclusão",
        "settings.modals.deleteConfirmation": "Tem certeza que deseja excluir?"
      };
      return translations[key] || key;
    }
  }
}));

jest.mock("../../../context/Currency/CurrencyContext", () => ({
  useCurrencyContext: () => ({
    formatCurrency: (value) => `R$ ${value.toFixed(2)}`,
    currency: "BRL"
  })
}));

jest.mock("../../../hooks/useDate", () => ({
  useDate: () => ({
    dateToClient: (date) => date ? new Date(date).toLocaleDateString("pt-BR") : "-",
    datetimeToClient: (date) => date ? new Date(date).toLocaleString("pt-BR") : "-"
  })
}));

/**
 * Testes de Componente: CompaniesManager - SearchBar Feature
 *
 * Valida:
 * - Renderização condicional baseada em feature flag
 * - Filtro client-side usando useMemo
 * - Case-insensitive search
 * - Busca em múltiplos campos (name, email, document, phone)
 * - Funcionalidade de limpar busca
 * - Acessibilidade (aria-labels, keyboard navigation)
 * - Integração com tabela (filteredRecords)
 */

describe("CompaniesManager - SearchBar Feature", () => {
  const mockCompanies = [
    {
      id: 1,
      name: "ACME Corporation",
      email: "contact@acme.com",
      document: "12345678000199",
      phone: "5511999999999",
      status: true,
      planId: 1,
      plan: { name: "Premium", amount: 99.90 },
      createdAt: "2024-01-01",
      dueDate: "2025-01-01",
      recurrence: "MENSAL",
      lastLogin: null
    },
    {
      id: 2,
      name: "TechStart Innovations",
      email: "info@techstart.com",
      document: "98765432000188",
      phone: "5511988888888",
      status: true,
      planId: 1,
      plan: { name: "Basic", amount: 49.90 },
      createdAt: "2024-02-01",
      dueDate: "2025-02-01",
      recurrence: "MENSAL",
      lastLogin: "2024-10-13T10:00:00"
    },
    {
      id: 3,
      name: "Consultech Solutions",
      email: "hello@consultech.com",
      document: "55555555000155",
      phone: "5511977777777",
      status: false,
      planId: 2,
      plan: { name: "Enterprise", amount: 199.90 },
      createdAt: "2024-03-01",
      dueDate: "2025-03-01",
      recurrence: "ANUAL",
      lastLogin: "2024-10-12T15:30:00"
    }
  ];

  const mockPlans = [
    { id: 1, name: "Premium", amount: 99.90 },
    { id: 2, name: "Basic", amount: 49.90 }
  ];

  const mockUseCompanies = {
    list: jest.fn().mockResolvedValue(mockCompanies),
    save: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    remove: jest.fn().mockResolvedValue({})
  };

  const mockUsePlans = {
    list: jest.fn().mockResolvedValue(mockPlans)
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCompanies.mockReturnValue(mockUseCompanies);
    usePlans.mockReturnValue(mockUsePlans);
    process.env.REACT_APP_FEATURE_COMPANY_SEARCH = "enabled";
  });

  describe("Feature Flag - Renderização Condicional", () => {
    it("deve renderizar SearchBar quando feature flag está enabled", async () => {
      process.env.REACT_APP_FEATURE_COMPANY_SEARCH = "enabled";

      render(<CompaniesManager />);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText("Buscar empresas...");
        expect(searchInput).toBeInTheDocument();
      });
    });

    it("deve renderizar SearchBar quando feature flag não está definido (padrão enabled)", async () => {
      delete process.env.REACT_APP_FEATURE_COMPANY_SEARCH;

      render(<CompaniesManager />);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText("Buscar empresas...");
        expect(searchInput).toBeInTheDocument();
      });
    });

    it("NÃO deve renderizar SearchBar quando feature flag está false", async () => {
      process.env.REACT_APP_FEATURE_COMPANY_SEARCH = "false";

      render(<CompaniesManager />);

      await waitFor(() => {
        // Aguardar carregamento das companies
        expect(screen.getByText("ACME Corporation")).toBeInTheDocument();
      });

      const searchInput = screen.queryByPlaceholderText("Buscar empresas...");
      expect(searchInput).not.toBeInTheDocument();
    });

    it("deve manter funcionalidade da tabela mesmo sem SearchBar", async () => {
      process.env.REACT_APP_FEATURE_COMPANY_SEARCH = "false";

      render(<CompaniesManager />);

      await waitFor(() => {
        expect(screen.getByText("ACME Corporation")).toBeInTheDocument();
        expect(screen.getByText("TechStart Innovations")).toBeInTheDocument();
        expect(screen.getByText("Consultech Solutions")).toBeInTheDocument();
      });
    });
  });

  describe("SearchBar - Filtro por Nome", () => {
    it("deve filtrar companies por nome (minúsculas)", async () => {
      render(<CompaniesManager />);

      await waitFor(() => screen.getByPlaceholderText("Buscar empresas..."));

      const searchInput = screen.getByPlaceholderText("Buscar empresas...");
      fireEvent.change(searchInput, { target: { value: "acme" } });

      await waitFor(() => {
        expect(screen.getByText("ACME Corporation")).toBeInTheDocument();
        expect(screen.queryByText("TechStart Innovations")).not.toBeInTheDocument();
        expect(screen.queryByText("Consultech Solutions")).not.toBeInTheDocument();
      });
    });

    it("deve filtrar companies por nome (maiúsculas)", async () => {
      render(<CompaniesManager />);

      await waitFor(() => screen.getByPlaceholderText("Buscar empresas..."));

      const searchInput = screen.getByPlaceholderText("Buscar empresas...");
      fireEvent.change(searchInput, { target: { value: "TECHSTART" } });

      await waitFor(() => {
        expect(screen.getByText("TechStart Innovations")).toBeInTheDocument();
        expect(screen.queryByText("ACME Corporation")).not.toBeInTheDocument();
      });
    });

    it("deve filtrar companies por parte do nome", async () => {
      render(<CompaniesManager />);

      await waitFor(() => screen.getByPlaceholderText("Buscar empresas..."));

      const searchInput = screen.getByPlaceholderText("Buscar empresas...");
      fireEvent.change(searchInput, { target: { value: "tech" } });

      await waitFor(() => {
        expect(screen.getByText("TechStart Innovations")).toBeInTheDocument();
        expect(screen.getByText("Consultech Solutions")).toBeInTheDocument();
        expect(screen.queryByText("ACME Corporation")).not.toBeInTheDocument();
      });
    });

    it("deve ser case-insensitive (misturando maiúsculas e minúsculas)", async () => {
      render(<CompaniesManager />);

      await waitFor(() => screen.getByPlaceholderText("Buscar empresas..."));

      const searchInput = screen.getByPlaceholderText("Buscar empresas...");

      // Testar "CoNsUl"
      fireEvent.change(searchInput, { target: { value: "CoNsUl" } });

      await waitFor(() => {
        expect(screen.getByText("Consultech Solutions")).toBeInTheDocument();
        expect(screen.queryByText("ACME Corporation")).not.toBeInTheDocument();
      });
    });
  });

  describe("SearchBar - Filtro por Email", () => {
    it("deve filtrar companies por email completo", async () => {
      render(<CompaniesManager />);

      await waitFor(() => screen.getByPlaceholderText("Buscar empresas..."));

      const searchInput = screen.getByPlaceholderText("Buscar empresas...");
      fireEvent.change(searchInput, { target: { value: "contact@acme.com" } });

      await waitFor(() => {
        expect(screen.getByText("ACME Corporation")).toBeInTheDocument();
        expect(screen.queryByText("TechStart Innovations")).not.toBeInTheDocument();
      });
    });

    it("deve filtrar companies por parte do email", async () => {
      render(<CompaniesManager />);

      await waitFor(() => screen.getByPlaceholderText("Buscar empresas..."));

      const searchInput = screen.getByPlaceholderText("Buscar empresas...");
      fireEvent.change(searchInput, { target: { value: "@techstart" } });

      await waitFor(() => {
        expect(screen.getByText("TechStart Innovations")).toBeInTheDocument();
        expect(screen.queryByText("ACME Corporation")).not.toBeInTheDocument();
      });
    });

    it("deve filtrar companies por domínio de email", async () => {
      render(<CompaniesManager />);

      await waitFor(() => screen.getByPlaceholderText("Buscar empresas..."));

      const searchInput = screen.getByPlaceholderText("Buscar empresas...");
      fireEvent.change(searchInput, { target: { value: "@consultech.com" } });

      await waitFor(() => {
        expect(screen.getByText("Consultech Solutions")).toBeInTheDocument();
        expect(screen.queryByText("ACME Corporation")).not.toBeInTheDocument();
      });
    });
  });

  describe("SearchBar - Filtro por Documento", () => {
    it("deve filtrar companies por documento completo", async () => {
      render(<CompaniesManager />);

      await waitFor(() => screen.getByPlaceholderText("Buscar empresas..."));

      const searchInput = screen.getByPlaceholderText("Buscar empresas...");
      fireEvent.change(searchInput, { target: { value: "12345678000199" } });

      await waitFor(() => {
        expect(screen.getByText("ACME Corporation")).toBeInTheDocument();
        expect(screen.queryByText("TechStart Innovations")).not.toBeInTheDocument();
      });
    });

    it("deve filtrar companies por parte do documento", async () => {
      render(<CompaniesManager />);

      await waitFor(() => screen.getByPlaceholderText("Buscar empresas..."));

      const searchInput = screen.getByPlaceholderText("Buscar empresas...");
      fireEvent.change(searchInput, { target: { value: "987654" } });

      await waitFor(() => {
        expect(screen.getByText("TechStart Innovations")).toBeInTheDocument();
        expect(screen.queryByText("ACME Corporation")).not.toBeInTheDocument();
      });
    });
  });

  describe("SearchBar - Filtro por Telefone", () => {
    it("deve filtrar companies por telefone completo", async () => {
      render(<CompaniesManager />);

      await waitFor(() => screen.getByPlaceholderText("Buscar empresas..."));

      const searchInput = screen.getByPlaceholderText("Buscar empresas...");
      fireEvent.change(searchInput, { target: { value: "5511999999999" } });

      await waitFor(() => {
        expect(screen.getByText("ACME Corporation")).toBeInTheDocument();
        expect(screen.queryByText("TechStart Innovations")).not.toBeInTheDocument();
      });
    });

    it("deve filtrar companies por parte do telefone", async () => {
      render(<CompaniesManager />);

      await waitFor(() => screen.getByPlaceholderText("Buscar empresas..."));

      const searchInput = screen.getByPlaceholderText("Buscar empresas...");
      fireEvent.change(searchInput, { target: { value: "5511988" } });

      await waitFor(() => {
        expect(screen.getByText("TechStart Innovations")).toBeInTheDocument();
        expect(screen.queryByText("ACME Corporation")).not.toBeInTheDocument();
      });
    });
  });

  describe("SearchBar - Funcionalidade de Limpar", () => {
    it("deve mostrar botão de limpar apenas quando há texto", async () => {
      render(<CompaniesManager />);

      await waitFor(() => screen.getByPlaceholderText("Buscar empresas..."));

      const searchInput = screen.getByPlaceholderText("Buscar empresas...");

      // Inicialmente, não deve ter botão de limpar
      expect(screen.queryByLabelText("Limpar busca")).not.toBeInTheDocument();

      // Digitar texto
      fireEvent.change(searchInput, { target: { value: "acme" } });

      // Agora deve aparecer o botão
      await waitFor(() => {
        expect(screen.getByLabelText("Limpar busca")).toBeInTheDocument();
      });
    });

    it("deve limpar o campo ao clicar no botão X", async () => {
      render(<CompaniesManager />);

      await waitFor(() => screen.getByPlaceholderText("Buscar empresas..."));

      const searchInput = screen.getByPlaceholderText("Buscar empresas...");
      fireEvent.change(searchInput, { target: { value: "acme" } });

      await waitFor(() => {
        expect(screen.getByText("ACME Corporation")).toBeInTheDocument();
        expect(screen.queryByText("TechStart Innovations")).not.toBeInTheDocument();
      });

      const clearButton = screen.getByLabelText("Limpar busca");
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(searchInput.value).toBe("");
        // Todas companies devem aparecer novamente
        expect(screen.getByText("ACME Corporation")).toBeInTheDocument();
        expect(screen.getByText("TechStart Innovations")).toBeInTheDocument();
        expect(screen.getByText("Consultech Solutions")).toBeInTheDocument();
      });
    });
  });

  describe("SearchBar - Empty State", () => {
    it("deve mostrar tabela vazia quando nenhuma company corresponde ao filtro", async () => {
      render(<CompaniesManager />);

      await waitFor(() => screen.getByPlaceholderText("Buscar empresas..."));

      const searchInput = screen.getByPlaceholderText("Buscar empresas...");
      fireEvent.change(searchInput, { target: { value: "nonexistent12345" } });

      await waitFor(() => {
        expect(screen.queryByText("ACME Corporation")).not.toBeInTheDocument();
        expect(screen.queryByText("TechStart Innovations")).not.toBeInTheDocument();
        expect(screen.queryByText("Consultech Solutions")).not.toBeInTheDocument();
      });

      // Tabela deve estar vazia mas renderizada
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();
    });

    it("deve mostrar todas companies quando o campo está vazio", async () => {
      render(<CompaniesManager />);

      await waitFor(() => screen.getByPlaceholderText("Buscar empresas..."));

      const searchInput = screen.getByPlaceholderText("Buscar empresas...");

      // Campo vazio deve mostrar todas
      expect(searchInput.value).toBe("");

      await waitFor(() => {
        expect(screen.getByText("ACME Corporation")).toBeInTheDocument();
        expect(screen.getByText("TechStart Innovations")).toBeInTheDocument();
        expect(screen.getByText("Consultech Solutions")).toBeInTheDocument();
      });
    });
  });

  describe("SearchBar - Acessibilidade", () => {
    it("deve ter aria-label correto no campo de busca", async () => {
      render(<CompaniesManager />);

      await waitFor(() => screen.getByPlaceholderText("Buscar empresas..."));

      const searchInput = screen.getByLabelText("Campo de busca de empresas");
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute("type", "search");
    });

    it("deve ter ícone de lupa visível", async () => {
      render(<CompaniesManager />);

      await waitFor(() => screen.getByPlaceholderText("Buscar empresas..."));

      // Ícone de busca deve estar presente
      const searchIcon = screen.getByTestId("SearchIcon") || document.querySelector('[data-testid="SearchIcon"]');
      // Material-UI renderiza o ícone, verificamos que o input tem o adornment
      const searchInput = screen.getByPlaceholderText("Buscar empresas...");
      expect(searchInput).toBeInTheDocument();
    });

    it("botão de limpar deve ter aria-label", async () => {
      render(<CompaniesManager />);

      await waitFor(() => screen.getByPlaceholderText("Buscar empresas..."));

      const searchInput = screen.getByPlaceholderText("Buscar empresas...");
      fireEvent.change(searchInput, { target: { value: "test" } });

      await waitFor(() => {
        const clearButton = screen.getByLabelText("Limpar busca");
        expect(clearButton).toBeInTheDocument();
        expect(clearButton).toHaveAttribute("aria-label", "Limpar busca");
      });
    });
  });

  describe("SearchBar - Performance e Otimização", () => {
    it("deve usar useMemo para otimizar filtro (não renderiza desnecessariamente)", async () => {
      const { rerender } = render(<CompaniesManager />);

      await waitFor(() => screen.getByPlaceholderText("Buscar empresas..."));

      const searchInput = screen.getByPlaceholderText("Buscar empresas...");
      fireEvent.change(searchInput, { target: { value: "acme" } });

      await waitFor(() => {
        expect(screen.getByText("ACME Corporation")).toBeInTheDocument();
      });

      // Rerender não deve causar chamadas desnecessárias
      rerender(<CompaniesManager />);

      await waitFor(() => {
        expect(screen.getByText("ACME Corporation")).toBeInTheDocument();
      });

      // list deve ter sido chamado apenas uma vez no início
      expect(mockUseCompanies.list).toHaveBeenCalledTimes(1);
    });

    it("deve atualizar filtro em tempo real durante digitação", async () => {
      render(<CompaniesManager />);

      await waitFor(() => screen.getByPlaceholderText("Buscar empresas..."));

      const searchInput = screen.getByPlaceholderText("Buscar empresas...");

      // Digitar "a" - deve mostrar ACME
      fireEvent.change(searchInput, { target: { value: "a" } });
      await waitFor(() => {
        expect(screen.getByText("ACME Corporation")).toBeInTheDocument();
      });

      // Digitar "ac" - ainda deve mostrar ACME
      fireEvent.change(searchInput, { target: { value: "ac" } });
      await waitFor(() => {
        expect(screen.getByText("ACME Corporation")).toBeInTheDocument();
      });

      // Digitar "tech" - deve mudar para TechStart e Consultech
      fireEvent.change(searchInput, { target: { value: "tech" } });
      await waitFor(() => {
        expect(screen.getByText("TechStart Innovations")).toBeInTheDocument();
        expect(screen.queryByText("ACME Corporation")).not.toBeInTheDocument();
      });
    });
  });

  describe("SearchBar - Integração com Outras Funcionalidades", () => {
    it("deve manter filtro ao editar uma company", async () => {
      render(<CompaniesManager />);

      await waitFor(() => screen.getByPlaceholderText("Buscar empresas..."));

      const searchInput = screen.getByPlaceholderText("Buscar empresas...");
      fireEvent.change(searchInput, { target: { value: "acme" } });

      await waitFor(() => {
        expect(screen.getByText("ACME Corporation")).toBeInTheDocument();
      });

      // Clicar em editar (ícone de edit)
      const editButtons = screen.getAllByLabelText("delete"); // Material-UI usa "delete" para o aria-label
      fireEvent.click(editButtons[0]);

      // Filtro deve permanecer
      expect(searchInput.value).toBe("acme");
    });

    it("filtro não deve interferir com a criação de nova company", async () => {
      render(<CompaniesManager />);

      await waitFor(() => screen.getByPlaceholderText("Buscar empresas..."));

      const searchInput = screen.getByPlaceholderText("Buscar empresas...");
      fireEvent.change(searchInput, { target: { value: "acme" } });

      await waitFor(() => {
        expect(screen.getByText("ACME Corporation")).toBeInTheDocument();
      });

      // Formulário de criação deve estar disponível
      const nameInput = screen.getByLabelText("Nome");
      expect(nameInput).toBeInTheDocument();

      // Preencher e submeter não deve ser afetado pelo filtro
      fireEvent.change(nameInput, { target: { value: "New Company" } });
      expect(nameInput.value).toBe("New Company");
    });
  });

  describe("SearchBar - Edge Cases", () => {
    it("deve tratar null values nos campos de company", async () => {
      const companiesWithNulls = [
        {
          id: 1,
          name: "Company With Nulls",
          email: null,
          document: null,
          phone: null,
          status: true,
          planId: 1,
          plan: { name: "Basic", amount: 49.90 },
          createdAt: "2024-01-01",
          dueDate: null,
          recurrence: null,
          lastLogin: null
        }
      ];

      mockUseCompanies.list.mockResolvedValueOnce(companiesWithNulls);

      render(<CompaniesManager />);

      await waitFor(() => screen.getByPlaceholderText("Buscar empresas..."));

      const searchInput = screen.getByPlaceholderText("Buscar empresas...");

      // Buscar por algo que não existe não deve gerar erro
      fireEvent.change(searchInput, { target: { value: "test" } });

      await waitFor(() => {
        // Não deve crashar, deve funcionar normalmente
        expect(screen.queryByText("Company With Nulls")).not.toBeInTheDocument();
      });
    });

    it("deve tratar caracteres especiais na busca", async () => {
      render(<CompaniesManager />);

      await waitFor(() => screen.getByPlaceholderText("Buscar empresas..."));

      const searchInput = screen.getByPlaceholderText("Buscar empresas...");

      // Buscar por email com @
      fireEvent.change(searchInput, { target: { value: "@acme.com" } });

      await waitFor(() => {
        expect(screen.getByText("ACME Corporation")).toBeInTheDocument();
      });
    });

    it("deve funcionar com lista de companies vazia", async () => {
      mockUseCompanies.list.mockResolvedValueOnce([]);

      render(<CompaniesManager />);

      await waitFor(() => screen.getByPlaceholderText("Buscar empresas..."));

      const searchInput = screen.getByPlaceholderText("Buscar empresas...");
      fireEvent.change(searchInput, { target: { value: "test" } });

      // Não deve crashar
      await waitFor(() => {
        expect(searchInput.value).toBe("test");
      });
    });
  });
});
