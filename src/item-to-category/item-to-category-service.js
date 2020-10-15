const ItemCategoryService = {
    getAllItemCategory(knex) {
      return knex
        .select('*')
        .from('item_to_category')
        .orderBy('id')
    },
  
    insertItemCategory(knex, newItemCategory) {
      return knex
        .insert(newItemCategory)
        .into('item_to_category')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
  
    getById(knex, id) {
        return knex
          .from('item_to_category')
          .select('*')
          .where('id', id)
          .first()
      },

    getByUserId(knex, user_id) {
      return knex
        .from('item_to_category')
        .select('*')
        .where('user_id', user_id)
    },

    getByItemId(knex, item_id) {
        return knex
          .from('item_to_category')
          .select('*')
          .where('item_id', item_id)
    },

    getByCategoryId(knex, category_id) {
        return knex
          .from('item_to_category')
          .select('*')
          .where('category_id', category_id)
    },
  
    deleteItemCategory(knex, id) {
      return knex('item_to_category')
        .where({ id })
        .delete()
    },
  
    updateItemCategory(knex, id, newItemCategory) {
      return knex('item_to_category')
        .where({ id })
        .update(newItemCategory)
    },
  }
  
  module.exports = ItemCategoryService