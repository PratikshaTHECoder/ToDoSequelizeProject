'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Task.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    task: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Completed', 'Incomplete'),
      allowNull: false,
      defaultValue: 'Incomplete'
    },
    isDeleted: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
    isTestData: {
      type: DataTypes.TINYINT,
      defaultValue: 0,
    },
  }, {
    sequelize,
    modelName: 'Task',
  });
  return Task;
};