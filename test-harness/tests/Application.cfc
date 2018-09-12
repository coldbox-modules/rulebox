/**
********************************************************************************
Copyright 2005-2007 ColdBox Framework by Luis Majano and Ortus Solutions, Corp
www.ortussolutions.com
********************************************************************************
*/
component{

	// UPDATE THE NAME OF THE MODULE IN TESTING BELOW
	request.MODULE_NAME = "rulebox";

	// APPLICATION CFC PROPERTIES
	this.name 				= "#request.MODULE_NAME# Testing Suite";
	this.sessionManagement 	= true;
	this.sessionTimeout 	= createTimeSpan( 0, 0, 15, 0 );
	this.applicationTimeout = createTimeSpan( 0, 0, 15, 0 );
	this.setClientCookies 	= true;

	// Create testing mapping
	this.mappings[ "/tests" ] = getDirectoryFromPath( getCurrentTemplatePath() );

	// The application root
	rootPath = REReplaceNoCase( this.mappings[ "/tests" ], "tests(\\|/)", "" );
	this.mappings[ "/root" ]   			= rootPath;

	// The module root path
	moduleRootPath = REReplaceNoCase( rootPath, "#request.MODULE_NAME#(\\|/)test-harness(\\|/)", "" );
	this.mappings[ "/moduleroot" ] 				= moduleRootPath;
	this.mappings[ "/#request.MODULE_NAME#" ] 	= moduleRootPath & "#request.MODULE_NAME#";

	// ORM Definitions
	/**
	this.datasource = "coolblog";
	this.ormEnabled = "true";
	this.ormSettings = {
		cfclocation = [ "/root/models" ],
		logSQL = true,
		dbcreate = "update",
		secondarycacheenabled = false,
		cacheProvider = "ehcache",
		flushAtRequestEnd = false,
		eventhandling = true,
		eventHandler = "cborm.models.EventHandler",
		skipcfcWithError = false
	};
	**/

	// request start
	public boolean function onRequestStart( String targetPage ){
		if( url.keyExists( "fwreinit" ) ){
			ormreload();
			if( StructKeyExists( server, "lucee" ) ){
				pagePoolClear();
			}
		}

		return true;
	}

	public function onRequestEnd(){
		structDelete( application, "cbController" );
		structDelete( application, "wirebox" );
	}
}