'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('users', [
      {
        userId: 'user_001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        password: 'hashedpassword123', // Giả sử đã hash password
        google_id: null,
        google_token: null,
        interests: 'coding, gaming',
        active: true,
        last_login_date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: 'user_002',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        password: 'hashedpassword456',
        google_id: 'google123',
        google_token: 'token123',
        interests: 'reading, traveling',
        active: false,
        last_login_date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  },
};
