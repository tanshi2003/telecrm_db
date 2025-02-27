const db = require('../models');
const bcrypt = require('bcrypt');

const createAdmin = async () => {
  const password = await bcrypt.hash('tanshi@123', 10);
  await db.Admin.create({
    name: 'tanshi',
    email: 'tkhandelwal2017@gmail.com',
    password: password,
    role: 'admin'
  });
  console.log('Admin user created');
};

db.sequelize.sync().then(() => {
  createAdmin().then(() => {
    process.exit();
  });
});