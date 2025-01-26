import { Product, RubricQuestion, Contributor } from "./src/parsing/types";

import {
  loadRubric,
  loadProducts,
  loadContributors,
} from "./src/parsing/index";

import {
  hbsFactory,
  getProductPageBuildTasks,
  getDirectoryPagesTasks,
  getExtensionAPI,
} from "./src/build/utils";

const gulp = require("gulp");
const postcss = require("gulp-postcss");
const fs = require("node:fs");
const path = require("node:path");
const through = require("through2");

const rubric: RubricQuestion[] = loadRubric();
const contributors: Contributor[] = loadContributors();
const products: Product[] = loadProducts(rubric, contributors);

gulp.task("clean", async () => {
  return fs.rmSync(path.join(__dirname, "dist"), {
    recursive: true,
    force: true,
  });
});

gulp.task("build api", async () => {
  const apiVersion = "v2";

  if (!fs.existsSync(`./dist/api/${apiVersion}/products`)) {
    fs.mkdirSync(`./dist/api/${apiVersion}/products`, { recursive: true });
  }

  const resolvedDates = await Promise.all(
    products.map((product) => product.lastUpdated)
  );

  const resolvedProducts = products.map((product, i) => {
    return {
      ...product,
      lastUpdated: resolvedDates[i],
    };
  });

  resolvedProducts.forEach((product) => {
    fs.writeFileSync(
      `./dist/api/${apiVersion}/products/${product.slug}.json`,
      JSON.stringify(product)
    );
  });

  const api = getExtensionAPI(resolvedProducts);

  return gulp
    .src(["./src/templates/pages/api/**/*.json"])
    .pipe(hbsFactory({ rubric, contributors, resolvedProducts, api }))
    .pipe(gulp.dest("./dist/api/"));
});

gulp.task("build general pages", () => {
  return gulp
    .src(["./src/templates/pages/**/*.hbs", "./src/templates/pages/*.hbs"], {
      ignore: [
        "./src/templates/pages/product.hbs",
        "./src/templates/pages/directory.hbs",
      ],
    })
    .pipe(through.obj((file, _, cb) => { // change to .html extension
      if (file.isBuffer()) {
        const fp = path.format({
          dir: path.dirname(file.path),
          name: path.basename(file.path, ".hbs"),
          ext: '.html'
        })
      }
      cb(null, file);
    }))
    .pipe(hbsFactory({ rubric, contributors, products }))
    .pipe(gulp.dest("./dist/"));
});

gulp.task(
  "build pages",
  gulp.parallel(
    ...getProductPageBuildTasks(products),
    ...getDirectoryPagesTasks(products),
    "build general pages",
    "build api"
  )
);

gulp.task("collect dependencies", () => {
  return gulp
    .src(["./node_modules/lunr/lunr.min.js"])
    .pipe(gulp.dest("./dist/static/deps/"));
});

gulp.task("collect static", () => {
  return gulp
    .src([
      "./src/static/**/*",
      "./node_modules/@fortawesome/fontawesome-free/**/*.{woff2,woff}",
      "!./src/static/**/*.{css,scss}",
    ])
    .pipe(gulp.dest("./dist/static/"));
});

gulp.task("collect root favicon", () => {
  return gulp.src(["./src/static/img/*.ico"]).pipe(gulp.dest("./dist/"));
});

gulp.task("collect product icons", () => {
  return gulp.src(["./icons/**/*"]).pipe(gulp.dest("./dist/static/icons/"));
});

gulp.task("build css", async () => {
  return gulp
    .src(["./src/static/css/base.scss"])
    .pipe(postcss())
    .pipe(through.obj((file, _, cb) => { // change to .css extension
      if (file.isBuffer()) {
        const fp = path.format({
          dir: path.dirname(file.path),
          name: path.basename(file.path, ".scss"),
          ext: '.css'
        })
      }
      cb(null, file);
    }))
    .pipe(gulp.dest("./dist/static/css/"));
});

gulp.task(
  "default",
  gulp.series([
    "clean",
    "build pages",
    "collect dependencies",
    "collect static",
    "collect product icons",
    "collect root favicon",
    "build css"
  ])
);

if (process.env.NODE_ENV === "debug") {
  gulp.watch(
    ["./src/templates/**/*"],
    gulp.series("build pages", "collect static")
  );
  gulp.watch(["./src/**/*.{css,scss}", "build css"]);
}
