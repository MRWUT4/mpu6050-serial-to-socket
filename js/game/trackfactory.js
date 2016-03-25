(function(window){

	window.TrackFactory = TrackFactory;

	var prototype = TrackFactory.prototype = Object.create( Object.prototype );
	prototype.constructor = TrackFactory;


	function TrackFactory(renderer)
	{
		this.renderer = renderer;
	}

    prototype.addStraight = function(num) 
    {
		num = num || Road.LENGTH.MEDIUM;
		this.renderer.addRoad( num, num, num, 0 );
    }

	prototype.addSCurves = function(curve, height) 
	{
		curve = curve || Road.CURVE.EASY;
		height = height || Road.HILL.HIGH;
		
		this.renderer.addRoad( Road.LENGTH.MEDIUM, Road.LENGTH.MEDIUM, Road.LENGTH.MEDIUM, -curve, height );
		this.renderer.addRoad( Road.LENGTH.MEDIUM, Road.LENGTH.MEDIUM, Road.LENGTH.MEDIUM,  curve, -height );
		// this.renderer.addRoad( Road.LENGTH.MEDIUM, Road.LENGTH.MEDIUM, Road.LENGTH.MEDIUM,  curve, 0 );
		this.renderer.addRoad( Road.LENGTH.MEDIUM, Road.LENGTH.MEDIUM, Road.LENGTH.MEDIUM, -curve, -height );
		this.renderer.addRoad( Road.LENGTH.MEDIUM, Road.LENGTH.MEDIUM, Road.LENGTH.MEDIUM, -curve, height );
	};

	prototype.addLowRollingHills = function(num, height) 
	{
		num = num || Road.LENGTH.SHORT;
		height = height || Road.HILL.LOW;

		this.renderer.addRoad( num, num, num, 0, height );
		this.renderer.addRoad( num, num, num, 0, -height );
	}


}(window));