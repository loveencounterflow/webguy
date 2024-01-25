

# WebGuy Type Declarations

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [WebGuy Type Declarations](#webguy-type-declarations)
  - [Type Declaration Objects](#type-declaration-objects)
    - [Why `fields` and `template`, why not `default`?](#why-fields-and-template-why-not-default)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


# WebGuy Type Declarations

* declarations are named attributes of a class (called an 'ISA-Class'); name of attribute is name of type,
  value of attribute controls behavior
* order matters
* if derived from `webguy.types.Isa`, its declarations will be inherited
  * in case a re-declaration of a given type is wanted, must opt-in, else rejected with error

Possible types for declarations (attribute values):

* in case `( type_of type_declaration ) is 'text'`: declares an **alias** of an existing type; no forward
  declarations possible
* in case `( type_of type_declaration ) is 'function'`: declares an **ISA-Function** (takes exactly one
  argument; never throws an error; returns either `true` or `false`, all other return values will be
  rejected with error)
* in case `( type_of type_declaration ) is 'object'`, a **type declaration object** (whose attribute `field`
  contains nested type declarations) is expected

## Type Declaration Objects

* obligatory attributes (in the below, `d` representes the declaration):
  * `d.fields`: an object whose keys are field names and whose values are field declarations
  * field declarations are type declarations

* optional attributes:
  * `d.optional`  (`optional boolean`; **`false`**, `true`): an optional type accepts `null` and `undefined` as values
  * `d.freeze`    (`optional boolean`; **`false`**, `true` == `shallow`, `deep`):
  * `d.template`  (`optional object`): an object whose keys are field names and whose values are the default value for
    each field; missing fields (that are not overwritten by the type's `create()` method) will be missing
    from the result (and may or may not lead to validation error, as the case may be)
  * `d.copy`      (`optional function`; **`null`**): when given, should be a unary function that returns a
    (deep) copy of the value it is given
  * `d.tests`     (`optional ( function or list of functions )`; **`null`**): when given, should be a unary
    function or list of unary functions; these functions will be called in the order given with the value
    under consideration; should any one fail, the remaining function calls are forgone, and the value is
    treated as not satisfying the type's requirements.

Field declarations

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
      type:     'integer'
      default:  123
    baz:
      type:     'text'
      optional: true
    gnu:
      type:     'boolean'
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
  type:       'list'
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
  type:       'map'
  tests:
    isa_float_x_value:  ( x ) -> @isa.float x.get 'value'
    isa_float_x_unit:   ( x ) -> @isa.text  x.get 'unit'
  template:   new Map [ [ 'value', 0, ], [ 'unit', 'u', ], ]
  copy:       ( x ) -> new Map x
```

In `#4`, we didn't use `fields` at all; we *could* have used it if we had wanted to because a JavaScript
`Map` is just another object that can have attributes (i.e. 'fields'), even though that would be confusing.
As WebGuy Types doesn't have a built-in way to access `Map` entries we have to spoon-feed it; that's what
the `tests` entry is there for.

* only JS `object`s have `fields`; we still provide a `type` attribute so one can have `list` with `fields`
  (i.e. attributes)
* any type can have a `template`
* a `template` is something to be copied, filled out and completed
* a `template` can be any type; `567` can be a `template` and so can be `new Map [ [ 'foo', 5, ], ]`

