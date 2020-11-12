const SavedLunchService = {
    getAllLists(knex) {
        return knex
            .select('*')
            .from('saved_lunches')
            .orderBy('id')
    },

    insertList(knex, newList) {
        return knex
            .insert(newList)
            .into('saved_lunches')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    getById(knex, id) {
        return knex
            .from('saved_lunches')
            .select('*')
            .where('id', id)
            .first()
    },

    getByUserId(knex, user_id) {
        return knex
            .from('saved_lunches')
            .select('*')
            .where('user_id', user_id)
    },

    deleteList(knex, id) {
        return knex('saved_lunches')
            .where({id})
            .delete()
    },

    updateList(knex, id, newListFields) {
        return knex('saved_lunches')
            .where({id})
            .update(newListFields)
    },
}

module.exports = SavedLunchService