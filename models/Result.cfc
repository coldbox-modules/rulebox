/**
 * A wrapper for rule results. This is an object so we can keep state as it traverses the chain
 */
component accessors="true"{

	/**
	 * The actual value of the result
	 */
	property name="value";

	/**
	 * The default value to use if the result is not set.
	 */
	property name="defaultValue";

	/**
	 * Constructor
	 *
	 * @value If passed, creates an instance of the result with this as the default value
	 */
	Result function init( value ){

		if( !isNull( arguments.value ) ){
			variables.defaultValue = arguments.value;
		}

		return this;
	}

	/**
	 * Reset the value of this result to the default value.
	 */
	Result function reset(){
		if( !isNull( variables.defaultValue ) ){
			variables.value = variables.defaultValue;
		}
		return this;
	}

	/**
     * Return true if there is a value present, otherwise false.
     */
    boolean function isPresent(){
        return !isNull( variables.value );
	}

	/**
     * If a value is present, invoke the specified consumer closure/lambda and pass the value
     *
     * @consumer closure/lambda to be executed if a value is present
     */
    void function ifPresent( required consumer ){
        if( isPresent() ){
			arguments.consumer( variables.value );
		}
	}

	 /**
     * Return the value if present, otherwise return other, which is passed in
     *
     * @other the value to be returned if there is no value present, may be null
     *
     * @return the value, if present, otherwise other
     */
    function orElse( required other ){
        return ( isPresent() ? variables.value : arguments.other );
	}

	 /**
     * Return the value if present, otherwise invoke the other closure/lambda and return the result of that invocation.
     *
     * @other a Supplier lambda or closure whose result is returned if no value is present
     *
     * @return the value if present otherwise the result of other.get()
     */
    function orElseGet( required other ){
        return ( isPresent() ? variables.value : arguments.other() );
    }

}