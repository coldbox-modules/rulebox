---
title: Home
order: 1
icon: phosphor-duotone:brain
summary: RuleBox is a modern, intuitive, natural-language rules engine for BoxLang and ColdBox applications.
toc: false
layout: home
---

# RuleBox

**RuleBox** is a natural-language rules engine for BoxLang and ColdBox:
write each rule as `given`, `when`, `then` instead of nested `if` statements.

Save this as `models/HelloWorld.bx`:

```js
class extends="rulebox.models.RuleBook"{
	function defineRules(){
		addRule( newRule( "greet" )
			.then( ( facts, result ) => result.setValue( "Hello " & facts.name ) ) )
	}
}
```

Then run it:

```js
getInstance( "HelloWorld" )
	.run( { name: "World" } )
	.getResult()
	.getValue()
```

That returns `Hello World`. Rules stay small, separate from each other, and
separate from the rest of your code. The syntax follows the
[Given-When-Then](https://martinfowler.com/bliki/GivenWhenThen.html) style
from Behavior Driven Development.

::: cards
::: card title="Natural-language DSL" icon="phosphor-duotone:chat-circle-text"
Rules read like sentences: `given().when().then()`. No nested
conditionals, no scattered business logic.
:::
::: card title="WireBox-native" icon="phosphor-duotone:plugs-connected"
`Rule@rulebox`, `RuleBook@rulebox`, `Builder@rulebox` and `Result@rulebox`
are registered automatically - just `getInstance()` them.
:::
::: card title="Fully audited" icon="phosphor-duotone:list-magnifying-glass"
Every rule's execution is tracked in an audit trail, so you always know
which rules fired, skipped, stopped, or failed.
:::
:::

## Where to start

- [Getting Started](getting-started.md) - run your first rule
- [Help and Consulting](help-and-consulting.md) - get professional help with your RuleBox integration
- [Tutorial Course](course/index.md) - learn RuleBox in ten short lessons by building a loan decision
- [Defining RuleBooks](guides/defining-rulebooks.md) - your first rules
- [The RuleBook DSL](guides/the-dsl.md) - `given`/`when`/`except`/`then`/`using`/`stop`
- [Declaring Facts](guides/declaring-facts.md) - say which facts a rulebook takes, and enforce them
- [External Rules](guides/external-rules.md) - load rules from JSON, YAML, or a database
- [A Complex Example](guides/complex-example.md) - a full, real-world walkthrough
- [Rule Visualizer](guides/visualizer.md) - an admin UI to browse rulebooks, dry-run them, and watch metrics

## Requirements

- BoxLang 1.18+
- ColdBox 8+
- Installs into your app's `modules/` folder

## Credits

RuleBox is based on the work of [RuleBook](https://github.com/rulebook-rules/rulebook),
ported to BoxLang.

## License

Apache License 2.0.
