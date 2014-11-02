Hex = {};

Hex.Game = function(canvas){
	this.context = canvas.getContext('2d');
	this.canvas = canvas;
	this.hexSize = 50;
	this.grid = new Hex.Grid(this.hexSize, 8, 7);	
	this.mouse = new Hex.Mouse(this.canvas, this.grid);
	this.board = new Hex.Board(this.grid, this.context);
}


Hex.Game.prototype = {

	init: function() {
		this.initialisePlayers();
		this.drawLevel();
		

		var game = this;
		this.mouse.onClickGridPosition(function(x, y){
			game.userClickedOnGridPos(x, y);
		});
	},

	drawLevel: function() {
		this.context.fillStyle = '#f5f5f5';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.board.drawLevel(this.context);
	},

	initialisePlayers: function() {
		this.board.initPlayers(3);
	},

	userClickedOnGridPos: function(x, y) {
		this.board.userClickedOnGridPos(x, y);
		this.drawLevel();
	},


}