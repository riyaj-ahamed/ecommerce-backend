const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: 'byfbkej8wldw114t7fiya-mysql.services.clever-cloud.com',
  user: 'uccxk2sxsyke3ewr',
  password: 'XCY68taD1IcUAq7CEHlt',
  database: 'byfbkej8wldw114t7fiya',
  port: 3306,
});

module.exports = db;
