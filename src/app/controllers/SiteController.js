const Course = require('../models/Course')

class SiteController {
    index(req, res, next) {
        Course.find({})
          .lean()
          .then((courses) => {
            res.render("home", { courses });
          })
          .catch((error) => {
            next(error);
          });
      }
      
}

module.exports = new SiteController()