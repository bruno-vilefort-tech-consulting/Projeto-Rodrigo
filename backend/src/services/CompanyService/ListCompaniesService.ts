import { Sequelize, Op } from "sequelize";
import Company from "../../models/Company";
import Plan from "../../models/Plan";

interface Request {
  searchParam?: string;
  pageNumber?: string;
}

interface Response {
  companies: Company[];
  count: number;
  hasMore: boolean;
}

/**
 * Lista empresas com suporte a busca e paginação
 *
 * @param searchParam - Termo de busca (name, email, document, phone) - case-insensitive
 * @param pageNumber - Número da página (padrão: "1")
 * @returns Lista de empresas, contador total e flag hasMore
 *
 * @example
 * // Sem filtro (retorna todas)
 * ListCompaniesService({ searchParam: "", pageNumber: "1" })
 *
 * // Com filtro
 * ListCompaniesService({ searchParam: "ACME", pageNumber: "1" })
 */
const ListCompaniesService = async ({
  searchParam = "",
  pageNumber = "1"
}: Request): Promise<Response> => {

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  // Trim searchParam para evitar espaços desnecessários
  const trimmedSearch = searchParam?.trim() || "";

  // Construir whereClause condicional para retrocompatibilidade
  const whereClause = trimmedSearch ? {
    [Op.or]: [
      { name: { [Op.iLike]: `%${trimmedSearch}%` } },
      { email: { [Op.iLike]: `%${trimmedSearch}%` } },
      { document: { [Op.iLike]: `%${trimmedSearch}%` } },
      { phone: { [Op.iLike]: `%${trimmedSearch}%` } }
    ]
  } : {};

  const { count, rows: companies } = await Company.findAndCountAll({
    where: whereClause,
    include: [{
      model: Plan,
      as: "plan",
      attributes: ["name"]
    }],
    limit,
    offset,
    order: [["name", "ASC"]]
  });

  const hasMore = count > offset + companies.length;

  return {
    companies,
    count,
    hasMore
  };
};

export default ListCompaniesService;
