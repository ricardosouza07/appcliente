import * as xlsx from 'xlsx';

const workbook = xlsx.readFile('./App Cliente/Carteira detalhada de clientes.xls');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

console.log('--- Columns ---');
console.log(data[0]);

console.log('\n--- First 5 rows ---');
for(let i = 1; i < Math.min(6, data.length); i++) {
    console.log(data[i]);
}

console.log('\n--- Total rows: ' + data.length + ' ---');
