const Course = require('../models/Course')

class SearchController {
      // [GET] /search
      search(req, res, next) {
        let name = req.params.name; // Lấy tên tìm kiếm từ URL params
        name = name.replace(/%20/g, ' '); // Thay thế %20 bằng khoảng trắng
        // Thực hiện tìm kiếm theo tên
        Course.find({ name: { $regex: new RegExp(name, "i") } })
          .then((courses) => {
            console.log("Kết quả tìm kiếm:", courses); // Log để kiểm tra kết quả tìm kiếm
            if (courses.length === 0) {
              console.log("Không tìm thấy kết quả nào.");
            }
            // Chuyển đổi các đối tượng Mongoose Document thành đối tượng tiêu chuẩn
            const plainCourses = courses.map(course => course.toObject());
            // Xử lý kết quả tìm kiếm, ví dụ: render trang kết quả
            res.render('search', { courses: plainCourses });
          })
          .catch((error) => {
            next(error);
          });
      }
}

module.exports = new SearchController()