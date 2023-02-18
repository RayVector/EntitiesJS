const path = require('path')
const ESLintPlugin = require('eslint-webpack-plugin');

const myEslintOptions = {
    extensions: [`js`, `jsx`, `ts`],
    exclude: [`node_modules`],
};

module.exports = {
    mode: 'production',
    target: 'web',
    entry: {
        index: './src/index.js'
    },
    output: {
        path: path.resolve(__dirname, './'),
        filename: 'index.js',
        library: 'EntitiesJS',
        libraryTarget: 'umd',
        globalObject: 'this',
        umdNamedDefine: true
    },
    plugins: [
        new ESLintPlugin(myEslintOptions)
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.resolve(__dirname, './src'),
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: [
                            '@babel/plugin-proposal-export-default-from',
                            '@babel/plugin-transform-runtime'
                        ]
                    }
                }
            }
        ]
    }
}
