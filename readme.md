# RuleBox: A Rule Engine For ColdBox Applications

**RuleBox** is a modern intuitive and natural language rule engine based upon the great work of **RuleBook**: https://github.com/rulebook-rules/rulebook ported over to BoxLang.

Tired of classes filled with if/then/else statements? Need a nice abstraction that allows rules to be easily specified in a way that decouples them from each other? Want to write rules the same way that you write the rest of your code in BoxLang? RuleBox is right for you!

RuleBox allows you to write rules in an expressive and dynamic Domain Specific Language modeled closely after the Given-When-Then (https://martinfowler.com/bliki/GivenWhenThen.html) methodology.

## Requirements

- BoxLang 1.14+

## Installation

Just leverage CommandBox: `box install rulebox` and it will install as a module in your ColdBox application.

## Usage

The module will register the following objects in WireBox:

- `Rule@rulebox` - A transient rule
- `RuleBook@rulebox` - A transient rule book object
- `Builder@rulebox` - A static class that can be used to build a-la-carte rules and rule books.
- `Result@rulebox` - RuleBooks produce results and this is the object that models such results.

### Defining Rules

The preferred approach is for you to create your own RuleBook that extends: `rulebox.models.RuleBook` with a method called `defineRules()`. In this method you will define all the rules that apply to that specific RuleBook using our DSL. There is nothing stopping you from creating rulebooks on the fly, which can allow you to create dynamic or a-la-carte rules if needed.

> RuleBooks should be transient objects as they are reused when binded with facts.

### A HelloWorld Example

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

As you can see from above, new rules are created by calling the `newRule()` method with an optional `name` that you can use to identify the rule you register. You can also define rules as a closure/lambda with slightly different syntax:

```js
class extends="rulebox.models.RuleBook"{

// Lambdas
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

> The RuleBook also has a `name` property, so you can attach a human readable name to the RuleBook via `setName( name )` method.

...or use 2 rules

```js
class extends="rulebox.models.RuleBook"{

	function defineRules(){
		.addRule(
			newRule()
				.then( () => println( "Hello " ) )
		)
		.addRule(
			newRule()
				.then( () => println( "World " ) )
		)
	}
}
```

now, run it!

```js
getInstance("HelloWorld").run()
```

Like mentioned before, I can also create a-la-carte rules and a rulebook by leveraging the `Builder`:

```js
builder = getInstance( "Builder@rulebox" )

builder
	.create( "My RuleBook" )
		.addRule(
			builder.rule()
				.then( ( facts ) => println( "Hello " ) )
		)
		.addRule(
			builder.rule()
				.then( ( facts ) => println( "World " ) )
		)
	.run()
```

### The Above Example Using Facts

```js
class extends="rulebox.models.RuleBook"{

	function defineRules(){
		addRule(
			newRule()
				.when( ( facts ) => facts.keyExists( "hello" ) )
				.then( ( facts ) => println( facts.hello ) )
		)
		.addRule(
			newRule()
				.when( ( facts ) => facts.keyExists( "world" ) )
				.then( ( facts ) => println( facts.world ) )
		)
	}
}
```

..or it could be a single rule

```js
class extends="rulebox.models.RuleBook"{

	function defineRules(){
		addRule(
			newRule()
			.when( ( facts ) => facts.keyExists( "hello" ) && facts.keyExists( "world" ) )
			using( "hello" ).then( ( facts ) => println( facts.hello ) )
			using( "world" ).then( ( facts ) => println( facts.world ) )
		)
	}
}
```

now, run it!

```js
getInstance( "MyRuleBook" )
	.run( {
		"hello" : "Hello ",
		"world" : " World"
	} )

# or using the givenAll() method
getInstance( "MyRuleBook" )
	.givenAll( {
		"hello" : "Hello ",
		"world" : " World"
	} )
	.run()
```

### A More Complex Scenario

**The Requirements**:

_MegaBank issues home loans. If an applicant's credit score is less than 600 then they must pay 4x the current rate. If an applicant’s credit score is between 600, but less than 700, then they must pay a an additional point on top of their rate. If an applicant’s credit score is at least 700 and they have at least $25,000 cash on hand, then they get a quarter point reduction on their rate. If an applicant is a first time home buyer then they get a 20% reduction on their calculated rate after adjustments are made based on credit score (note: first time home buyer discount is only available for applicants with a 600 credit score or greater)._

Given those set of requirements we will create the rules, but this time we will also track results using a RuleBox `Result` object. The `Result` object is passed to the `then()` methods and it has a very simple API for dealing with results. Please note that the same instance of that `Result` object is passed from rule to rule, so you can work on the result. Much how map, reduce functions work. The `Result` object can also be pre-set with a default value by leveraging the `withDefaultValue()` method in the `RuleBook` object. If not, the default value would be `null`.

Basic `Result` methods are:

-   `setValue()` - Set the value in the result
-   `getValue()` - Get the value
-   `isPresent()` - Has the value been set or is it `null`

**Applicant.bx**

```js
class{

	property creditScore
	property cashOnHand
	property firstTimeHomeBuyer

	function init( creditScore, cashOnHand, firstTimeHomeBuyer ){
		variables.creditScore        = arguments.creditScore
		variables.cashOnHand         = arguments.cashOnHand
		variables.firstTimeHomeBuyer = arguments.firstTimeHomeBuyer
		return this
	}

}
```

This `Applicant.bx` tracks our home loan applicants, now let's build the rules for this home loan.

**HomeLoanRateRuleBook.bx**

```js
/**
 * This rule book determines rules for a home loan rate
 */
class extends="rulebox.models.RuleBook"{

	function defineRules(){
		//credit score under 600 gets a 4x rate increase
		addRule(
			newRule()
			.when( ( facts ) => facts.applicant.getCreditScore() < 600 )
			.then( ( facts, result ) => result.setValue( result.getValue() * 4 ) )
			.stop()
		)

		//credit score between 600 and 700 pays a 1 point increase
		addRule(
			newRule()
			.when( ( facts ) => facts.applicant.getCreditScore() < 700 )
			.then( ( facts, result ) => result.setValue( result.getValue() + 1 ) )
		)

		//credit score is 700 and they have at least $25,000 cash on hand
		addRule(
			newRule()
			.when( ( facts ) => facts.applicant.getCreditScore() >= 700 && facts.applicant.getCashOnHand() >= 25000 )
			.then( ( facts, result ) => result.setValue( result.getValue() - 0.25 ) )
		)

		// first time homebuyers get 20% off their rate (except if they have a creditScore < 600)
		addRule(
			newRule()
			.when( ( facts ) => facts.applicant.getFirstTimeHomeBuyer() )
			.then( ( facts, result ) => result.setValue( result.getValue() * 0.80 ) )
		)
	}

}
```

Now that we have built the rules and applicant, let's run them with a few example applicants. Remember, you would run these from a handler or another service method. Below I am running them from a BDD test:

```js
describe("Home Loan Rate Rules", () => {
	it("Can calculate a first time home buyer with 20,000 down and 650 credit score", () => {
		var homeLoans = getInstance("tests.resources.HomeLoanRateRuleBook")
			.withDefaultResult(4.5)
			.given(
				"applicant",
				new tests.resources.Applicant(650, 20000, true)
			)

		homeLoans.run()

		expect(homeLoans.getResult().isPresent()).toBeTrue()
		expect(homeLoans.getResult().getValue()).toBe(4.4)
	})

	it("Can calculate a non first home buyer with 20,000 down and 650 credit score", () => {
		var homeLoans = getInstance("tests.resources.HomeLoanRateRuleBook")
			.withDefaultResult(4.5)
			.given(
				"applicant",
				new tests.resources.Applicant(650, 20000, false)
			)

		homeLoans.run()

		expect(homeLoans.getResult().isPresent()).toBeTrue()
		expect(homeLoans.getResult().getValue()).toBe(5.5)
	})
})
```

Let's even take this further and just use facts instead of the `Applicant.bx`

```js
/**
 * This rule book determines rules for a home loan rate using facts
 */
class extends="rulebox.models.RuleBook"{

	function defineRules(){
		//credit score under 600 gets a 4x rate increase
		addRule(
			newRule()
			.when( ( facts ) => facts[ "creditScore" ] < 600 )
			.then( ( facts, result ) => result.setValue( result.getValue() * 4 ) )
			.stop()
		)

		//credit score between 600 and 700 pays a 1 point increase
		addRule(
			newRule()
			.when( ( facts ) => facts[ "creditScore" ] < 700 )
			.then( ( facts, result ) => result.setValue( result.getValue() + 1 ) )
		)

		//credit score is 700 and they have at least $25,000 cash on hand
		addRule(
			newRule()
			.when( ( facts ) => facts[ "creditScore" ] >= 700 && facts[ "cashOnHand" ] >= 25000 )
			.then( ( facts, result ) => result.setValue( result.getValue() - 0.25 ) )
		)

		// first time homebuyers get 20% off their rate (except if they have a creditScore < 600)
		addRule(
			newRule()
			.when( ( facts ) => facts[ "firstTimeHomeBuyer" ] )
			.then( ( facts, result ) => result.setValue( result.getValue() * 0.80 ) )
		)
	}

}
```

```js
describe("Home Loan Rate Rules", () => {
	it("Can calculate a first time home buyer with 20,000 down and 650 credit score", () => {
		var homeLoans = getInstance("tests.resources.HomeLoanRateRuleBook")
			.withDefaultResult(4.5)
			.given("creditScore", 650)
			.given("cashOnHand", 20000)
			.given("firstTimeHomeBuyer", true)

		homeLoans.run()

		expect(homeLoans.getResult().isPresent()).toBeTrue()
		expect(homeLoans.getResult().getValue()).toBe(4.4)
	})

	it("Can calculate a non first home buyer with 20,000 down and 650 credit score", () => {
		var homeLoans = getInstance("tests.resources.HomeLoanRateRuleBook")
			.withDefaultResult(4.5)
			.given("creditScore", 650)
			.given("cashOnHand", 20000)
			.given("firstTimeHomeBuyer", false)

		homeLoans.run()

		expect(homeLoans.getResult().isPresent()).toBeTrue()
		expect(homeLoans.getResult().getValue()).toBe(5.5)
	})
})
```

#### `Result` Object

From the code above you might have noticed some nice convenience methods in the `Result` object. Here are some more:

-   `ifPresent( closure )` - You pass a closure that receives the value and it is only called if the value is **NOT** null
-   `orElse( value )` - You can get a value or a default value if the value is not set.
-   `orEleseGet( closure )` - If the value is not set, then we will call your closure which should return a value back.

```js
if (rulebook.getResult().isPresent()) {
	// do something.
}

rulebook.getResult().ifPresent( ( value ) => println("The vaue produced is #value#") )
```

### Thread Safety

`RuleBook` and `Rule` are transient (non-singleton) objects, and `given()`/`givenAll()` write facts directly onto the instance's own state. That means a single `RuleBook` instance is **not** safe to `run()` concurrently from multiple threads, or with different facts across separate calls - the facts and rule status audit trail accumulate on that instance across every `run()` call. Always request a fresh transient instance (e.g. `getInstance( "MyRuleBook" )`) per invocation, whether that invocation happens on a separate thread or simply at a separate point in time with different facts. A `RuleBook` instance is only safe to `run()` again with the exact same facts it already holds.

## The RuleBook Domain Specific Language Explained

The RuleBox BoxLang Domain Specific Language (DSL) uses the `Given-When-Then` format, popularized by Behavior Driven Development (BDD) and associated testing frameworks (e.g. TestBox, Cucumber and Spock) and highly inspired by our Java Counterpart: **RuleBook** (https://github.com/rulebook-rules/rulebook). Many of the ideas that went into creating the RuleBox BoxLang DSL are also borrowed from BDD, including: **Sentences should be used to describe rules and Rules should be defined using a ubiquitous language that translates into the codebase.**

### Given-When-Then: The Basis of the RuleBook Language

Much like the Given-When-Then language for defining tests that was popularized by BDD, RuleBox uses a Given-When-Then language for defining rules. The RuleBox Given-When-Then methods have the following meanings:

-   **Given** - some Fact(s)
-   **When** - a condition evaluates to true
-   **Except** - a condition that evaluates to false
-   **Then** - an action is triggered

This is great, but we have determined that the `when()` operations can also get out of hand, so we introduced another rule to the language: `except()`. So you can say: `when().except().then()`. This can be a handy exception function that even though the when condition evaulates to `true`, if you chain an `except()` to it that must evaluate to `false`.

`given, givenAll` methods can accept one or more facts in various different forms and are used as a collection of information provided to a single Rule. When grouping Rules into a RuleBook, facts are supplied to the Rules when the RuleBook is run, so the `Given` can be inferred.

```js
var homeLoans = getInstance("tests.resources.HomeLoanRateRuleBook")
	.withDefaultResult(4.5)
	.given("creditScore", 650)
	.given("cashOnHand", 20000)
	.given("firstTimeHomeBuyer", false)
	.run()

var homeLoans = getInstance("tests.resources.HomeLoanRateRuleBook")
	.withDefaultResult(4.5)
	.givenAll({
		creditScore: 650,
		cashOnHand: 20000,
		firstTimeHomeBuyer: false,
	})
	.run()
```

`When` methods accept a Predicate closure/lambda that evaluates a condition based on the Facts provided. Only one `when()` method can be specified per Rule and it must return boolean.

```js
.when( ( facts ) => {
	// determine if we continue or not
	return boolean
} )
```

`Except` methods negate the `when()` operation if it passes. Thus you can say, when the balance is greater than 100, except when your account is disabled, then dispense some money.

```js
except( ( facts ) => facts.accountDisabled )
```

`Then` methods accept a Consumer closure/lambda that describe the action to be invoked if the condition in the `when()` method evaluates to `true`. There can be **multiple** `then()` methods specified in a Rule that will all be invoked in the order they are specified if the `when()` condition evaluates to `true`. If a `then()` returns a `true` then no more consumers left in the execution will execute, thus breaking the consumer chain. If you return void or `false` the chain continues.

```js
.then( ( facts, result ) => {
	//  do stuff

	// break the next then()
	return true
} )
.then( ( facts, result ) => {
	// This never fires
} )
```

### The Using Method

Using methods reduce the set of facts available to a `then()` method. Multiple `using()` methods can also be chained together if so desired. The aggregate of the facts with the names specified in all `using()` methods immediately preceeding a `then()` method will be made available to that `then()` method. Please look above for the `using()` examples.

### The Stop Method

Stop methods break the rule chain. If a `stop()` method is specified when defining a rule, it means that if the `when()` condition evaluates to `true`, following the completion of the `then()` action(s), the rule chain should be broken and no more rules in that chain should be evaluated.

### Working With Facts

Facts can be provided to Rules using the `given() and givenAll()` methods. In RuleBooks, facts are provided to Rules when the RuleBook is run. The facts available to Rules and RuleBooks are contained in a struct, so this means that the facts are passed by referece. The reason why facts exist is so that there is always a reference to the objects that Rules work with - even if say, an immutable object is replaced, the perception is that the Fact still exists and provides a named reference to a representative object.

### Auditing Rules

Rule auditing is also very handy in knowing which rules fired and which ones did not. The RuleBook is in charge of tracking its rules in a special struture called `RuleStatusMap`. It is imperative that you give rules a `name` in order for the auditing to present you meaningful data, if not you will see the intern ID of the rule. You can name rules in many ways:

```js
// Using the Builder
builder.rule("ruleName")

// Using the new Rule method
addRule(newRule("ruleName"))

// Or using it's setter
addRule(newRule().setName("ruleName"))
```

Each Auditable Rule added to a RuleBook has its state recorded in the RuleBook. At the time when rules are registered in the RuleBook, their Rule Status is `REGISTERED`. After the RuleBook is run, their Rule Status is changed to `SKIPPED` for all rules whose conditions do not evaluate to true. For rules whose conditions do evaluate to true and whose `then()` action completes successfully, their Rule Status is changed to `EXECUTED`. If a `then()` action throws an exception, the Rule Status is changed to `FAILED` and the exception is re-thrown to the caller.

Retrieving the status of a rule can be done as follows:

```js
status = ruleBook.getRuleStatus("rule1")
status = ruleBook.getRuleStatus("rule2")
```

Or you can retrieve the entire struct of statuses:

```js
writeDump(ruleBook.getRuleStatusMap())
```
