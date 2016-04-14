(function(window){

	window.GameplayModule = GameplayModule;

	var prototype = GameplayModule.prototype = Object.create( IModule.prototype );
	prototype.constructor = GameplayModule;


	function GameplayModule(setup)
	{
		IModule.call( this );	
		
		Assist.setupScopeVariables( this, setup, 
		{
			names:
			{
				gem: "gem",
				coin: "coin"
			},
			duration: .3,
			setup: setup,
		});
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
		this.doTween.update();
		this.input.update();
		this.roadRenderer.update();	
	};


	/**
	 * Private interface. 
	 */

	/** Variables. */
	prototype.initVariables = function()
	{
		this.doTween = new DoTween();

		this.messenger = this.setup.messenger;
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
			// playerZ: 0,
			player: { source:this.player },
			// speed: this.baseSpeed,
			drawDistance: 200,
			decel: -5000,
			cameraHeight: 1500 * 2,
			playerLimit: 1.3,
			lanes: 2,
			position: 131300,
			roadWidth: 4000,
			centrifugal: .1,
			accel: 4000,
			// speed: 0,
			maxSpeed: 40000,
			segmentLength: 800
		});

		this.roadRenderer.on( Event.HIT, this.roadRendererHitHandler, this );

		this.roadRenderer.input.up = true;
	};


	/** Event handler functions. */
	prototype.roadRendererHitHandler = function(event)
	{	
		var object = event.object;

		switch( object.source.id )
		{
			case this.names.gem:
				this.tweenRemoveItem( object );
				this.messenger.send( new AudioEvent( AudioEvent.PLAY, this.names.coin ) );
				break;
			// case t.id.axe:
			// 	this.axeHitHandler( object );
			// 	break;

			// case t.id.goal:
			// 	this.goalHitHandler( object );
			// 	break;
		}
	};

	prototype.tweenRemoveItem = function(object)
	{
		// console.log( "HIT");
		var source = object.source;
		var y = source.y - 100;

		object.source = null;

		var tween = this.doTween.to( source, this.duration, { alpha:0, y:y, ease:Back.easeOut } );
		
		tween.on( Event.COMPLETE, function(event)
		{
			var displayObject = event.target.object;
			displayObject.parent.removeChild( displayObject );
		})
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