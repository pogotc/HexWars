Hex.Grid = function(hexSize, cols, rows) {
	this.hexSize = hexSize;
	this.cols = cols;
	this.rows = rows;
	this.coordMap = [];
	this.defaultColour = '#ffffff';
	this.hexColours = {};
}

Hex.Grid.prototype = {
	drawLevel: function(context){
		for (var x = 0; x < this.cols; x++) {
			for (var y = 0; y < this.rows; y++) {
				var worldPos = this.gridToWorld(x, y);
				this.coordMap.push({
					gridX: x,
					gridY: y,
					worldX: worldPos.x,
					worldY: worldPos.y
				});

				this.drawHex(context, worldPos.x, worldPos.y, this.hexSize, this.getColourOfHex(x, y));
			}
		}
		context.stroke();
	},

	setDefaultHexColour: function(col) {
		this.defaultColour = col;
	},

	setColourOfHex: function(x, y, col) {
		if (!this.hexColours[x]) {
			this.hexColours[x] = {};
		}
		this.hexColours[x][y] = col;
	},

	getColourOfHex: function(x, y) {
		if (this.hexColours[x] && this.hexColours[x][y]) {
			return this.hexColours[x][y];
		}
		return this.defaultColour;
	},

	worldToGrid: function(x, y) {
		var bestElem = {};
		var closest = 99999;
		for(var i = 0; i < this.coordMap.length; i++) {
			var hex = this.coordMap[i];
			var xDiff = Math.abs(x) - Math.abs(hex.worldX);
			var yDiff = Math.abs(y) - Math.abs(hex.worldY);
			var diff = (xDiff * xDiff) + (yDiff * yDiff);

			if (diff < closest) {
				bestElem = hex;
				closest = diff;
			}
		}
		return {x: bestElem.gridX, y: bestElem.gridY};
	},
 
	gridToWorld: function(x, y) {
		var xoffset = y % 2 == 0 ? this.hexSize : this.hexSize + (this.hexSize * 0.88);
		xoffset -= 7;
		return {
			x: xoffset + (x * (this.hexSize * 1.75)),
			y: this.hexSize + y * (this.hexSize * 1.5)
		};
	},

	findNeighbours: function(x, y) {
		return this.removeNonValidEntries(y % 2 == 0 ?
			[
				{x: x -1, y: y},
				{x: x + 1, y: y},
				{x: x, y: y + 1},
				{x: x - 1, y: y + 1},
				{x: x - 1, y: y - 1},
				{x: x, y: y - 1}
			]
		:
			[
				{x: x -1, y: y},
				{x: x + 1, y: y},
				{x: x, y: y + 1},
				{x: x + 1, y: y + 1},
				{x: x + 1 , y: y - 1},
				{x: x , y: y - 1}
			]);
	},

	removeNonValidEntries: function(entries) {
		var cols = this.cols;
		var rows = this.rows;
		return entries.filter(function(elem){
			return elem.x >= 0 && elem.y >= 0 
				&& elem.x < cols && elem.y < rows ;
		});
	},

	drawHex: function(context, center_x, center_y, size, colour) {
		context.beginPath();
		context.fillStyle = colour;
		context.strokeStyle = '#000000';
		for(var i = 0; i <= 6; i++) {
		    var angle = 2 * Math.PI / 6 * (i + 0.5);
		    var x_i = center_x + size * Math.cos(angle);
		    var y_i = center_y + size * Math.sin(angle);
		    if (i == 0) {
		        context.moveTo(x_i, y_i);
		    } else {
		        context.lineTo(x_i, y_i);
		    }
		}
		context.fill();
		context.stroke();
	}
}