const path = require("path");
const Dotenv = require("dotenv-webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: "./js/index.js",
    module: {
        rules: [
            {
                test: /\.(html)$/,
                use: ["html-loader"]
            }
        ]
    },
    plugins: [
        new Dotenv(),
        new HtmlWebpackPlugin({
            template: "template.html",
            inject: "body",
            scriptLoading: "blocking",
        })
    ]
};