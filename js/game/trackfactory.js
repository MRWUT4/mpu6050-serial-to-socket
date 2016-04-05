(function(window){

	window.TrackFactory = TrackFactory;

	var prototype = TrackFactory.prototype = Object.create( Object.prototype );
	prototype.constructor = TrackFactory;


	function TrackFactory(object)
	{
		this.object = object;

		this.initVariables();
		this.initSpriteIDs();
	}


	/**
	 * Getter / Setter.
	 */

	Object.defineProperty( prototype, "length", 
	{
		get: function() 
		{	
			return this.renderer.segments.length;
		}
	});


	/**
	 * Vector functions.
	 */

    prototype.addStraight = function(num) 
    {
		num = num || Road.LENGTH.MEDIUM;
		this.renderer.addRoad( num, num, num, 0 );
    }

	prototype.addSCurve = function(curve, height) 
	{
		curve = curve || Road.CURVE.EASY;
		height = height || Road.HILL.HIGH;
		
		this.addLeftCurve( curve, height );
		this.addRightCurve( curve, height );
		this.addLeftCurve( curve, height );
		this.addRightCurve( curve, height );
	};

	prototype.addLeftCurve = function(curve, height) 
	{
		curve = curve || Road.CURVE.EASY;
		height = height || Road.HILL.HIGH;
		
		this.renderer.addRoad( Road.LENGTH.MEDIUM, Road.LENGTH.MEDIUM, Road.LENGTH.MEDIUM, -curve, height );
	};

	prototype.addRightCurve = function(curve, height) 
	{
		curve = curve || Road.CURVE.EASY;
		height = height || Road.HILL.HIGH;
		
		this.renderer.addRoad( Road.LENGTH.MEDIUM, Road.LENGTH.MEDIUM, Road.LENGTH.MEDIUM, curve, height );
	};

	prototype.addLowRollingHills = function(num, height) 
	{
		num = num || Road.LENGTH.SHORT;
		height = height || Road.HILL.LOW;

		this.renderer.addRoad( num, num, num, 0, height );
		this.renderer.addRoad( num, num, num, 0, -height );
	}


	/**
	 * Sprite functions.
	 */

	prototype.getClone = function(id)
	{
		var displayObject = this.sprites.getChildByName( id );

		var clone = displayObject.clone( true );
		clone.pivot.x = displayObject.pivot.x;
		clone.pivot.y = displayObject.pivot.y;
		clone.id = displayObject.id;
		clone.name = displayObject.name;
		clone.visible = false;
		this.container.addChildAt( clone, 1 );

		return clone;
	};

	prototype.addSprite = function(i, id, position, scale, solid)
	{
		this.renderer.addSprite( i, this.getClone( id ), null, position, scale, solid );	
	};

	prototype.callMod = function(mod, callback)
	{
		mod = mod !== undefined ? mod : 10;
		var length = Math.floor( this.length / mod );

		for(var i = 0; i < length; ++i)
		{	
			var n = i * mod;
			callback( n, i );

		    // this.trackFactory.addSprite( n, t.id.wallLeft, -.8 );
		    // this.trackFactory.addSprite( n, t.id.wallRight, .8 );
		}
	};



	/**
	 * Private interface.
	 */

	prototype.initVariables = function()
	{
		this.renderer = this.object.renderer;
		this.sprites = this.object.sprites;
		this.container = this.object.container;
	};

	prototype.initSpriteIDs = function()
	{
		var rerefence = {};

		window.t = {};
		window.t.id = rerefence;

		var children = this.sprites.children;

		for(var i = 0; i < children.length; ++i)
		{
		    var object = children[ i ];
			var id = object.id;

		    rerefence[ id ] = id;
		}
	};



}(window));