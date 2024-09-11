const xlsx = require("xlsx");
const puppeteer = require("puppeteer");
const jsonpath = require("jsonpath-plus"); // For data extraction (optional)

async function main() {
  const startBlock = 3184471; 
  const endBlock = 3184480; 
  const address_collection = [];
  let screenshot_no = 2;

  const browser = await puppeteer.launch({ executablePath: "/run/current-system/sw/bin/chromium" });

  for (let blockNumber = startBlock; blockNumber <= endBlock; blockNumber++) {
    const apiUrl = `https://pacific-explorer.manta.network/api/v2/blocks/${blockNumber}/transactions`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      for (const item of data.items) {
        const fromAddress = item.from.hash;

        let flag = 0;
        for (let i = 0; i < address_collection.length; i++) {
          if (address_collection[i] === fromAddress) {
            flag = 1;
            break;
          }
        }

        if (flag === 0) {
          const blockDetail = {
            Network: "Manta",
            Address: fromAddress,
            // ... Extract other relevant data from 'item' using jsonpath or manually
          };

          address_collection.push(fromAddress);

          const screenshotUrl = `https://pacific-explorer.manta.network/tx/${item.hash}`;
          await screenshot(screenshotUrl, browser, screenshot_no);
          screenshot_no++;

          console.log(`Processing transaction ${item.hash}`);
          // Add blockDetail object to your data structure for further processing (e.g., write to spreadsheet)
        }
      }
    } catch (error) {
      console.error(`Error fetching data for block ${blockNumber}:`, error);
    }
  }

  await browser.close();

  // Write data to spreadsheet (assuming you have collected block details)
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(blockData);
  xlsx.utils.book_append_sheet(wb, ws, "Block Details");
  xlsx.writeFile(wb, "block_data.xlsx");
}

async function screenshot(url, browser, page_no) {
  const page = await browser.newPage();
  await page.goto(url);
  await page.setViewport({ width: 1830, height: 850 });
  await page.evaluate(() => window.scrollBy(0, 150));
  await new Promise((resolve) => setTimeout(resolve, 2000));
  await page.screenshot({ path: `Screenshot/${page_no}.png` });
}

main()
