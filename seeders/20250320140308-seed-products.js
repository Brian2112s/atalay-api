'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkInsert('products', [
        {
          name: 'Sweater',
          price: 10.00,
          stock: '5',
          category: 'clothing',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'Hoodie',
          price: 12.50,
          stock: '6',
          category: 'clothing',
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ]);
    } catch (error) {
      console.error('Seeding error:', error);
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('products', null, {});
  }
};
