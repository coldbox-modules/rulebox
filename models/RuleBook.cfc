/**
 * A RuleBook object that stores all the rules to execute in a given context against given facts.
 */
component accessors="true"{

	// DI
	property name="wirebox" inject="wirebox";
	property name="logger" 	inject="logbox:logger:{this}";

	/**
	 * The facts structure for this rulebook
	 */
	property name="facts" type="struct";

	/**
	 * The name of this rulebook, else defaults to empty.
	 */
	property name="name" type="string" default="";

	/**
	 * The result object, where a rulebook can keep track of result across the rule chain
	 */
	property name="result" type="Result";

	/**
	 * The default result value, if expressed using the `withDefaultValue()`
	 */
	property name="defaultResult" type="any";

	/**
	 * Head rule
	 */
	property name="headRule" type="any";

	/**
	 * Tail End rule
	 */
	property name="tailRule" type="any";

	/**
	 * A struct that tracks the states of the rules defined in this rulebook
	 */
	property name="ruleStatusMap" type="struct";

	// Static lookup map for rule states
	this.RULE_STATES = {
		NOT_AVAILABLE 	= "NOT_AVAILABLE",
		EXECUTED      	= "EXECUTED",
		SKIPPED       	= "SKIPPED",
		REGISTERED 	  	= "NONE",
		STOPPED 		= "STOPPED"
	};

	/**
	 * Constructor
	 *
	 * @name A name to give this rulebook, else defaults to empty
	 */
	RuleBook function init( name="" ){
		variables.facts 		= {};
		variables.name 			= arguments.name;
		variables.result 		= new Result();
		variables.ruleStatusMap = {};

		return this;
	}

	/**
	 * The withDefaultResult method allows a default result value to be specified.
	 * When using the DSL syntax to chain calls, this method should be the first one specified.
	 *
	 * @result The initial value of the stored result
	 */
	RuleBook function withDefaultResult( required result ){
		variables.defaultResult = arguments.result;
		variables.result.setDefaultValue( arguments.result );
		variables.result.setValue( arguments.result );
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
	Rule function newRule( name ){
		return wirebox
			.getInstance( name="Rule@rulebox", initArguments=arguments );
	}

	/**
	 * Add a rule to the rule book. You can pass in a closure/lambda that represents the rule or an actual Rule object
	 *
	 * @rule A rule object or a closure that will represent the rule.
	 */
	RuleBook function addRule( required rule ){
		// Chain of Responsiblity Rules, are we starting with the head?
		if( isNull( variables.headRule ) ){
			// Store rules and initial result
			variables.headRule = arguments.rule;
			variables.tailRule = arguments.rule;
		} else {
			// Set the next rule chain
			variables.tailRule.setNextRule( arguments.rule );
			// Change the pointer in the chain
			variables.tailRule = arguments.rule;
		}

		// Link the rule book
		arguments.rule.setRuleBook( this );
		// Track it's status
		variables.ruleStatusMap[ arguments.rule.getName() ] = this.RULE_STATES.REGISTERED;

		return this;
	}

	/**
	 * Run the rules in this rule book against the registered facts or passed facts
	 *
	 * @facts A structure of name-value pairs representing the facts in this rulebook
	 * @overwrite Overwrite the facts if they exist or not, defauls to true
	 */
	RuleBook function run( struct facts={}, boolean overwrite=true ){
		// Process Facts
		this.givenAll( argumentCollection=arguments );
		// Result Result just in case
		variables.result.ifPresent( variables.result.reset );

		// Verify if rules are loaded? If not, load them via the `defineRules()` call.
		if( !hasRules() ){
			// Load up the rules
			defineRules();
			// If still no rules, then exit out
			if( !hasRules() ){
				logger.info( "Cannot run a RuleBook (#variables.name#) that has no rules. See ya!" );
				return this;
			}
		}

		// run the chain with the given facts and passed result object
		variables.headRule
			.setResult( variables.result )
			.run( variables.facts );

		return this;
	}

	/**
	 * Verify if we have any rules in this rulebook
	 */
	boolean function hasRules(){
		return !isNull( variables.headRule );
	}

	/**
	 * Get the status of a ranned rule, if the rule doesn't exist it will return a NOT_AVAILABLE status
	 *
	 * @name The name of the rule
	 */
	string function getRuleStatus( required name ){
		return variables.ruleStatusMap[ arguments.name ] ?: this.RULE_STATES.NOT_AVAILABLE;
	}

}