

# WebGuy Type Declarations

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [WebGuy Type Declarations](#webguy-type-declarations)
  - [Type Declaration Objects](#type-declaration-objects)
  - [Samples](#samples)
  - [Field declarations](#field-declarations)
    - [Why `fields` and `template`, why not `default`?](#why-fields-and-template-why-not-default)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


# WebGuy Type Declarations

* declarations are named attributes of a class (called an 'ISA-Class'); name of attribute is name of type,
  value of attribute controls behavior
* order matters
* if derived from `webguy.types.Isa`, its declarations will be inherited
  * in case a re-declaration of a given type is wanted, must opt-in, else rejected with error
  * note that at present, overriding a type declaration `T` of `webguy.types.Isa` is undefined in its
    behavior w.r.t. to other types of `webguy.types.Isa` that may or may not use `T`

Possible types for declarations (attribute values):

* in case `( type_of type_declaration ) is 'text'`: declares an **alias** of an existing type; no forward
  declarations possible
* in case `( type_of type_declaration ) is 'function'`: declares an **ISA-Function** (takes exactly one
  argument; never throws an error; returns either `true` or `false`, all other return values will be
  rejected with error)
* in case `( type_of type_declaration ) is 'object'`, a **type declaration object** (whose attribute `field`
  contains nested type declarations) is expected

* list that contains one or more of the above



## Type Declaration Objects


(in the below, `d` represents the declaration):

* `d.fields` (`optional object`; **`null`**): an object whose keys are field names and whose values are
  field (i.e. object attribute) declarations
  * field declarations are type declarations
  * when `d.fields` is given, type `object` is assumed and tested for before fields are tested one by one;
    it is possible to override this test by putting one or more appropriate string values (i.e. type names)
    into `d.tests`; e.g. `d.fields: { foo: 'integer', }` with `d.tests: [ 'list', ..., ]` would declare a
    type whose instances are `list`s that have an attribute `foo`, an `integer`.

* `d.optional`  (`optional boolean`; **`false`**, `true`): an optional type accepts `null` and `undefined`
  as values

* `d.freeze`    (`optional boolean`; **`false`**, `true` == `shallow`, `deep`):

* `d.template`  (`optional anything`):
  * in case a refinement of `object` is declared, an object whose keys
    are field names and whose values are the default value for each field; missing fields (that are not
    overwritten by the type's `create()` method) will be missing from the result (and may or may not lead to
    validation error, as the case may be)

* `d.copy`      (`optional function`; **`null`**): when given, should be a unary function that returns a
  (deep) copy of the value it is given

* `d.tests`     (`optional ( function or list of functions )`; **`null`**): when given, should be

  * a unary function, or
  * the name of a known type, or
  * a list or object of either of these.

  Strings will be turned into type tests; functions will be called in the order given with the value under
  consideration as sole arguments; should any one fail, the remaining function calls are forgone, and the
  value is treated as not satisfying the type's requirements.

## Samples

```
# Sample Declaration #1
class T extends webguy.types.Isa

  small_quantity:

    template:
      value:    0
      unit:     'u'

    # we use a single function to declare tests and check fields (possible but not recommended):
    tests: ( x ) ->
      return false unless @isa.object         x
      return false unless @isa.float          x.value
      return false unless @isa.nonempty_text  x.unit
      return false unless                     x.value >= -1
      return false unless                     x.value <= +1
      return true
```

```
# Sample Declaration #2
class T extends webguy.types.Isa

  small_quantity:

    fields:
      value:    'float'
      unit:     'nonempty_text'

    template:
      value:    0
      unit:     'u'

    # we use a single function to declare tests (possible but not recommended):
    tests: ( x ) ->
      return false unless @isa.object x
      return false unless x.value >= -1
      return false unless x.value <= +1
      return true
```

```
# Sample Declaration #3
class T extends webguy.types.Isa

  small_quantity:

    fields:
      value:    'float'
      unit:     'nonempty_text'

    template:
      value:    0
      unit:     'u'

    # using an object to declare tests leads to naming all tests (recommended):
    tests:
      isa_object:           'object' # redundant b/c there's `T::small_quantity.fields
      not_below_minus_one:  ( x ) -> x.value >= -1
      not_above_plus_one:   ( x ) -> x.value <= +1
```

Granularity should be chosen such that tests do not do 'too little' (and proliferate) or 'too much' (and
hide rather than reveal causes of failure):

```
# Sample Declaration #4
class T extends webguy.types.Isa
  small_quantity:
    tests:
      value_is_small: ( x ) -> -1 <= x.value <= +1
```

```
# Sample Declaration #5
class T extends webguy.types.Isa

  small_quantity:

    fields:
      value:    'float'
      unit:     'nonempty_text'

    template:
      value:    0
      unit:     'u'

    # we can also use a list to declare tests:
    tests: [
      'object' # redundant b/c there's `T::small_quantity.fields
      not_below_minus_one = ( x ) -> x.value >= -1
      not_above_plus_one  = ( x ) -> x.value <= +1
      ]
```

It is also possible to put tests into the `fields` element but observe that **tests defined in the `fields`
declaration will be called with the field value; tests on the `tests` declaration will be called with the
object**:

```
# Sample Declaration #3
class T extends webguy.types.Isa

  small_quantity:

    fields:
      value:
        isa_float:            'float'
        not_below_minus_one:  ( x ) -> x >= -1
        not_above_plus_one:   ( x ) -> x <= +1
      unit:     'nonempty_text'

    template:
      value:    0
      unit:     'u'
```

This is again possible in all the ways a declaration can be declared, e.g. as a list:

```
# Sample Declaration #3
class T extends webguy.types.Isa

  small_quantity:

    fields:
      value: [
        'float'
        not_below_minus_one = ( x ) -> x >= -1
        not_above_plus_one  = ( x ) -> x <= +1
        ]
      unit:     'nonempty_text'

    template:
      value:    0
      unit:     'u'
```

... or using a single unary function for each field:

```
# Sample Declaration #3
class T extends webguy.types.Isa

  small_quantity:

    fields:
      value: ( x ) ->
        return false unless @isa.float x
        return false unless x >= -1
        return false unless x <= +1
        return true
      unit:     'nonempty_text'

    template:
      value:    0
      unit:     'u'
```

It is recommended to prefer the `tests` element over the `fields` element except for declaring the type
names of fields for a number of reasons:

* the `tests` element can always been used; the `fields` element is only specifically used for object
  attributes
* functions in `tests` will be called with the 'main' value being tested; therefore, functions in `tests`
  can refer to other fields on the same object—functions in `fields` can't do that. A declaration of, say, a
  `small_length` type whose `unit` can only be one of `'m'` or `'cm'` is doable inside the `fields` element,
  but one that restricts `value` to `-1 .. +1` in the case of `unit: 'm'` and to `-100 .. +100` in the case
  of `unit: 'cm'` is not—only a function declared under `tests` can do that

## Field declarations

```coffee
class Mytypes extends webguy.types.Isa
  foo: <declaration for type `foo`>
  bar: <declaration for type `bar`>
  ...
```

```coffee
class Mytypes extends webguy.types.Isa
  foo: ( x ) -> <code that returns `true` or `false`>
  ...
```

```coffee
class Mytypes extends webguy.types.Isa
  foo:
    fields:
      bar: <declaration for type `foo.bar`>
  ...
```


### Why `fields` and `template`, why not `default`?

When given a declaration containing entries for both `fields` and `template` as in `#1` below, one could
think that it would be more economical to put the entries under `template` into those in `fields` as shown
in `#2`; after all, they're just repetitions that specify the default value for each of the fields,
right?—While this is in principle right in this particular case, it is not right in the general case.

```
#------------------------------------------------------
# #1
foo:
  fields:
    bar:  'integer'
    baz:  'optional text'
    gnu:  'boolean'
  template:
    bar:  123
    gnu:  false

#------------------------------------------------------
# #2
foo:
  fields:
    bar:
      tests:    'integer'
      default:  123
    baz:
      tests:    'text'
      optional: true
    gnu:
      tests:    'boolean'
      default:  false
```

In case `#1`, above, we have a declaration for a JS `object`; incidentally, JS `object`s are also used to
formulate the declaration itself, so in this special (but also very common) case the two—declaration and
object template—seemingly fuse together, as it were.

In the general case, however, this fusion does not occur. Let's suppose we wanted to define a type for
two-dimensional coordinates that uses a list with two floats. We could start out like this:

```
#------------------------------------------------------
# #3
xy_point:
  tests:      'list'
  fields:
    0:          'float'
    1:          'float'
  template:   [ 0, 0, ]
```

In `#3`, the 'field' values in the `template` look nothing like the entries of the `field` setting; in fact,
one should probably call them 'elements' (of a list) rather than 'fields' of an object; we just hijack the
name and the syntax here because in JavaScript (as in many other languages), element access is syntactically
not different from field (attribute) access.

To make the contrast between `field`s and `template`s even clearer, let's declare a `quantity` type using a
`Map` with two entries `value` and `unit`. The declaration could then look like `#4`:

```
#------------------------------------------------------
# #4
quantity:
  tests:
    type:               'map'
    isa_float_x_value:  ( x ) -> @isa.float x.get 'value'
    isa_float_x_unit:   ( x ) -> @isa.text  x.get 'unit'
  template:   new Map [ [ 'value', 0, ], [ 'unit', 'u', ], ]
  copy:       ( x ) -> new Map x
```

In `#4`, we didn't use `fields` at all; we *could* have used it if we had wanted to because a JavaScript
`Map` is just another object that can have attributes (i.e. 'fields'), even though that would be confusing.
As WebGuy Types doesn't have a built-in way to access `Map` entries we have to spoon-feed it; that's what
the `tests` entry is there for.

<!-- * only JS `object`s have `fields`; we still provide a `type` attribute so one can have `list` with `fields`
  (i.e. attributes) -->
* any type can have a `template`
* a `template` is something to be copied, filled out and completed
* a `template` can be any type; `567` can be a `template` and so can be `new Map [ [ 'foo', 5, ], ]`

