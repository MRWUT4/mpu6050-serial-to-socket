(function(window){

	window.Proxy = Proxy;

	var prototype = Proxy.prototype = Object.create( Object.prototype );
	prototype.constructor = Proxy;


	function Proxy(setup)
	{
		Object.call(this);
		this.reset();
	}

	prototype.reset = function()
	{
		this._property = null;
	};


	/**
	 * System.
	 */

	Object.defineProperty( prototype, "name", 
	{
		get: function() 
		{	
			if( !this._name )
			{
				this._name = 
				{
					container: "container",
					player: "player",
					tree: "tree",
				};
			}
			
			return this._name;
		}
	});

}(window));

