import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("FlowCampaigns", "matchType", {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "exact"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("FlowCampaigns", "matchType");
  }
};
