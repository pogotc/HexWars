Hex = {};

Hex.Application = function(canvas) {
	this.context = canvas.getContext('2d');
	this.canvas = canvas;

	this.game = new Hex.Game(canvas, 8, 6);
}

Hex.Application.prototype = {

	init: function() {
		$("#hud").hide();
		this.game.init([
			new Hex.HumanPlayer(),
			new Hex.CPUPlayer()
		]);
	}
}
