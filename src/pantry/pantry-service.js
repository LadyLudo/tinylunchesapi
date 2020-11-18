const PantryService = {
    getAllItems(knex) {
        return knex
            .select('*')
            .from('pantry')
            .orderBy('id')
    },

    searchAllItems(knex, string) {
        return knex
            .select('*')
            .from('pantry')
            .where('item_name', 'like', `%${string}%`)
    },

    insertItem(knex, newItem) {
        return knex
            .insert(newItem)
            .into('pantry')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    getById(knex, id) {
        return knex
            .from('pantry')
            .select('*')
            .where('id', id)
            .first()
    },

    getByUserId(knex, user_id) {
        return knex
            .from('pantry')
            .select('*')
            .where('user_id', user_id)
    },

    deleteItem(knex, id) {
        return knex('pantry')
            .where({id})
            .delete()
    },

    updateItem(knex, id, newItemFields) {
        return knex('pantry')
            .where({id})
            .update(newItemFields)
    },
}

module.exports = PantryService