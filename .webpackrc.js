export default {
  "entry": "src/index.js",
  "disableCSSModules": false,
  "publicPath": "/",
  "theme": {
    "@primary-color": "#1DA57A",
    "@link-color": "#1DA57A",
    "@border-radius-base": "2px",
    "@font-size-base": "16px",
    "@line-height-base": "1.2"
  },
  "extraBabelPlugins": [
    ["import", { "libraryName": "antd", "libraryDirectory": "es", "style": "css" }]
  ],
  define: {
    'process.env': {
      'NODE_ENV': 'development'
    }
  }
}
