const oracledb = require('oracledb');
const db = require('../database');
const dbConfig = require('../config/dbconfig');

// Fetch each row as an object
const outFormat = oracledb.OUT_FORMAT_OBJECT;

module.exports = {
  create: user => {
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO API.users (name, email, password, type)
        VALUES (:name, :email, :password, :type) returning id into :id
        `,
        {
          id: user.id = { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
          type: user.type,
          name: user.name,
          email: user.email.toLowerCase(),
          password: user.password
        },
        { autoCommit: true }, dbConfig.local
      )
        .then((results) => {
          user.id = results.outBinds.id[0]; //Contains the output values of BIND_OUT
          return resolve(user);
        })
        .catch((err) => { return reject(err) })
    })
  },

  find: () => {
    return new Promise((resolve, reject) => {
      db.run(`
        SELECT * FROM API.users
        `, {}, { outFormat }, dbConfig.local)
        .then((users) => { return resolve(users) })
        .catch((err) => { return reject(err) })
    })
  },

  findById: id => {
    return new Promise((resolve, reject) => {
      db.run(`
        SELECT * FROM API.users WHERE id = :id
        `, { id }, { outFormat }, dbConfig.local)
        .then((user) => { return resolve(user) })
        .catch((err) => { return reject(err) })
    })
  },

  findByEmail: email => {
    return new Promise((resolve, reject) => {
      db.run(`
        SELECT * FROM API.users WHERE email = :email
        `, { email }, { outFormat }, dbConfig.local)
        .then((user) => { return resolve(user) })
        .catch((err) => { return reject(err) })
    })
  },

  delete: id => {
    return new Promise((resolve, reject) => {
      db.run(`
        DELETE FROM API.users WHERE id = :id
        `, { id }, { autoCommit: true }, dbConfig.local)
        .then(() => { return resolve() })
        .catch((err) => { return reject(err) })
    })
  }
}