---
title: Declaring Facts
order: 3
icon: phosphor-duotone:list-checks
summary: Declare the facts a RuleBook takes, document them, and optionally enforce them.
tags: [guides, facts, validation]
---

# Declaring Facts

A `RuleBook` can declare the facts it takes: each fact's name, type,
whether it is required, a default, a description and an example. The
declarations are metadata first. They document the rulebook, and the
[Rule Visualizer](visualizer.md) uses them to build its dry run form. A
rulebook can also **enforce** them, so a run with a missing or invalid fact
fails before any rule runs.

Facts belong to the `RuleBook`, so they are declared at the rulebook level,
not per rule.

## Declaring facts in `defineFacts()`

Override `defineFacts()` and call `fact( name )` for each fact. The builder
methods chain:

```js
class extends="rulebox.models.RuleBook"{

	function defineFacts(){
		fact( "creditScore" )
			.type( "numeric" )
			.required()
			.description( "The applicant's credit score, from 300 to 850" )
			.example( 680 )

		fact( "cashOnHand" )
			.type( "numeric" )
			.defaultValue( 0 )
			.description( "Cash available for the down payment" )

		fact( "loanType" )
			.type( "string" )
			.values( [ "fixed", "variable" ] )
			.defaultValue( "fixed" )
	}

	function defineRules(){
		addRule(
			newRule( "approve" )
				.when( ( facts ) => facts.creditScore >= 600 )
				.then( ( facts, result ) => result.setValue( "approved" ) )
		)
	}

}
```

`defineFacts()` runs once per instance, the first time the facts are
needed. Facts keep the order they were declared in.

| Method | Meaning |
|---|---|
| `type( type )` | The kind of value, one of the [types](#types). Defaults to `any` |
| `required( value = true )` | A required fact must be present. Facts are optional unless marked |
| `defaultValue( value )` | The value a missing fact gets when the rulebook enforces its facts. It is not called `default()` because `default` is a reserved word |
| `description( text )` | What the fact is, for documentation and the Visualizer |
| `example( value )` | An example value, for documentation and to prefill the Visualizer's dry run form |
| `values( array )` | The only values the fact may hold. Simple values compare without regard to case |

Calling `fact()` again with the same name returns the existing
declaration, so an instance can refine a class's facts:

```js
var ruleBook = getInstance( "LoanRuleBook" )
ruleBook.fact( "cashOnHand" ).required()
```

### Types

| Type | Accepts |
|---|---|
| `any` | Anything (the default) |
| `string` | Any simple value |
| `numeric` | A number, or a string that reads as one |
| `integer` | A whole number |
| `boolean` | `true`/`false`, `yes`/`no`, or a number |
| `date` | A date, or a string that reads as one |
| `struct` | A struct (not an object) |
| `array` | An array |
| `object` | An object (a class instance or Java object) |

An unknown type, or a blank fact name, throws
`RuleBox.InvalidFactDefinitionException`.

## Declaring facts from data: `withFacts()`

`withFacts( struct )` declares facts from a struct, keyed by fact name. Each
value takes the keys `type`, `required`, `default`, `description`, `example`
and `values`. It works on any rulebook, including one from
[the Builder](the-builder.md):

```js
var builder  = getInstance( "Builder@rulebox" )
var ruleBook = builder.rulebook( "Greeter" )
	.withFacts( {
		name  : { type : "string", required : true, description : "Who to greet" },
		times : { type : "integer", default : 1 }
	} )
	.addRule( builder.rule( "hello" ).then( ( facts, result ) => result.setValue( "Hello " & facts.name ) ) )
```

`withFacts()` checks every declaration before it declares any of them: an
unknown key, a `required` that isn't a boolean, a `values` that isn't an
array or an unknown type throws `RuleBox.InvalidFactDefinitionException`
and declares nothing. Rule files and config use the same struct; see
[Externalized Rule Definitions](external-rules.md#declaring-facts-in-a-rule-file).

## Reading the declarations

```js
ruleBook.getFactDefinitions()
// [
//   { name: "creditScore", type: "numeric", required: true, description: "...", example: 680 },
//   { name: "cashOnHand", type: "numeric", required: false, description: "...", default: 0 },
//   ...
// ]
```

Each struct has `name`, `type`, `required` and `description`, plus
`default`, `example` and `values` when they are set, ready to serialize
as JSON.

## Enforcing facts

By default the declarations only describe the rulebook: a run with a
missing required fact still runs. To check them, call `enforceFacts()`:

```js
function defineFacts(){
	enforceFacts()
	fact( "creditScore" ).type( "numeric" ).required()
}
```

Called in `defineFacts()`, it applies to every instance. You can also call
it on one instance, and an instance call wins over the class:

```js
getInstance( "LoanRuleBook" ).enforceFacts().run( facts )
```

When a rulebook enforces its facts, `run()` and `dryRun()` first:

1. give every missing (or `null`) fact that has a default its default
2. check every declared fact: a required fact must be present, a value must
   be of the declared type, and a fact with `values` must hold one of them
3. throw `RuleBox.InvalidFactsException` if anything is wrong, before any
   rule runs

Undeclared facts are still allowed. `run()` adds the defaults to the
rulebook's facts, so rules see them; `dryRun()` checks a copy and changes
nothing.

### Strict mode

A strict rulebook also rejects any fact it did not declare, which catches
typos like `creditScroe`. Use either form; they are the same:

```js
strictFacts()
enforceFacts( strict = true )
```

### `RuleBox.InvalidFactsException`

The exception lists every problem, not just the first:

| Field | Holds |
|---|---|
| `message` | Every problem, in one sentence each: `Missing required fact [creditScore].`, `Fact [loanType] must be one of: fixed, variable.` |
| `detail` | The facts the rulebook declares |
| `extendedInfo` | The problems as a JSON array of `{ fact, problem, message }`, where `problem` is `missing`, `type`, `value` or `undeclared` |

Messages name the fact but never repeat its value, since facts can hold
personal or sensitive data.

```js
try {
	ruleBook.run( facts )
} catch( "RuleBox.InvalidFactsException" e ) {
	var problems = jsonDeserialize( e.extendedInfo )
	// [ { fact: "creditScore", problem: "missing", message: "Missing required fact [creditScore]." } ]
}
```

## Checking facts without running: `validateFacts()`

`validateFacts( facts )` returns the same problems as an array, without
running anything or throwing, whether or not the rulebook enforces its
facts. Defaults are applied to a copy first, and undeclared facts are only
reported when the rulebook is strict. Use it to validate a form or an API
request before you run anything:

```js
var problems = ruleBook.validateFacts( { creditScore : "abc" } )
// [ { fact: "creditScore", problem: "type", message: "Fact [creditScore] must be a numeric value." } ]
```

`getFactsEnforced()` and `getFactsStrict()` tell you whether a rulebook
enforces its facts and whether it is strict.
