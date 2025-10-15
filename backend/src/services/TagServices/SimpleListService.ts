import { Op, Sequelize } from "sequelize";
import Tag from "../../models/Tag";
import Contact from "../../models/Contact";

interface Request {
  companyId: number;
  searchParam?: string;
  kanban?: number;
}

const ListService = async ({
  companyId,
  searchParam,
  kanban = 0
}: Request): Promise<Tag[]> => {
  let whereCondition = {};

  if (searchParam) {
    whereCondition = {
      [Op.or]: [
        { name: { [Op.like]: `%${searchParam}%` } },
        { color: { [Op.like]: `%${searchParam}%` } }
      ]
    };
  }

  try {
    console.log('🔍 SimpleListService - Iniciando query com:', { companyId, searchParam, kanban });

    const tags = await Tag.findAll({
      where: { ...whereCondition, companyId, kanban },
      order: [["name", "ASC"]],
      include: [
        {
          model: Contact,
          as: "contacts",
          attributes: [], // Não retornar colunas dos contatos, apenas fazer JOIN para COUNT
          through: {
            attributes: [] // Não trazer colunas de ContactTag
          }
        }
      ],
      attributes: [
        "id",
        "name",
        "color",
        "kanban",
        "companyId",
        "timeLane",
        "nextLaneId",
        "greetingMessageLane",
        "rollbackLaneId",
        "createdAt",
        "updatedAt",
        [Sequelize.fn("COUNT", Sequelize.col("contacts.id")), "contactsCount"]
      ],
      group: [
        "Tag.id",
        "Tag.name",
        "Tag.color",
        "Tag.kanban",
        "Tag.companyId",
        "Tag.timeLane",
        "Tag.nextLaneId",
        "Tag.greetingMessageLane",
        "Tag.rollbackLaneId",
        "Tag.createdAt",
        "Tag.updatedAt"
      ],
      subQuery: false
    });

    console.log('✅ SimpleListService - Query executada com sucesso. Tags encontradas:', tags.length);
    return tags;
  } catch (error) {
    console.error('❌ SimpleListService - ERRO NA QUERY:', {
      message: error.message,
      sql: error.sql,
      stack: error.stack,
      companyId,
      searchParam,
      kanban
    });
    throw error;
  }
};

export default ListService;
