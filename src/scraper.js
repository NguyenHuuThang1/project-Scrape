const Course = require('./app/models/Course');
const { connect } = require('./config/db');
const scrapeCategory = (browser, url) => new Promise(async (resolve, reject) => {
    try {
        let page = await browser.newPage()
        console.log('>> Mở tab mới ...');
        await page.goto(url)
        console.log('>>Truy cập vào ' + url)
        await page.waitForSelector('#shopify-section-all-collections')
        console.log('>> Website đã load xong...');

        const dataCategory = await page.$$eval('#shopify-section-all-collections > div.all-collections > div.sdcollections-content > ul.sdcollections-list > li', els => {
            return els.map(el => {
                return {
                    category: el.querySelector('div.collection-name').innerText,
                    link: el.querySelector('a').href
                }
            })
        })
        //console.log(dataCategory);

        await page.close()
        console.log('>> Tab đã đóng.');
        resolve(dataCategory)

    } catch (error) {
        console.log('lỗi ở scrape category: ' + error)
        reject(error)
    }
})

const scrapeCategory2 = (browser, url) => new Promise(async (resolve, reject) => {
    try {
        let page = await browser.newPage()
        console.log('>> Mở tab mới ...');
        await page.goto(url)
        console.log('>>Truy cập vào ' + url)
        await page.waitForSelector('header.header')
        console.log('>> Website đã load xong...');

        const dataCategory = await page.$$eval('header.header > div.header__main > div > ul.main-menu > li', els => {
            return els.map(el => {
                return {
                    category: el.querySelector('a span').innerText,
                    link: el.querySelector('a').href
                }
            })
        })
        //console.log(dataCategory);

        await page.close()
        console.log('>> Tab đã đóng.');
        resolve(dataCategory)

    } catch (error) {
        console.log('lỗi ở scrape category: ' + error)
        reject(error)
    }
})

const scrapeProductDetails = async (browser, url) => {
    try {
        let page = await browser.newPage();
        await page.goto(url);
        await page.waitForSelector('div.product-single__meta'); 

        const productDetails = await page.$$eval('div.product-single__description > ul > li', (els) => {
            let details = {};
            els.forEach((el) => {
                const [key, value] = el.innerText.split(':'); // Tách key và value bằng dấu ":"
                details[key.trim()] = value.trim(); // Loại bỏ khoảng trắng xung quanh key và value
            });
            return details;
        });

        await page.close();
        return productDetails;
    } catch (error) {
        console.error('Lỗi ở scrape details items: ' + error);
        throw error;
    }
};

const scrapeProductDetails2 = async (browser, url) => {
    try {
        let page = await browser.newPage();
        await page.goto(url);
        await page.waitForSelector('body');

        const productDetails = await page.$$eval('body > section.detail > div.box_main > div.box_right > div.parameter > ul > li', (els) => {
            return els.map((el) => {
                const key = el.querySelector('p.lileft') ? el.querySelector('p.lileft').innerText : '';
                const value = el.querySelector('div.liright') ? el.querySelector('div.liright').innerText : '';
                return `${key.trim()} ${value.trim()}`;
            });
        });

        await page.close();
        return productDetails.join('\n'); // Kết hợp các chi tiết thành một chuỗi, mỗi chi tiết trên một dòng mới
    } catch (error) {
        console.error('Lỗi ở scrape details items: ' + error);
        throw error; // Phải sử dụng throw để reject promise trong trường hợp có lỗi
    }
};

const scraper = (browser, url) => new Promise(async (resolve, reject) => {
    try {
        let newPage = await browser.newPage()
        console.log('>> Mở tab mới ...');
        await newPage.goto(url)
        console.log('>>Truy cập vào ' + url)
        await newPage.waitForSelector('div#collection-product-grid')
        console.log('>> Website đã load xong...');

        const items = await newPage.$$eval('div#collection-product-grid > div.grid-element', els => {
            return els.map(el => {
                return {
                    name: el.querySelector('div.grid-view-item__title').innerText,
                    price: el.querySelector('span.money').innerText,
                    img: el.querySelector('img.grid-view-item__image').src,
                    link: el.querySelector('div.grid-view-item__title > a').href,
                    

                }
            })
        })

        await newPage.close()
        console.log('>> Tab đã đóng.');

        for (let item of items) {
            const details = await scrapeProductDetails(browser, item.link);
            if (details) {
                item.details = details; 
            }
        }

        console.log(items)

        resolve(items)

        insertItemsToMongoDB(items);

    } catch (error) {
        console.log('lỗi ở scrape items: ' + error)
        reject(error)
    }
})

const scraper2 = (browser, url) => new Promise(async (resolve, reject) => {
    try {
        let newPage = await browser.newPage()
        console.log('>> Mở tab mới ...');
        await newPage.goto(url)
        console.log('>>Truy cập vào ' + url)
        await newPage.waitForSelector('ul.listproduct')
        console.log('>> Website đã load xong...');

        const items = await newPage.$$eval('ul.listproduct > li.item ', els => {
            return els.map(el => {
                return {
                    name: el.querySelector('h3').innerText,
                    price: el.querySelector('strong.price').innerText,
                    img: el.querySelector('img.thumb').src,
                    link: el.querySelector('a.main-contain').href
                }
            })
        })

        await newPage.close()
        console.log('>> Tab đã đóng.');

        for (let item of items) {
            const details = await scrapeProductDetails2(browser, item.link);
            if (details) {
                item.details = details; 
            }
        }
        console.log(items)
        resolve(items)

        insertItemsToMongoDB(items);

    } catch (error) {
        console.log('lỗi ở scrape items: ' + error)
        reject(error)
    }
})


async function clearOldDataFromMongoDB() {
    try {
        const connection = await connect();
        const db = connection.useDb('Data_price'); // Thay thế 'ten_database' bằng tên cơ sở dữ liệu của bạn
        const collection = db.collection('courses'); // Thay thế 'ten_collection' bằng tên bảng/collection của bạn

        const result = await collection.deleteMany({});
        console.log(`${result.deletedCount} documents đã được xóa khỏi MongoDB`);
    } catch (error) {
        console.error('Lỗi khi xóa dữ liệu cũ từ MongoDB:', error);
    }
}

async function insertItemsToMongoDB(items) {
    try {
        // Chuyển đối tượng details thành chuỗi JSON
        items.forEach(item => {
            if (item.details && typeof item.details === 'object') {
                item.details = JSON.stringify(item.details);
            }
        });

        // Chèn dữ liệu mới vào MongoDB
        const result = await Course.insertMany(items);
        console.log(`${result.length} documents đã được chèn thành công vào MongoDB`);
    } catch (error) {
        console.error('Lỗi khi chèn dữ liệu vào MongoDB:', error);
    }
}


module.exports = {
    scrapeCategory,
    scraper,
    scrapeCategory2,
    scraper2,
    clearOldDataFromMongoDB
}