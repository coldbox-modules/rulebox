---
title: Defining RuleBooks
order: 1
icon: phosphor-duotone:notebook
summary: Write a RuleBook class, run it, and read the result.
tags: [guides, rulebook]
---

# Defining RuleBooks

A RuleBook is a class that holds a list of rules. Extend
`rulebox.models.RuleBook` and add your rules in a `defineRules()` method.

## A HelloWorld example

```js title="HelloWorld.bx"
class extends="rulebox.models.RuleBook"{

	function defineRules(){
		addRule(
			newRule( "SayHello" )
				.then( ( facts, result ) => result.setValue( "Hello " & facts.name ) )
		)
	}

}
```

`newRule()` takes an optional name, which you can use to identify the
rule later, for [auditing](auditing.md). Now run it:

```js
var greeting = getInstance( "HelloWorld" )
	.run( { name : "World" } )
	.getResult()
	.getValue()
// "Hello World"
```

`getInstance( "HelloWorld" )` finds the class in your app's `models`
folder by name. Use the full path (`path.to.HelloWorld`) for a class
that lives somewhere else.

### Passing facts

`run( facts )` takes a struct of facts directly. It is a shortcut for
calling `given()` once per key and then `run()`. Facts you pass replace
any fact of the same name; pass `false` as the second argument
(`run( facts, false )`) to keep the ones already set. See
[Facts & Results](facts-and-results.md).

### Reading the outcome

`run()` returns the RuleBook itself, not the answer. That keeps calls
chainable. To get the answer, chain `.getResult().getValue()` after
`run()`, as the example above does. If you are not sure any rule set a
value, check `getResult().isPresent()` first. More in
[Facts & Results](facts-and-results.md).

### Why rules are defined on the first run

`defineRules()` does not run when the RuleBook is created. It runs the
first time you call `run()` (or `dryRun()`), and only when the RuleBook
has no rules yet. By then WireBox has finished injecting your
dependencies, so you can use them inside `defineRules()`. Later runs on
the same instance reuse the rules instead of building them again.

## Other ways to add a rule

You can also pass a closure to `addRule()` and configure the rule inside
it:

```js
addRule( ( rule ) => {
	rule
		.setName( "SayHello" )
		.then( ( facts, result ) => result.setValue( "Hello " & facts.name ) )
} )
```

A RuleBook has a `name` too, which you can set with `setName( name )`.
It is handy for [auditing](auditing.md) and the [Visualizer](visualizer.md).
You can also build rulebooks on the fly, with no class at all, using
[The Builder](the-builder.md).

Rule names must be unique within a `RuleBook`, because the
[audit trail](auditing.md) is keyed by name. Adding a rule whose name is
already taken throws a `RuleBox.DuplicateRuleNameException`; unnamed rules
are never affected.

## Retrieving a RuleBook

A RuleBook class is a normal WireBox-mapped class, so you retrieve it
like any other transient:

```js
var homeLoans = getInstance( "HomeLoanRateRuleBook" )
```

RuleBooks are transient: every `getInstance()` call returns a new one,
and each one remembers its own facts. Ask for a new RuleBook each time
you need one, and do not share one between requests or threads. See
[Thread Safety](thread-safety.md).

## Next

- [The RuleBook DSL](the-dsl.md): `when`, `except`, `then`, `using`, `stop` and priority.
- [Declared rulebooks](external-rules.md#declaring-rulebooks-in-config):
  get a ready-made RuleBook by name with `ruleBook( "name" )`.
- [Externalized Rule Definitions](external-rules.md): load rules from JSON, YAML, or a database.
