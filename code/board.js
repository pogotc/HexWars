var TURN_STATE_NONE = 0;
var TURN_STATE_SELECTED_ATTACKER = 1;
var TURN_STATE_SELECTED_TARGET = 2;

Hex.Board = function(grid, context){

	this.grid = grid;
	this.context = context;

	this.playerColours = {
		0: '#FF0000',
		1: '#0000FF',
		2: '#55FF55'
	};

	this.gameState = {};

	this.turnState = TURN_STATE_NONE;

	this.attackingElem = null;
};

Hex.Board.prototype = {

	initPlayers: function(numPlayers) {
		this.gameState = {};
		var gridPositions = [];
		for (var x = 0; x < this.grid.cols; x++) {
			for (var y = 0; y < this.grid.rows; y++) {
				gridPositions.push({x: x, y: y});
			}
		}		

		while (gridPositions.length) { 
			var gridPos = gridPositions.pop();
			var player = Math.floor(Math.random() * numPlayers);
			this.setOccupyer(gridPos, player);
		}
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

	setOccupyer: function(pos, player) {
		if (!this.gameState[pos.x]) {
			this.gameState[pos.x] = {};
		}
		this.gameState[pos.x][pos.y] = {player: player, score: 3};
		this.grid.setColourOfHex(pos.x, pos.y, this.playerColours[player]);
	},

	getOccupyer: function(pos) {
		return this.gameState[pos.x][pos.y].player;
	},

	getScoreForGridPosition: function(pos) {
		return this.gameState[pos.x][pos.y].score;
	},

	attack: function(from, to) {
		var attackingPlayer = this.getOccupyer(from);
		var targetPlayer = this.getOccupyer(to);

		if (attackingPlayer == targetPlayer) {
			this.turnState == TURN_STATE_SELECTED_ATTACKER
		} else {
			console.log("ATTACK!!", from, to);
			console.log(attackingPlayer + " attacking " + targetPlayer);
			this.turnState = TURN_STATE_NONE;
			this.resetSelectedStateOfHex(from.x, from.y);
		}
	},

	userClickedOnGridPos: function(x, y) {
		if (this.turnState == TURN_STATE_NONE) {
			this.selectAttackingHex(x, y);

		} else if (this.turnState == TURN_STATE_SELECTED_ATTACKER) {
			if (x == this.attackingElem.x && y == this.attackingElem.y) {
				this.resetSelectedStateOfHex(x, y);
				this.turnState = TURN_STATE_NONE;
			} else if(this.grid.areNeighbours(this.attackingElem, {x: x, y: y})) {
				this.attack(this.attackingElem, {x: x, y: y});
				// this.turnState = TURN_STATE_SELECTED_TARGET;
			}
		}
	},

	selectAttackingHex: function(x, y) {
		this.attackingElem = {x: x, y: y};
		this.grid.setStrokeColorOfHex(x, y, '#FFFFFF');
		this.turnState = TURN_STATE_SELECTED_ATTACKER;
	},

	resetSelectedStateOfHex: function(x, y) {
		this.grid.setStrokeColorOfHex(x, y, this.grid.defaultStrokeColour);		
	}
};