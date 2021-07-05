function sayHello2(person: string) {
  return 'Hello2, ' + person
}

let user2 = 'Tom'
console.log(sayHello2(user2))

let notSure: unknown = 4
notSure = 'hello'

//=======any和unknown区别==================
let d
d = 10
d = true

let e: unknown
e = 20
e = false

let f: string
d = '123'
//any类型可以赋值给任意变量（any类型不仅霍霍自己还霍霍别人！！！）
f = d //f负值为any类型的d时不报错！！！

e = 'abc'
//unkown 实际上是一个类型安全的any，他不能知己赋值给其他类型
f = e //报错！

//1
if (typeof e === 'string') {
  f = e //不报错，这里需要判断类型
}
//2 类型断言,用于告诉解析器变量的实际类型
f = e as string //不报错
f = <string>e //不报错

enum enum_1 {
  a = 1,
  b = 1,
}
