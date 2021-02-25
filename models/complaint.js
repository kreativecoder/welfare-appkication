'use strict';
module.exports = (sequelize, DataTypes) => {
  const complaint = sequelize.define('complaint', {
    message: DataTypes.STRING,
    user_id: {
      type: DataTypes.INTEGER
    },
    message: {
      type: DataTypes.STRING
    },
    addressed_by: {
      type: DataTypes.INTEGER
    }
  }, {});
  complaint.associate = function(models) {
    // associations can be defined here
    complaint.belongsTo(models.user, {
      as: 'complainant',
      foreignKey: 'user_id'
    });
    complaint.belongsTo(models.user, {
      as: 'treeted_by',
      foreignKey: 'addressed_by'
    });
  };
  return complaint;
};