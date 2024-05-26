const scrapers = require('./scraper')

const websites = [
    {
        name: 'Digital World',
        url: 'https://digital-world-2.myshopify.com/',
        scrapeCategoryFunction: scrapers.scrapeCategory, // Thay thế bằng hàm cạo dữ liệu danh mục cho trang Digital World
        scrapeDataFunction: scrapers.scraper // Thay thế bằng hàm cạo dữ liệu cho trang Digital World
    },
    {
        name: 'TheGioiDiDong',
        url: 'https://www.thegioididong.com/',
        scrapeCategoryFunction: scrapers.scrapeCategory2, // Thay thế bằng hàm cạo dữ liệu danh mục cho trang Your New Website
        scrapeDataFunction: scrapers.scraper2 // Thay thế bằng hàm cạo dữ liệu cho trang Your New Website
    }
    
    // Thêm các trang web khác vào đây nếu cần
]

const scrapeController = async (browserInstance) => {
    

    try {
        let browser = await browserInstance
        // gọi hàm cạo ở file s scrape

        await scrapers.clearOldDataFromMongoDB();
        for (const website of websites) {
        const indexs = [0]

        const categories = await website.scrapeCategoryFunction(browser, website.url)
        // console.log(categories);
        const selectedCategories = categories.filter((category, index) => indexs.some(i=> i === index))

        console.log(selectedCategories)

        await website.scrapeDataFunction(browser, selectedCategories[0].link)
   
        }
    } catch (e) {
        console.log('Lỗi ở scrape controller: ' + e);
    }
}



module.exports = scrapeController