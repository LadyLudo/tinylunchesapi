const UsersService = {
    hasUserWithUserName(db, username) {
      return db('users')
        .where({ username })
        .first()
        .then(user => !!user)
    },
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

    validatePassword(password) {
      if (password.length < 8) {
        return 'Password must be longer than 8 characters'
      }
      if (password.length > 72) {
        return 'Password must be less than 72 characters'
      }
      if (password.startsWith(' ') || password.endsWith(' ')) {
        return 'Password must not start or end with empty spaces'
      }
    }
  }
  
  module.exports = UsersService