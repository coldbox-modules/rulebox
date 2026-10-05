---
name: rulebox-boxlang-conventions
description: Use this skill when writing or reviewing any BoxLang code in the RuleBox repo. It covers destructuring for-in loops, ## escaping, the null keyword, truthiness, static constants and stateless helpers, property and accessor rules, docblocks, and @threadSafe singletons.
---

# RuleBox BoxLang Conventions

This is BoxLang, not Java. These are the house rules for every class, template and spec in this repo. Each one has been checked on BoxLang 1.18.

## Loops

Use the two-part (destructuring) `for-in` whenever the body needs a position or a value. Never keep a manual counter, and never look a value up by key inside the loop.

```js
// Arrays: element, then its 1-based index
for( var item, index in meals ){ ... }

// Structs: key, then its value (a null value arrives as null, so isNull( value ) works)
for( var key, value in produce ){ ... }

// Queries: the row as a struct, then its 1-based row number
for( var row, rowNumber in qRules ){ ... }
```

Both loop variables are function-local, with or without `var`. Keep a classic `for( var i = 1; ... )` only for counting loops with no collection, or when the body needs a neighbour (`items[ i + 1 ]`).

## Templates and strings

- `#` starts an expression inside `bx:output`, `.bxm` templates and interpolated strings. Write `##` for a literal `#`. An HTML entity becomes `&##10084;`, or use the character itself.
- An unescaped `#` in a docs theme template fails the bx-sites build. The build still exits 0 and publishes a partial site, so always check the built page count.

## Values

- Use the `null` keyword, never `javaCast( "null", "" )`.
- BoxLang does truthy comparisons and type coercion behind the scenes. Don't add Java-style conversions or casts it already does.

## Static

- Constants that never change, and defaults a module loads once, live in a `static {}` block and are read as `static.NAME`.
- A helper with no state is a class of `static` functions, called as `ClassName::method()`. Inside it, call its own helpers as `static.helper()`.

## Properties are fields

- Every instance field (anything a class keeps in `variables`) is declared with `property`, including runtime state such as counters, flags and lazily resolved objects. `ModuleConfig.bx` is the exception: `variables.settings` there is the ColdBox module convention.
- Every non-injected property has a docblock saying what it holds. Injected properties (`@inject( "..." )`) don't need one.
- Initialise mutable defaults (`{}`, `[]`) in `init()` or `onDIComplete()`.
- A declared property always exists in `variables`, as `null` until set. Test it with `isNull( variables.x )`. `structKeyExists( variables, "x" )` is always true for a declared property.

## Accessors

BoxLang generates `getX()` and `setX()` for every property, and the generated setter returns `this`, so chaining works. Don't hand-write an accessor that only reads or assigns the field. Write a `get` or `set` method only when it computes, defaults or validates something.

## Docblocks

Every method has a docblock: what it does, each `@argument`, and `@return` when it returns something.

## Singletons and @threadSafe

A `@singleton` class that has property injection, or an `onDIComplete()` method, also gets `@threadSafe`, so WireBox holds its construction lock through injection. This does not apply to classes in a circular dependency.

```js
@singleton
@threadSafe
class{

	@inject( "wirebox" )
	property name="wirebox";

	/**
	 * The last subscription token handed out by subscribe()
	 */
	property name="nextToken" type="numeric";

	/**
	 * Wire up anything that needs the injected dependencies
	 */
	function onDIComplete(){
		variables.nextToken = 0
	}

}
```

## Checklist for a new or changed class

1. Every `variables.*` field is a declared `property`, with a docblock unless it is injected.
2. No hand-written plain getters or setters.
3. Existence checks on properties use `isNull()`.
4. `@singleton` with injection or `onDIComplete()` also has `@threadSafe`.
5. Constants and stateless helpers are `static`.
6. Loops that need an index, key or value use the two-part `for-in`.
7. Every method has a docblock.
