const path = require('path');
let isCoverage = process.env.NODE_ENV === 'coverage';

let rules = [];
if (isCoverage) {
    rules = rules.concat([{
        test: /\.js$/,
        include: path.resolve(__dirname, 'src/js'),
        loader: 'istanbul-instrumenter-loader',
        query: {
            esModules: true
        }
    }]);
}

rules = rules.concat([
    {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src/js'),
        exclude: path.resolve(__dirname, 'node_modules'),
    },
]);

module.exports = {
    entry: './test/entry.js',
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'dist-tests'),
        filename: 'bundle.js'
    },
    module: {
        rules: rules
    }
};