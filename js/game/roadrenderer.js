(function(window){

	window.RoadRenderer = RoadRenderer;

	var prototype = RoadRenderer.prototype = Object.create( EventDispatcher.prototype );
	prototype.constructor = RoadRenderer;


	/**
	 * RoadRenderer
	 *
	 * @class RoadRenderer
	 * @constructor
	 *
	 */
	function RoadRenderer(setup)
	{
		EventDispatcher.call( this );
		this.setup = setup;
		this.init();
	}


	/**
	 * Public functions.
	 */

	prototype.addSegment = function(curve, y) 
	{
		var n = this.segments.length;
	
		this.segments.push(
		{
			index: n,
			p1: { world: { y:this.lastY(), z: n * this.segmentLength }, camera: {}, screen: {} },
			p2: { world: { y:y, z:(n+1) * this.segmentLength }, camera: {}, screen: {} },
			curve: curve,
			color: Math.floor( n / this.rumbleLength ) % 2 ? Colors.DARK : Colors.LIGHT,
			sprites: []
		});

		this.trackLength = this.segments.length * this.segmentLength;
	};

	prototype.addSprite = function(n, sprite, parent, offset, scale, solid)
	{
		parent = parent !== null ? parent : sprite.parent;

		if( n < this.segments.length )
		{	
			this.segments[ n ].sprites.push( 
			{ 
				id: sprite.id,
				source: sprite, 
				parent: parent, 
				offset: offset,
				solid: solid,
				scale: scale,
			});
		}
	};

	prototype.addRoad = function(enter, hold, leave, curve, y) 
	{
		var startY = this.lastY();
		var endY = startY + ( Util.toInt(y, 0) * this.segmentLength );
		var n, total = enter + hold + leave;

		for(n = 0 ; n < enter ; n++)
			this.addSegment( Util.easeIn(0, curve, n/enter), Util.easeInOut(startY, endY, n/total) );

		for(n = 0 ; n < hold  ; n++)
			this.addSegment( curve, Util.easeInOut(startY, endY, (enter+n)/total) );

		for(n = 0 ; n < leave ; n++)
			this.addSegment( Util.easeInOut(curve, 0, n/leave), Util.easeInOut(startY, endY, (enter+hold+n)/total) );
	}


	/** Update loop. */
	prototype.update = function()
	{
		if( this.active )
		{
			this.updateDrawValues();
			this.updateInputValues();
			this.updatePlayerValues();
			this.updateSpriteCollision();
			this.drawRoad();
			this.drawSprites();
			this.drawPlayer();
		}
	};


	/**
	 * Private interface.
	 */

	/** Init function. */
	prototype.init = function()
	{
		this.initVariables();
		this.initGraphics();
	};


	/** Variables. */
	prototype.initVariables = function()
	{
		this.active = true;
		this.width = this.setup.width;
		this.height = this.setup.height;
		this.step = 1 / GameSetup.getInstance().fps;
		this.segments = [];
		this.input = { up:false, down:false, left:false, right:false };

		this.player = this.setup.player;
		this.roadWidth = this.setup.roadWidth !== undefined ? this.setup.roadWidth : 2000;
		this.segmentLength = this.setup.segmentLength !== undefined ? this.setup.segmentLength : 200;
		this.rumbleLength = this.setup.rumbleLength !== undefined ? this.setup.rumbleLength : 3;
		this.trackLength = this.setup.trackLength !== undefined ? this.setup.trackLength : null;
		this.lanes = this.setup.lanes !== undefined ? this.setup.lanes : 3;
		this.fieldOfView = this.setup.fieldOfView !== undefined ? this.setup.fieldOfView : 100;
		this.cameraHeight = this.setup.cameraHeight !== undefined ? this.setup.cameraHeight : 1000;
		this.cameraDepth = this.setup.cameraDepth !== undefined ? this.setup.cameraDepth : 1 / Math.tan( ( this.fieldOfView / 2 ) * Math.PI/180 );
		this.drawDistance = this.setup.drawDistance !== undefined ? this.setup.drawDistance : 150;
		this.playerX = this.setup.playerX !== undefined ? this.setup.playerX : 0;
		this.playerZ = this.setup.playerZ !== undefined ? this.setup.playerZ :this.cameraHeight * this.cameraDepth;
		this.fogDensity = this.setup.fogDensity !== undefined ? this.setup.fogDensity : 5;
		this.position = this.setup.position !== undefined ? this.setup.position : 0;
		this.speed = this.setup.speed !== undefined ? this.setup.speed : 0;
		this.maxSpeed = this.setup.maxSpeed !== undefined ? this.setup.maxSpeed : this.segmentLength / this.step;
		this.accel = this.setup.accel !== undefined ? this.setup.accel : this.maxSpeed / 5;
		this.breaking = this.setup.breaking !== undefined ? this.setup.breaking : -this.maxSpeed;
		this.decel = this.setup.decel !== undefined ? this.setup.decel : -this.maxSpeed / 5;
		this.offRoadDecel = this.setup.offRoadDecel !== undefined ? this.setup.offRoadDecel : -this.maxSpeed / 2;
		this.offRoadLimit = this.setup.offRoadLimit !== undefined ? this.setup.offRoadLimit : this.maxSpeed / 4;
		this.playerLimit = this.setup.playerLimit !== undefined ? this.setup.playerLimit : 2;
		this.centrifugal = this.setup.centrifugal !== undefined ? this.setup.centrifugal : 0.3;
		this.hitSize = this.setup.hitSize !== undefined ? this.setup.hitSize : 0.3;

		this.direction = 1;
		this.throttle = 0;
		Event.HIT = "hit";
		this.eventHit = new Event( Event.HIT );

		this.vectorVO = { graphics:0, width:0, lanes:0, x1:0, y1:0, w1:0, x2:0, y2:0, w2:0, fog:0, color:0 };
	};


	/** Create graphics object. */
	prototype.initGraphics = function()
	{
		this.container = this.setup.container;
		this.graphics = new PIXI.Graphics();
		this.container.addChild( this.graphics );
	};


	/** Value update functions. */
	prototype.updateDrawValues = function()
	{
		this.speedPercent = this.speed / this.maxSpeed;
		this.playerSegment = this.findSegment( this.position + this.playerZ );
		this.position = Util.increase( this.position, this.step * this.speed, this.trackLength );
		this.playerX = this.playerX - ( this.step * this.speedPercent * this.playerSegment.curve * this.centrifugal );
		this.playerX = Util.limit( this.playerX, -this.playerLimit, this.playerLimit );
	};

	prototype.updateInputValues = function()
	{
		if( this.input.left )
			this.direction =  1;
		else 
		if( this.input.right )
			this.direction = -1;
		else
			this.direction = 0;


		if( this.input.up )
			this.throttle = this.accel;
		else 
		if( this.input.down )
			this.throttle = this.breaking;
		else
			this.throttle = this.decel;
	};

	prototype.updatePlayerValues = function()
	{
		this.dx = this.step * 2 * this.speedPercent;
		this.playerX = this.playerX - this.dx * this.direction;
		this.speed = Util.accelerate( this.speed, this.throttle, this.step );

		if( ( this.playerX < -1 || this.playerX > 1 ) && ( this.speed > this.offRoadLimit) )
			this.speed = Util.accelerate( this.speed, this.offRoadDecel, this.step );

		this.playerX = this.playerX - (this.dx * this.speedPercent * this.playerSegment.curve * this.centrifugal);
      	this.speed = Util.limit( this.speed, 0, this.maxSpeed );
	};


	/** Sprite collision detection function. */
	prototype.updateSpriteCollision = function()
	{
		var player = this.player.source;
		var playerWidth = player.width;

		for(var i = 0 ; i < this.playerSegment.sprites.length ; i++) 
		{
			var object = this.playerSegment.sprites[ i ]
			var sprite = object.source;

			if( sprite )
			{
				var isColliding = player.x + playerWidth > sprite.x && player.x < sprite.x + sprite.width;
				var isSolid = object.solid === true;

				if( isColliding )
				{
					if( isSolid )
						this.position = Util.increase( this.playerSegment.p1.world.z, -this.playerZ, this.trackLength );
					
					this.eventHit.object = object;
					this.send( this.eventHit );
					
					break;
				}
			}
		}
	};


	/** Draw loop functions. */
	prototype.drawRoad = function()
	{
		this.playerPercent = Util.percentRemaining( this.position + this.playerZ, this.segmentLength );
		this.playerSegment = this.findSegment( this.position + this.playerZ );
		this.playerY = Util.interpolate( this.playerSegment.p1.world.y, this.playerSegment.p2.world.y, this.playerPercent );
		this.baseSegment = this.findSegment( this.position );

		var basePercent = Util.percentRemaining( this.position, this.segmentLength );
		var maxy = this.height;
		var dx = - ( this.baseSegment.curve * basePercent );
		var x = 0;
		var segment = null;

		this.graphics.clear();

		for(var i = 0; i < this.drawDistance; i++) 
		{
			segment = this.segments[ ( this.baseSegment.index + i ) % this.segments.length];
			segment.looped = segment.index < this.baseSegment.index;
			segment.fog = Util.exponentialFog ( i / this.drawDistance, this.fogDensity );
			segment.clip = maxy;

			Util.project(
				segment.p1,
				(this.playerX * this.roadWidth) - x,
				this.playerY + this.cameraHeight,
				this.position - (segment.looped ? this.trackLength : 0),
				this.cameraDepth,
				this.width,
				this.height,
				this.roadWidth
			);
			
			Util.project(
				segment.p2,
				(this.playerX * this.roadWidth) - x - dx,
				this.playerY + this.cameraHeight,
				this.position - (segment.looped ? this.trackLength : 0),
				this.cameraDepth,
				this.width,
				this.height,
				this.roadWidth
			);


			x = x + dx;
			dx = dx + segment.curve;


			var behindCamera = segment.p1.camera.z <= this.cameraDepth;
			var backFaceCull = segment.p2.screen.y >= segment.p1.screen.y;
			var isVisible = segment.p2.screen.y >= maxy;

			
			if ( behindCamera || backFaceCull || isVisible )
				continue;

			this.vectorVO.graphics = this.graphics; 
			this.vectorVO.width = this.width; 
			this.vectorVO.height = this.height; 
			this.vectorVO.lanes = this.lanes; 
			this.vectorVO.x1 = segment.p1.screen.x; 
			this.vectorVO.y1 = segment.p1.screen.y; 
			this.vectorVO.w1 = segment.p1.screen.w; 
			this.vectorVO.x2 = segment.p2.screen.x; 
			this.vectorVO.y2 = segment.p2.screen.y; 
			this.vectorVO.w2 = segment.p2.screen.w; 
			this.vectorVO.fog = segment.fog; 
			this.vectorVO.color = segment.color;

			Draw.segment( this.vectorVO );

			maxy = segment.p1.screen.y;
		}
	};

	prototype.drawSprites = function()
	{
		for(var j = this.drawDistance - 1; j >= 0; --j)
		{
			var segment = this.segments[ ( this.baseSegment.index + j ) % this.segments.length ];
			var sprites = segment.sprites;

			for(var i = 0; i < sprites.length; ++i)
			{
				var object = sprites[ i ];
				var source = object.source;

				if( source )
				{
					source.visible = true;
					this.vectorVO.scale = segment.p1.screen.scale;
					this.vectorVO.destX = segment.p1.screen.x + (this.vectorVO.scale * object.offset * this.roadWidth * this.width / 2 );
					this.vectorVO.destY = segment.p2.screen.y;
					this.vectorVO.roadWidth = this.roadWidth;
					this.vectorVO.clipY = segment.clip;

					Draw.sprite( object, this.vectorVO, object.offset, -1 );
				}
			}
		}
	};

	prototype.drawPlayer = function()
	{
		this.vectorVO.roadWidth = this.roadWidth;  
		this.vectorVO.speedPercent = this.speed / this.maxSpeed; 
		this.vectorVO.scale = this.cameraDepth / this.playerZ; 
		this.vectorVO.destX = this.width / 2; 
		this.vectorVO.destY = ( this.height / 2 ) - ( this.cameraDepth / this.playerZ * Util.interpolate( this.playerSegment.p1.camera.y, this.playerSegment.p2.camera.y, this.playerPercent) * this.height / 2 );
		this.vectorVO.steer = this.speed * ( this.input.left ? -1 : this.input.right ? 1 : 0 );
		this.vectorVO.updown = this.playerSegment.p2.world.y - this.playerSegment.p1.world.y;

		Draw.player( this.player, this.input, this.vectorVO );
	};


	/** Assist functions. */
	prototype.lastY = function() 
	{
		return ( this.segments.length == 0 ) ? 0 : this.segments[ this.segments.length - 1 ].p2.world.y;
	}

	prototype.findSegment = function(z)
	{
		return this.segments[ Math.floor( z / this.segmentLength) % this.segments.length ];
	};

}(window));



(function(window){

	window.Road = Road;

	var prototype = Road.prototype = Object.create( Object.prototype );
	prototype.constructor = Road;


	/**
	 * Road
	 *
	 * @class Road
	 * @constructor
	 *
	 */
	function Road(){}
  	
  	Road.HILL =	  { NONE: 0, LOW:    10, MEDIUM:  20, HIGH:   30 },
	Road.LENGTH = { NONE: 0, SHORT:  25, MEDIUM:  50, LONG:  100 }; // num segments
	Road.CURVE =  { NONE: 0, EASY:    2, MEDIUM:   4, HARD:    6 };

	Road.SPRITE_SCALE = 1;

}(window));




(function(window){

	window.Colors = Colors;

	var prototype = Colors.prototype = Object.create( Object.prototype );
	prototype.constructor = Colors;

	/**
	 * Colors
	 *
	 * @class Road
	 * @constructor
	 *
	 */
	function Colors(){}

	Colors.to = function(string)
	{
		return parseInt( string, 16 );
	};

	Colors.hex = function(c)
	{
		var hex = c.toString( 16 );
		return hex.length == 1 ? "0" + hex : hex;
	};

	Colors.rgb = function(r, g, b)
	{
    	return Colors.to( Colors.hex(r) + Colors.hex(g) + Colors.hex(b) );
	};

	Colors.hsb = function(h, s, l) 
	{
	    var r, g, b;

	    if(s == 0)
	    {
	        r = g = b = l; // achromatic
	    }
	    else
	    {
	        var hue2rgb = function hue2rgb(p, q, t)
	        {
	            if(t < 0) t += 1;
	            if(t > 1) t -= 1;
	            if(t < 1/6) return p + (q - p) * 6 * t;
	            if(t < 1/2) return q;
	            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
	            return p;
	        }

	        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	        var p = 2 * l - q;

	        r = hue2rgb(p, q, h + 1/3);
	        g = hue2rgb(p, q, h);
	        b = hue2rgb(p, q, h - 1/3);
	    }

	    return Colors.rgb( Math.round( r * 255 ), Math.round( g * 255 ), Math.round( b * 255 ) );
	}

	Colors.rgbToHSL = function(r, g, b)
	{
		r /= 255, g /= 255, b /= 255;
		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, l = (max + min) / 2;

		if(max == min){
			h = s = 0; // achromatic
		}
		else
		{
			var d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			
			switch(max)
			{
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}

			h /= 6;
		}

		return [h, s, l];
	};

	Colors.SKY = Colors.to( '72D7EE');
	Colors.TREE = Colors.to( '005108');
	Colors.FOG = Colors.to( '005108');
	Colors.LIGHT = { road: Colors.to( '6B6B6B'), grass: Colors.to( '10AA10'), rumble: Colors.to( '555555'), lane: Colors.to( 'CCCCCC') };
	Colors.DARK = { road: Colors.to( '696969'), grass: Colors.to( '009A00'), rumble: Colors.to( 'BBBBBB') };
	Colors.START = { road: Colors.to( 'FFFFFF'), grass: Colors.to( 'FFFFFF'), rumble: Colors.to( 'FFFFFF') };
	Colors.FINISH = { road: Colors.to( 'FFFFFF'), grass: Colors.to( 'FFFFFF'), rumble: Colors.to( 'FFFFFF') };

}(window));