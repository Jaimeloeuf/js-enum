const { createEnum, constructEnumVariant, match } = require("./src/main");

const errors = createEnum([
  "RuntimeError",
  "Unknown(innerValue)", // nested value
  "SomethingElse(innerValue, innerValue2)", // 2 nested value
]);
// console.log(errors);

// Invalid code
// const myError = constructEnumVariant(errors, "SomethingElse", ["a", 5, 10]);
// const myError = constructEnumVariant(errors, "SomethingElsee", [5, "a"]);

// Valid ways of constructing a variant
const myError = constructEnumVariant(errors, "SomethingElse", [7, "a"]);
const myError2 = errors.create("SomethingElse", [7, "a"]);
// console.log(myError);

/* Pattern matching */
// Shorthand syntax
errors.match(myError, {});

match(myError, errors, {
  RuntimeError: function () {
    console.log("unfortunately, runtime error");
  },

  // Positional value only
  "Unknown(innerValue)": function (innerValue) {
    console.log("found innerValue of: ", innerValue);
  },

  "SomethingElse(innerValue, innerValue2)": function (innerValue, innerValue2) {
    console.log("SomethingElse ", innerValue, innerValue2);
  },
});
