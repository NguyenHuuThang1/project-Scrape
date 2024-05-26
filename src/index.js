const express = require('express')
const path = require('path')
const morgan = require('morgan')
const { engine } = require("express-handlebars");
const app = express()
const port = 3001
const route = require('./routes')
const db = require('./config/db')
const Handlebars = require("handlebars")
const methodOverride = require('method-override')


const startBrowser = require('./browser')
const scrapeController = require('./scrapeController')

let browser = startBrowser()
scrapeController(browser)


app.use(express.urlencoded({ extended: true }))
app.use(express.json())

db.connect()

app.use(express.static(path.join(__dirname,'public')))

app.use(morgan('combined'))

app.engine("handlebars", engine());

app.use(methodOverride('_method'))

Handlebars.registerHelper("sum", function (a, b) {
  return a + b;
});

app.set('view engine', 'handlebars')
app.set('views',path.join(__dirname,'resources', 'views'))

route(app);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})