import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn("Tags", "timeLane", {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      allowNull: true
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn("Tags", "timeLane", {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true
    });
  }
};
