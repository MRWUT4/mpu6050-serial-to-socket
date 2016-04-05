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
	};


	/** Init RoadRenderer object. */
	prototype.initRoadRenderer = function()
	{
		this.roadRenderer = new RoadRenderer(
		{
			width: this.canvas.width,
			height: this.canvas.height,
			container: this.container,
			fieldOfView: 80,
			player: { source:this.player },
			// playerZ: 20,
			// speed: this.baseSpeed,
			drawDistance: 200,
			decel: -5000,
			cameraHeight: 600,
			playerLimit: .9,
			lanes: 2,
			// accel: 4000,
			// speed: 0,
			// maxSpeed: 4000,
			// segmentLength: 400
		});

		this.roadRenderer.on( Event.HIT, this.roadRendererHitHandler, this );

		this.roadRenderer.input.up = true;

		// this.roadRenderer.input.up = true;


		// this.roadRenderer.update();

		// this.roadRenderer.addSprite( 60, this.tree, -2 );
		// this.roadRenderer.segments.reverse();
	};


	/** Event handler functions. */
	prototype.roadRendererHitHandler = function(event)
	{	
		var object = event.object;

		switch( object.source.id )
		{
			// case t.id.axe:
			// 	this.axeHitHandler( object );
			// 	break;

			// case t.id.goal:
			// 	this.goalHitHandler( object );
			// 	break;
		}
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