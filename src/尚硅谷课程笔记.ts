// 1.直接赋值的参数可以不定义类型
let a = 1
// a = true 报错
a = 123

// 2.重点：类型判断其实主要是对传入方法中的参数进行判断的,可以规定传入和返回的数据类型
function sayHello2(person: string): string {
  return 'Hello2, ' + person;
}
let user123 = 'Tom';
console.log(sayHello2(user123));

//3.类型
/**
 * 1.Number
 * 2.String
 * 3.Boolean
 * 4.字面量
 * 5.Array
 * 6.Object
 * 7.Void
 */