"use strict";
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    "user",
    {
      firstname: { type: DataTypes.STRING, allowNull: false },
      lastname: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: {type: DataTypes.STRING, allowNull: false},
      dob: { type: DataTypes.DATEONLY },
      phone_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      address: { type: DataTypes.STRING },
      img_url: { type: DataTypes.STRING },
      role: { type: DataTypes.STRING, defaultValue: "user" },
      employed_as: { type: DataTypes.STRING },
      branch: { type: DataTypes.STRING },
      monthly_savings: { type: DataTypes.STRING },
      account_number: { type: DataTypes.STRING },
      bank_name: { type: DataTypes.STRING },
      status: { type: DataTypes.STRING, defaultValue: "active" }
    },

    {}
  );
  user.associate = function(models) {
    // associations can be defined here
    user.hasMany(models.saving, { foreignKey: 'id'});
    user.hasMany(models.item, { foreignKey: 'id'});
    user.hasMany(models.purchase, { foreignKey: 'id'});
    user.hasMany(models.loan, { foreignKey: 'id'});
    user.hasMany(models.complaint, { foreignKey: 'id'});
  };
  return user;
};
