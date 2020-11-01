module.exports = {
    transpileDependencies: ["vuetify"],
    lintOnSave: false,
    devServer: {
        proxy: "http://localhost:5010",
        overlay: {
          warnings: true,
          errors: true
        }
    }
};
