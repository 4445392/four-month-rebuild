// Keeps sw.js honest:
//  - every app file (index, css, js, fonts, icons, manifest) is listed in FILES, and every listed file exists;
//  - VERSION is a hash of those files, so any change ships as a new service-worker version.
//   node tools/stamp-sw.mjs          → writes the new VERSION
//   node tools/stamp-sw.mjs --check  → exits 1 if FILES or VERSION is out of date (used by the tests)
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

const root = new URL("../", import.meta.url);
const swPath = new URL("sw.js", root);
const sw = readFileSync(swPath, "utf8");
const listed = JSON.parse("[" + sw.match(/const FILES = \[([\s\S]*?)\];/)[1].trim().replace(/,\s*$/, "") + "]");

const onDisk = ["index.html", "manifest.webmanifest"];
for (const [dir, re] of [["css", /\.css$/], ["js", /\.js$/], ["fonts", /\.woff2$/], ["icons", /\.(png|svg)$/]]) {
  if (existsSync(new URL(dir + "/", root))) for (const f of readdirSync(new URL(dir + "/", root))) if (re.test(f)) onDisk.push(dir + "/" + f);
}
const problems = [];
for (const f of onDisk) if (!listed.includes(f)) problems.push("not in sw.js FILES: " + f);
for (const f of listed) if (f !== "./" && !existsSync(new URL(f, root))) problems.push("listed in sw.js but missing: " + f);

const h = createHash("sha256");
for (const f of listed.filter((f) => f !== "./").sort()) {
  let buf = readFileSync(new URL(f, root));
  if (/\.(html|css|js|webmanifest|svg)$/.test(f)) buf = Buffer.from(buf.toString("utf8").replace(/\r\n/g, "\n")); // same hash on Windows and Linux checkouts
  h.update(f + "\0").update(buf);
}
const version = h.digest("hex").slice(0, 12);
const current = (sw.match(/const VERSION = "([^"]*)";/) || [])[1];

if (process.argv.includes("--check")) {
  if (current !== version) problems.push(`sw.js VERSION is "${current}" but the files hash to "${version}" — run: node tools/stamp-sw.mjs`);
  if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
  console.log("sw.js up to date (" + version + ")");
} else {
  if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
  writeFileSync(swPath, sw.replace(/const VERSION = "[^"]*";/, `const VERSION = "${version}";`));
  console.log(current === version ? "sw.js already " + version : "sw.js VERSION " + current + " → " + version);
}
