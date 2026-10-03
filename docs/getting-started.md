---
title: Getting Started
order: 2
icon: phosphor-duotone:rocket-launch
summary: Install RuleBox and see what it registers in WireBox.
tags: [guides, setup]
---

# Getting Started

## Requirements

- BoxLang 1.14+
- ColdBox 8+

The Visualizer Live Tracker needs BoxLang 1.18.0+. Older runtimes strip the
blank line that ends each server-sent event. This is fixed in 1.18.0.

## Installation

Leverage [CommandBox](https://commandbox.ortusbooks.com/) to install
RuleBox as a module in your ColdBox application. It installs into your
app's `modules/` folder:

```bash frame="terminal" title="Terminal"
box install rulebox
```

## Your first rule

Save this as `models/HelloWorld.bx`:

```js
class extends="rulebox.models.RuleBook"{
	function defineRules(){
		addRule( newRule( "greet" )
			.then( ( facts, result ) => result.setValue( "Hello " & facts.name ) ) )
	}
}
```

Then run it from a handler or anywhere you can call `getInstance()`:

```js
getInstance( "HelloWorld" )
	.run( { name: "World" } )
	.getResult()
	.getValue()
```

That returns `Hello World`. `run()` takes your facts, `getResult()` gets the
result, and `getValue()` reads what the rule put in it. To go deeper, see
[Defining RuleBooks](guides/defining-rulebooks.md).

## What gets registered

Once installed, the module registers the following objects in WireBox:

| WireBox ID | Type | Description |
|---|---|---|
| `Rule@rulebox` | Transient | A single rule |
| `RuleBook@rulebox` | Transient | A rule book that groups and chains rules |
| `Builder@rulebox` | Singleton | Builds à la carte rules and rule books |
| `Result@rulebox` | Transient | Models the result produced by a rule chain |
| `RuleBookRegistry@rulebox` | Singleton | Hands out named rulebooks declared in settings or config files |

> `RuleBook` and `Rule` are **transient** objects - they carry state
> (facts, results, audit trail) across a `run()`, so a fresh instance is
> requested every time via `getInstance()`. See
> [Thread Safety](guides/thread-safety.md) for why that matters.

## Next steps

- [Defining RuleBooks](guides/defining-rulebooks.md)
- [The RuleBook DSL](guides/the-dsl.md)
