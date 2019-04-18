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
        babel.transform(sCode, { "extends": "./.babelrc" }, function(err, result) {
            if(err){
                throw err;
            }

            let oMinifyCode = UglifyJS.minify(result.code);
            if(oMinifyCode.error){
                throw oMinifyCode.error;
            }

            resolve(oMinifyCode)
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
        fs.readFile(filePath, (err, code) => {
            if(err){
                throw err;
            }

            let sMinifyCode = handleJSString(code);
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
 * @returns {Promise.<void>} isDirectory :Boolean
 */
async function handleFile(filePath){
    let judgeDirectoryResult = await judgeDirectory(filePath).then((isDirectory)=>{
        return {
            isDirectory,
            err:null
        }
    }).catch((err)=>{
        console.error(err);
        return {
            isDirectory:null,
            err:err
        }
    });
    if(judgeDirectoryResult.err){
        throw judgeDirectoryResult.err;
    }

    let isDirectory = judgeDirectoryResult.isDirectory;
    if(isDirectory){
        return {
            isDirectory:true
        };
    }

    minifyJs(filePath).catch((err)=>{
        throw err;
    });
    return {
        isDirectory:false
    };
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
            if(fileName.indexOf('.js') === -1)continue;

            if(fileName.indexOf('min.js') !== -1)continue;

            let filePath = path.resolve(dirPath ,fileName);
            handleFile(filePath).then((result)=>{
                if(result.isDirectory){
                    minifyDirAllJsFile(filePath)
                }
            }).catch((err)=>{
                console.error(err);
            });
        }
    });
}

module.exports = minifyDirAllJsFile;