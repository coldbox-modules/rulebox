/**
 * A pesudo static class to build rule books and rules.
 */
component singleton{

	// WireBox Reference
	property name="wirebox" inject="wirebox";

	/**
	 * Constructor
	 */
	function init(){
		return this;
	}


	/**
	 * Create a new Rule Book
	 *
	 * @name Give the rulebook a name
	 */
	RuleBook function create( name="" ){
		return wirebox.getInstance( name="RuleBook@rulebox", initArguments={ name = arguments.name } );
	}

	/**
	 * Create a new Rule
	 *
	 * @name Give the rule a name
	 */
	Rule function rule( name="" ){
		return wirebox.getInstance( name="Rule@rulebox", initArguments={ name = arguments.name } );
	}

}