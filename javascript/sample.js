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


