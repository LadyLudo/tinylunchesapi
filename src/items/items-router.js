const express = require('express')
const ItemsService = require('./items-service')

const ItemsRouter = express.Router()
const jsonParser = express.json()

ItemsRouter
    .route('/')
    .get((req, res, next) => {
        ItemsService.getAllItems(
            req.app.get('db')
        )
            .then(items => {
                res.json(items)
            })
            .catch(next)
    })
    .post(jsonParser, (req,res,next) => {
        const { item_name } = req.body
        const newItem = { item_name }

        for (const [key, value] of Object.entries(newItem)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        ItemsService.insertItem(
            req.app.get('db'),
            newItem
          )
            .then(item => {
              res
                .status(201)
                .json(item)
            })
            .catch(next)
    })

ItemsRouter
    .route('/:id')
    .all((req, res, next) => {
        ItemsService.getById(
            req.app.get('db'),
            req.params.id
        )
            .then(item => {
                if(!item) {
                    return res.status(404).json({
                        error: { message: `Item doesn't exist` }
                    })
                }
                res.item = item
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.item.id,
            item_name: res.item.item_name
        })
    })
    .delete((req, res, next) => {
        ItemsService.deleteItem(
            req.app.get('db'),
            req.params.id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req,res,next) => {
        const { item_name } = req.body
        const itemToUpdate = { item_name }

        const numberOfValues = Object.values(itemToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain item_name`
                }
            })
        }

        ItemsService.updateItem(
            req.app.get('db'),
            req.params.id,
            itemToUpdate
        )
            .then(result => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = ItemsRouter