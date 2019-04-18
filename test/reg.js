var reg = /(\w+)\.js$/;
var s = 'splice.js.js';
var s2 = 'splice.js.js1';
var result = s.replace(reg , '$1.min.js');
var result2 = s2.match(reg , '$1.min.js');
console.log(result)
console.log(result2)