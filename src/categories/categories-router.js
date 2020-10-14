const express = require('express')
const CategoriesService = require('./categories-service')

const CategoriesRouter = express.Router()
const jsonParser = express.json()

CategoriesRouter
    .route('/')
    .get((req, res, next) => {
        CategoriesService.getAllCategories(
            req.app.get('db')
        )
            .then(categories => {
                res.json(categories)
            })
            .catch(next)
    })
    .post(jsonParser, (req,res,next) => {
        const { name } = req.body
        const newCategory = { name }

        for (const [key, value] of Object.entries(newCategory)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        CategoriesService.insertCategory(
            req.app.get('db'),
            newCategory
          )
            .then(category => {
              res
                .status(201)
                .json(category)
            })
            .catch(next)
    })

CategoriesRouter
    .route('/:id')
    .all((req, res, next) => {
        CategoriesService.getById(
            req.app.get('db'),
            req.params.id
        )
            .then(category => {
                if(!category) {
                    return res.status(404).json({
                        error: { message: `Category doesn't exist` }
                    })
                }
                res.category = category
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.category.id,
            name: res.category.name
        })
    })
    .delete((req, res, next) => {
        CategoriesService.deleteCategory(
            req.app.get('db'),
            req.params.id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req,res,next) => {
        const { name } = req.body
        const categoryToUpdate = { name }

        const numberOfValues = Object.values(categoryToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain name`
                }
            })
        }

        CategoriesService.updateCategory(
            req.app.get('db'),
            req.params.id,
            categoryToUpdate
        )
            .then(result => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = CategoriesRouter