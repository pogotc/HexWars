
Hex.CPUPlayer = function() {
	this.isHuman = false;	
}

Hex.CPUPlayer.prototype = {

	takeTurn: function(game, board) {
		console.log("thinking...");

		setTimeout(function() {
			game.endTurn();
		}, 1000);
	}
}