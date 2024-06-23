const xlsx = require("xlsx");

const start_block = 17427383;

async function get_detail_of_block(block) {
	const data = await fetch(
		`https://andromeda-explorer.metis.io/api/v2/blocks/${block}/transactions`,
	);
	const result_data = await data.json();
	const hash = result_data.items[0].hash;
	return {
		Hash: hash,
		Types: `${result_data.items[0].tx_types[0]} , ${result_data.items[0].tx_types[1] || ''}`,
		Address: result_data.items[0].from.hash,
		URL: `https://andromeda-explorer.metis.io/tx/${hash}`,
	};
}

async function main() {
	const blockData = [];
	for (let i = 1; i < 10; i++) {
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
