// More than one connection (local or example)
// Choose your connection in ../models params
module.exports = {
  local: {
    user: process.env.NODE_ORACLEDB_USER || "system",
    password: process.env.NODE_ORACLEDB_PASSWORD || "root",
    connectString: process.env.NODE_ORACLEDB_CONNECTIONSTRING || "localhost:1521/XEPDB1"
  },

  example: {
    user: process.env.NODE_ORACLEDB_USER || "example",
    password: process.env.NODE_ORACLEDB_PASSWORD || "example",
    connectString: process.env.NODE_ORACLEDB_CONNECTIONSTRING || "192.168.0.1:1521/EXAMPLE"
  }
};