
# Social Nodejs Server
## Target:
### Here is the Nodejs Server Demo about social app with some main features:
```
 - User sign up and login
 - User create/update/view profiles
 - User can do post
 - User can leave comment into post
 - User can like/dislike a post
```
## Directory structure
```
/
|
|- config/
|   |- db.js/
|   |- default.json/
|- middleware
|   |- auth.js
|- models
|   |- Post
|   |- Profile
|   |- User
|- routes
|   |- api
|       |- auth.js
|       |- posts.js
|       |- profile.js
|       |- users.js
|- .gitignore
|- server.js
|- README.md
|- package.json
\
```

## Technologies
  - Nodejs/Express
  - Mongodb/Mongoose
  - JWT
  - Bcryptjs

## Editor && third party
* [Visual Studio Code](https://code.visualstudio.com/)
* [Postman](https://www.postman.com/)

## Guidline for running project
**Step 1:** Refer to https://documenter.getpostman.com/view/3259679/Szf9VmjX?version=latest#74cdabb6-b63e-4a2c-a3c6-fd4bcbd58afc to get all available API

**Step 2:** Run command
 
```
  - npm install
  - npm run server
```
