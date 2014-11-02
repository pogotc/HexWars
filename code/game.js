Hex = {};

Hex.Game = function(canvas){
	this.context = canvas.getContext('2d');
	this.canvas = canvas;
	this.hexSize = 50;
	this.grid = new Hex.Grid(this.hexSize, 8, 7);	
	this.mouse = new Hex.Mouse(this.canvas, this.grid);
}


Hex.Game.prototype = {

	init: function() {
		this.drawLevel();

		var game = this;
		this.mouse.onClickGridPosition(function(x, y){
			game.userClickedOnGridPos(x, y);
		});
	},

	drawLevel: function() {
		this.context.fillStyle = '#f5f5f5';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.grid.drawLevel(this.context);
	},

	userClickedOnGridPos: function(x, y) {
		this.grid.setColourOfHex(x, y, '#ff0000');

		var neighbours = this.grid.findNeighbours(x, y);
		for (var i in neighbours) {
			this.grid.setColourOfHex(neighbours[i].x, neighbours[i].y, '#0000ff');	
		}

		this.drawLevel();
	},


}