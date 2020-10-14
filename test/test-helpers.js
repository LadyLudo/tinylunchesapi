const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
    return [
        {
            id: 1,
            username: 'kevin@gmail.com',
            password: 'test123',
            creation_date: '2020-08-23T00:00:00.000Z'
            
        },
        {
            id: 2,
            username: 'katy@gmail.com',
            password: 'test123',
            creation_date: '2020-08-23T00:00:00.000Z'
        },
        {
            id: 3,
            username: 'susan@gmail.com',
            password: 'test123',
            creation_date: '2020-08-23T00:00:00.000Z'
        },
    ]
  }

  function makeItemsArray () {
    return [
        {
            id: 1,
            item_name: 'pasta'
        },
        {
            id: 2,
            item_name: 'chicken'
        },
        {
            id: 3,
            item_name: 'salad'
        },
        {
            id: 4,
            item_name: 'bananas'
        },
        {
            id: 5,
            item_name: 'pepsi'
        },
        {
            id: 6,
            item_name: 'brownie'
        }
    ];
}

function makeCategoriesArray () {
  return [
    {
      id: 1,
      name: 'carbs'
    },
    {
      id: 2,
      name: 'protein'
    },
    {
      id: 3,
      name: 'vegetable'
    },
    {
      id: 4,
      name: 'fruit'
    },
    {
      id: 5,
      name: 'drink'
    },
    {
      id: 6,
      name: 'dessert'
    }
  ]
}

function makeItemsFixtures() {
    const testUsers = makeUsersArray()
    const testItems = makeItemsArray(testUsers)
    const testCategories = makeCategoriesArray()
    return { testUsers, testItems, testCategories }
  }

  function cleanTables(db) {
    return db.raw(
      `TRUNCATE
        items,
        users
        RESTART IDENTITY CASCADE`
    )
  }

  function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 1)
    }))
    return db.into('users').insert(preppedUsers)
      .then(() => 
        db.raw(
          `SELECT setval('users_id_seq', ?)`,
          [users[users.length - 1].id],
        )
      )
  }

  function seedItemsTables(db, users, items) {
    // use a transaction to group the queries and auto rollback on any failure
    return db.transaction(async trx => {
      await seedUsers(trx, users)
      await trx.into('items').insert(items)
      // update the auto sequence to match the forced id values
      await trx.raw(
        `SELECT setval('items_id_seq', ?)`,
        [items[items.length - 1].id]
      )
    })
  }

  function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.id }, secret, {
      subject: user.username,
      algorithm: 'HS256',
    })
    return `Bearer ${token}`
  }

  function cleanTables(db) {
    return db.raw(
      `TRUNCATE
        items,
        users
        RESTART IDENTITY CASCADE`
    )
  }

  module.exports = {
      makeAuthHeader,
      makeItemsArray,
      makeUsersArray,
      makeCategoriesArray,
      seedItemsTables,
      makeItemsFixtures,
      cleanTables,
      seedUsers,
  }