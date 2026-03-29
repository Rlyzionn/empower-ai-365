const fs = require('fs');
const pdf = require('pdf-parse');
let dataBuffer = fs.readFileSync('../TechVera_Proposal_Final.pdf');
pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('../parsed_pdf.txt', data.text);
    console.log('PDF Extracted successfully.');
}).catch(console.error);
