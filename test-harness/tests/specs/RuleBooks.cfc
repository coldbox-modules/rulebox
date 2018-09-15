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
			describe( "Hello World Rules", function(){
				it( "Can run the hello world rules", function(){
					var helloRules = getInstance( "tests.resources.HelloWorld" )
						.given( "hello", "Hello" );
					helloRules.run();

					expect( helloRules.getResult().getValue() ).toBe( 1 );
				});
			});


			describe( "Home Loan Rate Rules", function(){
				it( "Can calculate a first time home buyer with 20,000 down and 650 credit score", function(){
					var homeLoans = getInstance( "tests.resources.HomeLoanRateRuleBook" )
						.withDefaultResult( 4.5 )
						.given( "applicant", new tests.resources.Applicant( 650, 20000, true ) );

					homeLoans.run();

					expect( homeLoans.getResult().isPresent() ).toBeTrue();
					expect( homeLoans.getResult().getValue() ).toBe( 4.4 );

				});

				it( "Can calculate a non first home buyer with 20,000 down and 650 credit score", function(){
					var homeLoans = getInstance( "tests.resources.HomeLoanRateRuleBook" )
						.withDefaultResult( 4.5 )
						.given( "applicant", new tests.resources.Applicant( 650, 20000, false ) );

					homeLoans.run();

					expect( homeLoans.getResult().isPresent() ).toBeTrue();
					expect( homeLoans.getResult().getValue() ).toBe( 5.5 );

				});
			});
		}

	}
