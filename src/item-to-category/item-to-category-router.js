const express = require('express')
const ItemCategoryService = require('./item-to-category-service')

const itemCategoryRouter = express.Router()
const jsonParser = express.json()

itemCategoryRouter
    .route('/')
    .get((req,res,next) => {
        ItemCategoryService.getAllItemCategory(
            req.app.get('db')
        )
            .then(itemCategories => {
                res.json(itemCategories)
            })
            .catch(next)
    })
    .post(jsonParser, (req,res,next) => {
        const { item_id, category_id, user_id } = req.body
        const newItemCategory = { item_id, category_id, user_id }

        for (const [key, value] of Object.entries(newItemCategory)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        ItemCategoryService.insertItemCategory(
          req.app.get('db'),
          newItemCategory
        )
          .then(itemCategory => {
            res
              .status(201)
              .json(itemCategory)
          })
          .catch(next)
    })

itemCategoryRouter
    .route('/id/:id')
    .all((req,res,next) => {
        ItemCategoryService.getById(
            req.app.get('db'),
            req.params.id
        )
            .then(itemCategory => {
                if(!itemCategory) {
                    return res.status(404).json({
                        error: { message: `Item to Category entry doesn't exist` }
                    })
                }
                res.itemCategory = itemCategory
                next()
    
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json( res.itemCategory )
    })
    .delete((req,res,next) => {
        ItemCategoryService.deleteItemCategory(
            req.app.get('db'),
            req.params.id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch( jsonParser, (req,res, next) => {
        const { item_id, category_id, user_id } = req.body
        const itemCategoryToUpdate = { item_id, category_id, user_id }

        const numberOfValues = Object.values(itemCategoryToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'item_id', 'categpory_id', or 'user_id'`
                }
            })
        }

        ItemCategoryService.updateItemCategory(
            req.app.get('db'),
            req.params.id,
            itemCategoryToUpdate
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

itemCategoryRouter
    .route('/user_id/:user_id')
    .all((req,res,next) => {
        ItemCategoryService.getByUserId(
            req.app.get('db'),
            req.params.user_id
        )
            .then(itemCategory => {
            
                res.itemCategory = itemCategory
                next()
    
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json( res.itemCategory )
    })
    
itemCategoryRouter
    .route('/item_id/:item_id')
    .all((req,res,next) => {
        ItemCategoryService.getByItemId(
            req.app.get('db'),
            req.params.item_id
        )
            .then(itemCategory => {
            
                res.itemCategory = itemCategory
                next()
    
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json( res.itemCategory )
    })

itemCategoryRouter
    .route('/category_id/:category_id')
    .all((req,res,next) => {
        ItemCategoryService.getByCategoryId(
            req.app.get('db'),
            req.params.category_id
        )
            .then(itemCategory => {
            
                res.itemCategory = itemCategory
                next()
    
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json( res.itemCategory )
    })
    
module.exports = itemCategoryRouter