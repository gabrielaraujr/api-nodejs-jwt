module.exports = {
  local: {
    user: process.env.NODE_ORACLEDB_USER || "admin",
    password: process.env.NODE_ORACLEDB_PASSWORD || "admin",
    connectString: process.env.NODE_ORACLEDB_CONNECTIONSTRING || "localhost:1521/ORCLPDB1"
  }
};