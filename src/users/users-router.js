const express = require('express')
const UsersService = require('./users-service')
const bcrypt = require('bcrypt')

const usersRouter = express.Router()
const jsonParser = express.json()

usersRouter
    .route('/')
    .get((req,res,next) => {
        UsersService.getAllUsers(
            req.app.get('db')
        )
            .then(users => {
                res.json(users)
            })
            .catch(next)
    })
    .post(jsonParser, (req,res,next) => {
        const { username, password } = req.body
        const newUser = { username, password }

        for (const [key, value] of Object.entries(newUser)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }
        bcrypt.hash(newUser.password, 10)
            .then((hash) => {
                const hashedUser = {
                    username: newUser.username,
                    password: hash  
                }
                UsersService.insertUser(
                    req.app.get('db'),
                    hashedUser
                  )
                    .then(user => {
                      res
                        .status(201)
                        .json(user)
                    })
                    .catch(next)
            })

    })

usersRouter
    .route('/:id')
    .all((req,res,next) => {
        UsersService.getById(
            req.app.get('db'),
            req.params.id
        )
            .then(user => {
                if(!user) {
                    return res.status(204).end()
                }
                res.user = user
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json({
            id: res.user.id,
            username: res.user.username,
            password: res.user.password,
            creation_date: res.user.creation_date
        })
    })
    .delete((req,res,next) => {
        UsersService.deleteUser(
            req.app.get('db'),
            req.params.id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })
    .patch( jsonParser, (req,res, next) => {
        const { username, password } = req.body
        const userToUpdate = { username, password } 

        const numberOfValues = Object.values(userToUpdate).filter(Boolean).length
        if (numberOfValues === 0) {
            return res.status(400).json({
                error: {
                    message: `Request body must contain either 'password' or 'username'`
                }
            })
        }
        if(req.body.password !== undefined){
            bcrypt.hash(req.body.password, 6)
            .then((hashPass) => {
                const hashedUser = {
                    password: hashPass
                }
                UsersService.updateUser(
                    req.app.get('db'),
                    req.params.id,
                    hashedUser
                  )
                    .then(user => {
                      res
                        .status(204).end()
                    })
                    .catch(next)
            })
        } else {
            UsersService.updateUser(
                req.app.get('db'),
                req.params.id,
                userToUpdate
            )
                .then(numRowsAffected => {
                    res.status(204).end()
                })
                .catch(next)
        }
    })


module.exports = usersRouter