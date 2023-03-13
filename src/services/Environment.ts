import * as fs from 'fs';

let environmentFile = fs.readFileSync('.env').toString().trim();

export const Environment = JSON.parse(fs.readFileSync(environmentFile).toString());

console.log(`Environment file ${environmentFile} read`);