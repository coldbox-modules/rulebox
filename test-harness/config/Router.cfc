component{

	function configure(){
		setFullRewrites( true );

		route( ":handler/:action?" ).end();
	}

}