const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
    return [
        {

            creation_date: '2020-08-23T00:00:00.000Z',
            id: 1,
            username: 'kevin@gmail.com',
            password: 'test123'
            
        },
        {
            creation_date: '2020-08-23T00:00:00.000Z',
            id: 2,
            username: 'katy@gmail.com',
            password: 'test123'
            
        },
        {
            creation_date: '2020-08-23T00:00:00.000Z',
            id: 3,
            username: 'susan@gmail.com',
            password: 'test123'
        },
    ]
  }

  function makeItemsArray () {
    return [
        {
            id: 1,
            item_name: 'pasta',
            user_id: 1,
            category_1: 'carb',
            category_2: null,
            category_3: null,
            category_4: null,
            category_5: null,
            category_6: null,
            category_7: null
        },
        {
            id: 2,
            item_name: 'chicken',
            user_id: 1,
            category_1: 'protein',
            category_2: null,
            category_3: null,
            category_4: null,
            category_5: null,
            category_6: null,
            category_7: null
        },
        {
            id: 3,
            item_name: 'salad',
            user_id: 1,
            category_1: 'vegetable',
            category_2: null,
            category_3: null,
            category_4: null,
            category_5: null,
            category_6: null,
            category_7: null
        },
        {
            id: 4,
            item_name: 'bananas',
            user_id: 1,
            category_1: 'fruit',
            category_2: null,
            category_3: null,
            category_4: null,
            category_5: null,
            category_6: null,
            category_7: null
        },
        {
            id: 5,
            item_name: 'pepsi',
            user_id: 1,
            category_1: 'drink',
            category_2: null,
            category_3: null,
            category_4: null,
            category_5: null,
            category_6: null,
            category_7: null
        },
        {
            id: 6,
            item_name: 'brownie',
            user_id: 1,
            category_1: 'dessert',
            category_2: null,
            category_3: null,
            category_4: null,
            category_5: null,
            category_6: null,
            category_7: null
        }
    ];
}

function makePantryItemsArray () {
  return [
      {
          id: 1,
          item_name: 'pasta',
          user_id: 1,
          category_1: 'carb',
          category_2: null,
          category_3: null,
          category_4: null,
          category_5: null,
          category_6: null,
          category_7: null,
          quantity: 3
      },
      {
          id: 2,
          item_name: 'chicken',
          user_id: 1,
          category_1: 'protein',
          category_2: null,
          category_3: null,
          category_4: null,
          category_5: null,
          category_6: null,
          category_7: null,
          quantity: 3
      },
      {
          id: 3,
          item_name: 'salad',
          user_id: 1,
          category_1: 'vegetable',
          category_2: null,
          category_3: null,
          category_4: null,
          category_5: null,
          category_6: null,
          category_7: null,
          quantity: 3
      },
      {
          id: 4,
          item_name: 'bananas',
          user_id: 1,
          category_1: 'fruit',
          category_2: null,
          category_3: null,
          category_4: null,
          category_5: null,
          category_6: null,
          category_7: null,
          quantity: 3
      },
      {
          id: 5,
          item_name: 'pepsi',
          user_id: 1,
          category_1: 'drink',
          category_2: null,
          category_3: null,
          category_4: null,
          category_5: null,
          category_6: null,
          category_7: null,
          quantity: 3
      },
      {
          id: 6,
          item_name: 'brownie',
          user_id: 1,
          category_1: 'dessert',
          category_2: null,
          category_3: null,
          category_4: null,
          category_5: null,
          category_6: null,
          category_7: null,
          quantity: 3
      }
  ];
}


function makeItemsFixtures() {
    const testUsers = makeUsersArray()
    const testItems = makeItemsArray(testUsers)
    const testPantry = makePantryItemsArray()
    return { testUsers, testItems, testPantry }
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

  function seedItemsTables(db, users, items, categories, itemCategories) {
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
        users,
        pantry
        RESTART IDENTITY CASCADE`
    )
  }

  module.exports = {
      makeAuthHeader,
      makeItemsArray,
      makeUsersArray,
      seedItemsTables,
      makeItemsFixtures,
      cleanTables,
      seedUsers,
      makePantryItemsArray,
  }