---
title: The Builder
order: 10
icon: phosphor-duotone:hammer
summary: Build à la carte rules and rule books without a dedicated class.
tags: [guides, builder]
---

# The Builder

`Builder@rulebox` is a singleton that lets you create rules and rule
books on the fly, without writing a dedicated class that extends
`RuleBook`.

**When to use it:** use the Builder when the rules are put together at
runtime (from user choices, settings, or a database). Use a
[RuleBook class](defining-rulebooks.md) when the rules are fixed, so you
can name, reuse and test them.

Inject it into any class:

```js title="GreetingService.bx"
class singleton{

	property name="builder" inject="Builder@rulebox";

	function greet( name ){
		return builder.rulebook( "Greeter" )
			.addRule(
				builder.rule()
					.then( ( facts, result ) => result.setValue( "Hello " & facts.name ) )
			)
			.addRule(
				builder.rule()
					.then( ( facts, result ) => result.setValue( result.getValue() & "!" ) )
			)
			.run( { name : arguments.name } )
			.getResult()
			.getValue()
	}

}
```

Outside of WireBox-managed classes, ask for it with
`getInstance( "Builder@rulebox" )`.

| Method | Returns | Description |
|---|---|---|
| `rulebook( name="" )` | `RuleBook` | Creates a new `RuleBook`, optionally named |
| `rule( name )` | `Rule` | Creates a new standalone `Rule`, optionally named |

Since `builder.rulebook()` returns a normal `RuleBook` instance, every
method described in [The RuleBook DSL](the-dsl.md) and
[Facts & Results](facts-and-results.md) - `given()`, `withDefaultResult()`,
`addRule()`, `run()` - is available on it, exactly as it would be on a
hand-written `RuleBook` subclass.

If your rules live in JSON, YAML, or a database, see
[Externalized Rule Definitions](external-rules.md). `loadRules()` works on a
Builder rulebook too.
