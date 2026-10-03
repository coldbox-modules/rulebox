---
title: RuleBooks in ColdBox
summary: Declare a rulebook once in config, then get a fresh copy anywhere in your app.
icon: phosphor-duotone:number-circle-seven
tags: [course]
---

# RuleBooks in ColdBox

In lesson 6 you wired up the action and the file by hand each time. In a
real app you do that once, in config, and ask for the rulebook by name.

## Declare it

Add a rulebook to your app's `config/ColdBox.bx`. The setting goes inside
`configure()`:

```js
variables.moduleSettings = {
	rulebox = {
		rulebooks = {
			"loan" : {
				"source"  : "config/rules/loan.json",
				"actions" : { "decide" : "DecisionAction" }
			}
		}
	}
}
```

> Write `variables.moduleSettings`. Leaving off `variables.` is a common
> mistake in a BoxLang config, and ColdBox then ignores the setting without
> any error.

`source` is the JSON file from lesson 6, found relative to your app root.
`actions` maps the action name to a **WireBox ID**, so the code lives in a
normal class. Save this as `models/DecisionAction.bx`:

```js
class {

	function execute( facts, result, params ){
		result.setValue( params.decision )
	}

}
```

An action is any object with an `execute( facts, result, params )` method.

## Use it

Ask for the rulebook by name with the `ruleBook()` helper. It is available in
handlers, views and layouts. Update `handlers/Loans.bx`:

```js
class {

	function decide( event, rc, prc ){
		var decision = ruleBook( "loan" )
			.withDefaultResult( "MANUAL_REVIEW" )
			.run( {
				creditScore     : rc.creditScore,
				requestedAmount : rc.requestedAmount
			} )
			.getResult()
			.getValue()

		event.renderData( type="text", data=decision )
	}

}
```

Values from `rc` are strings, and they still compare as numbers, so you do
not need to convert them.

## Two other ways to get it

```js
// Anywhere you have WireBox
getInstance( "RuleBookRegistry@rulebox" ).getRuleBook( "loan" )

// Inject a provider into a model or handler
property name="loanRules" inject="rulebook:loan";
// ...then use it:
loanRules.get().run( facts )
```

## A fresh copy every time

Each of these gives you a **new** RuleBook. RuleBox keeps the recipe, not a
built instance. That matters because a RuleBook holds facts and results
while it runs, so a new one per request keeps requests from interfering with
each other, even in a singleton.

For the injected form, remember to call `.get()`. What is injected is the
small provider, which builds the RuleBook when you ask.

## Rule files in a folder

Any `.json` or `.yaml` file you drop in `config/rulebox/` is picked up
automatically, named after the file. A file that needs no named actions can
be used with no config at all:

```js
ruleBook( "pricing" )   // config/rulebox/pricing.json
```

## Try it

Run your handler with `creditScore=720&requestedAmount=100000` and you get
`APPROVED`. Try `creditScore=540` for `DECLINED`.

**Next:** what happens when something breaks.
