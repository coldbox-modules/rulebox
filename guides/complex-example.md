---
title: A Complex Example
order: 8
icon: phosphor-duotone:bank
summary: A full home-loan rate calculator, built from real requirements.
tags: [guides, example]
---

# A Complex Example

**The requirements**: MegaBank issues home loans. If an applicant's
credit score is less than 600, they must pay 4x the current rate. If a
credit score is between 600 and 700, they must pay an additional point on
top of their rate. If a credit score is at least 700 and they have at
least $25,000 cash on hand, they get a quarter-point reduction. If an
applicant is a first-time home buyer, they get a 20% reduction on their
calculated rate after credit-score adjustments (first-time buyer discount
only applies to a credit score of 600 or greater).

We'll build the rules and track the result using a `Result` object - see
[Facts & Results](facts-and-results.md).

## The applicant

```js title="Applicant.bx"
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

## The rules

```js title="HomeLoanRateRuleBook.bx"
/**
 * This rule book determines rules for a home loan rate
 */
class extends="rulebox.models.RuleBook"{

	function defineRules(){
		// credit score under 600 gets a 4x rate increase
		addRule(
			newRule()
				.when( ( facts ) => facts.applicant.getCreditScore() < 600 )
				.then( ( facts, result ) => result.setValue( result.getValue() * 4 ) )
				.stop()
		)

		// credit score between 600 and 700 pays a 1 point increase
		addRule(
			newRule()
				.when( ( facts ) => facts.applicant.getCreditScore() < 700 )
				.then( ( facts, result ) => result.setValue( result.getValue() + 1 ) )
		)

		// credit score is 700+ and they have at least $25,000 cash on hand
		addRule(
			newRule()
				.when( ( facts ) => facts.applicant.getCreditScore() >= 700 && facts.applicant.getCashOnHand() >= 25000 )
				.then( ( facts, result ) => result.setValue( result.getValue() - 0.25 ) )
		)

		// first time homebuyers get 20% off their rate (except if their credit score < 600)
		addRule(
			newRule()
				.when( ( facts ) => facts.applicant.getFirstTimeHomeBuyer() )
				.then( ( facts, result ) => result.setValue( result.getValue() * 0.80 ) )
		)
	}

}
```

## Running it

You'd normally run this from a handler or another service method. Here
it's run from a BDD test:

```js
describe( "Home Loan Rate Rules", () => {
	it( "Can calculate a first time home buyer with 20,000 down and 650 credit score", () => {
		var homeLoans = getInstance( "tests.resources.HomeLoanRateRuleBook" )
			.withDefaultResult( 4.5 )
			.given(
				"applicant",
				new tests.resources.Applicant( 650, 20000, true )
			)

		homeLoans.run()

		expect( homeLoans.getResult().isPresent() ).toBeTrue()
		expect( homeLoans.getResult().getValue() ).toBe( 4.4 )
	} )

	it( "Can calculate a non first home buyer with 20,000 down and 650 credit score", () => {
		var homeLoans = getInstance( "tests.resources.HomeLoanRateRuleBook" )
			.withDefaultResult( 4.5 )
			.given(
				"applicant",
				new tests.resources.Applicant( 650, 20000, false )
			)

		homeLoans.run()

		expect( homeLoans.getResult().isPresent() ).toBeTrue()
		expect( homeLoans.getResult().getValue() ).toBe( 5.5 )
	} )
} )
```

## The same example, using plain facts

You don't need a dedicated `Applicant.bx` - named facts work just as
well:

```js title="HomeLoanRateRuleBook.bx (facts-based)"
/**
 * This rule book determines rules for a home loan rate using facts
 */
class extends="rulebox.models.RuleBook"{

	function defineRules(){
		addRule(
			newRule()
				.when( ( facts ) => facts[ "creditScore" ] < 600 )
				.then( ( facts, result ) => result.setValue( result.getValue() * 4 ) )
				.stop()
		)

		addRule(
			newRule()
				.when( ( facts ) => facts[ "creditScore" ] < 700 )
				.then( ( facts, result ) => result.setValue( result.getValue() + 1 ) )
		)

		addRule(
			newRule()
				.when( ( facts ) => facts[ "creditScore" ] >= 700 && facts[ "cashOnHand" ] >= 25000 )
				.then( ( facts, result ) => result.setValue( result.getValue() - 0.25 ) )
		)

		addRule(
			newRule()
				.when( ( facts ) => facts[ "firstTimeHomeBuyer" ] )
				.then( ( facts, result ) => result.setValue( result.getValue() * 0.80 ) )
		)
	}

}
```

```js
describe( "Home Loan Rate Rules", () => {
	it( "Can calculate a first time home buyer with 20,000 down and 650 credit score", () => {
		var homeLoans = getInstance( "tests.resources.HomeLoanRateRuleBook" )
			.withDefaultResult( 4.5 )
			.given( "creditScore", 650 )
			.given( "cashOnHand", 20000 )
			.given( "firstTimeHomeBuyer", true )

		homeLoans.run()

		expect( homeLoans.getResult().isPresent() ).toBeTrue()
		expect( homeLoans.getResult().getValue() ).toBe( 4.4 )
	} )
} )
```
