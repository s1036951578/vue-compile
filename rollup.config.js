
import babel from 'rollup-plugin-babel'

export default{

  // 入口
  input:'./src/index.js',
  // 出口
  output:{
    file:'dist/vue.js',
    // 打包模块
    format:'umd',
    // umd模块需要配置name 会将到处的模块放在window上 如果在node中使用 cjs 如果只是打包
    // webpack里面导入 esm模块 前端里 script iife umd
    name:'Vue',
    sourcemap:true
  },
  plugins:[
    babel({
      exclude:'node_modules/**'
    })
  ]
}