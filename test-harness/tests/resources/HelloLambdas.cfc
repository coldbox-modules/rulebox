component extends="rulebox.models.RuleBook"{
// Look at drools of creating criteria and how to modify rules.
// Think about async runnning of rules
// Order of execution of rules.

	function defineRules(){
		addRule( ( rule ) => {
			rule
				.when( ( facts ) => {
					return facts.keyExists( "hello" )
					&&
					facts.keyExists( "world" );
				} )
				.using( "hello,luis" )
				.then( ( facts ) => {
					systemOutput( facts.hello );
				} )
				.using( "world" ).then( ( facts ) => {
					systemOutput( facts.world );
				} )
		} );
	}


}