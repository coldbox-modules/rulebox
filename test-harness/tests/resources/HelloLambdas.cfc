component extends="rulebox.models.RuleBook"{

	function defineRules(){
		addRule( ( rule ) => {
			rule
				.when( ( facts ) => {
					return facts.keyExists( "hello" ) && facts.keyExists( "world" );
				} )
				.using( "hello" ).then( ( facts ) => {
					systemOutput( facts.hello );
				} )
				.using( "world" ).then( ( facts ) => {
					systemOutput( facts.world );
				} )
		} );
	}


}