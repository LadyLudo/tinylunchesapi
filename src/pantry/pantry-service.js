const PantryService = {
    getAllItems(knex) {
        return knex
            .select('*')
            .from('pantry')
            .orderBy('id')
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