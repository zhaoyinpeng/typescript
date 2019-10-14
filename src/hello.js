function sayHello(person) {
    return 'Hello, ' + person;
}
var user = '0';
console.log(sayHello(user));
//========================原始数据类型==========================
var isBoolean = false;
var isBoolean2 = Boolean(0);
var isNumber = 1;
var isNumber2 = 0xfd00d;
var isString = 'Tom';
var isVoid = undefined;
var isVoid2 = null;
var isNull = null;
var isUndefined = undefined;
//====void 和 null,nudefined区别 
//下面的方法是对的
var isUndefined2;
var isNumber3 = isUndefined2;
//下面的方法是错的
// let isVoid3: void
// let isNumber4: number = isVoid3
//========================类型推论==========================
//下面的方法是错误的
// let myFavoriteNumber = 'seven'
// myFavoriteNumber = 7
//它等价于
// let myFavoriteNumber: string = 'seven';
// myFavoriteNumber = 7;
//如果定义的时候没有赋值，不管之后有没有赋值，都会被推断成 any 类型而完全不被类型检查：
var myFavoriteNumber;
myFavoriteNumber = 'seven';
myFavoriteNumber = 7;
//========================联合类型==========================
var myFavoriteNumber2;
myFavoriteNumber2 = 'seven';
myFavoriteNumber2 = 7;
var tom = {
    name: 'Tom',
    age: 25
};
var tom2 = {
    name: 'Tom'
};
var tom3 = {
    name: 'Tom',
    gender: 'male'
};
var tom5 = {
    id: 89757,
    name: 'Tom',
    gender: 'male'
};
//以下方法是错误的 报错信息有两处，第一处是在对 tom 进行赋值的时候，没有给 id 赋值。第二处是在给 tom.id 赋值的时候，由于它是只读属性，所以报错了。
// let tom6: Person6 = {
//   name: 'Tom',
//   gender: 'male'
// };
// tom6.id = 89757;
