const xlsx = require('xlsx');

const workbook = xlsx.readFile('./App Cliente/Carteira detalhada de clientes.xls');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

console.log('--- Columns ---');
console.log(data[0] || data[1] || data[2] || data[3]); // Try first few rows in case of empty top rows

console.log('\n--- First 10 rows ---');
for(let i = 0; i < Math.min(10, data.length); i++) {
    console.log(JSON.stringify(data[i]));
}

console.log('\n--- Total rows: ' + data.length + ' ---');
