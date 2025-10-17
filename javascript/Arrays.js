const numbers = [2, 3];
// numbers = [] // this will throw an error because of const. But the number can be modified even thouh it is constant.

// addig ele to the end
numbers.push(5, 6);
// Beginning
numbers.unshift(1, 2);
// given position add element (index)
// args: (index, number of elements to delete, elements to add(can be more than one))
numbers.splice(2, 0, "a", "b");
// console.log(numbers);

// Other Methods:
// - indexof() // -1 if the element is not present.
// -lastindexof()
// includes()

// Find(): This Method will take the call back fnction and can work on the Array.
// findindex(): similar to find but gives index.
const courses = [
  { id: 1, name: "a" },
  { id: 2, name: "b" },
];

// const course = courses.find(function (course) {
//   return course.name === "a"; // this will return the first matching element. It will not run for the entire array if it found any on the middle.
// });

// The same above function can be written using the arraow function.

// const course = courses.find((course) => {
//   return course.name === "a";
// });

// the above syntax can be over simplified still
// 1. () not required is there is single argument.
// 2. if there us a sinfle line then return statement is not requred and {} also not necessary
const course = courses.find((course) => course.name === "a");
console.log(course);

// Removing element from array
// pop() // remove element from the end of the array.
// shift() remove from the beginning of the array
// splice(2, 1)  // the second index and one element to remove.

// following are the way we can remove all the Elements from the array
let array = [1, 2, 3];
array = []; // 1 eway
array.length = 0; // 2 way
array.splice(0, array.length); // 3 way

// Combining elements of the array
// 1. const combined = array1.concat(array2)
// 3. const combined = [ ...array1, ...array2]

// Splitting the array
// 1. const combined = array1.split(3, 5) // Second argument is optinal

// Itterating the array
// Itterating can be done for in, for of and for each methods.
array = [1, 2, 3];
array.forEach((arr, index) => console.log(arr, index)); // index is optional in the arguments.

// like in python JS also having split and join method
let array_join = [1, 2, 3, 4, 5];
let join_array = array_join.join(",");
console.log(join_array);
let array_join1 = join_array.split(",");
console.log(array_join1);

// Sort and Reverse methods
// on array it will work simply
let array_random = [3, 5, 1, 2, 4];
let array_sort = array_random.sort(); // sort large to small. Python is opposit.
let array_reverse = array_random.reverse(); // inplace sort. So array_random is affected. array_sort is just a refereence to array_random.
console.log(array_sort, array_reverse);
// on Array of objects (dict) it will not work. Hene we need to define the call back function inside.
