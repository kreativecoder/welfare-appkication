'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
   await queryInterface.bulkInsert('users', [{
     firstname: 'admin',
     lastname: 'jerry',
     email: 'admin@test.com',
     password: '$2y$10$HIiQIwjHjZ7xhJaP0QkYLeijeq3gvI1qQVy3nKqoh0VY9B9eo0rnS',
     dob: new Date(),
     phone_number: '08088492993',
     address: '22 pamikinku street ipaja lagos',
     role: 'admin',
     employed_as: 'teacher',
     branch: 'ipaja',
     status: 'active',
     updatedAt: new Date(),
     createdAt: new Date()
   }])
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
