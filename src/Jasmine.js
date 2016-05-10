var dataTypes = [
    'undefined',
    'object',
    'boolean',
    'number',
    'string',
    'symbol',
    'function'
];

/**
 * Assert that the passed value is of the expected class/type
 * @param {string}  name            Name of the value, to be shown in the exception message
 * @param {*}       value           The value to be tested
 * @param {string}  expectedType    The expected type/class, or array type if it ends with '[]' (recursive)
 */
var assertType = function (name, value, expectedType) {
    var typeLower = expectedType.toLocaleLowerCase();
    var msg;

    // Test data type
    if (dataTypes.indexOf(typeLower) >= 0){
        msg = "[" + name + "] is not of type [" + expectedType + "]";
        expect(typeof value).toBe(typeLower, msg);
        return;
    }

    // Test for null
    if (typeLower == 'null') {
        msg = "[" + name + "] is not null";
        expect(value).toBeNull(msg);
        return;
    }

    // Test for array
    if (typeLower == 'array'){
        msg = "[" + name + "] is not an array";
        expect(Array.isArray(value)).toBe(true, msg);
        return;
    }

    // Test array type if 'Something[]'
    if (expectedType.length > 2 && expectedType.slice(-2) == '[]'){
        var arrayType = expectedType.slice(0, -2);
        expect(Array.isArray(value)).toBe(true, "[" + name + "] is not an array");
        expect(value.length).not.toBe(0, "[" + name + "] is empty");
        assertType(name+"[0]", value[0], arrayType);
        return;
    }

    // Test class instance
    assertClass(name, value, expectedType);
};

/**
 * Assert that the passed value is of the expected class
 * @param {string}  name                Name of the value, to be shown in the exception message
 * @param {*}       value               The value to be tested
 * @param {string}  expectedClassName   The expected class name
 */
var assertClass = function(name, value, expectedClassName) {
    var msg = "[" + name + "] is not an instance of [" + expectedClassName + "]";
    expect(typeof value).toEqual('object', msg);
    expect(value).not.toBeNull(msg);
    expect(value.constructor.name).toBe(expectedClassName, msg);
};

/**
 * Assert that the passed value is as expected
 * @param {string}  name            Name of the value, to be shown in the exception message
 * @param {*}       value           The value to be tested
 * @param {*}       expectedValue   The expected value
 */
var assertValue = function(name, value, expectedValue){
    var msg = "["+name+"] doesn't have the value ["+expectedValue+"]";
    expect(value).toBe(expectedValue, msg);
};

/**
 * Test that a model has the given property, and optionally its type/class and value
 * @param {object}  target          The model to test
 * @param {string}  key             The property's name
 * @param {string}  [expectedType]  The expected data type or class name
 * @param {*}       [expectedValue] The expected value
 */
var assertProperty = function(target, key, expectedType, expectedValue){
    expect(key).toEqual(jasmine.any(String), "Key not specified");
    expect(target).toEqual(jasmine.any(Object), "Target for ["+key+"] isn't an Object");
    var value = target[key];

    // Test property exists
    expect(value).toBeDefined("["+key+"] is not defined");

    if (typeof expectedType == 'string') {
        assertType(key, value, expectedType);
    }

    if (typeof expectedValue != 'undefined'){
        assertValue(key, value, expectedValue);
    }
};

/**
 * Test that a model has the given method, and optionally its return type/class and value
 * @param {object}  target          The model to test
 * @param {string}  key             The property's name
 * @param {Array}   [args]          Arguments to call the method with
 * @param {string}  [expectedType]  The expected data type or class name
 * @param {*}       [expectedValue] The expected value
 */
var assertMethod = function(target, key, args, expectedType, expectedValue){
    assertProperty(target, key, 'function');
    if (!Array.isArray(args)) return;

    var result = target[key].apply(target, args);

    var testType = typeof expectedType == 'string';
    var testValue = typeof expectedValue != 'undefined';
    if (!testType && !testValue) return;

    if (testType) assertType(key+'()', result, expectedType);
    if (testValue) assertValue(key+'()', result, expectedValue);
};

/**
 * Test that the passed variable is an object/instance. Expected properties can also be passed in to test.
 * @example:
 *  assertObject('The instance', myInstance, {
 *      var1: false,
 *      var2: "string",
 *      var3: "string[]",
 *      var4: {type:"string"},
 *      var5: {type:"number", value: 1},
 *      func1: {args:[]},
 *      func2: {args:[], type:"number"},
 *      func3: {args:[], type:"number", value:"something"},
 *  }, true, "MyClass");
 * @param {string}  name        The name of the object to appear in messages
 * @param {Object}  target      The object to test against
 * @param {Object}  [tests]     An object containing the properties to test
 * @param {boolean} [testAll]   If it should fail due to a property name not being in tests
 * @param {string}  [className] Test if target is an instance of the specified class
 */
var assertObject = function(name, target, tests, testAll, className){
    expect(typeof target).toEqual('object', "[" + name + "] is not an object");
    expect(target).not.toBeNull("[" + name + "] is null");
    if (className){
        assertClass(name, target, className);
    }

    if (!tests) return;

    // Create a map of all the members that are untested
    var untested = {};
    if (testAll || testAll==undefined){
        var members;
        if (target.constructor.name == 'Object'){
            members = Object.getOwnPropertyNames(target)
        }else{
            members = Object.getOwnPropertyNames(
                Object.getPrototypeOf(target)
            );
        }

        // Add public members to untested map
        members.forEach(function (prop) {
            if (prop != 'constructor' && prop != 'toString' && prop.charAt(0) != '_'){
                untested[prop] = true;
            }
        });
    }

    // Test each property listed in tests
    for (var key in tests){
        delete untested[key]; // Tested this, so remove
        var test = tests[key];

        // Simple test
        if (!test || typeof test == 'string'){
            assertProperty(target, key, test);
            continue;
        }
        // Complex test
        if (typeof test == 'object'){
            // If args are passed, treat it as a function
            if ('args' in test){
                assertMethod(target, key, test.args, test.type, test.value);
                continue;
            }
            // For a property
            assertProperty(target, key, test.type, test.value);
            continue;
        }
        // Invalid test
        throw "The ["+key+"] passed to assertObject() to be tested is of the unhandled type ["+type+"]";
    }

    // Convert untested into an array, and then assert that it's empty
    untested = Object.keys(untested);
    expect(untested.length).toEqual(0, "["+name+"] properties not tested in assertObject(): ["+untested.join()+"]");
};

module.exports = {
    assertType:     assertType,
    assertValue:    assertValue,
    assertClass:    assertClass,
    assertProperty: assertProperty,
    assertMethod:   assertMethod,
    assertObject:   assertObject
};