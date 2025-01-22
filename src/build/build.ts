import esbuild from "esbuild";
import { build_scss } from "./src/build/css.ts";

import fs from "node:fs";
import path from "node:path";

// get task(s)
if (process.argv.length == 1) { build_all(); }
if (process.argv.length < 2) { process.exit(2); }
const args = process.argv.slice(2);
for (const arg in args) {
	switch(arg) {
		case "build_api":
			clean();
			build_api();
			break;
		case "build_pages":
			build_directory();
			build_products();
			build_pages();
			build_assets();
			build_scss();
			break;
		case "build_assets":
			build_assets();
			build_scss();
			break;
		case "build":
		case "build all":
			build_all();
	}
}

function build_all() {
	clean();
	build_directory();
	build_products();
	build_pages();
	build_api();
	build_assets();
	build_scss();
}

function clean() {
	return await fs.rm(path.join(__dirname, "dist"), {
		recursive: true,
		force: true
	});
}

function build_assets() {
	[
		"./src/static/**/*",
		"./node_modules/@fortawesome/fontawesome-free/**/*.{woff2,woff}",
		"./icons/**/*"
	].forEach((pattern) => {
		const files = glob(pattern);
		files.forEach((file) => {
			const tgt = path.join(`${__dirname}/dist/static/`, path.basename(file));
			fs.mkdirSync(`${__dirname}/dist/static/`, { recursive: true });
			fs.copyFileSync(file, tgt);
			if (process.env.NODE_ENV === "DEBUG") { console.log(`build_assets(): Copied ${file} to ${tgt}`); }
		});
	});

	[
		'./node_modules/lunr/lunr.min.js'
	].forEach((pattern) => {
		const files = glob(pattern);
		files.forEach((file) => {
			const tgt = path.join(`${__dirname}/dist/static/deps/`, path.basename(file));
			fs.mkdirSync(`${__dirname}/dist/static/deps/`, { recursive: true });
			fs.copyFileSync(file, tgt);
			if (process.env.NODE_ENV === "DEBUG") { console.log(`build_assets(): Copied ${file} to ${tgt}`); }
		});
	});

	[
		'./src/static/img/*.ico'
	].forEach((pattern) => {
		const files = glob(pattern);
		files.forEach((file) => {
			const tgt = path.join(`${__dirname}/dist/static/icons/`, path.basename(file));
			fs.mkdirSync(`${__dirname}/dist/static/icons/`, { recursive: true });
			fs.copyFileSync(file, tgt);
			if (process.env.NODE_ENV === "DEBUG") { console.log(`build_assets(): Copied ${file} to ${tgt}`); }
		});
	});

	[
		'./src/static/img/*.ico'
	].forEach((pattern) => {
		const files = glob(pattern);
		files.forEach((file) => {
			const tgt = path.join(`${__dirname}/dist/static/icons/`, path.basename(file));
			fs.mkdirSync(`${__dirname}/dist/static/icons/`, { recursive: true });
			fs.copyFileSync(file, tgt);
			if (process.env.NODE_ENV === "DEBUG") { console.log(`build_assets(): Copied ${file} to ${tgt}`); }
		});
	});
}


function glob(pattern: string): string[] {
	const files: string[] = [];
	const glob = (dir: string) => {
		const items = fs.readdirSync(dir, { withFileTypes: true });
		for (const item of items) {
			const path = path.join(dir, item.name);
			if (item.isDirectory()) {
				glob(item);
			} else if (match(item.name, pattern.split('/').pop() || '')) {
				files.push(items);
			}
		}
	};
	glob(__dirname);
	return files;
}
function match(file: string, pattern: string): boolean {
	return new RegExp('^' + pattern.split('*'.map(part => {
		return part.replace(/[-/\\^$+?.()|[\]{}]/g, '\\$&');
	}).join('.*') + '$')).test(file);
}
