
/**
* My BDD Test
*/
component extends="coldbox.system.testing.BaseTestCase" appMapping="/root"{

/*********************************** LIFE CYCLE Methods ***********************************/

	// executes before all suites+specs in the run() method
	function beforeAll(){
		super.beforeAll();

		setup();
	}

	// executes after all suites+specs in the run() method
	function afterAll(){
		super.afterAll();
	}

/*********************************** BDD SUITES ***********************************/

	function run( testResults, testBox ){
		// all your suites go here.
		describe( "Rule Book Builder", function(){

			it( "can build a rulebook", function(){
				var ruleBook = getInstance( "RuleBookBuilder@rulebox" ).create( "my-rulebook" );
				expect(	ruleBook ).toBeComponent();
				expect( ruleBook.getName() ).toBe( "my-rulebook" );
			});

			it( "can build rules", function(){
				var rule = getInstance( "RuleBookBuilder@rulebox" ).rule( "my-rule" );
				expect(	rule ).toBeComponent();
				expect( rule.getName() ).toBe( "my-rule" );
			});

		});
	}

}
