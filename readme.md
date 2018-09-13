# RuleBox: A Rule Engine For ColdBox Applications

**RuleBox** is a modern intuitive and natural language rule engine based upon the great work of **RuleBook**: https://github.com/rulebook-rules/rulebook ported over to ColdFusion (CFML).

Tired of classes filled with if/then/else statements? Need a nice abstraction that allows rules to be easily specified in a way that decouples them from each other? Want to write rules the same way that you write the rest of your code [in ColdFusion]? RuleBox is right for you!

RuleBox allows you to write rules in an expressive and dynamic Domain Specific Language modeled closely after the Given-When-Then (https://martinfowler.com/bliki/GivenWhenThen.html) methodology.

## Requirements

* Lucee4.5+
* Adobe ColdFusion 11+

## Installation

Just leverage CommandBox: `box install rulebox` and it will install as a module in your ColdBox application.

## Usage

The module will register the following objects in WireBox:

* `Rule@rulebox` - A transient rule
* `RuleBook@rulebox` - A transient rule book object
* `RuleBookBuilder@rulebox` - A static class that can be used to build a-la-carte rules and rule books.

### Defining Rules

The preferred approach is for you to create your own RuleBook that extends: `rulebox.models.RuleBook` with a method called `defineRules()`.  In this method you will define all the rules that apply to that specific RuleBook using our DSL.

### A HelloWorld Example

```js
component extends="rulebox.models.RuleBook" singleton{

	function defineRules(){
		// Add a new rule to this rulebook
		addRule(
			newRule( "MyRule" )
				.then( function( facts ){
					sytemOutput( "Hello " );
				} )
				.then( function( facts ){
					systemOutput( "World" );
				} )
		);
	}
}
```

As you can see from above, new rules are created by calling the `newRule()` method with an optional `name` that you can use to identify the rule you register.

> The RuleBook also has a `name` property, so you can attach a human readable name to the RuleBook via `setName( name )` method.

...or use 2 rules

```js
component extends="rulebox.models.RuleBook" singleton{

	function defineRules(){
		.addRule( 
			newRule()
				.then( function(){
					sytemOutput( "Hello " );
				} )
		)
		.addRule( 
			newRule()
				.then( function(){
					sytemOutput( "World " );
				} )
		)
	}
}
```

now, run it!

```js
getInstance( "HelloWorld" ).run();
```

### The Above Example Using Facts

```js
component extends="rulebox.models.RuleBook" singleton{

	function defineRules(){
		addRule( 
			newRule()
				.when( function( facts ){
					return facts.keyExists( "hello" );
				})
				.then( function( facts ){
					sytemOutput( facts.hello );
				} )
		)
		.addRule( 
			newRule()
				.when( function( facts ){
					return facts.keyExists( "world" );
				})
				.then( function( facts ){
					sytemOutput( facts.world );
				} )
		);
	}
}
```

..or it could be a single rule

```js
component extends="rulebox.models.RuleBook" singleton{

	function defineRules(){
		addRule( 
			newRule()
			.when( function(){
				return facts.keyExists( "hello" ) && facts.keyExists( "world" );
			})
			using( "hello" ).then( function(){
				systemOutput( facts.hello );
			} );
			using( "world" ).then( function(){
				systemOutput( facts.world );
			} );
		);
	}
}
```

now, run it!

```js
getInstance( "MyRuleBook" )
	.run( {
		"hello" : "Hello ",
		"world" : " World"
	} );

# or using the givenAll() method
getInstance( "MyRuleBook" )
	.givenAll( {
		"hello" : "Hello ",
		"world" : " World"
	} )
	.run();
```

### A More Comple Scenario

*MegaBank issues home loans. If an applicant's credit score is less than 600 then they must pay 4x the current rate. If an applicant’s credit score is between 600, but less than 700, then they must pay a an additional point on top of their rate. If an applicant’s credit score is at least 700 and they have at least $25,000 cash on hand, then they get a quarter point reduction on their rate. If an applicant is a first time home buyer then they get a 20% reduction on their calculated rate after adjustments are made based on credit score (note: first time home buyer discount is only available for applicants with a 600 credit score or greater).*

**Applicant.cfc**

```js
component accessors="true"{

	property creditScore;
	property cashOnHand;
	property firstTimeHomeBuyer;

	function init( creditScore, cashOnHand, firstTimeHomeBuyer ){
		variables.creditScore        = arguments.creditScore;
		variables.cashOnHand         = arguments.cashOnHand;
		variables.firstTimeHomeBuyer = arguments.firstTimeHomeBuyer;
		return this;
	}

}
```

This `Applicant.cfc` tracks our home loan applicants, now let's build the rules for this home loan.

**HomeLoanRateRules.cfc**

```js
/**
 * This rule book determines rules for a home loan rate
 */
component extends="rulebox.models.RuleBook"{

	function defineRules(){
		//credit score under 600 gets a 4x rate increase
		addRule(
			newRule()
			.when( function( facts ){ return facts.applicant.getCreditScore() < 600; } )
			.then( function( facts, result ){ result.setValue( result.getValue() * 4 ); } )
			.stop()
		);

		//credit score between 600 and 700 pays a 1 point increase
		addRule(
			newRule()
			.when( function( facts ){ return facts.applicant.getCreditScore() < 700; } )
			.then( function( facts, result ){ result.setValue( result.getValue() + 1 ); } )
		);

		//credit score is 700 and they have at least $25,000 cash on hand
		addRule(
			newRule()
			.when( function( facts ){
				return ( facts.applicant.getCreditScore() >= 700 && facts.applicant.getCashOnHand() >= 25000 );
			} )
			.then( function( facts, result ){ result.setValue( result.getValue() - 0.25 ); } )
		);

		// first time homebuyers get 20% off their rate (except if they have a creditScore < 600)
		addRule(
			newRule()
			.when( function( facts ){ return facts.applicant.getFirstTimeHomeBuyer(); } )
			.then( function( facts, result ){ result.setValue( result.getValue() * 0.80 ); } )
		);
	}

}
```

Now that we have built the rules and applicant, let's run them with a few example applicants.  Remember, you would run these from a handler or another service method.  Below I am running them from a BDD test:

```js
describe( "Home Loan Rate Rules", function(){
	it( "Can calculate a first time home buyer with 20,000 down and 650 credit score", function(){
		var homeLoans = getInstance( "tests.resources.HomeLoanRateRuleBook" )
			.withDefaultResult( 4.5 )
			.given( "applicant", new tests.resources.Applicant( 650, 20000, true ) );

		homeLoans.run();

		expect( homeLoans.getResult().isPresent() ).toBeTrue();
		expect( homeLoans.getResult().getValue() ).toBe( 4.4 );

	});

	it( "Can calculate a non first home buyer with 20,000 down and 650 credit score", function(){
		var homeLoans = getInstance( "tests.resources.HomeLoanRateRuleBook" )
			.withDefaultResult( 4.5 )
			.given( "applicant", new tests.resources.Applicant( 650, 20000, false ) );

		homeLoans.run();

		expect( homeLoans.getResult().isPresent() ).toBeTrue();
		expect( homeLoans.getResult().getValue() ).toBe( 5.5 );

	});
});
```

Let's even take this further and just use facts instead of the `Applicant.cfc`

```js
/**
 * This rule book determines rules for a home loan rate using facts
 */
component extends="rulebox.models.RuleBook"{

	function defineRules(){
		//credit score under 600 gets a 4x rate increase
		addRule(
			newRule()
			.when( function( facts ){ return facts[ "creditScore" ] < 600; } )
			.then( function( facts, result ){ result.setValue( result.getValue() * 4 ); } )			.stop()
		);

		//credit score between 600 and 700 pays a 1 point increase
		addRule(
			newRule()
			.when( function( facts ){ return facts[ "creditScore" ] < 700; } )
			.then( function( facts, result ){ result.setValue( result.getValue() + 1 ); } )
		);

		//credit score is 700 and they have at least $25,000 cash on hand
		addRule(
			newRule()
			.when( function( facts ){
				return ( facts[ "creditScore" ] >= 700 && facts[ "cashOnHand" ] >= 25000 );
			} )
			.then( function( facts, result ){ result.setValue( result.getValue() - 0.25 ); } )
		);

		// first time homebuyers get 20% off their rate (except if they have a creditScore < 600)
		addRule(
			newRule()
			.when( function( facts ){ return facts[ "firstTimeHomeBuyer" ]; } )
			.then( function( facts, result ){ result.setValue( result.getValue() * 0.80 ); } )
		);
	}

}
```

```js
describe( "Home Loan Rate Rules", function(){
	it( "Can calculate a first time home buyer with 20,000 down and 650 credit score", function(){
		var homeLoans = getInstance( "tests.resources.HomeLoanRateRuleBook" )
			.withDefaultResult( 4.5 )
			.given( "creditScore", 650 )
			.given( "cashOnHand", 20000 )
			.given( "firstTimeHomeBuyer", true );

		homeLoans.run();

		expect( homeLoans.getResult().isPresent() ).toBeTrue();
		expect( homeLoans.getResult().getValue() ).toBe( 4.4 );

	});

	it( "Can calculate a non first home buyer with 20,000 down and 650 credit score", function(){
		var homeLoans = getInstance( "tests.resources.HomeLoanRateRuleBook" )
			.withDefaultResult( 4.5 )
			.given( "creditScore", 650 )
			.given( "cashOnHand", 20000 )
			.given( "firstTimeHomeBuyer", false );;

		homeLoans.run();

		expect( homeLoans.getResult().isPresent() ).toBeTrue();
		expect( homeLoans.getResult().getValue() ).toBe( 5.5 );

	});
});
```

### Thread Safety

RuleBooks are threadsafe since they hold state and are transient.  This means that a single instance of a RuleBook can be run in different threads with different Facts without unexpected results. However, using the same exact fact structures across different threads may cause unexpected results. Facts represent data for individual invocations of a RuleBook, whereas RuleBooks represent reusable sets of Rules.

### The RuleBook Domain Specific Language Explained

The RuleBox CFML Domain Specific Language (DSL) uses the `Given-When-Then` format, popularized by Behavior Driven Development (BDD) and associated testing frameworks (e.g. TestBox, Cucumber and Spock) and highly inspired by our Java Counterpart: **RuleBook** (https://github.com/rulebook-rules/rulebook). Many of the ideas that went into creating the RuleBox CFML DSL are also borrowed from BDD, including: **Sentences should be used to describe rules and Rules should be defined using a ubiquitous language that translates into the codebase.**

#### Given-When-Then: The Basis of the RuleBook Language

Much like the Given-When-Then language for defining tests that was popularized by BDD, RuleBox uses a Given-When-Then language for defining rules. The RuleBox Given-When-Then methods have the following meanings.

* **Given** - some Fact(s)
* **When** - a condition evaluates to true
* **Then** - an action is triggered

`given, givenAll` methods can accept one or more facts in various different forms and are used as a collection of information provided to a single Rule. When grouping Rules into a RuleBook, facts are supplied to the Rules when the RuleBook is run, so the `Given` can be inferred.

`When` methods accept a Predicate closure/lambda that evaluates a condition based on the Facts provided. Only one `when()` method can be specified per Rule and it must return boolean.

`Then` methods accept a Consumer closure/lambda that describe the action to be invoked if the condition in the `when()` method evaluates to `true`. There can be **multiple** `then()` methods specified in a Rule that will all be invoked in the order they are specified if the `when()` condition evaluates to `true`.

#### The Using Method

Using methods reduce the set of facts available to a `then()` method. Multiple `using()` methods can also be chained together if so desired. The aggregate of the facts with the names specified in all `using()` methods immediately preceeding a `then()` method will be made available to that `then()` method. Please look above for the `using()` examples.

#### The Stop Method

Stop methods break the rule chain. If a `stop()` method is specified when defining a rule, it means that if the `when()` condition evaluates to `true`, following the completion of the `then()` action(s), the rule chain should be broken and no more rules in that chain should be evaluated.

#### Working With Facts

Facts can be provided to Rules using the `given() and givenAll()` methods. In RuleBooks, facts are provided to Rules when the RuleBook is run. The facts available to Rules and RuleBooks are contained in a struct, so this means that the facts are passed by referece. The reason why facts exist is so that there is always a reference to the objects that Rules work with - even if say, an immutable object is replaced, the perception is that the Fact still exists and provides a named reference to a representative object.