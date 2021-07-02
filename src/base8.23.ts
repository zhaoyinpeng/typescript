function sayHello(person: string) {
  return 'Hello, ' + person;
}

let user = '0';
console.log(sayHello(user));


//========================原始数据类型==========================
let isBoolean: boolean = false
let isBoolean2: boolean = Boolean(0)


let isNumber: number = 1
let isNumber2: number = 0xfd00d

let isString: string = 'Tom'

let isVoid: void = undefined
let isVoid2: void = null

let isNull: null = null
let isUndefined: undefined = undefined

//====void 和 null,nudefined区别 
//下面的方法是对的
let isUndefined2: undefined
let isNumber3: number = isUndefined2

//下面的方法是错的
// let isVoid3: void
// let isNumber4: number = isVoid3

let b = true
// b = 123
b = false

//========================类型推论==========================
//下面的方法是错误的
// let myFavoriteNumber = 'seven'
// myFavoriteNumber = 7
//它等价于
// let myFavoriteNumber: string = 'seven';
// myFavoriteNumber = 7;

//如果定义的时候没有赋值，不管之后有没有赋值，都会被推断成 any 类型而完全不被类型检查：
let myFavoriteNumber
myFavoriteNumber = 'seven'
myFavoriteNumber = 7


//========================联合类型==========================
let myFavoriteNumber2: string | number;
myFavoriteNumber2 = 'seven';
myFavoriteNumber2 = 7;

//当 TypeScript 不确定一个联合类型的变量到底是哪个类型的时候，我们只能访问此联合类型的所有类型里共有的属性或方法：
//以下方法会报错的 length 不是 string 和 number 的共有属性，所以会报错。
// function getLength(something: string | number): number {
//   return something.length;
// }


//========================对象类型-接口==========================
interface Person {
  name: string;
  age: number;
}

let tom: Person = {
  name: 'Tom',
  age: 25
};
//上面的例子中，我们定义了一个接口 Person，接着定义了一个变量 tom，它的类型是 Person。这样，我们就约束了 tom 的形状必须和接口 Person 一致。
//定义的变量比接口少了一些属性是不允许的：
//多一些属性也是不允许的：

//可选属性 加问号 但是仍然不允许添加属性
interface Person2 {
  name: string;
  age?: number;
}

let tom2: Person2 = {
  name: 'Tom'
};

//任意属性 
interface Person3 {
  name: string;
  age?: number;
  [propName: string]: any;
}

let tom3: Person3 = {
  name: 'Tom',
  gender: 'male'
};
//需要注意的是，一旦定义了任意属性，那么确定属性和可选属性的类型都必须是它的类型的子集：
//下面是错误的 任意属性的值允许是 string，但是可选属性 age 的值却是 number，number 不是 string 的子属性，所以报错了
// interface Person4 {
//   name: string;
//   age?: number;
//   [propName: string]: string;
// }

// let tom4: Person4 = {
//   name: 'Tom',
//   age: 25,
//   gender: 'male'
// };

//只读属性
interface Person5 {
  readonly id: number,
  name: string,
  age?: number,
  [propName: string]: any
}

let tom5: Person5 = {
  id: 89757,
  name: 'Tom',
  gender: 'male'
};

//以下方法是错的 使用 readonly 定义的属性 id 初始化后，又被赋值了，所以报错了
// tom5.id = 9527;

//未确定的只读属性赋值时
interface Person6 {
  readonly id: number,
  name: string,
  age?: number,
  [propName: string]: any
}

//以下方法是错误的 报错信息有两处，第一处是在对 tom 进行赋值的时候，没有给 id 赋值。第二处是在给 tom.id 赋值的时候，由于它是只读属性，所以报错了。
// let tom6: Person6 = {
//   name: 'Tom',
//   gender: 'male'
// };

// tom6.id = 89757;
