(function(window){

	window.GameplayModule = GameplayModule;

	var prototype = GameplayModule.prototype = Object.create( IModule.prototype );
	prototype.constructor = GameplayModule;


	function GameplayModule(setup)
	{
		IModule.call( this );	
		this.setup = setup;
	}


	/**
	 * Public interface. 
	 */
	
	prototype.enter = function()
	{
		this.initVariables();
		this.initRoadRenderer();
		this.initInput();
	};

	prototype.exit = function()
	{
	};

	prototype.kill = function()
	{	
	};

	prototype.update = function()
	{
		this.input.update();
		this.roadRenderer.update();	
	};


	/**
	 * Private interface. 
	 */

	/** Variables. */
	prototype.initVariables = function()
	{
		this.canvas = this.setup.canvas;
		this.proxy = this.setup.proxy;
		this.graphics = this.setup.graphics;
		this.name = this.proxy.name;
		this.container = this.graphics.getChildByName( this.name.container );
		this.player = this.graphics.getChildByName( this.name.player );
		this.tree = this.graphics.getChildByName( this.name.tree );
		this.tree.parent.removeChild( this.tree );
	};


	/** Init RoadRenderer object. */
	prototype.initRoadRenderer = function()
	{
		Draw.loop = 
		[
			Draw.background,
			Draw.road,
			Draw.rumble,
			Draw.lanes,
			Draw.fog
		];

		Road.SPRITE_SCALE = 1; 

		Colors.LIGHT.rumble = Colors.to( 'D9A300');
		Colors.DARK.rumble = Colors.to( 'D9A300');


		this.roadRenderer = new RoadRenderer(
		{
			width: this.canvas.width,
			height: this.canvas.height,
			container: this.container,
			player: { source:this.player },
			drawDistance: 200,
			playerLimit: .7,
			lanes: 2,
			rumbleLength: 2,
		});

		// this.roadRenderer.input.up = true;


		this.trackFactory = new TrackFactory( this.roadRenderer );

		this.trackFactory.addLowRollingHills( 0, Road.HILL.LOW );
		this.trackFactory.addLowRollingHills( 0, Road.HILL.LOW );
		this.trackFactory.addSCurves( Road.CURVE.EASY, Road.HILL.LOW );
		this.trackFactory.addStraight();
		this.trackFactory.addLowRollingHills( 0, Road.HILL.LOW );

		for(var i = 0; i < 800; ++i)
		{
			if( i % 2 == 0 )
			{
			    this.roadRenderer.addSprite( i * 10, this.getClone( this.tree ), null, Calculator.getRandomFloatBetweenAandB( -.8, -1.6 ) );	
			    this.roadRenderer.addSprite( i * 10, this.getClone( this.tree ), null, Calculator.getRandomFloatBetweenAandB(  .8,  1.6 ) );
			}
		}

		this.roadRenderer.update();

		// this.roadRenderer.addSprite( 60, this.tree, -2 );
		// this.roadRenderer.segments.reverse();
	};

	prototype.getClone = function(displayObject)
	{
		var clone = displayObject.clone( true );
		clone.id = displayObject.id;
		clone.name = displayObject.name;
		clone.visible = false;
		this.container.addChildAt( clone, 1 );

		return clone;
	};


	/** Keyboard input functions. */
	prototype.initInput = function()
	{
		this.input = Input.getInstance(
		{
			id: this.id,
			keys:
			{
				"up": 
				{ 
					keyDown: this.arrowKeyUpHandler.bind( this, true ),
					keyUp: this.arrowKeyUpHandler.bind( this, false )
				},
				"down": 
				{ 
					keyDown: this.arrowKeyDownHandler.bind( this, true ),
					keyUp: this.arrowKeyDownHandler.bind( this, false )
				},
				"left": 
				{ 
					keyDown: this.arrowKeyLeftHandler.bind( this, true ),
					keyUp: this.arrowKeyLeftHandler.bind( this, false )
				},
				"right": 
				{ 
					keyDown: this.arrowKeyRightHandler.bind( this, true ),
					keyUp: this.arrowKeyRightHandler.bind( this, false )
				}
			}
		});
	};

	prototype.arrowKeyUpHandler = function(boolean)
	{
		this.roadRenderer.input.up = boolean;
	};

	prototype.arrowKeyDownHandler = function(boolean)
	{
		this.roadRenderer.input.down = boolean;
	};

	prototype.arrowKeyLeftHandler = function(boolean)
	{
		this.roadRenderer.input.left = boolean;
	};

	prototype.arrowKeyRightHandler = function(boolean)
	{
		this.roadRenderer.input.right = boolean;
	};

}(window));