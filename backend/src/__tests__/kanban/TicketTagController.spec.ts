import { Request, Response } from "express";
import { store, remove } from "../../controllers/TicketTagController";
import TicketTag from "../../models/TicketTag";
import Tag from "../../models/Tag";
import ShowTicketService from "../../services/TicketServices/ShowTicketService";
import { getIO } from "../../libs/socket";
import AppError from "../../errors/AppError";

// Mock dependencies
jest.mock("../../models/TicketTag");
jest.mock("../../models/Tag");
jest.mock("../../services/TicketServices/ShowTicketService");
jest.mock("../../libs/socket");

describe("TicketTagController - Multi-tenant Security", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockIO: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request
    mockRequest = {
      params: {
        ticketId: "123",
        tagId: "2"
      },
      user: {
        id: "1",
        companyId: 1,
        profile: "admin"
      }
    };

    // Mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // Mock Socket.IO
    mockIO = {
      of: jest.fn().mockReturnThis(),
      emit: jest.fn()
    };
    (getIO as jest.Mock).mockReturnValue(mockIO);
  });

  describe("PUT /ticket-tags/:ticketId/:tagId - store()", () => {
    it("should validate ticket belongs to company BEFORE creating tag", async () => {
      // Arrange
      const mockTicket = {
        id: 123,
        companyId: 1,
        tags: []
      };

      const mockTag = {
        id: 2,
        name: "Em Atendimento",
        kanban: 1,
        companyId: 1
      };

      (ShowTicketService as jest.Mock).mockResolvedValue(mockTicket);
      (Tag.findOne as jest.Mock).mockResolvedValue(mockTag);
      (TicketTag.create as jest.Mock).mockResolvedValue({
        ticketId: 123,
        tagId: 2
      });

      // Act
      await store(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(ShowTicketService).toHaveBeenCalledWith("123", 1);
      expect(ShowTicketService).toHaveBeenCalledBefore(TicketTag.create as jest.Mock);
    });

    it("should reject tag from another company", async () => {
      // Arrange
      const mockTicket = {
        id: 123,
        companyId: 1,
        tags: []
      };

      (ShowTicketService as jest.Mock).mockResolvedValue(mockTicket);
      (Tag.findOne as jest.Mock).mockResolvedValue(null); // Tag not found for company

      // Act
      await store(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(Tag.findOne).toHaveBeenCalledWith({
        where: {
          id: "2",
          kanban: 1,
          companyId: 1
        }
      });
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Tag não encontrada ou não é do tipo Kanban."
      });
      expect(TicketTag.create).not.toHaveBeenCalled();
    });

    it("should reject ticket from another company", async () => {
      // Arrange
      (ShowTicketService as jest.Mock).mockRejectedValue(
        new AppError("Não é possível consultar registros de outra empresa", 403)
      );

      // Act
      await store(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(ShowTicketService).toHaveBeenCalledWith("123", 1);
      expect(TicketTag.create).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });

    it("should use correct Socket.IO namespace pattern /workspace-{companyId}", async () => {
      // Arrange
      const mockTicket = {
        id: 123,
        companyId: 1,
        tags: [{ id: 2, name: "Em Atendimento" }]
      };

      const mockTag = {
        id: 2,
        name: "Em Atendimento",
        kanban: 1,
        companyId: 1
      };

      (ShowTicketService as jest.Mock).mockResolvedValue(mockTicket);
      (Tag.findOne as jest.Mock).mockResolvedValue(mockTag);
      (TicketTag.create as jest.Mock).mockResolvedValue({
        ticketId: 123,
        tagId: 2
      });

      // Act
      await store(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockIO.of).toHaveBeenCalledWith("/workspace-1");
      expect(mockIO.of).not.toHaveBeenCalledWith("1"); // Old incorrect pattern
      expect(mockIO.emit).toHaveBeenCalledWith("company-1-ticket", {
        action: "update",
        ticket: mockTicket
      });
    });

    it("should validate tag is of type Kanban (kanban=1)", async () => {
      // Arrange
      const mockTicket = {
        id: 123,
        companyId: 1,
        tags: []
      };

      (ShowTicketService as jest.Mock).mockResolvedValue(mockTicket);
      (Tag.findOne as jest.Mock).mockResolvedValue(null); // Non-Kanban tag

      // Act
      await store(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(Tag.findOne).toHaveBeenCalledWith({
        where: {
          id: "2",
          kanban: 1, // Must be Kanban type
          companyId: 1
        }
      });
      expect(TicketTag.create).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /ticket-tags/:ticketId - remove()", () => {
    it("should validate ticket belongs to company BEFORE removing tags", async () => {
      // Arrange
      const mockTicket = {
        id: 123,
        companyId: 1,
        tags: []
      };

      (ShowTicketService as jest.Mock).mockResolvedValue(mockTicket);
      (TicketTag.findAll as jest.Mock).mockResolvedValue([
        { ticketId: 123, tagId: 1 },
        { ticketId: 123, tagId: 2 }
      ]);
      (Tag.findAll as jest.Mock).mockResolvedValue([
        { id: 1, kanban: 1, companyId: 1 }
      ]);
      (TicketTag.destroy as jest.Mock).mockResolvedValue(1);

      // Act
      await remove(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(ShowTicketService).toHaveBeenCalledWith("123", 1);
      expect(ShowTicketService).toHaveBeenCalledBefore(TicketTag.findAll as jest.Mock);
    });

    it("should filter tags by companyId to prevent cross-tenant data leakage", async () => {
      // Arrange
      const mockTicket = {
        id: 123,
        companyId: 1,
        tags: []
      };

      (ShowTicketService as jest.Mock).mockResolvedValue(mockTicket);
      (TicketTag.findAll as jest.Mock).mockResolvedValue([
        { ticketId: 123, tagId: 1 },
        { ticketId: 123, tagId: 2 }
      ]);
      (Tag.findAll as jest.Mock).mockResolvedValue([
        { id: 1, kanban: 1, companyId: 1 }
      ]);
      (TicketTag.destroy as jest.Mock).mockResolvedValue(1);

      // Act
      await remove(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(Tag.findAll).toHaveBeenCalledWith({
        where: {
          id: [1, 2],
          kanban: 1,
          companyId: 1 // CRITICAL: Must filter by companyId
        }
      });
    });

    it("should only remove tags with kanban=1, preserve other tags", async () => {
      // Arrange
      const mockTicket = {
        id: 123,
        companyId: 1,
        tags: [
          { id: 1, kanban: 1, name: "Tag Kanban" },
          { id: 3, kanban: 0, name: "Tag Normal" }
        ]
      };

      (ShowTicketService as jest.Mock).mockResolvedValue(mockTicket);
      (TicketTag.findAll as jest.Mock).mockResolvedValue([
        { ticketId: 123, tagId: 1 },
        { ticketId: 123, tagId: 3 }
      ]);
      (Tag.findAll as jest.Mock).mockResolvedValue([
        { id: 1, kanban: 1, companyId: 1 } // Only Kanban tag
      ]);
      (TicketTag.destroy as jest.Mock).mockResolvedValue(1);

      // Act
      await remove(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(TicketTag.destroy).toHaveBeenCalledWith({
        where: {
          ticketId: "123",
          tagId: [1] // Only Kanban tags, not tagId 3
        }
      });
    });

    it("should use correct Socket.IO namespace pattern /workspace-{companyId}", async () => {
      // Arrange
      const mockTicket = {
        id: 123,
        companyId: 1,
        tags: []
      };

      (ShowTicketService as jest.Mock).mockResolvedValue(mockTicket);
      (TicketTag.findAll as jest.Mock).mockResolvedValue([]);
      (Tag.findAll as jest.Mock).mockResolvedValue([]);

      // Act
      await remove(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockIO.of).toHaveBeenCalledWith("/workspace-1");
      expect(mockIO.of).not.toHaveBeenCalledWith("1"); // Old incorrect pattern
    });

    it("should reject ticket from another company", async () => {
      // Arrange
      (ShowTicketService as jest.Mock).mockRejectedValue(
        new AppError("Não é possível consultar registros de outra empresa", 403)
      );

      // Act
      await remove(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(ShowTicketService).toHaveBeenCalledWith("123", 1);
      expect(TicketTag.findAll).not.toHaveBeenCalled();
      expect(TicketTag.destroy).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(403);
    });
  });
});
