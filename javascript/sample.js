let turnary = 5 > 7 ? true : false;

console.log(turnary);

console.log(true && false);

// Falsey
// NaN, undefined, 0, "", null, false,
// anything that is not Falsy is Truthy

console.log(false || "Adi");
console.log(false || 1);
console.log(false || 10 || 20); // return first truthy value in OR

// if () {

// }
// else if () {

// }
// else {

// }

let test = "welcome";
switch (test) {
  case "greeting":
    console.log("This is greeting");
    break;
  case "welcome":
    console.log("This is welcome");
    break;
  default:
    console.log("This is default");
}

// simple for loop
for (let i = 0; i < 3; i++) {
  console.log("for", i);
}

let i = 0;

while (i < 3) {
  console.log("while", i);
  i++;
}

// let i = 0; # error redefinition

// do {
//    statements
// } while (condition)

// for in loop

person = {
  name: "Adithya",
  age: 28,
  company: "MIE",
};

for (key in person) {
  //   console.log(key, person[key]);
}

data = ["hello", "All", "I", "am", "Adithya"];

// for-in loop will give the index for the array/list
for (index in data) {
  //   console.log(index, data[index]);
}

// for-of itterate the elements in the array
for (ele of data) {
  //   console.log(ele);
}

// Defining an object or dictinary (OOP)

const circle = {
  radius: 5,
  location: {
    x: 0,
    y: 2,
  },
  isVisible: false,
  draw: function () {
    console.log("Curcle is drawing");
  },
};

// circle.draw();

// Factory function for creating objects. It will be in camel notation.
function factoryObject(radius) {
  return {
    radius, // radius: radius, meaning
    draw() {
      // draw: function() {}, meaning
      console.log("Drawing !!!");
    },
  };
}

// console.log(factoryObject(5));

// Constructor function for creating the objects. It will be in Pascl notation.
function Circle(radius) {
  this.radius = radius;
  this.draw = function () {
    console.log("Draw");
  };
  //   return this; // not necessary to return. It will automatically return.
}

const obj = new Circle(5);
// obj.draw();

// Premitive types are coppied by value. and Objects are coppied by the referene or address.

// premitive types: Number, String, Boolean, Symbol, undefined, null
// Reference Types: Object (dict in python), Function, Array

// Example:
let x = 10;
let y = x;

y = 11;
console.log(x); // 10
console.log(y); // 11

let x1 = { value: 10 };
let y1 = x1;

x1.value = 11;

console.log(x1); // 11
console.log(y1); // 11

// Createing the clone 3 methods.
const circle1 = {
  radius: 1,
  draw() {
    console.log("draw");
  },
};

// Manually creating the clone
// const another = {};
// for (let key in circle1) {
//   another[key] = circle1[key];
// }

// Spread Operator
// const another = { ...circle1 };

// Assign Method
const another = Object.assign({}, circle1);

console.log(another);

// JS is having "Garbage Collection"

//  Literals:
// there are many types are literals:
// object Literals : {}
// Boolian Literals : true, false
// String literals: '', ""
// Template literal: ``
const message = "this is my  \n'first' Message"; // now we cannot visualize how the end result looks like.
const another_template_literals_msg = `this is my
'first' Message`;

console.log(message);
console.log(another_template_literals_msg); // Both outputs are same.

// we can add the place holders are also easily in Template literals.
const something = `this is ${message} and ${2 + 3}`;
console.log(something);
