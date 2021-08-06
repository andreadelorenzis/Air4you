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
        }),
        new HtmlWebpackPlugin({
            template: "pages/info-page/info.html",
            filename: "info.html"
        }),
        new HtmlWebpackPlugin({
            template: "pages/world-map/world.html",
            filename: "world.html"
        })
    ]
};