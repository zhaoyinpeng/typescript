//数组类型
let array1: number[] = [1, 2, 3, 4, 5]
//下面的会报错 定义了number类型的数组就必须全部都是数组
// let array2: number[] = ['1', 2, 3, 4, 5]

// 数组泛型？？？？

//接口定义数组 NumberArray 表示：只要 index 的类型是 number，那么值的类型必须是 number。
interface NumberArray {
  [index: number]: number;
}
let fibonacci: NumberArray = [1, 1, 2, 3, 5];

//any数组
let list: any[] = ['Xcat Liu', 25, { website: 'http://xcatliu.com' }];

//类数组
//下面是错误的
// function sum1() {
//   let args: number[] = arguments;
// }
//类数组（Array-like Object）不是数组类型，比如 arguments。事实上常见的类数组都有自己的接口定义，如 IArguments, NodeList, HTMLCollection 等：
function sum2() {
  let args: IArguments = arguments;
}

//函数类型
