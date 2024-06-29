const xlsx = require("xlsx");
const puppeteer = require("puppeteer");

const start_block = 17427383;
const needed = 15;
const address_collection = [];
let screenshot_no = 2

async function screenshot(url,page_no) {
   const browser = await puppeteer.launch({executablePath: "/usr/bin/google-chrome-stable"})
	const page = await browser.newPage();
	await page.goto(
		url
	);
	await page.setViewport({ width: 1830, height: 850 });
	await page.evaluate(() => window.scrollBy(0, 150));

	await new Promise((resolve) => setTimeout(resolve, 2000));
	await page.screenshot({ path: `Screenshot/${page_no}.png` });
	await browser.close();
}

async function main() {
	const blockData = [];
	for (let j = 0; j < needed; j++) {
		const random_int = Math.floor(Math.random() * 15);
		const start = start_block + random_int;
		const data = await fetch(
			`https://andromeda-explorer.metis.io/api/v2/blocks/${start}/transactions`,
		);
		const result_data = await data.json();
		const hash = result_data.items[0].hash;
		const address = result_data.items[0].from.hash;

		let flag = 0;
        let i = 1

		for (let i = 0; i < address_collection.length; i++) {
			if (address === address_collection[i]) {
				flag += 1;
				break;
			}
		}

		if (flag === 1) {
			continue;
		}

        console.log(`starting ${j}`);

        await screenshot(`https://andromeda-explorer.metis.io/tx/${hash}`,screenshot_no)
        console.log("Screenshot done ", screenshot_no)
        screenshot_no++

		const blockDetail = {
			Network: "Metis",
			Address: result_data.items[0].from.hash,
			Category: "Infra,L2,Wallet",
			Entity: "Metis",
			"Evidence(TxHash)": hash,
			"Evidence(Link)": `https://andromeda-explorer.metis.io/tx/${hash}`,
			"Evidence(Text)": `${result_data.items[0].tx_types[0]} , ${result_data.items[0].tx_types[1] || ""}`,
		};

		address_collection.push(address);
		blockData.push(blockDetail);
	}
	const wb = xlsx.utils.book_new();
	const ws = xlsx.utils.json_to_sheet(blockData);
	xlsx.utils.book_append_sheet(wb, ws, "Block Details");
	xlsx.writeFile(wb, "block_data.xlsx");
}

main();
