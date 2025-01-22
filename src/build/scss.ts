import esbuild from "esbuild";
import { sass } from "esbuild-sass-plugin";
import postcss from "postcss";
import autoprefixer from "autoprefixer";
import postcssImport from "postcss-import";
import postcssScss from "postcss-scss";
import purgecss from "@fullhuman/postcss-purgecss";
import tailwind from "tailwindcss";

export function build_scss() {
	esbuild.build({
		entryPoints: ["./src/css/base.scss"],
		outfile: ["./dist/static/css/base.css"],
		bundle: true,
		plugins: [sass({
			async transform(src, res) {
				const { css } = await postcss([
					autoprefixer,
					postcssImport,
					postcssScss,
					purgecss({
						// Specify the paths to all of the template files in your project
						content: [
							"./src/**/*.hbs",
							"./src/**/*.js",
							"./src/**/*.ts",
							"./gulpfile.ts"
						],
						// This is the function used to extract class names from your templates
						defaultExtractor: content => {
			        // Capture as liberally as possible, including things like `h-(screen-1.5)`
			        const broadMatches = content.match(/[^<>"'`\s]*[^<>"'`\s:]/g) || []
			        // Capture classes within other delimiters like .block(class="w-1/2") in Pug
			        const innerMatches = content.match(/[^<>"'`\s.()]*[^<>"'`\s.():]/g) || []

			        return broadMatches.concat(innerMatches)
						}
					}),
					tailwind("tailwind.config.js"),
				]).process(src, {from: undefined});
				return css;
			}
		})]
	}).catch(() => process.exit(1));
}
