import * as fs from "fs";
import * as hcl from "hcl2-parser";
import * as path from "path";

const filePath = path.join(process.cwd(), "samples", "vulnerable.tf");
const raw = fs.readFileSync(filePath, "utf-8");
const parsed = hcl.parseToObject(raw);
console.log(JSON.stringify(parsed, null, 2));
