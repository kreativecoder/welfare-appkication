"use strict";
module.exports = (sequelize, DataTypes) => {
  const item = sequelize.define(
    "item",
    {
      img_url: DataTypes.STRING,

      added_by: {
        type: DataTypes.INTEGER
      },
      unit: {
        type: DataTypes.INTEGER
      },
      unit_amount: {
        type: DataTypes.DECIMAL
      },
      total_amount: {
        type: DataTypes.DECIMAL
      },
      quantity_available: {
        type: DataTypes.INTEGER
      },
      profit: {
        type: DataTypes.STRING
      },
      name: {
        type: DataTypes.STRING
      },
      description: {
        type: DataTypes.STRING
      },
      selling_price: {
        type: DataTypes.STRING
      },
    
      status: {
        type: DataTypes.STRING,
        defaultValue: "Available"
      }
    },
    {}
  );
  item.associate = function(models) {
    // associations can be defined here
    item.belongsTo(models.user, {
      foreignKey: 'added_by'
    });
  };
  return item;
};
