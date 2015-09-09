#FUCK OFF IT'S NOT DONE!
Well... it's almost done now.

#to set up on your local machine:
###*before set-up, you must have `node` and `mongodb` installed*
- clone the repo
- install npm dependencies from the root of the project
```
$ npm install
```
- make a "data" folder in the root of the project
- run an instance of mongodb in another tab
```
$ mongod --dbpath ~/Path/to/blog/data/
```

#####*You'll have to create an account for yourself in the database:*
- start the mongo shell in another tab
```
$ mongo
```
```
db.users.insert({ "username":"(a string of the username you want)", "password":"(*an md5 hash of the password you want*)"})
```

####You're good to go! Go to `localhost:3000` and start blogging!


#features:
- user auth for posting new articles
- inline editor (medium-like)

#todo:
- insert photos
- make it prettier
- display in reverse chronological
- editing
