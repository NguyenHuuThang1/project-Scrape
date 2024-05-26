const newsRouter = require('./news')
const siteRouter = require('./site')
const meRouter = require('./me')
const coursesRouter = require('./courses')
const searchRouter = require('./search')
function route(app){

      app.use('/news',newsRouter)
      app.use('/me',meRouter)
      app.use('/courses',coursesRouter)
      app.use('/search',searchRouter)
        
      app.use('/',siteRouter)

}

module.exports = route;