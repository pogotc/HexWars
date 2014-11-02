var TURN_STATE_NONE = 0;
var TURN_STATE_SELECTED_ATTACKER = 1;
var TURN_STATE_GAME_OVER = 2;

Hex.Board = function(grid, context){

	this.grid = grid;
	this.context = context;

	this.playerColours = {
		0: '#FF0303',
		1: '#0042FF',
		2: '#1CE6B9',
		3: '#20C000',
		4: '#FFFC01',
		5: '#FF8000',
		6: '#540081',
		7: '#E55BB0',
		8: '#959697'
	};

	this.gameState = {};

	this.turnState = TURN_STATE_NONE;

	this.attackingElem = null;
	this.currentPlayer = 0;
	this.totalPlayers = 0;
	this.onGameCompleteCallback = null;
	this.onAttackCallback = null;
	this.maxReinforcements = 8;
};

Hex.Board.prototype = {

	initPlayers: function(numPlayers) {
		this.gameState = {};
		this.totalPlayers = numPlayers;
		var gridPositions = [];
		for (var x = 0; x < this.grid.cols; x++) {
			for (var y = 0; y < this.grid.rows; y++) {
				gridPositions.push({x: x, y: y});
			}
		}		

		while (gridPositions.length) { 
			var gridPos = gridPositions.pop();
			var player = Math.floor(Math.random() * numPlayers);
			var score = 1 + Math.floor(Math.random() * 6);
			this.setOccupyer(gridPos, player, score);
		}

		this.turnState = TURN_STATE_NONE;
		this.currentPlayer = 0;
	},

	onGameComplete: function(callback) {
		this.onGameCompleteCallback = callback;
	},

	onAttack: function(callback) {
		this.onAttackCallback = callback;
	},

	drawLevel: function() {
		var context = this.context;
		var board = this;
		this.grid.drawLevel(this.context, function(hexWorldPos, hexGridPos){
			context.fillStyle = '#000000';
			context.font = "bold 20pt Arial";
			context.textAlign = "center";
			context.textBaseline = "middle";
			context.fillText(board.getScoreForGridPosition(hexGridPos), hexWorldPos.x, hexWorldPos.y);
		});
	},

	setOccupyer: function(pos, player, score) {
		if (!this.gameState[pos.x]) {
			this.gameState[pos.x] = {};
		}

		this.gameState[pos.x][pos.y] = {player: player, score: score};
		this.grid.setColourOfHex(pos.x, pos.y, this.playerColours[player]);
	},

	getOccupyer: function(pos) {
		return this.gameState[pos.x][pos.y].player;
	},

	getScoreForGridPosition: function(pos) {
		return this.gameState[pos.x][pos.y].score;
	},

	getOccupiedHexesForPlayer: function(playerId) {
		var occupiedHexes = [];
		for (var x = 0; x < this.grid.cols; x++) {
			for (var y = 0; y < this.grid.rows; y++) {
				if (this.getOccupyer({x: x, y: y}) == playerId) {
					occupiedHexes.push({x: x, y: y});
				}
			}
		}
		return occupiedHexes;
	},

	getTotalOccupiedHexesForPlayer: function(playerId) {
		return this.getOccupiedHexesForPlayer(playerId).length;
	},

	playerHasWon: function(playerId) {
		var totalPlaces = this.grid.getTotalHexPlaces();
		var placesForPlayer = this.getTotalOccupiedHexesForPlayer(playerId);

		return totalPlaces == placesForPlayer;
	},

	attack: function(from, to) {
		var attackingPlayer = this.getOccupyer(from);
		var targetPlayer = this.getOccupyer(to);

		if (this.attackerWinsFight(from, to)) {
			this.setOccupyer(to, attackingPlayer, this.getScoreForGridPosition(from) - 1);
			this.setOccupyer(from, attackingPlayer, 1);
		} else {
			this.setOccupyer(from, attackingPlayer, 1);
		}
		if (this.onAttackCallback) {
			this.onAttackCallback();
		}
	},

	canAttack: function(from, to) {
		var attackingPlayer = this.getOccupyer(from);
		var targetPlayer = this.getOccupyer(to);
		if (attackingPlayer == targetPlayer) {
			return false;
		}
		if (this.getScoreForGridPosition(from) <= 1) {
			return false;
		}

		return this.grid.areNeighbours(from, to);
	},

	attackerWinsFight: function(attacker, target) {
		var attackerMax = this.getScoreForGridPosition(attacker) * 6;
		var targetMax = this.getScoreForGridPosition(target) * 6;
		var attackerScore = Math.ceil(Math.random() * attackerMax);
		var targetScore = Math.ceil(Math.random() * targetMax);
		console.log("Attacker: " + attackerScore + ", Target: " + targetScore);
		return attackerScore > targetScore;
	},

	completeGame: function(winner){
		if (this.onGameCompleteCallback) {
			this.onGameCompleteCallback(winner);
		}
		this.turnState = TURN_STATE_GAME_OVER;
	},

	userClickedOnGridPos: function(x, y) {
		if (this.turnState == TURN_STATE_NONE && this.userCanSelectHexAsAttacker(x, y)) {
			this.selectAttackingHex(x, y);

		} else if (this.turnState == TURN_STATE_SELECTED_ATTACKER) {
			if (x == this.attackingElem.x && y == this.attackingElem.y) {
				this.resetSelectedStateOfHex(x, y);
				this.turnState = TURN_STATE_NONE;
			} else if(this.canAttack(this.attackingElem, {x: x, y: y})) {
				this.attack(this.attackingElem, {x: x, y: y});
				this.turnState = TURN_STATE_NONE;
				this.resetSelectedStateOfHex(this.attackingElem.x, this.attackingElem.y);

				if (this.playerHasWon(this.currentPlayer)) {
					this.completeGame(this.currentPlayer);
				}
			}
		}
	},

	endPlayerTurn: function() {
		this.sendReinforcements();

		do {
			this.advancePlayerTurn();
		} while (this.getTotalOccupiedHexesForPlayer(this.currentPlayer) == 0);
	},

	advancePlayerTurn: function() {
		this.currentPlayer++;
		this.currentPlayer = this.currentPlayer % this.totalPlayers;
	},

	sendReinforcements: function() {
		var occupiedHexes = this.getOccupiedHexesForPlayer(this.currentPlayer);
		var totalReinforcements = occupiedHexes.length;

		while (totalReinforcements) {
			var hexToReinforce = occupiedHexes[Math.floor(Math.random() * occupiedHexes.length)];
			var currentScore = this.getScoreForGridPosition(hexToReinforce);
			this.setOccupyer(hexToReinforce, this.currentPlayer, Math.min(this.maxReinforcements, currentScore + 1));
			totalReinforcements--;
		}
	},

	selectAttackingHex: function(x, y) {
		this.attackingElem = {x: x, y: y};
		this.grid.setStrokeColorOfHex(x, y, '#FFFFFF');
		this.turnState = TURN_STATE_SELECTED_ATTACKER;
	},

	userCanSelectHexAsAttacker: function(x, y) {
		return this.currentPlayer ==
					this.getOccupyer({x: x, y: y});
	},

	resetSelectedStateOfHex: function(x, y) {
		this.grid.setStrokeColorOfHex(x, y, this.grid.defaultStrokeColour);		
	}
};