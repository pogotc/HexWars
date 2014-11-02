Hex.Mouse = function(canvas, grid){

	this.canvas = canvas;
	this.grid = grid;
	this.gridClickCallback = null;

	var mouse = this;


	canvas.addEventListener('mouseup', function(evt) {
		mouse.handleMouseClick(evt);
	});	
}

Hex.Mouse.prototype = {

	handleMouseClick: function(evt) {
		function getMousePos(canvas, evt) {
	        var rect = this.canvas.getBoundingClientRect();
	        return {
				x: evt.clientX - rect.left,
	          	y: evt.clientY - rect.top
	        };
		}

		var mousePos = getMousePos(canvas, evt);
		var gridPos = this.grid.worldToGrid(mousePos.x, mousePos.y);
		this.gridClickCallback(gridPos.x, gridPos.y);
	},

	onClickGridPosition: function(gridClickCallback){
		this.gridClickCallback = gridClickCallback;
	}
}