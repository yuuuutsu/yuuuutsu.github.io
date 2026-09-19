const resolve = require("C:/Users/admin/my-blog/themes/hugo-toigian/node_modules/resolve");
const themeDir = "C:/Users/admin/my-blog/themes/hugo-toigian/";
const opts = {
  basedir: "C:/Users/admin/my-blog",
  moduleDirectory: ["web_modules", "node_modules"],
  paths: [themeDir],
  extensions: [".css"],
  packageFilter: function (pkg) {
    if (pkg.style) pkg.main = pkg.style;
    else if (!pkg.main || !/\.css$/.test(pkg.main)) pkg.main = "index.css";
    return pkg;
  },
  preserveSymlinks: false,
};
resolve("tailwindcss/base", opts, (err, path) => {
  if (err) console.log("ERR1:", err.message.split("\n")[0]);
  else console.log("OK:", path);
});
resolve("tailwindcss/base", { ...opts, paths: undefined }, (err, path) => {
  if (err) console.log("ERR2:", err.message.split("\n")[0]);
  else console.log("OK2:", path);
});
