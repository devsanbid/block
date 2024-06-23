const xlsx = require("xlsx");

const start_block = 17427383;
const needed = 10

async function get_detail_of_block(block) {
	const data = await fetch(
		`https://andromeda-explorer.metis.io/api/v2/blocks/${block}/transactions`,
	);
	const result_data = await data.json();
	const hash = result_data.items[0].hash;
	return {
        Network: "Metis",
        Address: result_data.items[0].from.hash,
        Category: "Infra,L2,Wallet",
        Entity: "Metis",
		"Evidence(TxHash)": hash,
        "Evidence(Link)": `https://andromeda-explorer.metis.io/tx/${hash}`,
        "Evidence(Text)": `${result_data.items[0].tx_types[0]} , ${result_data.items[0].tx_types[1] || ''}`,
	};
}

async function main() {
	const blockData = [];
	for (let i = 1; i < needed; i++) {
		const start = start_block + i;
        console.log(`starting ${i}`)
		const blockDetail = await get_detail_of_block(start);
		blockData.push(blockDetail);
	}
	const wb = xlsx.utils.book_new();
	const ws = xlsx.utils.json_to_sheet(blockData);

	xlsx.utils.book_append_sheet(wb, ws, "Block Details");

	xlsx.writeFile(wb, "block_data.xlsx");
}

main();
