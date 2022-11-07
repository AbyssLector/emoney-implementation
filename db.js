require('dotenv').config()

var mysql = require('mysql2');
module.exports = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
});

// const Pool = require('pg').Pool;
// const pool = new Pool({
//     host: 'localhost',
//     user: 'postgres',
//     password: 'password',
//     database: 'rest_api_gallecoins',
//     port: 5432
// })
// module.exports = pool;