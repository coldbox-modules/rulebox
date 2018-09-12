# RuleBox: A Rule Engine Module For ColdBox


2.1 A HelloWorld Example

```js
ruleBook = getInstance( "RuleBook@rulebox" )
    .addRule(
		getInstance( "Rule@rulebox" )
			.then( function(){
				sytemOutput( "Hello " );
			} )
			.then( function(){
				systemOutput( "World" );
			} )
	);
```

...or use 2 rules

```js
ruleBook = getInstance( "RuleBook@rulebox" )
    .addRule( 
		getInstance( "Rule@rulebox" )
			.then( function(){
				sytemOutput( "Hello " );
			} )
	)
	.addRule( 
		getInstance( "Rule@rulebox" )
			.then( function(){
				sytemOutput( "World " );
			} )
	)
```

now, run it!

```js
ruleBook.run();
```

2.2 The Above Example Using Facts

```js
ruleBook = getInstance( "RuleBook@rulebox" )
    .addRule( 
		getInstance( "Rule@rulebox" )
			.when( function(){
				return facts.keyExists( "hello" );
			})
			.then( function( facts ){
				sytemOutput( facts.hello );
			} )
	)
	.addRule( 
		getInstance( "Rule@rulebox" )
			.when( function(){
				return facts.keyExists( "world" );
			})
			.then( function( facts ){
				sytemOutput( facts.world );
			} )
	);
```

..or it could be a single rule

```js
ruleBook = getInstance( "RuleBook@rulebox" )
    .addRule( 
		getInstance( "Rule@rulebox" )
			.when( function(){
				return facts.keyExists( "hello" ) && facts.keyExists( "world" );
			})
			using( "hello" ).then( function(){
				systemOutput( facts.hello );
			} );
			using( "world" ).then( function(){
				systemOutput( facts.world );
			} );
	);
```

now, run it!

```js
ruleBook.run( {
	"hello" : "Hello ",
	"world" : " World"
} );
```