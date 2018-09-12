/**
 * A RuleBook object that stores all the rules to execute in a given context against given facts
 */
component accessors="true"{

	// WireBox Reference
	property name="wirebox" inject="wirebox";
	property name="logger" 	inject="logbox:logger:{this}";

	/**
	 * The facts structure for this rulebook
	 */
	property name="facts" type="struct";

	/**
	 * The name of this rulebook, else defaults to empty.
	 */
	property name="name" type="string";

	/**
	 * The result value; this should be set for RuleBooks that are expected to produce a Result.
	 */
	property name="result" type="any";

	/**
	 * Head rule
	 */
	property name="headRule" type="any";

	/**
	 * Tail End rule
	 */
	property name="tailRule" type="any";

	/**
	 * Constructor
	 *
	 * @name A name to give this rulebook, else defaults to empty
	 */
	RuleBook function init( name="" ){
		variables.facts 	= {};
		variables.name 		= arguments.name;

		return this;
	}

	/**
	 * Called to define rules in a rulebook, you would usually overwrite this method in your own class
	 * that extends: rulebox.models.RuleBook.
	 */
	void function defineRules(){
	}

	/**
	 * The given() method accepts a key/value pair as a Fact for this RuleBook.
	 * The facts passed in will also be applied to all rules added to this RuleBook.
	 *
	 * @name The unique name of the fact
	 * @value The value of the fact
	 */
	RuleBook function given( required name, required value ){
		variables.facts[ arguments.name ] = arguments.value;
		return this;
	}

	/**
	 * The givenAll() method accepts all the Facts for this RuleBook.
	 * The facts passed in will also be applied to all rules added to this RuleBook.
	 *
	 * @facts The structure of facts to store
	 * @overwrite Overwrite facts if they exist already, defaults to true
	 */
	RuleBook function givenAll( required struct facts, boolean overwrite=true ){
		structAppend( variables.facts, arguments.facts, true );
		return this;
	}

	/**
	 * Shortcut to create a new rule
	 *
	 * @name The name of the rule, else empty.
	 */
	Rule function newRule( name="" ){
		return new Rule( arguments.name );
	}

	/**
	 * Add a rule to the rule book
	 *
	 * @rule A rule object
	 */
	RuleBook function addRule( required Rule rule ){
		// Chain of Responsiblity Rules
		if( isNull( variables.headRule ) ){
			variables.headRule = arguments.rule;
			variables.tailRule = arguments.rule;
		} else {
			// We already have a head, set the next rule
			variables.tailRule.setNextRule( arguments.rule );
			// Change the pointer in the chain
			variables.tailRule = arguments.rule;
		}

		return this;
	}

	/**
	 * Run the rules in this rule book against the registered facts or passed facts
	 *
	 * @facts A structure of name-value pairs representing the facts in this rulebook
	 * @overwrite Overwrite the facts if they exist or not, defauls to true
	 */
	RuleBook function run( struct facts={}, boolean overwrite=true ){
		this.givenAll( argumentCollection=arguments );

		// Verify if rules are loaded? If not, load them via the `defineRules()` call.
		if( !hasRules() ){
			// Load up the rules
			defineRules();
			// If still no rules, then exit out
			if( !hasRules() ){
				logger.info( "Cannot rule RuleBook (#variables.name#) as it has no defined rules." );
				return this;
			}
		}

		// run the chain with the given facts
		variables.headRule.run( variables.facts );

		return this;
	}

	/**
	 * Verify if we have any rules in this rulebook
	 */
	boolean function hasRules(){
		return !isNull( variables.headRule );
	}

}