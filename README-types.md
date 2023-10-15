

# InterType

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [InterType](#intertype)
  - [API](#api)
  - [Base Types, Refinements, Optional Types](#base-types-refinements-optional-types)
  - [Declarations](#declarations)
    - [Declaration by Type Alias](#declaration-by-type-alias)
    - [Declaration by Value Enumeration](#declaration-by-value-enumeration)
    - [Declaration by ISA Function](#declaration-by-isa-function)
    - [Declaration by Declaration Objects](#declaration-by-declaration-objects)
    - [Declaration with Fields](#declaration-with-fields)
  - [Standard Types](#standard-types)
    - [Bottom Types](#bottom-types)
      - [`null`](#null)
      - [`undefined`](#undefined)
    - [Textual Types](#textual-types)
      - [`text`](#text)
      - [`codepoint`](#codepoint)
      - [`regex`](#regex)
      - [`buffer`](#buffer)
    - [thx to https://github.com/mathiasbynens/mothereff.in/blob/master/js-variables/eff.js and](#thx-to-httpsgithubcommathiasbynensmothereffinblobmasterjs-variableseffjs-and)
      - [`jsidentifier`](#jsidentifier)
    - [Container Types](#container-types)
      - [`list`](#list)
      - [`set`](#set)
      - [`map`](#map)
    - [Numeric Types](#numeric-types)
      - [`infinity`](#infinity)
      - [`float`](#float)
      - [`numeric`](#numeric)
      - [`bigint`](#bigint)
      - [`integer`](#integer)
      - [`codepointid`](#codepointid)
      - [`cardinal`](#cardinal)
      - [`zero`](#zero)
      - [`nan`](#nan)
      - [`nonzero`](#nonzero)
      - [`even`](#even)
      - [`odd`](#odd)
    - [Classes](#classes)
      - [`class`](#class)
    - [Other Types](#other-types)
      - [`boolean`](#boolean)
      - [`object`](#object)
      - [`buffer`](#buffer-1)
      - [`function`](#function)
      - [`asyncfunction`](#asyncfunction)
      - [`symbol`](#symbol)
      - [`keyowner`](#keyowner)
    - [Existential Types](#existential-types)
      - [`nothing`](#nothing)
      - [`something`](#something)
      - [`anything`](#anything)
  - [Type Signatures](#type-signatures)
  - [See also](#see-also)

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


* **`null`**: `( x ) -> x is null`
* **`undefined`**:`( x ) -> x is undefined`
* **`text`**: `( x ) -> ( typeof x ) is 'string'`
* **`chr`**: `( x ) -> ( @isa.text x ) and ( /^.$/u.test x )`
* **`regex`**: `( x ) -> ( Object::toString.call x ) is '[object RegExp]'`
* **`blank_text`**
* **`nonblank_text`**
* **`int2text`**
* **`int10text`**
* **`int16text`**
* **`arraybuffer`**
* **`int8array`**
* **`uint8array`**
* **`uint8clampedarray`**
* **`int16array`**
* **`uint16array`**
* **`int32array`**
* **`uint32array`**
* **`float32array`**
* **`float64array`**
* **`weakmap`**
* **`weakset`**
* **`infinitefloat`**
* **`int32`**
* **`proper_fraction`**
* **`safeinteger`**
* **`date`**
* **`true`**
* **`false`**
* **`error`**
* **`global`**
* **`generatorfunction`**
* **`asyncgeneratorfunction`**
* **`asyncgenerator`**
* **`generator`**
* **`listiterator`**
* **`textiterator`**
* **`setiterator`**
* **`mapiterator`**
* **`promise`**
* **`nativepromise`**
* **`thenable`**
* **`frozen`**
* **`sealed`**
* **`extensible`**
* **`empty_list`**
* **`empty_text`**
* **`empty_map`**
* **`empty_set`**
* **`nonempty_list`**
* **`nonempty_text`**
* **`nonempty_map`**
* **`nonempty_set`**
* **`empty_object`**
* **`nonempty_object`**
* **`truthy`**
* **`falsy`**
* **`buffer`**: `( x ) -> ( globalThis.Buffer?.isBuffer ? -> false ) x`
* **`list`**: `( x ) -> Array.isArray x`
* **`set`**: `( x ) -> x instanceof Set`
* **`map`**: `( x ) -> x instanceof Map`
* **`infinity`**: `( x ) -> ( x is +Infinity ) or ( x is -Infinity )`
* **`float`**: `( x ) -> Number.isFinite x`
* **`numeric`**: `( x ) -> ( Number.isFinite x ) or ( typeof x is 'bigint' )`
* **`bigint`**: `( x ) -> typeof x is 'bigint'`
* **`integer`**: `( x ) -> Number.isInteger x`, which evaluates to `false` for `±Infinity`, `BigInt`s, and `NaN`.
* **`codepointid`**: `( x ) -> ( @isa.integer x ) and ( 0x00000 <= x <= 0x1ffff )`
* **`cardinal`**: `( x ) -> ( Number.isInteger x ) and ( x >= 0 )`
* **`zero`**: `( x ) -> x is 0 ### NOTE true for -0 as well ###`
* **`nan`**: `( x ) -> Number.isNaN x`
* **`nonzero`**: `( x ) -> ( @isa.numeric x ) and ( not @isa.zero x )`
* **`even`**: `( x ) -> ( Number.isInteger x ) and ( ( x % 2 ) is   0 )`
* **`odd`**: `( x ) -> ( Number.isInteger x ) and ( ( x % 2 ) isnt 0 )`
* **`boolean`**: `( x ) -> ( x is true ) or ( x is false )`
* **`buffer`**: `false` when used outside of NodeJS; if `globalThis.Buffer` is set, the result of `Buffer.isBuffer x`.
* **`function`**: `isa.function x` is `true` for all values whose MDN is `[object Function]`; this includes classical functions proper, fat-arrow functions and bound methods and excludes asynchronous functions, generator functions and generators.
* **`asyncfunction`**: Satisfied if the value's MDN is `[object AsyncFunction]`. This includes `async` funtions proper and excludes asynchronous iterators.
* **`symbol`**: `( x ) -> ( typeof x ) is 'symbol'`
* **`nothing`**: `( x ) -> not x?`
* **`something`**: `( x ) -> x?`
* **`anything`**: `( x ) -> true`

* **`class`**

  `( x ) ->`

    ( ( Object::toString.call x ) is '[object Function]' ) and \
      ( Object.getOwnPropertyDescriptor x, 'prototype' )?.writable is false

* **`object`**

  `object` tests a value against three constraints:

    * `x?` (excludes `null` and `undefined`),
    * `typeof x` returns `'object'`,
    * and `( Object::toString.call x )` gives `'[object Object]`

* **`jsidentifier`**

  ```
  ( x ) -> ( @isa.text x ) and ( x.match \
    /// ^ (?: [ $_ ] | \p{ID_Start} ) (?: [ $ _ \u{200c} \u{200d} ] | \p{ID_Continue} )* $ ///u )?
  ```

  (thx to https://github.com/mathiasbynens/mothereff.in/blob/master/js-variables/eff.js and
   https://mathiasbynens.be/notes/javascript-identifiers-es6)


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

