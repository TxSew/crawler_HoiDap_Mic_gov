const cheerio = require("cheerio");
const request = require("request-promise");
const fs = require("fs");
const maxPages = 439; // Maximum number of pages to fetch for each category

// Function to fetch and process data for each category page
const fetchDataForCategoryPage = async (page) => {
  const url = `https://mic.gov.vn/Pages/HoiDap.aspx?chudeid=98&pageid=${page}`;
  try {
    const html = await request(url);
    const $ = cheerio.load(html);
    const data = $(".content")
      .map((index, el) => {
        const title = $(el).find("div:first-child strong").text().trim();
        const email = $(el).find("div:nth-child(2) strong").text().trim();
        const question = $(el).find("div:nth-child(3) p").text().trim();
        const answer = $(el).find("div:last-child").text().trim();

        return { title, email, question, answer };
      })
      .get();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

// Function to fetch data from multiple pages
const fetchDataFromMultiplePages = async () => {
  let allData = [];
  for (let page = 1; page <= maxPages; page++) {
    const pageData = await fetchDataForCategoryPage(page);
    allData = allData.concat(pageData);
  }
  return allData;
};

// Filter data containing the keyword "13/2020"
const filterDataContainingKeyword = (data) => {
  return data.filter(
    (item) =>
      item.title.includes("13/2020") ||
      item.question.includes("13/2020") ||
      item.email.includes("13/2020") ||
      item.answer.includes("13/2020")
  );
};

// Example usage:
fetchDataFromMultiplePages()
  .then((allData) => {
    //add filter by keyword "13/2020"
    const filteredData = filterDataContainingKeyword(allData);
    // Write filtered data to a JSON file
    fs.writeFile("full.json", JSON.stringify(filteredData, null, 2), (err) => {
      if (err) {
        console.error("Error writing JSON file:", err);
        return;
      }
      console.log("Filtered data has been written to filteredData.json");
    });
  })
  .catch((error) => {
    console.error("Error fetching data from multiple pages:", error);
  });
