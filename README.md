APP Name: Tiny Lunches

Live App: https://tiny-lunches-app.vercel.app/

APP Repo: https://github.com/Kevindavis5454/tiny-lunches-app.git

Summary:
This API allows for the creation, reading, updating and deletion of lunch items and data. You can store lunch items, categories, quantities, and entire lunches.

Endpoints:
/contest_to_user : Allows the association of a particular contest to a user.
Accepts for Input: user_id , contest_id
Outputs: json

/auth : Allows for authentication and access to protected endpoints.
Accepts for Input: username, password
outputs: json

/items : Allows for the storage of individual items on a master list without quantities
Accepts for Input: user_id, item_name, category_1, category_2, category_3, category_4, category_5, category_6, category_7
outputs: json

/pantry : Allows for the storage of individual items on a master list with quantities
Accepts for Input: user_id, item_name, category_1, category_2, category_3, category_4, category_5, category_6, category_7,quantity
outputs: json

/savedlunches : Allows for the storage of complete lunches
Accepts for Input: user_id, title, items (array)
outputs: json

/users : Allows for the storage of user data
Accepts for Input: username, password, display_name
outputs: json

This app is built with the following languages, frameworks, and libraries:

Front end: React, JSX, CSS, React-to-Print

Back end: Node.js, Express, Knex, Mocha, Chai

Database: PostgresSQL
