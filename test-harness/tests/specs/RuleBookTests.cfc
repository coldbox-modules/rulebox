/**
* My BDD Test
*/
component extends="coldbox.system.testing.BaseTestCase" appMapping="/root"{
/*********************************** LIFE CYCLE Methods ***********************************/

	// executes before all suites+specs in the run() method
	function beforeAll(){
		super.beforeAll();
	}

	// executes after all suites+specs in the run() method
	function afterAll(){
		super.afterAll();
	}

/*********************************** BDD SUITES ***********************************/

	function run( testResults, testBox ){
		// all your suites go here.
		describe( "A Rule Book", function(){

			it( "can be created", function(){
				var ruleBook = getInstance( "RuleBook@rulebox" );
				expect( ruleBook ).toBeComponent();
				expect( ruleBook.getFacts() ).toBeEmpty();
			});

			it( "can store a given fact", function(){
				var ruleBook = getInstance( "RuleBook@rulebox" )
					.given( "name", "luis" );
				expect( ruleBook.getFacts() ).toHaveKey( "name" );
			});

			it( "can store multiple facts", function(){
				var ruleBook = getInstance( "RuleBook@rulebox" )
					.givenAll( { "name" : "luis" } );
				expect( ruleBook.getFacts() ).toHaveKey( "name" );
			});

			it( "can create rules", function(){
				var rule = getInstance( "RuleBook@rulebox" ).newRule( "my-rule" );
				expect( rule ).toBeComponent();
				expect( rule.getName() ).toBe( "my-rule" );
			});


			it( "can add a rule when no rules are defined", function(){
				var ruleBook = getInstance( "RuleBook@rulebox" );
				var rule = ruleBook
					.newRule( "my-rule" );
				ruleBook.addRule( rule );

				expect( ruleBook.getHeadRule() ).toBe( rule );
				expect( ruleBook.getTailRule() ).toBe( rule );
			});

			it( "can add multiple rules", function(){
				var ruleBook = getInstance( "RuleBook@rulebox" );
				var rule1 = ruleBook.newRule();
				var rule2 = ruleBook.newRule();

				ruleBook.addRule( rule1 ).addRule( rule2 );

				expect( ruleBook.getHeadRule() ).toBe( rule1 );
				expect( ruleBook.getTailRule() ).toBe( rule2 );
			});


			it( "can detect set rules", function(){
				var ruleBook = getInstance( "RuleBook@rulebox" );
				expect( ruleBook.hasRules() ).toBeFalse();
				ruleBook.addRule( ruleBook.newRule() );
				expect( ruleBook.hasRules() ).toBeTrue();
			});


			it( "can ignore running rules if none are set", function(){
				var ruleBook = prepareMock( getInstance( "RuleBook@rulebox" ) )
					.$( "defineRules" )
					.$( "hasRules", false );
				ruleBook.run();
				expect( ruleBook.$once( "defineRules") ).toBeTrue();
				expect( ruleBook.$times( 2, "hasRules") ).toBeTrue();
			});

			it( "can run rules", function(){
				var ruleBook = prepareMock( getInstance( "RuleBook@rulebox" ) );
				var mockRule = prepareMock( rulebook.newRule() )
					.$( "run" );

				ruleBook
					.givenAll( { name: "luis" } )
						.addRule( mockRule )
					.run();

				expect( mockRule.$once( "run" ) ).toBeTrue();
			});

		});
	}

}
