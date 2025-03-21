'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('orders', [
      {
        date_ordered: '2025-03-20',
        date_delivery: '2025-03-25',
        adress: 'Beltmolen 123',
        post_code: '5694LP',
        user_id: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        date_ordered: '2025-03-21',
        date_delivery: '2025-03-26',
        adress: 'Beltmolen 128',
        post_code: '5693PL',
        user_id: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('orders', null, {});
  }
};
