(function(window){
	
	window.PreloaderState = PreloaderState;

	var prototype = PreloaderState.prototype = Object.create( pixijs.FluidButtonState.prototype );
	prototype.constructor = PreloaderState;


	function PreloaderState(setup)
	{
		pixijs.FluidButtonState.call( this, setup );

		this.loaderPreload = setup.loaderPreload || null;
		this.urlPreloader = setup.urlPreloader || null;
	}


	/* StateMachine callback on setState. */
	prototype.enterFluidButtonState = prototype.enter;
	prototype.enter = function()
	{
		this.enterFluidButtonState();
		this.initVariables();
		this.initPreloader();
	};

	prototype.update = function()
	{
		this.updatePreloaderScale();
	};


	/** Create game atlas. */
	prototype.initAtlas = function()
	{
		this.json = this.loaderPreload.getObjectWithID( this.urlPreloader ).result;
		this.atlas = pixijs.Scene.createAtlas( this.json, this.loaderPreload );
	};


	/** Init state graphics representation. */
	prototype.initGraphics = function(boolean)
	{
		boolean = boolean !== undefined ? boolean : true;

		if( boolean )
		{
			this.scene = new pixijs.Scene( 
			{ 
				json: this.json,
				loader: this.loaderPreload,
				atlas: this.atlas
			});

			this.graphics = this.scene.graphics;
			this.stage.addChild( this.graphics );
		}
		else
			this.stage.removeChild( this.graphics );
	};


	/** Variables. */
	prototype.initVariables = function()
	{
		this.content = this.graphics.getChildByName( "content" );
	};


	/** Preloader. */
	prototype.initPreloader = function()
	{
		this.preloader = this.graphics.getChildByName( "preloader" );

		this.mask = new PIXI.Graphics();

		var pivot = this.mask.pivot;

		pivot.x = 0;
		pivot.y = 0;

		this.mask.x = this.preloader.x + pivot.x;
		this.mask.y = this.preloader.y + pivot.y;

		this.mask.beginFill( 0, 1 );
		this.mask.drawRect( 0, 0, this.preloader.width, this.preloader.height);
		this.mask.endFill();

		this.preloader.mask = this.mask;

		this.content.addChild( this.mask );
	};

	prototype.updatePreloaderScale = function()
	{
		this.mask.scale.x = this.loader.progress;		
	};


}(window));