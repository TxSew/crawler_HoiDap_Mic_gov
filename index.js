const cheerio = require("cheerio");
const request = require("request-promise");
const fs = require("fs");
let idCate = [
  "the-gioi",
  "the-gioi/tu-lieu",
  "the-gioi/phan-tich",
  "the-gioi/nguoi-viet-5-chau",
  "the-gioi/cuoc-song-do-day",
  "the-gioi/quan-su",

  "bat-dong-san",
  "bat-dong-san/chinh-sach",
  "bat-dong-san/thi-truong",
  "bat-dong-san/du-an",
  "bat-dong-san/khong-gian-song",
  "bat-dong-san/tu-van",

  "podcast",
  "podcast/vnexpress-hom-nay",
  "podcast/toi-ke",
  "podcast/giai-ma",
  "podcast/hop-den",
  "podcast/ho-noi-gi",
  "podcast/ly-hon",
  "podcast/nguy-co",
  "podcast/diem-tin",
  "podcast/chuyen-di-lam",

  "the-thao",
  "the-thao/tennis",
  "the-thao/du-lieu-bong-da",
  "the-thao/cac-mon-khac",
  "the-thao/hau-truong",
  "the-thao/video",

  "phap-luat",
  "phap-luat/ho-so-pha-an",
  "phap-luat/tu-van",
  "phap-luat/video",

  "giai-tri",
  "giai-tri/gioi-sao",
  "giai-tri/sach",
  "giai-tri/nhac",
  "giai-tri/thoi-trang",
  "giai-tri/lam-dep",
  "giai-tri/san-khau-my-thuat",

  "bong-da",
  "du-lich",
  "du-lich/diem-den",
  "du-lich/am-thuc",
  "du-lich/dau-chan",
  "du-lich/tu-van",
  "du-lich/anh-video",

  "oto-xe-may/thi-truong",
  "oto-xe-may/dien-dan",

  "so-hoa",
  "so-hoa/cong-nghe",
  "so-hoa/san-pham",
  "so-hoa/kinh-nghiem",

  "doi-song",
  "doi-song/to-am",
  "doi-song/bai-hoc-song",
  "doi-song/cooking",
  "doi-song/tieu-dung",
  "doi-song/nhip-song",

  "giao-duc",
  "giao-duc/tin-tuc",
  "giao-duc/tuyen-sinh",
  "giao-duc/chan-dung",
  "giao-duc/du-hoc",
  "giao-duc/thao-luan",
  "giao-duc/hoc-tieng-anh",
  "giao-duc/giao-duc-40",

  "suc-khoe",
  "suc-khoe/tin-tuc",
  "suc-khoe/tu-van",
  "suc-khoe/dinh-duong",
  "suc-khoe/khoe-dep",
  "suc-khoe/dan-ong",
  "suc-khoe/cac-benh",
  "suc-khoe/vaccine",

  "y-kien",
  "y-kien/thoi-su",
  "y-kien/doi-song",

  "tam-su",
  "tam-su/hen-ho",

  "thu-dan",
  "thu-gian/cuoi",
  "thu-gian/thu-cung",
  "thu-gian/chuyen-la",
  "thu-gian/crossword",

  "thoi-su",
  "thoi-su/chinh-tri",
  "thoi-su/dan-sinh",
  "thoi-su/lao-dong-viec-lam",
  "thoi-su/giao-thong",
  "thoi-su/mekong",

  "goc-nhin",
  "goc-nhin/binh-luan-nhieu",
  "goc-nhin/chinh-tri-chinh-sach",
  "goc-nhin/y-te-suc-khoe",
  "goc-nhin/kinh-doanh-quan-tri",
  "goc-nhin/giao-duc-tri-thuc",
  "goc-nhin/moi-truong",
  "goc-nhin/covid-19",
  "goc-nhin/tac-gia",

  "kinh-doanh",
  "kinh-doanh/quoc-te",
  "kinh-doanh/doanh-nghiep",
  "kinh-doanh/chung-khoan",
  "kinh-doanh/ebank",
  "kinh-doanh/vi-mo",
  "kinh-doanh/tien-cua-toi",
  "kinh-doanh/bao-hiem",
  "kinh-doanh/hang-hoa",

  "khoa-hoc",
  "khoa-hoc/khoa-hoc-trong-nuoc",
  "khoa-hoc/pii-doi-moi-sang-tao",
  "khoa-hoc/tin-tuc",
  "khoa-hoc/phat-minh",
  "khoa-hoc/ung-dung",
  "khoa-hoc/the-gioi-tu-nhien",
  "khoa-hoc/thuong-thuc",
];
const maxPages = 20; // Số lượng trang tối đa cần tải cho mỗi category

// Hàm để tải và xử lý dữ liệu cho mỗi trang category
const fetchDataForCategoryPage = async (category, page) => {
  const url = `https://vnexpress.net/${category}-p${page}`;
  try {
    const html = await request(url);
    const $ = cheerio.load(html);
    const data = $(".item-news")
      .map((index, el) => {
        const title = $(el).find(".title-news a").text();
        const description = $(el).find(".description a").text();
        const link = $(el).find(".thumb-art a").attr("href");
        const thumbnail = $(el).find(".thumb-art img").attr("src");
        return { title, description, category, link, thumbnail };
      })
      .get();
    return data;
  } catch (error) {
    return [];
  }
};

// Hàm để tải dữ liệu cho tất cả các trang của mỗi category
const fetchDataForCategory = async (category) => {
  const promises = Array.from({ length: maxPages }, (_, index) =>
    fetchDataForCategoryPage(category, index + 1)
  );
  try {
    const results = await Promise.all(promises);
    console.log("🚀 ~ fetchDataForCategory ~ results:", results);
    return results.flat(); // Chuyển mảng 2 chiều thành mảng 1 chiều
  } catch (error) {
    return [];
  }
};

// Hàm để tải dữ liệu cho tất cả các categories
const fetchDataForAllCategories = async () => {
  const promises = idCate.map((category) => fetchDataForCategory(category));
  try {
    const results = await Promise.all(promises);
    console.log("🚀 ~ fetchDataForAllCategories ~ results:", results);
    return results.flat(); // Chuyển mảng 2 chiều thành mảng 1 chiều
  } catch (error) {
    return [];
  }
};

// Tải dữ liệu cho tất cả các categories và ghi vào file
fetchDataForAllCategories()
  .then((allData) => {
    fs.writeFileSync("data.json", JSON.stringify(allData));
    console.log("Data has been written to data.json");
  })
  .catch((error) => {
    console.error("Error fetching data for all categories", error);
  });
