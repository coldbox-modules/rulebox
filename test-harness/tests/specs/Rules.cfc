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
			describe( "A Rule", function(){

				it( "can be created", function(){
					var rule = getInstance( "Rule@rulebox" );
					expect( rule ).toBeComponent();
					expect( rule.getFacts() ).toBeEmpty();
					expect( rule.getCurrentState() ).toBe( rule.STATES.NEXT );
					expect( rule.getConsumers() ).toBeEmpty();
					expect( isClosure( rule.getPredicate() ) ).toBeTrue();
				});

				it( "can store a given fact", function(){
					var rule = getInstance( "rule@rulebox" )
						.given( "name", "luis" );
					expect( rule.getFacts() ).toHaveKey( "name" );
				});

				it( "can store multiple facts", function(){
					var rule = getInstance( "rule@rulebox" )
						.givenAll( { "name" : "luis" } );
					expect( rule.getFacts() ).toHaveKey( "name" );
				});


				it( "can store when functions", function(){
					var rule = getInstance( "rule@rulebox" )
						.when( function( facts ){
							return false;
						} );
					expect( isClosure( rule.getPredicate() ) ).toBeTrue();
					var predicate = rule.getPredicate();
					expect( predicate() ).toBeFalse();
				});

				it( "can store then functions", function(){
					var rule = getInstance( "rule@rulebox" )
						.then( function( facts ){
						} );
					expect( rule.getConsumers().len() ).toBe( 1 );
				});

				it( "can stop execution chains", function(){
					var rule = getInstance( "rule@rulebox" )
						.stop();
					expect( rule.getCurrentState() ).toBe( rule.STATES.BREAK );
				});

				it( "can store using fact names when none are defined", function(){
					var rule = getInstance( "rule@rulebox" )
						.using( "name" )
						.using( "age" );
					expect( rule.getFactsNameMap()[ 1 ].findNoCase( "name" ) ).toBeTrue();
					expect( rule.getFactsNameMap()[ 1 ].findNoCase( "age" ) ).toBeTrue();
				});

				it( "can store the next rule", function(){
					var rule = getInstance( "rule@rulebox" );

					expect( rule.getNextRule() ).toBeNull();

					rule
						.setNextRule(
							getInstance( "rule@rulebox" )
						);
					expect( rule.getNextRule() ).toBeComponent();
				});

				it( "can run the rules when the predicate is false", function(){
					var rule = getInstance( "rule@rulebox" )
						.given( "name", "luis" )
						.when( function( facts ){
							return ( facts.keyExists( "age" ) );
						} )
						.run();
				});

				it( "can run the rules when the predicate is true", function(){
					var result = false;
					var rule = getInstance( "rule@rulebox" )
						.given( "name", "luis" )
						.when( function( facts ){
							return ( facts.keyExists( "name" ) );
						} )
						.then( function( facts ){
							result = true;
						} )
						.run();

					expect( result ).toBeTrue();
				});

			});
		}

	}
