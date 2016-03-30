(function(window){

	window.SocketGyroControlModule = SocketGyroControlModule;

	var prototype = SocketGyroControlModule.prototype = Object.create( IModule.prototype );
	prototype.constructor = SocketGyroControlModule;


	function SocketGyroControlModule(setup, settings)
	{
		IModule.call( this );	

		Assist.setupScopeVariables( this, settings,
		{
			setup: setup,
			multiplier:
			{
				x: .2,
				y: .2,
				z: .2,
			},
			range:
			{
				x: 18000,
				y: 16000,
				z: 14000,
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
		this.initSocket();
	};

	prototype.exit = function()
	{
	};

	prototype.kill = function()
	{	
	};

	prototype.update = function()
	{	
	};


	/**
	 * Private interface. 
	 */

	/** Variables. */
	prototype.initVariables = function()
	{
		this.gyro = { x:0, y:0, z:0 };
		
		this.messenger = this.setup.messenger;
		this.event = new Event( Event.GYRO, this.gyro );
	};

	prototype.initSocket = function()
	{
		this.socket = io( 'http://127.0.0.1:8124/' );
		this.socket.on( 'serial', this.socketOnSerialHandler.bind(this) );
	};

	prototype.socketOnSerialHandler = function(data)
	{
		this.parseSocketData( data );
	};

	prototype.parseSocketData = function(data)
	{
		var split = data.split( "," );

		this.gyro.x = this.limitValue( split[ 0 ], this.range.x, this.multiplier.x );
		this.gyro.y = this.limitValue( split[ 1 ], this.range.y, this.multiplier.y );
		this.gyro.z = this.limitValue( split[ 2 ], this.range.z, this.multiplier.z );

		this.messenger.send( this.event );
	};

	prototype.limitValue = function(value, range, multiplier)
	{
		return Math.max( -1, Math.min( 1, Number( value ) / ( range * multiplier ) ) );
	};

}(window));