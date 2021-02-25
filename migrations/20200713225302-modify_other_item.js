'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('items', 'description', {
        type: Sequelize.STRING,
        allowNull: true
      }, 'selling_price', {
        type: Sequelize.STRING,
        allowNull: true
      }, 'interest', {
        type: Sequelize.STRING,
        allowNull: true
      }), ])
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
      
    */
   return Promise.all([queryInterface.removeColumn('items', 'description')]);
  }
};
