(function(window){

	window.Draw = Draw;

	var prototype = Draw.prototype = Object.create( Object.prototype );
	prototype.constructor = Draw;


	Draw.pool = [];

	function Draw(setup){}


	/**
	 * Static functions.
	 */

	/** Draw single segment. */
	Draw.segment = function(v) 
	{	
		for(var i = 0; i < Draw.loop.length; ++i)
		{
		    var callback = Draw.loop[ i ];
		    callback( v );
		}
	};
	
	/** Draw callback interface. */
	Draw.rumble = function(v)
	{
		var r1 = Draw.rumbleWidth( v.w1, v.lanes );
		var r2 = Draw.rumbleWidth( v.w2, v.lanes );
		var l1 = Draw.laneMarkerWidth( v.w1, v.lanes );
		var l2 = Draw.laneMarkerWidth( v.w2, v.lanes );

		Draw.polygon( v.graphics, v.x1 - v.w1 - r1, v.y1, v.x1 - v.w1, v.y1, v.x2 - v.w2, v.y2, v.x2 - v.w2 - r2, v.y2, v.color.rumble );
		Draw.polygon( v.graphics, v.x1 + v.w1 + r1, v.y1, v.x1 + v.w1, v.y1, v.x2 + v.w2, v.y2, v.x2 + v.w2 + r2, v.y2, v.color.rumble );
	};

	Draw.road = function(v)
	{
		Draw.polygon( v.graphics, v.x1 - v.w1, v.y1, v.x1 + v.w1, v.y1, v.x2 + v.w2, v.y2, v.x2-v.w2, v.y2, v.color.road );
	};

	Draw.lanes = function(v)
	{
		var l1 = Draw.laneMarkerWidth( v.w1, v.lanes );
		var l2 = Draw.laneMarkerWidth( v.w2, v.lanes );
		var lanew1 = null; 
		var lanew2 = null; 
		var lanex1 = null; 
		var lanex2 = null; 
		
		if( v.color.lane ) 
		{
			lanew1 = v.w1 * 2 / v.lanes;
			lanew2 = v.w2 * 2 / v.lanes;
			lanex1 = v.x1 - v.w1 + lanew1;
			lanex2 = v.x2 - v.w2 + lanew2;
			
			for( var lane = 1 ; lane < v.lanes ; lanex1 += lanew1, lanex2 += lanew2, lane++ )
				Draw.polygon( v.graphics, lanex1 - l1/2, v.y1, lanex1 + l1/2, v.y1, lanex2 + l2/2, v.y2, lanex2 - l2/2, v.y2, v.color.lane );
		}
	};

	Draw.background = function(v)
	{
		v.graphics.beginFill( v.color.grass, 1 );
		v.graphics.drawRect( 0, v.y2, v.width, v.y1 - v.y2 );
	};

	Draw.fog = function(v) 
	{
		if( v.fog < 1 ) 
		{
			var height = v.y2-v.y1;

			v.graphics.beginFill( Colors.FOG, 1 - v.fog );
			v.graphics.drawRect( 0, v.y1, v.width, height );
		}
	};


	/** Helper functions. */
	Draw.polygon = function(graphics, x1, y1, x2, y2, x3, y3, x4, y4, color) 
	{
		graphics.beginFill( color, 1 );

		graphics.moveTo( x1, y1 );
		graphics.lineTo( x2, y2 );
		graphics.lineTo( x3, y3 );
		graphics.lineTo( x4, y4 );
		graphics.endFill();
	};

	Draw.rumbleWidth = function(projectedRoadWidth, lanes) 
	{ 
		return projectedRoadWidth / Math.max( .2, lanes ); 
	};
	
	Draw.laneMarkerWidth = function(projectedRoadWidth, lanes) 
	{ 
		return projectedRoadWidth / Math.max( 32, 8 * lanes );
	};


	/** Draw callback loop. */
	Draw.loop = 
	[
		Draw.background,
		Draw.road,
		Draw.rumble,
		Draw.lanes,
		Draw.fog
	];


	// Draw.background = function(v.graphics, background, v.width, height, layer, rotation, offset) 
	// {

	// 	rotation = rotation || 0;
	// 	offset   = offset   || 0;

	// 	var imageW = layer.w/2;
	// 	var imageH = layer.h;

	// 	var sourceX = layer.x + Math.floor(layer.w * rotation);
	// 	var sourceY = layer.y
	// 	var sourceW = Math.min(imageW, layer.x+layer.w-sourceX);
	// 	var sourceH = imageH;

	// 	var destX = 0;
	// 	var destY = offset;
	// 	var destW = Math.floor(v.width * (sourceW/imageW));
	// 	var destH = height;

	// 	v.graphics.drawImage(background, sourceX, sourceY, sourceW, sourceH, destX, destY, destW, destH);
	// 	if (sourceW < imageW)
	// 	v.graphics.drawImage(background, layer.x, sourceY, imageW-sourceW, sourceH, destW-1, destY, v.width-destW, destH);
	// };


	// Draw.sprite = function(v.graphics, v.width, height, resolution, roadWidth, sprites, sprite, scale, destX, destY, offsetX, offsetY, clipY) 
	Draw.sprite = function(object, v, offsetX, offsetY, useClip, scale) 
	{
		useClip = useClip !== undefined ? useClip : true;
		scale = scale !== undefined ? scale : object.scale !== undefined ? object.scale : Road.SPRITE_SCALE;

		// console.log( object.scale );

		var sprite = object.source;
		var parent = object.parent;
		var texture = sprite.texture;

		var spriteWidth = texture.width;
		var spriteHeight = texture.height;
		var spriteScale =  scale * ( 1 / spriteWidth );
		var destW = ( spriteWidth * v.scale * v.width / 2 ) * ( spriteScale * v.roadWidth );
		var destH = ( spriteHeight * v.scale * v.width / 2 ) * ( spriteScale * v.roadWidth );

		v.destX = v.destX + ( destW * (offsetX || 0) ) - destW * .5;
		v.destY = v.destY + ( destH * (offsetY || 0) );

		sprite.width = destW;		
		sprite.height = destH;	
		sprite.x = v.destX;
		sprite.y = v.destY;

		var clipH = v.clipY ? Math.max( 0, v.destY + destH - v.clipY ) : 0;

		if( clipH < destH && useClip )
		{		
			sprite.visible = true;
			
			var cropHeight = spriteHeight - ( spriteHeight * clipH / destH );
			sprite._texture.crop.height = cropHeight;
		}
		else
		if( useClip )
			sprite.visible = false;
	};

	Draw.player = function(object, input, v) 
	{
		var sprite = object.source;

		if( v.steer < 0 )
			sprite.gotoAndPlay( v.updown < 20 ? "straight-left" : "up-left" );
		else
		if( v.steer > 0 )
			sprite.gotoAndPlay( v.updown < 20 ? "straight-right" : "up-right" );
		else
			sprite.gotoAndPlay( v.updown < 20 ? "straight" : "up" );

		Draw.sprite( object, v, .5, -1, false, .2 );
	};

}(window));