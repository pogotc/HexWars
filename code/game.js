
Hex.Game = function(canvas, cols, rows){
	this.context = canvas.getContext('2d');
	this.canvas = canvas;
	this.hexSize = 40;
	this.grid = new Hex.Grid(this.hexSize, cols, rows);	
	this.mouse = new Hex.Mouse(this.canvas, this.grid);
	this.board = new Hex.Board(this.grid, this.context);

	this.players = null;
	this.numPlayers = 0
	this.gameOver = false;
	this.restartGameOnNextClick = false;
	this.winner = null;
}


Hex.Game.prototype = {

	init: function(players) {
		this.initialisePlayers(players);

		var game = this;
		var board = this.board;
		this.mouse.onClickGridPosition(function(x, y){
			game.userClickedOnGridPos(x, y);
		});

		$("#end-turn").click(function(){
			game.endTurn();
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

	initialisePlayers: function(players) {
		this.numPlayers = players.length;
		this.players = players;
		this.board.initPlayers(this.numPlayers);
		$("#hud").show();
		this.drawLevel();
		this.updatePlayerStatuses();
	},

	userClickedOnGridPos: function(x, y) {
		if (!this.acceptClicksFromCurrentUser()) {
			return false;
		}

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

	endTurn: function(){
		this.board.endPlayerTurn();
		this.updatePlayerStatuses();
		this.drawLevel();
		this.getMoveForPlayer();
	},

	getMoveForPlayer: function() {
		if (!this.getCurrentPlayer().isHuman) {
			this.getCurrentPlayer().takeTurn(this, this.board);
		}
	},

	acceptClicksFromCurrentUser: function() {
		return this.getCurrentPlayer().isHuman;
	},

	getCurrentPlayer: function() {
		return this.players[this.board.currentPlayer];
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

			var playerMarker = "<span class='playercolour' style='background: " + playerCol + "'>&nbsp;</span>";
			playerLi.append(playerMarker);
			playerLi.append("<span class='total'>" + this.board.getTotalOccupiedHexesForPlayer(i) + "</span>");

			if (i == this.board.currentPlayer) {
				playerLi.addClass("current");
			}

			jQuery("#player-status").append(playerLi);	
		}
	}

}