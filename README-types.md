

# InterType

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [InterType](#intertype)
  - [API](#api)
  - [Base Types, Refinements, Optional Types](#base-types-refinements-optional-types)
  - [Mediaries](#mediaries)
  - [Declarations](#declarations)
    - [Declaration by Type Alias](#declaration-by-type-alias)
    - [Declaration by Value Enumeration](#declaration-by-value-enumeration)
    - [Declaration by ISA Function](#declaration-by-isa-function)
    - [Declaration by Declaration Objects](#declaration-by-declaration-objects)
    - [Declaration with Fields](#declaration-with-fields)
  - [Standard Types](#standard-types)
  - [Type Signatures](#type-signatures)
  - [See also](#see-also)
  - [Schematics (Draft)](#schematics-draft)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


# InterType

## API

* `validate.t x, ...`—returns `true` on success, throws error otherwise
* `isa.t      x, ...`—returns `true` on success, `false` otherwise

## Base Types, Refinements, Optional Types

* As **base types** we regard roughly what JavaScript itself considers the `typeof` a value—*roughly*
  because JS's concept of types is (in)famously hazy and riddled with pitfalls. But we can probably agree on
  what constitutes, say, a JS `array`, a `null`, a `boolean`, or a `function` in JavaScript. It's somewhat
  more difficult with `object` since (almost, but not quite) 'everything is an object' in JS (even `null` in
  a way which makes no sense at all).

* A **refined type** (a.k.a. ['conditional type'](https://youtu.be/vyjHRlQrVSA?t=1311)) is a base type plus
  additional constraints. For example, in the set of values that are regarded as `number`s in JS, there's a
  subset of values that are `integer` `number`s, and of these, there are the two subsets `even` and `odd`
  `integer` `numbers`. Therefore, `even` and `odd` can be regarded as refinements of both type `number` and
  type `integer`.

* An **optional type** is `null`able one (which includes `undefined`, because JS). It is produced with the
  'mediary' ('intermediate decorator') `types.optional()`, e.g. `isa.integer optional x` is true when `x`
  is either `null`, `undefined`, or satisfies `isa.integer x`.

* A **collective type** is a type that refers to the elements of a collection rather than the collection
  itself. Like optional types, this is implemented with a so-called 'mediary', of which there are two,
  `types.all_of()` and `types.any_of()`. For example `isa.integer all_of [ 6, 5, 4, 3, 2, 1, ]` will return
  `true`, while `isa.integer all_of [ 6, 5, 4, 3.9, 2, 1, ]` will return `false`; similarly with `any_of()`.
  In order to ensure `x` is indeed a `list` (or a `text` or another known iterable), one may write
  `isa.integer all_of validate.list x`, since `validate.list x` will throw an error if `x` is not a `list`
  and return `x` otherwise, making the step transparent to `all_of()` which is to be called next. In order
  to avoid exceptions and get a `true` or `false`, use `verify()`, for example `isa.integer all_of
  verify.list x` which will never throw an error.

  When a list is empty (or `null` and licensed by preceding mediary `optional`), all element type tests with
  `all_of()` will succeed, but all tests with `any_of()` will fail. From this one can see that `all_of` can
  be thought of as 'no element violates the given condition', while `any_of` means 'there's at leas one
  element that will satisfy the given condition:

  * `isa.$type all_of []`, `isa.$type all_of optional null` will always return `true`;
  * `isa.$type any_of []`, `isa.$type any_of optional null` will always return `false`.

## Mediaries

* go in-between a test and a value
* should normally not be used for the outermost call, unless you know what you're doing
* may return an instance of (a derivative of) `Sentinel`

* `isa.$type                        x`: `true` if `x` is a `$type`
* `isa.$type optional               x`: `true` if `x` is a `$type` or `null` or `undefined`
* `isa.$etype all_of                x`: `true` if all elements of `x` satisfy `$etype`
* `isa.$etype any_of                x`: `true` if any elements of `x` satisfy `$etype`
* `isa.$etype all_of verify.$ctype  x`: `true` if `x` satisfies `$ctype` and all elements of `x` satisfy
  `$etype`
* alternative syntax for the last: `( isa.$ctype x ) and ( isa.$etype all_of x )`

* mediary `verify.$type x` is similar to `validate.$type x`, but never throws an exception; instead, it
  returns a `Failure` object that wraps `x` and signals to the outer method that `x` does not satisfy
  `$type`.

## Declarations

* type name must be a JS identifier (match `/// ^ (?: [ $_ ] | \p{ID_Start} ) (?: [ $ _ \u{200c} \u{200d} ]
  | \p{ID_Continue} )* $ ///u`)

* type declarations must be of type `$type_declaration`, which is any of the below:

### Declaration by Type Alias

A new type may be declared by giving the **name of an existing type**. The declaration

```coffee
quantity: 'float'
```

may be read as 'a `quantity` is extensionally (materially) nothing but a `float` (so all `quantities` are
`float`s, but, *intentionally* speaking, not all `float`s are necessarily used as `quantity`s').

This is similar to what `extends` (see below) does but without any way to refine or modify the newly
declared type. Aliases are most often used for the fields of structured types (see below).


### Declaration by Value Enumeration

A type may be declared by providing a non-empty **enumeration of arbitrary values**:

```coffee
favorite_thing: [ 'snowflakes', 'packages', 'do-re-mi', ]
```

The default value of an enumeration will always be its first value.

Implicitly, a `create()` method is added that accepts zero arguments or one of the listed values as inputs;
to create a new `favorite_thing`, call e.g. `types.create.favorite_thing()` (which will return
`'snowflakes'`) or `types.create.favorite_thing 'bee_sting'` (which will fail because `'bee_sting'` is none
of my `favorite_thing`s).


### Declaration by ISA Function

A type may be declared by giving a **function** of type `$type_declaration_function` (a *unary function*
(that takes exactly one argument) that *never throws an exception* and *always returns either true or
false*). In order to define `measure` as an `object` with fields `q`(uantity) and `u`(nit), one may write:

```coffee
measure: ( x ) ->
  return false unless ( @isa.object         x   ) # don't even try if it's not an object
  return false unless ( @isa.float          x.q ) # bail out unless field `q` isn't a `float`
  return false unless ( @isa.nonempty_text  x.u ) # need to give a `u`nit, too
  return true                                     # if none of the above matched, we're fine
```

### Declaration by Declaration Objects

A type may be declared by giving an **object** of type `$type_declaration_object`. The properties of a type
declaration object are all optional, but at a minimum either `fields` or `isa` (or both) must be given.


### Declaration with Fields

The `fields` property of a declaration object lists all the fields (properties) that a value of the declared
type may have. When present, values will implicitly first tested whether they qualify as an [`object`](...)
unless the `isa` property is also given, which will then be called before testing the fields one by one.


```coffee
measure: ( x ) ->
  return false unless ( @isa.object         x   ) # don't even try if it's not an object
  return false unless ( @isa.float          x.q ) # bail out unless field `q` isn't a `float`
  return false unless ( @isa.nonempty_text  x.u ) # need to give a `u`nit, too
  return true                                     # if none of the above matched, we're fine
```

## Standard Types


* **`anything`**: `( x ) -> true`
* **`arraybuffer`**
* **`asyncfunction`**: Satisfied if the value's MDN is `[object AsyncFunction]`. This includes `async` funtions proper and excludes asynchronous iterators.
* **`asyncgenerator`**
* **`asyncgeneratorfunction`**
* **`bigint`**: `( x ) -> typeof x is 'bigint'`
* **`blank_text`**
* **`boolean`**: `( x ) -> ( x is true ) or ( x is false )`
* **`buffer`**: `( x ) -> ( globalThis.Buffer?.isBuffer ? -> false ) x`
* **`buffer`**: `false` when used outside of NodeJS; if `globalThis.Buffer` is set, the result of `Buffer.isBuffer x`.
* **`cardinal`**: `( x ) -> ( Number.isInteger x ) and ( x >= 0 )`
* **`chr`**: `( x ) -> ( @isa.text x ) and ( /^.$/u.test x )`
* **`class`**: returns `true` if value is a function and its `x.prototype` is `writable`
* **`codepointid`**: `( x ) -> ( @isa.integer x ) and ( 0x00000 <= x <= 0x1ffff )`
* **`date`**
* **`empty_list`**
* **`empty_map`**
* **`empty_object`**
* **`empty_set`**
* **`empty_text`**
* **`error`**
* **`even`**: `( x ) -> ( Number.isInteger x ) and ( ( x % 2 ) is   0 )`
* **`extensible`**
* **`false`**
* **`falsy`**
* **`float32array`**
* **`float64array`**
* **`float`**: `( x ) -> Number.isFinite x`
* **`frozen`**
* **`function`**: `isa.function x` is `true` for all values whose MDN is `[object Function]`; this includes classical functions proper, fat-arrow functions and bound methods and excludes asynchronous functions, generator functions and generators.
* **`generator`**
* **`generatorfunction`**
* **`global`**
* **`infinitefloat`**
* **`infinity`**: `( x ) -> ( x is +Infinity ) or ( x is -Infinity )`
* **`int10text`**
* **`int16array`**
* **`int16text`**
* **`int2text`**
* **`int32`**
* **`int32array`**
* **`int8array`**
* **`integer`**: `( x ) -> Number.isInteger x`, which evaluates to `false` for `±Infinity`, `BigInt`s, and `NaN`.
* **`jsidentifier`**: all texts that can be used as JavaScript identifiers
* **`list`**: `( x ) -> Array.isArray x`
* **`listiterator`**
* **`map`**: `( x ) -> x instanceof Map`
* **`mapiterator`**
* **`nan`**: `( x ) -> Number.isNaN x`
* **`nativepromise`**
* **`nonblank_text`**
* **`nonempty_list`**
* **`nonempty_map`**
* **`nonempty_object`**
* **`nonempty_set`**
* **`nonempty_text`**
* **`nonzero`**: `( x ) -> ( @isa.numeric x ) and ( not @isa.zero x )`
* **`nothing`**: `( x ) -> not x?`
* **`null`**: `( x ) -> x is null`
* **`numeric`**: `( x ) -> ( Number.isFinite x ) or ( typeof x is 'bigint' )`
* **`object`**: all values whose `typeof` is `object` and whose MDN is `'[object Object]'`
* **`odd`**: `( x ) -> ( Number.isInteger x ) and ( ( x % 2 ) isnt 0 )`
* **`promise`**
* **`proper_fraction`**
* **`regex`**: `( x ) -> ( Object::toString.call x ) is '[object RegExp]'`
* **`safeinteger`**
* **`sealed`**
* **`set`**: `( x ) -> x instanceof Set`
* **`setiterator`**
* **`something`**: `( x ) -> x?`
* **`symbol`**: `( x ) -> ( typeof x ) is 'symbol'`
* **`text`**: `( x ) -> ( typeof x ) is 'string'`
* **`textiterator`**
* **`thenable`**
* **`true`**
* **`truthy`**
* **`uint16array`**
* **`uint32array`**
* **`uint8array`**
* **`uint8clampedarray`**
* **`undefined`**:`( x ) -> x is undefined`
* **`weakmap`**
* **`weakset`**
* **`zero`**: `true` if value is `±0`


--------------------------------------------------------
--------------------------------------------------------
--------------------------------------------------------
--------------------------------------------------------
--------------------------------------------------------
--------------------------------------------------------


* where `isa` is a
`$type_declaration_fields_object` that lists the types of all fields; implicitly, this means that a
`measure` is a plain old `object` (as opposed to, say, an array):

```coffee
measure:
  isa:
    fields:
      q:  'float'
      u:  'nonempty_text'
```

* type declared by giving a `$type_declaration_object` where `extends` indicates inheritance and `isa` is
a `$type_declaration_fields_object`. Type `length` is declared as an extension of `measure` with the
added stipulation that `u`(nit) be a `length_unit` (declared elsewhere, probably by enumeration):

```coffee
length:
  extends: 'measure'
  isa:
    u:  'length_unit'
```

```coffee
rectangle:
  fields:
    width:
      isa:  'object'
      fields:
        q:
          isa: 'float'
        u:
          isa: 'nonempty_text'
    height:
      isa:  'object'
      fields:
        q:
          isa: 'float'
        u:
          isa: 'nonempty_text'

rectangle:
  fields:
    width:
      fields:
        q:  'float'
        u:  'nonempty_text'
    height:
      fields:
        q:  'float'
        u:  'nonempty_text'
```




## Type Signatures

* string of variable length reflecting the results of a minimal number of tests that never fail and
  give each type of values a unique name

* Tests are:
  * the result of `typeof x`
  * the shortened *Miller Device Name* (MDN) obtained by `Object::toString.call x`, but replacing the
    surrounding (and invariably constant) `[object (.*)]`
  * the value's `constructor.name` property or `0` where missing
  * the value's *Denicola Device Name* (DDN), which is the `constructor` property's `name` or, if the value
    has no prototype, the digit zero `0`.
  * the value's *Carter Device Name* (CDN), which is `class` for ES6 `class`es, `fn` for functions, and
    `other` for everything else. It works by first looking at a value's Miller Device Name; if that is not
    indicative of a function, the value's CDN is `other`. Else, the property descriptor `dsc` of the value's
    prototype is retrieved; if it is missing, the CDN is `other`, too. If `dsc.writable` is `true`, the CDN
    is `fn`; otherwise, the CDN is `class`.
  * `N` if `Number.isNaN x` is `true`, digit zero `0` otherwise

Results are joined with a slash `/`.

## See also

* [*Ectype - bringing type safety (and more!) to vanilla JavaScript* by Holly Wu (Strange Loop
  2023)](https://www.youtube.com/watch?v=vyjHRlQrVSA)
* [*clojure.spec* by Rich Hickey (LispNYC 2016)](https://www.youtube.com/watch?v=dtGzfYvBn3w)

## Schematics (Draft)

In the schematics,

* steps are written in the order of processing (so rightmost expression is first in list)
* the tested value is called `x`
* `x` may be re-assigned to a sentinel, original value preserved as `sentinel.value`
* intermediate results shown in italics
* final result shown in bold

<hr>

* ✅ The simplest form is an `isa` test without mediaries; it can only ever return `true` or `false`:<br>
**`isa.integer 1234`**<br>
`value:               ` `x = 1234`<br>
`base:                ` `isa.integer x`<br>
**`result:              `** **`true`**<br>

* ❌ When `isa.integer()` sees a non-conforming value, it naturally returns `false`:<br>
**`isa.integer null`**<br>
`value:               ` `x = null`<br>
`base:                ` `isa.integer x`<br>
**`result:              `** **`false`**<br>

* ✅ Type test can be made 'nullable' by inserting an `optional` mediary into the call chain; this will
cause the value to be wrapped into a sentinel of type `Optional`:<br>
**`isa.integer optional 1234`**<br>
`value:               ` `x = 1234`<br>
`mediary:             ` `optional x`<br>
*`sentinel:            `* *`x = new Optional { value: 1234, }`*<br>
`base:                ` `isa.integer x`<br>
**`result:              `** **`true`**<br>

* ✅ **`isa.integer optional null`**<br>
`value:               ` `x = null`<br>
`mediary:             ` `optional x`<br>
*`sentinel:            `* *`x = new Optional { value: null, }`*<br>
`base:                ` `isa.integer x`<br>
**`result:              `** **`true`**<br>

* ✅ **`isa.integer all_of [ 1, 2, 3, 4, ]`**<br>
`value:               ` `x = [ 1, 2, 3, 4, ]`<br>
`mediary:             ` `all_of x`<br>
*`sentinel:            `* *`x = new All_of { value: [ 1, 2, 3, 4, ], }`*<br>
`base:                ` `isa.integer x` (sees sentinel ➔ iterates over `x.value`)<br>
**`result:              `** **`true`**<br>

* ❌ **`isa.integer all_of 1234`**<br>
`value:               ` `x = 1234`<br>
`mediary:             ` `all_of x`<br>
*`sentinel:            `* *`x = new All_of { value: 1234, }`*<br>
`base:                ` `isa.integer x` (sees sentinel ➔ cannot iterate over number ➔ `false`)<br>
**`result:              `** **`false`**<br>

* ✅ **`isa.integer all_of verify.list [ 1, 2, 3, 4, ]`**<br>
`value:               ` `x = [ 1, 2, 3, 4, ]`<br>
`mediary:             ` `verify.list x`<br>
*`intermediate:        `* *`x = [ 1, 2, 3, 4, ]`*<br>
`mediary:             ` `all_of x`<br>
*`sentinel:            `* *`x = new All_of { value: [ 1, 2, 3, 4, ], }`*<br>
`base:                ` `isa.integer x` (sees sentinel ➔ iterates over `x.value`)<br>
**`result:              `** **`true`**<br>

* ❌ **`isa.integer all_of verify.list [ 1, 2, 'c', 4, ]`**<br>
`value:               ` `x = [ 1, 2, 'c', 4, ]`<br>
`mediary:             ` `verify.list x`<br>
*`intermediate:        `* *`x = [ 1, 2, 'c', 4, ]`*<br>
`mediary:             ` `all_of x`<br>
*`sentinel:            `* *`x = new All_of { value: [ 1, 2, 'c', 4, ], }`*<br>
`base:                ` `isa.integer x` (sees sentinel ➔ iterates over `x.value` ➔ sees `'c'` ➔ fails)<br>
**`result:              `** **`false`**<br>

* ❌ **`isa.integer all_of verify.list 1234`**<br>
`value:               ` `x = 1234`<br>
`mediary:             ` `verify.list x` (verification fails ➔ returns `Failure` sentinel)<br>
*`intermediate:        `* *`x = New Failure { value: 1234, }`*<br>
`mediary:             ` `all_of x` (sees `Failure` sentinel ➔ passes it on)<br>
*`sentinel:            `* *`x = New Failure { value: 1234, }`*<br>
`base:                ` `isa.integer x` (sees `Failure` sentinel ➔ fails)<br>
**`result:              `** **`false`**<br>









