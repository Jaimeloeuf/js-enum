function createSimpleEnum(arrayOfVariants) {
  const enumObject = {};
  for (const variant of arrayOfVariants) enumObject[variant] = variant;
  return Object.freeze(enumObject);
}

// Test if in this form first
// 1. inner tuple can be any word char and , or space (does not include tab and newline)
// 2. tuple data type is optional, can be just variant name
const variantPattern = /^\w*(\((\w|,)*\))?$/;

// Remove this from string to get the variant name if it is a tuple type
const variantTupleOnlyPattern = /\((\w|,)*\)$/;

function createEnum(arrayOfVariants) {
  // Enum object comes with an empty __variantNames array by default to append variant names onto it laterc
  const enumObject = { __variantNames: [] };

  // Strip out all white spaces in variant definition strings before any other processing is done
  arrayOfVariants = arrayOfVariants.map((variant) =>
    variant.replace(/\s/g, "")
  );

  enumObject["__variantPatterns"] = arrayOfVariants;

  const arrayOfInvalidVariants = arrayOfVariants.filter(
    (variant) => !variantPattern.test(variant)
  );

  if (arrayOfInvalidVariants.length > 0)
    throw new Error(
      `\nVariant constructor(s)\n${arrayOfInvalidVariants
        .map((name) => `- ${name}`)
        .join("\n")}\nContains invalid syntax`
    );

  for (const variant of arrayOfVariants) {
    // Strip away the tuple part if any to get the variant name
    const variantName = variant.replace(variantTupleOnlyPattern, "");

    // Add variant name to the inner hidden field
    enumObject.__variantNames.push(variantName);

    const tuple = variantTupleOnlyPattern.exec(variant);
    const tupleNames = tuple
      ? tuple[0] // .exec returns an array, with first element as matched string
          .replace(/\(|\)$/g, "") // Match literals '(' and ')' used to enclose tuples
          .split(",")
      : []; // can also be a empty array
    // : undefined; // can also be a empty array

    enumObject[variantName] = {
      // Full variant pattern string
      variantPattern: variant,
      tupleNames,
    };
  }

  /* These short hand methods means that user cannot create variants with name create and match */

  enumObject.create = (variantName, tupleValues = []) =>
    constructEnumVariant(enumObject, variantName, tupleValues);

  enumObject.match = (enumVariant, patternArms) =>
    match(enumVariant, enumObject, patternArms);

  return Object.freeze(enumObject);
}

function constructEnumVariant(ENUM, variantName, tupleValues = []) {
  const enumVariant = ENUM[variantName];

  if (!enumVariant)
    throw new Error(
      `\nEnum variant '${variantName}' does not exist for given Enum type, try:\n${ENUM.__variantNames
        .map((name) => `- ${name}`)
        .join("\n")}`
    );

  if (enumVariant.tupleNames.length)
    if (enumVariant.tupleNames.length !== tupleValues.length)
      throw new Error(
        `\nTuple type enum variant '${enumVariant.variantPattern}'\nHave mistmatched constructor input:\n${tupleValues}`
      );

  return {
    name: variantName,

    tupleFields: tupleValues,
    // structFields: {},
  };
}

function match(enumVariant, ENUM, patternArms) {
  // @todo Check if patternArms is valid
  // Check if all cases are matched..?

  // Strip out all white spaces in pattern arm names
  patternArms = Object.keys(patternArms)
    .map((variant) => ({
      original: variant,
      new: variant.replace(/\s/g, ""),
    }))
    .reduce((newArms, currentValue) => {
      newArms[currentValue.new] = patternArms[currentValue.original];
      return newArms;
    }, {});

  const armFunction = patternArms[ENUM[enumVariant.name].variantPattern];

  // Call the function
  patternArms[ENUM[enumVariant.name].variantPattern](
    ...enumVariant.tupleFields
  );
}

module.exports = {
  createSimpleEnum,
  createEnum,
  constructEnumVariant,
  match,
};
