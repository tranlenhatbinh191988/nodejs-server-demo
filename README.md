
#  Dev Connector Server API
A platform for developers to connect. They can create their portofolio by adding their experience, education, skills and other important information of their professional career.

Users can also create small posts and like/dislike and comment on other posts.

### Directory structure
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

### Quick Start
```
# clone repository
git@github.com:tranlenhatbinh191988/nodejs-server-demo.git
# Install dependencies
cd nodejs-server-demo && npm install
```
To run the development server:
```
# the development server runs
npm run server
```
### Main Technologies
 - Node.js / Express
 - MongoDB
 - JWT
 - Passport
 - Passport-jwt
#### Libraries used in Server-side
 - bcryptjs
 - gravatar
 - mongoose
 - jwt-decode
 - express-validator
