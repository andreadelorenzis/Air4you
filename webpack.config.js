const path = require("path");
const Dotenv = require("dotenv-webpack");

module.exports = {
    mode: "development",
    devtool: false,
    entry: "./js/index.js",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "dist")
    },
    plugins: [
        new Dotenv()
    ]
};