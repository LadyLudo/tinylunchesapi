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
        const { user_id, item_name, category_1, category_2, category_3, category_4, category_5, category_6, category_7 } = req.body
        const newItem = { user_id, item_name, category_1, category_2, category_3, category_4, category_5, category_6, category_7 }

        
        if (user_id == null) {
            return res.status(400).json({
                error: { message: `Missing 'user_id' in request body` }
            })
        }
        if (item_name == null) {
            return res.status(400).json({
                error: { message: `Missing 'item_name' in request body` }
            })
        }
        if (category_1 == null) {
            return res.status(400).json({
                error: { message: `Missing 'category_1' in request body` }
            })
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
        res.json(res.item)
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
        const { item_name, category_1, catgory_2, category_3, category_4, category_5, category_6, category_7 } = req.body
        const itemToUpdate = { item_name, category_1, catgory_2, category_3, category_4, category_5, category_6, category_7 }

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