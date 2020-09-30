const UsersService = {
    getAllUsers(knex) {
      return knex
        .select('*')
        .from('users')
        .orderBy('id')
    },
  
    insertUser(knex, newUser) {
      return knex
        .insert(newUser)
        .into('users')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
  
    getById(knex, id) {
      return knex
        .from('users')
        .select('*')
        .where('id', id)
        .first()
    },

    getByUsername(knex, username) {
      return knex
        .from('users')
        .select('*')
        .where('username', username)
        .first()
    },
  
    deleteUser(knex, id) {
      return knex('users')
        .where({ id })
        .delete()
    },
  
    updateUser(knex, id, newUserFields) {
      return knex('users')
        .where({ id })
        .update(newUserFields)
    },

    userAuth(knex, username) {
        return knex
          .from('users')
          .select('id', 'password')
          .where('username', username)
          .first()
      },
  }
  
  module.exports = UsersService