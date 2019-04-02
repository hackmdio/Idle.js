'use strict';

const path = require('path');

function createWebpackConfigForTarget(target, postfix, isMin) {
    target = target || "umd";
    postfix = postfix || "";
    isMin = isMin || false;
    if (isMin) {
        postfix = postfix + '.min'
    }
    return {
        entry: './src/idle.ts',
        mode: isMin ? "production" : "none",
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: 'ts-loader',
                    exclude: /node_modules/
                }
            ]
        },
        resolve: {
            extensions: ['.ts', '.js']
        },
        output: {
            filename: `idle.${postfix}.js`,
            path: path.resolve(__dirname, "dist"),
            libraryTarget: target,
            library: target === 'window' ? 'Idle' : undefined,
            libraryExport: target === 'window' ? 'default' : undefined
        }
    }
}

module.exports = [
    createWebpackConfigForTarget('window', 'browser'),
    createWebpackConfigForTarget('umd', 'umd'),
    createWebpackConfigForTarget('window', 'browser', true),
    createWebpackConfigForTarget('umd', 'umd', true),
];
