const CategoriesService = {
    getAllCategories(knex) {
        return knex
            .select('*')
            .from('categories')
            .orderBy('id')
    },

    insertCategory(knex, newCategory) {
        return knex
            .insert(newCategory)
            .into('categories')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    getById(knex, id) {
        return knex
            .from('categories')
            .select('*')
            .where('id', id)
            .first()
    },

    deleteCategory(knex, id) {
        return knex('categories')
            .where({id})
            .delete()
    },

    updateCategory(knex, id, newCategoryFields) {
        return knex('categories')
            .where({id})
            .update(newCategoryFields)
    },
}

module.exports = CategoriesService