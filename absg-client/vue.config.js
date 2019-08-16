module.exports = {
    transpileDependencies: ['vuetify'],
    lintOnSave: false,
    devServer: {
        proxy: 'http://localhost:5000',
    }
};
