const express = require('express')
const SavedLunchService = require('./saved_lunches-service')

const SavedLunchRouter = express.Router()
const jsonParser = express.json()

SavedLunchRouter
    .route('/')
    .get((req, res, next) => {
        SavedLunchService.getAllLists(
            req.app.get('db')
        )
            .then(lists => {
                res.json(lists)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { user_id, title, items } = req.body
        const newList = { user_id, title, items }

        
        for (const [key, value] of Object.entries(newList)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        SavedLunchService.insertList(
            req.app.get('db'),
            newList
        )
            .then(list => {
                res
                    .status(201)
                    .json(list)
            })
            .catch(next)
    })

SavedLunchRouter
    .route('/:id')
    .all((req, res, next) => {
        SavedLunchService.getById(
            req.app.get('db'),
            req.params.id
        )
            .then(list => {
                if(!list) {
                    return res.status(404).json({
                        error: { message: `List doesn't exist`}
                    })
                }
                res.list = list
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(res.list)
    })
    .delete((req, res, next) => {
        SavedLunchService.deleteList(
            req.app.get('db'),
            req.params.id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const { user_id, title, items } = req.body
        const listToUpdate = { user_id, title, items }

        const numberOfValues = Object.values(listToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain at least one value`
                }
            })
        }

        SavedLunchService.updateList(
            req.app.get('db'),
            req.params.id,
            listToUpdate
        )
            .then(result => {
                res.status(204).end()
            })
            .catch(next)
    })

SavedLunchRouter
    .route('/users/:user_id')
    .all((req,res,next) => {
        SavedLunchService.getByUserId(
            req.app.get('db'),
            req.params.user_id
        )
            .then(list => {
                if(!list[0]) {
                    return res.status(404).json({
                        error: { message: `List doesn't exist` }
                    })
                }
                res.list = list
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.send(res.list)
    })

module.exports = SavedLunchRouter