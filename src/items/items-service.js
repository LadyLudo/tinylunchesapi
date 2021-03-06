const ItemsService = {
    getAllItems(knex) {
        return knex
            .select('*')
            .from('items')
            .orderBy('id')
    },

    searchAllItems(knex, string) {
        return knex
            .select('*')
            .from('items')
            .where('item_name', 'like', `%${string}%`)
    },

    // searchBothTables(knex, string) {
    //     return knex('items')
    //         .join('pantry', 'pantry.item_name')
    //         .select('*')
    //         .where('item_name', 'like', `%${string}%`)
    // },

    insertItem(knex, newItem) {
        return knex
            .insert(newItem)
            .into('items')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    getById(knex, id) {
        return knex
            .from('items')
            .select('*')
            .where('id', id)
            .first()
    },

    deleteItem(knex, id) {
        return knex('items')
            .where({id})
            .delete()
    },

    updateItem(knex, id, newItemFields) {
        return knex('items')
            .where({id})
            .update(newItemFields)
    },
}

module.exports = ItemsService