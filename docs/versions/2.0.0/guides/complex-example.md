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

	property creditScore;
	property cashOnHand;
	property firstTimeHomeBuyer;

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

Create the RuleBook, give it a starting rate and the applicant, run it,
and read the result. Here it is from a handler action:

```js title="Loans.bx"
class{

	function rate( event, rc, prc ){
		return getInstance( "HomeLoanRateRuleBook" )
			.withDefaultResult( 4.5 )
			.run( { applicant : new models.Applicant( 650, 20000, true ) } )
			.getResult()
			.getValue()
	}

}
```

A first-time buyer with a 650 credit score gets `4.4`: the starting 4.5
plus one point is 5.5, and 20% off that is 4.4. Without the first-time
buyer discount (`false`), the answer is `5.5`.

## Testing it

The same rules, checked from a TestBox spec:

```js
describe( "Home Loan Rate Rules", () => {
	it( "gives a first time buyer with a 650 credit score 4.4", () => {
		var rate = getInstance( "HomeLoanRateRuleBook" )
			.withDefaultResult( 4.5 )
			.run( { applicant : new models.Applicant( 650, 20000, true ) } )
			.getResult()
			.getValue()

		expect( rate ).toBe( 4.4 )
	} )

	it( "gives a repeat buyer with a 650 credit score 5.5", () => {
		var rate = getInstance( "HomeLoanRateRuleBook" )
			.withDefaultResult( 4.5 )
			.run( { applicant : new models.Applicant( 650, 20000, false ) } )
			.getResult()
			.getValue()

		expect( rate ).toBe( 5.5 )
	} )
} )
```

## Plain facts instead of an Applicant

You don't need an `Applicant` class. Named facts work just as well. Only
the `when` conditions change, to read the facts directly. For example,
`facts.applicant.getCreditScore() < 600` becomes:

```js
newRule()
	.when( ( facts ) => facts.creditScore < 600 )
	.then( ( facts, result ) => result.setValue( result.getValue() * 4 ) )
	.stop()
```

...and you pass the facts in with `run()` (here `HomeLoanRateRuleBook`
is the version of the rules that reads plain facts):

```js
getInstance( "HomeLoanRateRuleBook" )
	.withDefaultResult( 4.5 )
	.run( { creditScore : 650, cashOnHand : 20000, firstTimeHomeBuyer : true } )
	.getResult()
	.getValue()
```
