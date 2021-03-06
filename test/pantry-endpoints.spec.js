const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");
const supertest = require("supertest");
const helpers = require("./test-helpers");

describe("Pantry Endpoints", function () {
  let db;

  const { testUsers, testPantry } = helpers.makeItemsFixtures();

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("clean the table", () => db("pantry").delete());

  afterEach("cleanup", () => helpers.cleanTables(db));

  describe("GET /api/pantry", function () {
    context("Given no items", () => {
      beforeEach("insert users", () => {
        return db.into("users").insert(testUsers);
      });
      it("responds with 200 and an empty list", () => {
        return supertest(app)
          .get("/api/pantry")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, []);
      });
    });
    context("Given that there are items in the database", () => {
      const testPantry = helpers.makePantryItemsArray();

      beforeEach("insert users", () => helpers.seedUsers(db, testUsers));

      beforeEach("insert items", () => {
        return db.into("pantry").insert(testPantry);
      });

      it("Responds with 200 and all of the items", () => {
        return supertest(app)
          .get("/api/pantry")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, testPantry);
      });
    });
  });

  describe("GET /api/pantry/:id", () => {
    context("Given no items", () => {
      beforeEach("insert users", () => {
        return db.into("users").insert(testUsers);
      });
      it("responds with 404", () => {
        const id = 123456;
        return supertest(app)
          .get(`/api/pantry/${id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(404);
      });
    });
    context("Given there are items in the database", () => {
      beforeEach("insert users", () => {
        helpers.seedUsers(db, testUsers);
      });
      beforeEach("insert items", () => {
        return db.into("pantry").insert(testPantry);
      });

      it("Responds with 200 and the expected item", () => {
        const id = 2;
        const expectedItem = testPantry[id - 1];
        return supertest(app)
          .get(`/api/pantry/${id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedItem);
      });
    });
  });

  describe("POST /api/pantry", () => {
    beforeEach("insert users", () => {
      helpers.seedUsers(db, testUsers);
    });
    it("creates an item, responding with 201 and the new item", () => {
      const newItem = {
        user_id: 1,
        item_name: "blueberries",
        category_1: "fruit",
        category_2: null,
        category_3: null,
        category_4: null,
        category_5: null,
        category_6: null,
        category_7: null,
        quantity: 3,
      };
      return supertest(app)
        .post("/api/pantry")
        .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
        .send(newItem)
        .expect(201)
        .expect((res) => {
          expect(res.body.item_name).to.eql(newItem.item_name);
        })
        .then((postRes) =>
          supertest(app)
            .get(`/api/pantry/${postRes.body.id}`)
            .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
            .expect(postRes.body)
        );
    });
  });

  describe("DELETE /api/pantry/:id", () => {
    context("Given no items", () => {
      beforeEach("insert users", () => {
        return db.into("users").insert(testUsers);
      });
      it("responds with 404", () => {
        const id = 123456;
        return supertest(app)
          .delete(`/api/pantry/${id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(404);
      });
    });
    context("Given there are itemsin the database", () => {
      const testPantry = helpers.makePantryItemsArray();

      beforeEach("insert users", () => {
        return db.into("users").insert(testUsers);
      });
      beforeEach("insert items", () => {
        return db.into("pantry").insert(testPantry);
      });

      it("responds with 204 and removes the item", () => {
        const idToRemove = 2;
        const expectedItems = testPantry.filter(
          (item) => item.id !== idToRemove
        );
        return supertest(app)
          .delete(`/api/pantry/${idToRemove}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(204)
          .then((res) =>
            supertest(app)
              .get("/api/pantry")
              .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
              .expect(expectedItems)
          );
      });
    });
  });

  describe("PATCH /api/pantry/:id", () => {
    context("Given no items", () => {
      beforeEach("insert users", () => {
        return db.into("users").insert(testUsers);
      });
      it("responds with 404", () => {
        const id = 123456;
        return supertest(app)
          .patch(`/api/pantry/${id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(404);
      });
    });
    context("Given there are items in the database", () => {
      const testPantry = helpers.makePantryItemsArray();

      beforeEach("insert users", () => {
        return db.into("users").insert(testUsers);
      });
      beforeEach("insert items", () => {
        return db.into("pantry").insert(testPantry);
      });

      it("Responds with 204 and updates the item", () => {
        const idToUpdate = 2;
        const updatedItem = {
          item_name: "bread",
          category_1: "carb",
          category_2: null,
          category_3: null,
          category_4: null,
          category_5: null,
          category_6: null,
          category_7: null,
          quantity: 3,
        };
        const expectedItem = {
          ...testPantry[idToUpdate - 1],
          ...updatedItem,
        };
        return supertest(app)
          .patch(`/api/pantry/${idToUpdate}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(updatedItem)
          .expect(204)
          .then((res) =>
            supertest(app)
              .get(`/api/pantry/${idToUpdate}`)
              .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
              .expect(expectedItem)
          );
      });
    });
  });

  describe("GET /api/pantry/user/:user_id", () => {
    context("Given no items", () => {
      beforeEach("insert users", () => {
        return db.into("users").insert(testUsers);
      });
      it("responds with 404", () => {
        const user_id = 123456;
        return supertest(app)
          .get(`/api/pantry/users/${user_id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(404);
      });
    });
    context("Given there are items in the database", () => {
      beforeEach("insert users", () => {
        return db.into("users").insert(testUsers);
      });
      beforeEach("insert items", () => {
        return db.into("pantry").insert(testPantry);
      });

      it("Responds with 200 and the expected items", () => {
        const user_id = 1;
        const expectedItems = testPantry.filter(
          (item) => item.user_id === user_id
        );
        return supertest(app)
          .get(`/api/pantry/users/${user_id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedItems);
      });
    });
  });

  describe("GET /search/item/", () => {
    context("Given no items", () => {
      beforeEach("insert users", () => helpers.seedUsers(db, testUsers));
      it("Responds with an empty list", () => {
        const itemSearchString = "shrtingkshd";
        return supertest(app)
          .get("/api/pantry/search/item/")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .query({ string: itemSearchString })
          .expect(200, []);
      });
    });
    context("Given there are items in the database", () => {
      beforeEach("insert users", () => helpers.seedUsers(db, testUsers));

      beforeEach("insert items", () => {
        return db.into("pantry").insert(testPantry);
      });
      it("Responds with 200 and the desired item", () => {
        const itemSearchString = "pasta";
        const expectedItem = testPantry[0];
        return supertest(app)
          .get("/api/pantry/search/item/")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .query({ string: itemSearchString })
          .expect(200, [expectedItem]);
      });
    });
  });
});
