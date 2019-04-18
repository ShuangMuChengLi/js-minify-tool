js压缩工具，可以对文件夹下所有js文件进行es6语法进行转码，并执行js文件压缩

# 使用说明

## 1、安装Node.js

## 2、将.babelrc、main.js、minify.js、package.json拷贝到你现有的工程根目录下

## 3、安装依赖包

````
npm install
````

## 4、配置压缩的目标文件夹

修改main.js第三行的路径test-code，

__dirname：代表当前main.js所在文件夹

./test-code:是目标文件夹相对main.js所在文件夹的相对路径
````
let minify = require('./minify');
let path = require('path');
minify(path.resolve(__dirname,'./test-code'));
````

## 5、执行压缩

方法1：window下，双击‘开始压缩.bat’

方法2：
````
node main
````
方法3
````
npm start
````
