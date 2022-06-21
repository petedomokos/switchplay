const path = require('path')
const CURRENT_WORKING_DIR = process.cwd()

const config = {
    mode: "production",
    entry: [
        path.join(CURRENT_WORKING_DIR, 'client/main.js')
    ],
    output: {
        path: path.join(CURRENT_WORKING_DIR , '/dist'),
        filename: 'bundle.js',
        publicPath: "/dist/"
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: [
                    'babel-loader'
                ]
            },
            {
                test: /\.(ttf|eot|svg|gif|jpg|png)(\?[\s\S]+)?$/,
                use: 'file-loader'
            },
            {
                test: /\.css$/,
                //exclude: [
                //path.resolve(__dirname, "node_modules/bootstrap"),
                //],
                //TODO - EXCLUDE FILES FROM WIHIN THE GLOBAL STYLES FOLDER, AND MAKE A GLOBAL STYLES FOLDER FOR GLOBAL FILES, INC BOOTSTRAP
                use:['style-loader',
                      {
                       loader:'css-loader',
                       //{modules:true} enables locally scoped css (ie css modules) by default
                       //Q) does this option need to be set for style-loader etc too?
                       options:{ modules: false }
                      }, 
                      {
                       loader:'postcss-loader',
                       options:{ plugin:() => [require('autoprefixer')] }
                      }
                    ]
            },
        ]
    }
}

module.exports = config
