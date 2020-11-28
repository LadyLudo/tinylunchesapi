const express = require("express");
const PantryService = require("./pantry-service");
const { requireAuth } = require("../middleware/jwt-auth");

const PantryRouter = express.Router();
const jsonParser = express.json();

PantryRouter.route("/")
  .all(requireAuth)
  .get((req, res, next) => {
    PantryService.getAllItems(req.app.get("db"))
      .then((items) => {
        res.json(items);
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const {
      user_id,
      item_name,
      category_1,
      category_2,
      category_3,
      category_4,
      category_5,
      category_6,
      category_7,
      quantity,
    } = req.body;
    const newItem = {
      user_id,
      item_name,
      category_1,
      category_2,
      category_3,
      category_4,
      category_5,
      category_6,
      category_7,
      quantity,
    };

    if (user_id == null) {
      return res.status(400).json({
        error: { message: `Missing 'user_id' in request body` },
      });
    }
    if (item_name == null) {
      return res.status(400).json({
        error: { message: `Missing 'item_name' in request body` },
      });
    }
    if (category_1 == null) {
      return res.status(400).json({
        error: { message: `Missing 'category_1' in request body` },
      });
    }
    if (quantity == null) {
      return res.status(400).json({
        error: { message: `Missing 'quantity' in request body` },
      });
    }

    PantryService.insertItem(req.app.get("db"), newItem)
      .then((item) => {
        res.status(201).json(item);
      })
      .catch(next);
  });

PantryRouter.route("/:id")
  .all(requireAuth)
  .all((req, res, next) => {
    PantryService.getById(req.app.get("db"), req.params.id)
      .then((item) => {
        if (!item) {
          return res.status(404).json({
            error: { message: `Item doesn't exist` },
          });
        }
        res.item = item;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(res.item);
  })
  .delete((req, res, next) => {
    PantryService.deleteItem(req.app.get("db"), req.params.id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const {
      user_id,
      item_name,
      category_1,
      category_2,
      category_3,
      category_4,
      category_5,
      category_6,
      category_7,
      quantity,
    } = req.body;
    const itemToUpdate = {
      user_id,
      item_name,
      category_1,
      category_2,
      category_3,
      category_4,
      category_5,
      category_6,
      category_7,
      quantity,
    };

    const numberOfValues = Object.values(itemToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain at least one value`,
        },
      });
    }

    PantryService.updateItem(req.app.get("db"), req.params.id, itemToUpdate)
      .then((result) => {
        res.status(204).end();
      })
      .catch(next);
  });

PantryRouter.route("/users/:user_id")
  .all(requireAuth)
  .all((req, res, next) => {
    PantryService.getByUserId(req.app.get("db"), req.params.user_id)
      .then((item) => {
        if (!item[0]) {
          return res.status(404).json({
            error: { message: `No Pantry Items exist for this User` },
          });
        }
        res.item = item;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.send(res.item);
  });

PantryRouter.route("/search/item")
  .all(requireAuth)
  .get((req, res, next) => {
    PantryService.searchAllItems(req.app.get("db"), req.query.string)
      .then((result) => {
        res.status(200).send(result);
      })
      .catch(next);
  });

module.exports = PantryRouter;
