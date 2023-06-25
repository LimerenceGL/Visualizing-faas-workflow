const merge = require('webpack-merge');
module.exports = {
    // publicPath:'/arrange/',
    devServer: {
        host: '0.0.0.0',
        disableHostCheck: true,
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
        port: 8000,
        hot: true,
        open: 'Google Chrome',
        public: '133.133.134.87:8000' ,
    },

    productionSourceMap: false,
    configureWebpack: config => {
        if (process.env.NODE_ENV === 'production') {
            // config.externals = /^@antv.*/;
        }
        config.output = merge(config.output, {
            libraryExport: 'default'
        });
    },
    chainWebpack: config => {
        const svgRule = config.module.rule('svg');
        svgRule.uses.clear();
        svgRule
            .use('url-loader')
            .loader('url-loader')
            .tap(options => {
                return merge(options, {
                    limit: 10000 // default 10k
                })
            })
            .end();
    },
    css: {extract: false},

};
