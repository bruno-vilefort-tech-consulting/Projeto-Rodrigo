import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Tickets", "closedAt", {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null
    });
  },
  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Tickets", "closedAt");
  }
};
