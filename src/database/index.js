process.env.ORA_SDTZ = 'UTC';

const oracledb = require('oracledb');

async function run(sql, binds, opts, db) {
  let conn;

  try {
    conn = await oracledb.getConnection(db);

    const result = await conn.execute(sql, binds, opts);

    return result;
  } catch (err) {
    console.error(err);
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

module.exports.run = run;