let turnary = 5 > 7 ? true : false;

console.log(turnary);

console.log(true && false);

// Falsey
// NaN, undefined, 0, "", null, false,
// anything that is not Falsy is Truthy

console.log(false || "Adi");
console.log(false || 1);
console.log(false || 10 || 20); // return first truthy value in OR
