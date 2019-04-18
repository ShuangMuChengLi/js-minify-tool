let babel = require("@babel/core");
babel.transform(`let a = 1;
(()=>{return 1;})();
console.log(a);`, { "extends": "../.babelrc" }, function(err, result) {
    if(err){
        console.error(err);
        return;
    }
    console.log(result.code)
});