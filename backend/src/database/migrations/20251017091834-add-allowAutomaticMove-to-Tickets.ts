import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Tickets", "allowAutomaticMove", {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
      comment: "Flag para controlar se o ticket pode ser movido automaticamente pelo cron job. False quando cliente responde e vai para rollbackLane."
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Tickets", "allowAutomaticMove");
  }
};
