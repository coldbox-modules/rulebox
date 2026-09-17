---
title: Defining RuleBooks
order: 1
icon: phosphor-duotone:notebook
summary: RuleBook basics, defineRules(), and the HelloWorld example.
tags: [guides, rulebook]
---

# Defining RuleBooks

The preferred approach is to create your own `RuleBook` that extends
`rulebox.models.RuleBook`, with a method called `defineRules()`. In this
method you define all the rules that apply to that RuleBook using the
RuleBox DSL. Nothing stops you from creating rulebooks on the fly either,
which lets you build dynamic or à la carte rules when needed - see
[The Builder](the-builder.md).

> RuleBooks should be transient objects, since they're reused when bound
> to facts. See [Thread Safety](thread-safety.md).

## A HelloWorld example

```js
class extends="rulebox.models.RuleBook"{

	function defineRules(){
		// Add a new rule to this rulebook
		addRule(
			newRule( "MyRule" )
				.then( ( facts ) => println( "Hello " ) )
				.then( ( facts ) => println( "World" ) )
		)
	}

}
```

New rules are created by calling `newRule()` with an optional `name` you
can use to identify the rule later, for [auditing](auditing.md). You can
also define a rule as a closure/lambda instead, with a slightly different
syntax:

```js
class extends="rulebox.models.RuleBook"{

	function defineRules(){
		addRule( ( rule ) => {
			rule
				.setName( "MyRule" )
				.then( ( facts ) => println( "Hello " ) )
				.then( ( facts ) => println( "World" ) )
		} )
	}

}
```

> A `RuleBook` also has a `name` property, so you can attach a
> human-readable name to it via `setName( name )`.

...or use two separate rules:

```js
class extends="rulebox.models.RuleBook"{

	function defineRules(){
		addRule(
			newRule()
				.then( () => println( "Hello " ) )
		)
		addRule(
			newRule()
				.then( () => println( "World " ) )
		)
	}

}
```

Now, run it:

```js
getInstance( "HelloWorld" ).run()
```

## Retrieving a RuleBook

Since a `RuleBook` subclass is just a WireBox-mapped CFC/BX class, you
retrieve it the same way you'd retrieve any other transient:

```js
var homeLoans = getInstance( "path.to.HomeLoanRateRuleBook" )
```
