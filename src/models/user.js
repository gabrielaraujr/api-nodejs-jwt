const oracledb = require("oracledb");
const db = require("../database");
const dbConfig = require("../config/dbconfig");

const outFormat = oracledb.OUT_FORMAT_OBJECT;

module.exports = {
  create: (user) => {
    return new Promise((resolve, reject) => {
      db.run(
        `
        DECLARE
          last_id number;
        BEGIN
          INSERT INTO API.USERS (name, email, password) VALUES (:name, :email, :password) RETURNING id INTO last_id;
          INSERT INTO APP_PROMO.USERDATA (USERID, USERTYPE) VALUES (last_id, :type) RETURNING USERID INTO :id;
        END;
        `,
        {
          id: (user.id = { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }),
          name: user.name,
          email: user.email.toLowerCase(),
          password: user.password,
          type: user.type.toUpperCase(),
        },
        { autoCommit: true },
        dbConfig.inova
      )
        .then((results) => {
          user.id = results.outBinds.id[0];
          return resolve(results);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  },

  find: (filter) => {
    return new Promise((resolve, reject) => {
      db.run(
        `
        SELECT /*+ FIRST_ROWS(100) */ *
        FROM (
          SELECT ROWNUM rnum, A.*
          FROM (
            SELECT
              ID as "id",
              NAME as "name",
              EMAIL as "email",
              PASSWORD as "password",
              CREATEDAT as "createdAt",
              D.USERTYPE as "type",
              T.DESCRIPTION as "typeDesc",
              STATUS as "status"
            FROM API.USERS
            INNER JOIN APP_PROMO.USERDATA D
            ON D.USERID = ID
            INNER JOIN APP_PROMO.USERTYPES T
            ON D.USERTYPE = T.USERTYPE
            ORDER BY ID
          ) A
          WHERE ROWNUM <= (:page) * :limit
        )
        WHERE rnum > (:page-1) * :limit
      `,
        {
          page: filter.page,
          limit: filter.limit,
        },
        { outFormat },
        dbConfig.inova
      )
        .then((result) => {
          return resolve(result);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  },

  findById: (id) => {
    return new Promise((resolve, reject) => {
      db.run(
        `
        SELECT
          ID as "id",
          NAME as "name",
          EMAIL as "email",
          PASSWORD as "password",
          CREATEDAT as "createdAt",
          D.USERTYPE as "type",
          T.DESCRIPTION as "typeDesc",
          STATUS as "status"
        FROM API.USERS
        INNER JOIN APP_PROMO.USERDATA D
        ON D.USERID = ID
        INNER JOIN APP_PROMO.USERTYPES T
        ON D.USERTYPE = T.USERTYPE
        WHERE ID = :id
        `,
        { id },
        { outFormat },
        dbConfig.inova
      )
        .then((user) => {
          return resolve(user);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  },

  findByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.run(
        `
        SELECT
          ID as "id",
          NAME as "name",
          EMAIL as "email",
          PASSWORD as "password",
          CREATEDAT as "createdAt",
          D.USERTYPE as "type",
          T.DESCRIPTION as "typeDesc",
          STATUS as "status"
        FROM API.USERS
        INNER JOIN APP_PROMO.USERDATA D
        ON D.USERID = ID
        INNER JOIN APP_PROMO.USERTYPES T
        ON D.USERTYPE = T.USERTYPE
        WHERE EMAIL = :email
        `,
        { email },
        { outFormat },
        dbConfig.inova
      )
        .then((user) => {
          return resolve(user);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  },

  update: (user) => {
    return new Promise((resolve, reject) => {
      db.run(
        `
        BEGIN
          UPDATE API.USERS SET NAME= :name, PASSWORD= :password WHERE ID = :id;
          UPDATE APP_PROMO.USERDATA SET USERTYPE= :type WHERE USERID = :id;
        END;
        `,
        {
          id: user.id,
          name: user.name,
          password: user.password,
          type: user.type,
        },
        { autoCommit: true },
        dbConfig.inova
      )
        .then((results) => {
          return resolve(results);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  },

  toggleStatus: (id, status) => {
    return new Promise((resolve, reject) => {
      db.run(
        `
        UPDATE API.USERS SET STATUS= :status WHERE ID = :id
        `,
        { id, status },
        { autoCommit: true },
        dbConfig.inova
      )
        .then((results) => {
          return resolve(results);
        })
        .catch((err) => {
          return reject(err);
        });
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.run(
        `
        DELETE FROM API.USERS WHERE ID = :id
        `,
        { id },
        { autoCommit: true },
        dbConfig.inova
      )
        .then(() => {
          return resolve();
        })
        .catch((err) => {
          return reject(err);
        });
    });
  },
};
