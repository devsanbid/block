const API_KEY = process.env.ETH_KEY;
const BASE_URL = "https://api.etherscan.io/api";

const xlsx = require("xlsx");
const puppeteer = require("puppeteer");

const needed = 80;
let BLOCK_NUMBER = 20198654;
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

async function screenshot(url) {
	const browser = await puppeteer.launch({
		executablePath: "/run/current-system/sw/bin/chromium",
		headless: false, 
		defaultViewport: null,
	});
	const page = await browser.newPage();
	await page.goto(url);
	await new Promise((resolve) => setTimeout(resolve, 2000));
	await page.setViewport({ width: 1830, height: 850 });
	await page.evaluate(() => window.scrollBy(0, 150));

	await new Promise((resolve) => setTimeout(resolve, 1000));
	await page.screenshot({ path: `eth_Screenshot/${screenshot_no}.png` });
	await browser.close();
	screenshot_no++;
}

async function main() {
	const blockData = [];
	for (let j = 0; j < needed; j++) {
		BLOCK_NUMBER++;
		const result_data = await getBlockAndTransactionData(BLOCK_NUMBER);
        console.log(`${j}: Block no ${BLOCK_NUMBER}`)

		const hash = result_data.hash;
		const address = result_data.address;

		await screenshot(`https://etherscan.io/tx/${hash}`);

		const blockDetail = {
			Network: "Ethereum",
			Address: address,
			Category: "Infra,L2,Wallet",
			Entity: "Ethereum",
			"Evidence(TxHash)": hash,
			"Evidence(Link)": `https://etherscan.io/tx/${hash}`,
			"Evidence(Text)": " ",
		};

		blockData.push(blockDetail);
	}
	const wb = xlsx.utils.book_new();
	const ws = xlsx.utils.json_to_sheet(blockData);
	xlsx.utils.book_append_sheet(wb, ws, "Ethereum Details");
	xlsx.writeFile(wb, "ethereum.xlsx");
}

main();

getBlockAndTransactionData(BLOCK_NUMBER);
