/**
 * This rule book determines rules for a home loan rate
 */
component extends="rulebox.models.RuleBook"{

	function defineRules(){
		//credit score under 600 gets a 4x rate increase
		addRule(
			newRule( "credit score under 600 gets 4x rate increase" )
			.when( function( facts ){ return facts.applicant.getCreditScore() < 600; } )
			.then( function( facts, result ){ result.setValue( result.getValue() * 4 ); } )
			.stop()
		);

		//credit score between 600 and 700 pays a 1 point increase
		addRule(
			newRule( "between 600 and 700 pays 1 point" )
			.when( function( facts ){ return facts.applicant.getCreditScore() < 700; } )
			.then( function( facts, result ){ result.setValue( result.getValue() + 1 ); } )
		);

		//credit score is 700 and they have at least $25,000 cash on hand
		addRule(
			newRule( "credit score is 700 and they have at least $25,000 cash on hand" )
			.when( function( facts ){
				return ( facts.applicant.getCreditScore() >= 700 && facts.applicant.getCashOnHand() >= 25000 );
			} )
			.then( function( facts, result ){ result.setValue( result.getValue() - 0.25 ); } )
		);

		// first time homebuyers get 20% off their rate (except if they have a creditScore < 600)
		addRule(
			newRule( "first time homebuyers get 20% off their rate (except if they have a creditScore < 600)" )
			.when( function( facts ){ return facts.applicant.getFirstTimeHomeBuyer(); } )
			.then( function( facts, result ){ result.setValue( result.getValue() * 0.80 ); } )
		);
	}

}