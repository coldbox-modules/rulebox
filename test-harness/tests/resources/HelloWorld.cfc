component extends="rulebox.models.RuleBook"{

	function defineRules(){
		addRule(
			newRule()
			.when( function( facts ){
				return facts.keyExists( "hello" ) && facts.keyExists( "world" );
			})
			.using( "hello" ).then( function( facts ){
				systemOutput( facts.hello );
			} )
			.using( "world" ).then( function( facts ){
				systemOutput( facts.world );
			} )
		);

		// Add Rule With Closure Syntax
		addRule( function( rule ){
			rule
			.setName( "stop multiple when" )
			.when( function( facts ){
				return facts.keyExists( "hello" );
			})
			.except( function( facts ){
				return facts.disabled;
			} )
			.then( function( facts, result ){
				result.setValue( 1 );
				// Return true to stop the next then(), return void or false to continue
				return true;
			} )
			.then( function( facts, result ){
				result.setValue( 2 );
			} );
		} );
	}


}