const API_KEY = process.env.ETH_KEY
const BASE_URL = "https://api.etherscan.io/api";
const xlsx = require("xlsx");
const puppeteer = require("puppeteer");

const needed = 20;
const address_collection = [];
const BLOCK_NUMBER = 20197654;
let screenshot_no = 2;

async function getBlockAndTransactionData(blockNumber) {
	const txListUrl = `${BASE_URL}?module=proxy&action=eth_getBlockByNumber&tag=0x${blockNumber.toString(16)}&boolean=true&apikey=${API_KEY}`;
	const txListResponse = await fetch(txListUrl);
	const txListData = await txListResponse.json();

	return {
		hash: txListData.result.transactions[0].hash,
		address: txListData.result.transactions[0].from,
	};
}

async function screenshot(url, page_no) {
	const browser = await puppeteer.launch({
		executablePath: "/usr/bin/chromium",
		headless: false, // Set to true for headless mode
		defaultViewport: null,
	});
	const page = await browser.newPage();
	await page.goto(url);
	await new Promise((resolve) => setTimeout(resolve, 2000));
	await page.setViewport({ width: 1830, height: 850 });
	await page.evaluate(() => window.scrollBy(0, 150));

	await new Promise((resolve) => setTimeout(resolve, 1000));
	await page.screenshot({ path: `eth_Screenshot/${page_no}.png` });
	await browser.close();
}

async function main() {
	const blockData = [];
	for (let j = 0; j < needed; j++) {
		const random_int = Math.floor(Math.random() * 15);
		const start = BLOCK_NUMBER + random_int;
		console.log(start);
		const result_data = await getBlockAndTransactionData(start);

		const hash = result_data.hash;
		const address = result_data.address;

		let flag = 0;

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

		await screenshot(`https://etherscan.io/tx/${hash}`, screenshot_no);
		console.log("Screenshot done ", screenshot_no);
		screenshot_no++;

		const blockDetail = {
			Network: "Ethereum",
			Address: address,
			Category: "Infra,L2,Wallet",
			Entity: "Ethereum",
			"Evidence(TxHash)": hash,
			"Evidence(Link)": `https://etherscan.io/tx/${hash}`,
			"Evidence(Text)": " ",
		};

		address_collection.push(address);
		blockData.push(blockDetail);
	}
	const wb = xlsx.utils.book_new();
	const ws = xlsx.utils.json_to_sheet(blockData);
	xlsx.utils.book_append_sheet(wb, ws, "Ethereum Details");
	xlsx.writeFile(wb, "ethereum.xlsx");
}

main();

getBlockAndTransactionData(BLOCK_NUMBER);
