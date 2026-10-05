---
title: Facts & Results
order: 3
icon: phosphor-duotone:database
summary: Working with facts, and the Result object's convenience API.
tags: [guides, facts, results]
---

# Facts & Results

## Working with facts

Facts are provided to rules via `given()`/`givenAll()`. In a `RuleBook`,
facts are supplied when the `RuleBook` is run. The facts available to
rules and rulebooks live in a struct, so they're passed **by reference** -
even if, say, an immutable object is replaced, the perception is that the
fact still exists and provides a named reference to a representative
object.

You can key facts off a domain object:

```js
class extends="rulebox.models.RuleBook"{

	function defineRules(){
		addRule(
			newRule()
				.when( ( facts ) => facts.applicant.getCreditScore() < 600 )
				.then( ( facts, result ) => result.setValue( result.getValue() * 4 ) )
				.stop()
		)
	}

}
```

...or off simple named facts instead, whichever reads better for your
domain:

```js
.when( ( facts ) => facts[ "creditScore" ] < 600 )
```

## The `Result` object

`RuleBooks` produce results, and `Result` is the object that models them.
It's passed to every `then()` call, and the **same instance** flows from
rule to rule - much like `map`/`reduce` - so you can accumulate onto it as
the chain runs. Pre-set a default value on a `RuleBook` via
`withDefaultResult()`; otherwise the default is `null`.

| Method | Description |
|---|---|
| `setValue( value )` | Set the value in the result |
| `getValue()` | Get the value |
| `isPresent()` | `true` if the value has been set, `false` if it's still `null` |
| `ifPresent( closure )` | Invoke `closure( value )`, but only if the value is **not** `null` |
| `orElse( other )` | Return the value, or `other` if it isn't present |
| `orElseGet( closure )` | Return the value, or invoke `closure()` and return its result if it isn't present |
| `reset()` | Reset the value back to the default value |

```js
if( rulebook.getResult().isPresent() ) {
	// do something
}

rulebook.getResult().ifPresent( ( value ) => println( "The value produced is #value#" ) )
```

`RuleBook.run()` calls `reset()` on the result at the start of every run,
so a `RuleBook` instance re-run with fresh facts doesn't inherit a value
left over from a previous run.
