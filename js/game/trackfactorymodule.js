(function(window){

	window.TrackFactoryModule = TrackFactoryModule;

	var prototype = TrackFactoryModule.prototype = Object.create( IModule.prototype );
	prototype.constructor = TrackFactoryModule;


	function TrackFactoryModule(setup)
	{
		IModule.call( this );	
		
		Assist.setupScopeVariables( this, setup,
		{
			setup: setup,
			names:
			{
				container: "container",
				sprites: "sprites",
				GameplayModule: "GameplayModule",
			}
		})
	}


	/**
	 * Public interface. 
	 */
	
	prototype.enter = function()
	{
		this.initVariables();

		this.initDrawLoop();
		this.initColors();
		this.initTrackFactory();
		this.initSprites();
	};



	/**
	 * Private interface. 
	 */

	/** Variables. */
	prototype.initVariables = function()
	{
		this.proxy = this.setup.proxy;
		this.graphics = this.setup.graphics;
		// this.roadRenderer = this.proxy.roadRenderer;

		this.state = this.setup.state;
		this.gameplayModule = this.state.getModule( this.names.GameplayModule );
		this.roadRenderer = this.gameplayModule.roadRenderer;

		this.container = this.graphics.getChildByName( this.names.container );
		this.sprites = this.graphics.getChildByName( this.names.sprites );
	};


	prototype.initDrawLoop = function()
	{
		Draw.loop = 
		[
			Draw.background,
			Draw.road,
			Draw.rumble,
			Draw.lanes,
			Draw.fog
		];
	};

	prototype.initColors = function()
	{
		// Colors.LIGHT.road = Colors.to( '2E4C1F' );
		// Colors.DARK.road = Colors.to( '2C4923' );
		// Colors.LIGHT.grass = Colors.to( '263F19' );
		// Colors.DARK.grass = Colors.to( '243D18' );
		// Colors.FOG = Colors.to( '1D3017' );
	};

	prototype.initTrackFactory = function()
	{
		this.trackFactory = new TrackFactory( 
		{
			renderer: this.roadRenderer,
			sprites: this.sprites,
			container: this.container
		});

		this.trackFactory.addStraight();
		this.trackFactory.addLowRollingHills( 0, Road.HILL.LOW );
		this.trackFactory.addLowRollingHills( 0, Road.HILL.LOW );

		this.trackFactory.addLeftCurve( Road.CURVE.EASY, Road.HILL.LOW );
		this.trackFactory.addRightCurve( Road.CURVE.EASY, Road.HILL.LOW );
		// this.trackFactory.addSCurves( Road.CURVE.EASY, Road.HILL.LOW );
		this.trackFactory.addStraight();
		this.trackFactory.addLowRollingHills( 0, Road.HILL.LOW );
		this.trackFactory.addLowRollingHills( 0, Road.HILL.LOW );
		this.trackFactory.addStraight();

	};

	prototype.initSprites = function()
	{
		this.sprites = this.graphics.getChildByName( this.names.sprites );
		this.sprites.parent.removeChild( this.sprites );

		this.trackFactory.callMod( 1, function(n, i)
		{
			// if( n % 25 == 0 && n <= this.goalDistance - this.blankDistance )
			// {
			// 	// this.trackFactory.addSprite( n, "shadow", 0, 2 );
			// 	// this.trackFactory.addSprite( n, "hinge", 0, .2 );
			// 	this.trackFactory.addSprite( n, "axe", .25, 1 );
			// }

			// if( n % this.goalDistance == this.goalDistance - 35 )
			// 	this.trackFactory.addSprite( n, "goal", 0, 1.8 );

			// if( n % this.goalDistance == this.goalDistance - 33 )
			// 	this.trackFactory.addSprite( n, "end", .005, .24 );

			if( n % 20 == 0 )
			{
				this.trackFactory.addSprite( n, "tree", 1, 1 );
				this.trackFactory.addSprite( n, "tree", -1, 1 );
			}

		}.bind( this ) );
	};

	// prototype.initTrackHitColors = function()
	// {
	// 	ColorsAxe.LIGHT = 
	// 	{ 
	// 		road: Colors.to( 'E5CF7E'),
	// 		grass: Colors.DARK.grass,
	// 		rumble: Colors.DARK.rumble,
	// 		lane: Colors.DARK.lane
	// 	};

	// 	var segments = this.trackFactory.renderer.segments;

	// 	for(var i = 0; i < segments.length; ++i)
	// 	{
	// 	    var segment = segments[ i ];
	// 		var sprites = segment.sprites;

	// 	    for(var j = 0; j < sprites.length; ++j)
	// 	    {
	// 	        var sprite = sprites[ j ];
		    
	// 	        if( sprite.id == "axe" )
	// 	        {
	// 	        	segment.color = ColorsAxe.LIGHT;
	// 	        	// console.log( segment.color );
	// 	        }
	// 	    }
	// 	}
	// };

}(window));


// (function(window){

// 	window.ColorsAxe = ColorsAxe;

// 	var prototype = ColorsAxe.prototype = Object.create( Object.prototype );
// 	prototype.constructor = ColorsAxe;

// 	function ColorsAxe(){}

// }(window));