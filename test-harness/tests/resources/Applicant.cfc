component accessors="true"{

	property creditScore;
	property cashOnHand;
	property firstTimeHomeBuyer;

	function init( creditScore, cashOnHand, firstTimeHomeBuyer ){
		variables.creditScore        = arguments.creditScore;
		variables.cashOnHand         = arguments.cashOnHand;
		variables.firstTimeHomeBuyer = arguments.firstTimeHomeBuyer;
		return this;
	}

}