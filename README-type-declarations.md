

# WebGuy Type Declarations

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [WebGuy Type Declarations](#webguy-type-declarations)
  - [Type Declaration Objects](#type-declaration-objects)

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
  * `optional` (**`false`**, `true`): an optional type accepts `null` and `undefined` as values
  * `d.freeze` (**`false`**, `true` == `shallow`, `deep`):
  * `d.template`: an object whose keys are field names and whose values are the default value for each
    field; missing fields (that are not overwritten by the type's `create()` method) will be missing from
    the result (and may or may not lead to validation error, as the case may be)

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
