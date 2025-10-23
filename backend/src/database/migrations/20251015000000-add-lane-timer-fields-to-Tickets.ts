import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Tickets", "laneTimerStartedAt", {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Data/hora quando o timer da lane foi iniciado (quando atendente enviou mensagem)"
      }),
      queryInterface.addColumn("Tickets", "laneNextMoveAt", {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Data/hora quando o ticket deve ser movido automaticamente para nextLaneId"
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Tickets", "laneTimerStartedAt"),
      queryInterface.removeColumn("Tickets", "laneNextMoveAt")
    ]);
  }
};
