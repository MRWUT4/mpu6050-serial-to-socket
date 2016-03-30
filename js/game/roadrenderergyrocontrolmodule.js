(function(window){

	window.RoadRendererGyroControlModule = RoadRendererGyroControlModule;

	var prototype = RoadRendererGyroControlModule.prototype = Object.create( IModule.prototype );
	prototype.constructor = RoadRendererGyroControlModule;


	function RoadRendererGyroControlModule(setup, settings)
	{
		IModule.call( this );	

		Assist.setupScopeVariables( this, settings,
		{
			setup: setup,
			names:
			{
				GameplayModule: "GameplayModule"
			}
		});
	}


	/**
	 * Public interface. 
	 */
	
	/** IModule interface. */
	prototype.enter = function()
	{
		this.initVariables();
		this.initMessengerEventHandler();
		this.initRoadRendererOverwrite();
	};

	prototype.exit = function()
	{
	};

	prototype.kill = function()
	{	
	};

	prototype.update = function()
	{	
		this.updateRoadRendererValues();
	};


	/**
	 * Private interface. 
	 */

	/** Variables. */
	prototype.initVariables = function()
	{
		this.state = this.setup.state;
		this.messenger = this.setup.messenger;
		this.gameplayModule = this.state.getModule( this.names.GameplayModule );
		this.roadRenderer = this.gameplayModule.roadRenderer;
		this.roadRenderer.centrifugal = .1;

		this.acceleration = this.roadRenderer.accel;

		this.direction = 0;
		this.throttle = this.acceleration;
	};


	/** Messenger Event handler. */
	prototype.initMessengerEventHandler = function(bool)
	{
		bool = bool !== undefined ? bool : true;
	
		if( bool )
		{
			this.messenger.on( Event.GYRO, this.messengerGyroHandler, this );
		}
		else
		{
			this.messenger.off( Event.GYRO, this.messengerGyroHandler, this );
		}
	};
	
	prototype.messengerGyroHandler = function(event)
	{
		this.updateControlValues( event.object );
	};


	prototype.updateControlValues = function(object)
	{
		this.direction = -object.x * 1.2;
	};


	/** RoadRender setup. */
	prototype.initRoadRendererOverwrite = function()
	{
		this.roadRenderer.updateInputValues = function(){};
	};

	prototype.updateRoadRendererValues = function()
	{
		this.roadRenderer.direction = this.direction;
		this.roadRenderer.throttle = this.throttle;
	};

}(window));