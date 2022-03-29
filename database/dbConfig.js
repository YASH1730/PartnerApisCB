require('dotenv').config();
const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.HOST,
    port: process.env.DB_PORT,
    user: 'classbazaar',
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  },
  pool: {
    min: 1,
    max: 4000,
  },
  debug: process.env.DATABASE_DEBUG === 'true',
});

module.exports = db;