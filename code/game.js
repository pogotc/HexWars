Hex = {};

Hex.Game = function(canvas){
	this.context = canvas.getContext('2d');
	this.canvas = canvas;
	this.hexSize = 50;
	this.grid = new Hex.Grid(this.hexSize, 6, 6);	
	this.mouse = new Hex.Mouse(this.canvas, this.grid);
	this.board = new Hex.Board(this.grid, this.context);

	this.numPlayers = 3;
	this.gameOver = false;
	this.restartGameOnNextClick = false;
	this.winner = null;
}


Hex.Game.prototype = {

	init: function() {
		this.initialisePlayers();

		var game = this;
		var board = this.board;
		this.mouse.onClickGridPosition(function(x, y){
			game.userClickedOnGridPos(x, y);
		});

		$("#end-turn").click(function(){
			board.endPlayerTurn();
			game.updatePlayerStatuses();
			game.drawLevel();
		});

		this.board.onAttack(function(){
			game.updatePlayerStatuses();
		});

		this.board.onGameComplete(function(winner) {
			game.gameOver = true;
			game.winner = winner;
		});
	},

	drawLevel: function() {
		this.context.fillStyle = '#f5f5f5';
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

		this.board.drawLevel(this.context);
	},

	initialisePlayers: function() {
		this.board.initPlayers(this.numPlayers);
		$("#hud").show();
		this.drawLevel();
		this.updatePlayerStatuses();
	},

	userClickedOnGridPos: function(x, y) {
		this.board.userClickedOnGridPos(x, y);
		this.drawLevel();

		if (this.restartGameOnNextClick) {
			this.initialisePlayers(this.numPlayers);
			this.restartGameOnNextClick = false;
			this.gameOver = false;
			return;
		}

		if (this.gameOver) {
			this.showEndGameScreen();
			this.restartGameOnNextClick = true;
		}
	},

	showEndGameScreen: function() {
		$("#hud").fadeOut();
		this.context.fillStyle = '#000000';
		this.context.font = "bold 30pt Arial";
		this.context.textAlign = "center";
		this.context.textBaseline = "middle";
		this.context.fillText("Player " + (this.winner + 1) + " wins", this.canvas.width / 2, this.canvas.height / 2);
	},

	updatePlayerStatuses: function() {
		jQuery("#player-status").empty();
		for (var i = 0; i < this.numPlayers; i++) {
			var playerCol = this.board.playerColours[i];
			var playerLi = jQuery("<li></li>");

			var playerMarker = "<span style='background: " + playerCol + "'>&nbsp;</span>";
			playerLi.append(playerMarker);
			playerLi.append(this.board.getTotalOccupiedHexesForPlayer(i));

			if (i == this.board.currentPlayer) {
				playerLi.addClass("current");
			}

			jQuery("#player-status").append(playerLi);	
		}
	}

}