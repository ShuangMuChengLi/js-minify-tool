let UglifyJS = require("uglify-js");
let fs = require('fs');
let path = require('path');
let babel = require("@babel/core");
let reg = /(\w+)\.js$/; // 匹配不含后缀.js的文件名
/**
 * 将代码进行转换（es6转码、压缩）
 * @param code:String
 * @returns {Promise} 转换后的代码:String 。失败时返回false
 */
function handleJSString(code) {
    return new Promise((resolve , reject)=>{
        let sCode = code.toString();
        babel.transform(sCode, { "extends": path.resolve(__dirname,"./.babelrc" )}, function(err, result) {
            if(err){
                throw err;
            }

            let oMinifyCode = UglifyJS.minify(result.code);
            if(oMinifyCode.error){
                throw oMinifyCode.error;
            }

            resolve(oMinifyCode.code);
        });
    })

}

/**
 * 压缩单文件
 * @param filePath
 * @returns {Promise}
 */
function minifyJs(filePath) {
    return new Promise(async (resolve , reject)=>{
        fs.readFile(filePath, async (err, code) => {
            if(err){
                throw err;
            }

            let sMinifyCode = await handleJSString(code).catch((err)=>{
                reject(err);
                return false;
            });
            if(!sMinifyCode)return;

            let minFileNamePath = filePath.replace(reg , '$1.min.js');
            fs.writeFile(minFileNamePath, sMinifyCode, (err)=>{
                if(err) throw err;
            })
        });
    })
}

/**
 * 判断是否是文件夹
 * @param filePath
 * @returns {Promise}
 */
async function judgeDirectory(filePath) {
    return new Promise((resolve , reject)=>{
        fs.stat(filePath, (err , stats)=>{
            if(err){
                reject(err);
            }

            if(stats.isDirectory()){
                resolve(true);
            }

            resolve(false);
        });
    })
}

/**
 * 处理文件
 * @param filePath
 * @returns {Promise.<void>}
 */
async function handleFile(filePath){
    let judgeDirectoryResult = await judgeDirectory(filePath).then((isDirectory)=>{
        return {
            isDirectory,
            err:null
        }
    }).catch((err)=>{
        throw err;
    });
    if(judgeDirectoryResult.err){
        throw judgeDirectoryResult.err;
    }

    let isDirectory = judgeDirectoryResult.isDirectory;
    if(isDirectory){
        minifyDirAllJsFile(filePath);
    }

    if(!filePath.match(reg))return;

    minifyJs(filePath).catch((err)=>{
        throw err;
    });
}
/**
 * 递归压缩目录下所有js文件
 * @param dirPath 文件夹名
 */
function minifyDirAllJsFile(dirPath) {
    fs.readdir(dirPath ,async function (err, files) {
        if(err){
            throw err;
        }

        for(let fileName of files){
            if(fileName.indexOf('min.js') !== -1)continue;

            let filePath = path.resolve(dirPath ,fileName);
            handleFile(filePath).catch((err)=>{
                console.error(err);
            });
        }
    });
}

module.exports = minifyDirAllJsFile;