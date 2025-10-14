import { QueryInterface } from "sequelize";
import { hash } from "bcryptjs";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.transaction(async t => {
      // Verifica se já existe um usuário com este email
      const userExists = await queryInterface.rawSelect('Users', {
        where: {
          email: 'admin@admin.com',
        },
      }, ['id']);

      if (!userExists) {
        // Cria nova empresa se não existir a padrão
        const companyExists = await queryInterface.rawSelect('Companies', {
          where: { id: 1 }
        }, ['id']);

        if (!companyExists) {
          // Primeiro verifica se existe o plano padrão
          const planExists = await queryInterface.rawSelect("Plans", {
            where: { id: 1 }
          }, ["id"]);

          if (!planExists) {
            await queryInterface.bulkInsert("Plans", [{
              id: 1,
              name: "Plano Super Admin",
              users: 999999,
              connections: 999999,
              queues: 999999,
              amount: 0,
              useWhatsapp: true,
              useFacebook: true,
              useInstagram: true,
              useCampaigns: true,
              useSchedules: true,
              useInternalChat: true,
              useExternalApi: true,
              useKanban: true,
              useOpenAi: true,
              useIntegrations: true,
              trial: false,
              trialDays: 0,
              recurrence: "MENSAL",
              isPublic: true,
              createdAt: new Date(),
              updatedAt: new Date()
            }], { transaction: t });
          }

          await queryInterface.bulkInsert("Companies", [{
            id: 1,
            name: "Super Admin Company",
            planId: 1,
            dueDate: "2999-12-31",
            status: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }], { transaction: t });
        }

        // Cria o usuário super admin
        const passwordHash = await hash("123456", 8);
        await queryInterface.bulkInsert('Users', [{
          name: "Super Admin",
          email: "admin@admin.com",
          profile: "admin",
          passwordHash,
          companyId: 1,
          super: true,
          online: false,
          startWork: "00:00",
          endWork: "23:59",
          color: "#000000",
          allTicket: "enable",
          allowGroup: true,
          defaultTheme: "light",
          defaultMenu: "open",
          farewellMessage: "",
          allHistoric: "enabled",
          allUserChat: "enabled",
          userClosePendingTicket: "enabled",
          showDashboard: "enabled",
          canViewAllContacts: true,
          defaultTicketsManagerWidth: 550,
          allowRealTime: "enable",
          allowConnections: "enable",
          language: "pt-BR",
          createdAt: new Date(),
          updatedAt: new Date()
        }], { transaction: t });

        console.log("✅ Super Admin criado com sucesso!");
        console.log("📧 Email: admin@admin.com");
        console.log("🔑 Senha: 123456");
      } else {
        // Se o usuário já existe, atualiza para garantir que é super admin
        const passwordHash = await hash("123456", 8);
        await queryInterface.bulkUpdate('Users', {
          name: "Super Admin",
          profile: "admin",
          passwordHash,
          super: true,
          allTicket: "enable",
          allowGroup: true,
          allHistoric: "enabled",
          allUserChat: "enabled",
          userClosePendingTicket: "enabled",
          showDashboard: "enabled",
          canViewAllContacts: true,
          allowRealTime: "enable",
          allowConnections: "enable",
          updatedAt: new Date()
        }, {
          email: 'admin@admin.com'
        }, { transaction: t });

        console.log("✅ Super Admin atualizado com sucesso!");
        console.log("📧 Email: admin@admin.com");
        console.log("🔑 Senha: 123456");
      }
    });
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Users", {
      email: "admin@admin.com"
    });
  }
};