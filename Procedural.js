"use strict";

meta.class("Procedural.Generator", 
{
	gen: function(cellsX, cellsY)
	{
		this.cellsX = cellsX;
		this.cellsY = cellsY;

		if(this.cellsX < 4) {
			this.cellsX = 4;
		}
		if(this.cellsY < 4) {
			this.cellsY = 4;
		}

		this.data = new Uint32Array(cellsX * cellsY);
		this.rooms = [];

		var centerX = (this.cellsX / 2) | 0;
		var centerY = (this.cellsY / 2) | 0;
		this._makeRoom(centerX, centerY, 10, 10, meta.random.number(0, 3));

		for(var n = 0; n < this.numTries; n++)
		{
			var roomID = meta.random.number(0, this.numRooms - 1);
			var room = this.rooms[roomID];

			var wallDirection = meta.random.number(0, 3);
			var cursorX, cursorY;

			switch(wallDirection)
			{
				case 0: // NORTH
				{
					cursorX = meta.random.number(room.minX + 1, room.maxX - 1);
					cursorY = room.minY;
				} break;

				case 1: // SOUTH
				{
					cursorX = meta.random.number(room.minX + 1, room.maxX - 1);
					cursorY = room.maxY;
				} break;

				case 2: // WEST
				{
					cursorX = room.minX;
					cursorY = meta.random.number(room.minY + 1, room.maxY - 1);
				} break;

				case 3: // EAST
				{
					cursorX = room.maxX;
					cursorY = meta.random.number(room.minY + 1, room.maxY - 1);
				} break;
			}

			var chance = meta.random.number(0, 99);
			if(chance < 25) 
			{
				if(!this._makeCorridor(cursorX, cursorY, 9, wallDirection)) {
					continue;
				}
			}
			else 
			{
				if(!this._makeRoom(cursorX, cursorY, 10, 10, wallDirection)) {
					continue;
				}
			}

			this.data[cursorX + (cursorY * this.cellsX)] = 1;
		}
	},

	_makeRoom: function(startCellX, startCellY, maxRoomSizeX, maxRoomSizeY, direction)
	{
		var roomX, roomY;

		var roomSizeX = meta.random.number(3, maxRoomSizeX);
		var roomSizeY = meta.random.number(3, maxRoomSizeY);

		switch(direction)
		{
			case 0: // NORTH
			{
				roomX = startCellX - ((roomSizeX / 2) | 0);
				roomY = startCellY - roomSizeY + 1;
			} break;

			case 1: // SOUTH
			{
				roomX = startCellX - ((roomSizeX / 2) | 0);
				roomY = startCellY;
			} break;

			case 2: // WEST
			{
				roomX = startCellX - roomSizeX + 1;
				roomY = startCellY - ((roomSizeY / 2) | 0);
			} break;

			case 3: // EAST
			{
				roomX = startCellX;
				roomY = startCellY - ((roomSizeY / 2) | 0);
			} break;
		}

		if(!this._isAreaFree(roomX, roomY, roomSizeX, roomSizeY)) {
			return false;
		}

		this._buildArea(roomX, roomY, roomSizeX, roomSizeY);

		return true;
	},

	_makeCorridor: function(startCellX, startCellY, maxLength, direction)
	{
		var roomX, roomY;

		var length = meta.random.number(6, maxLength);

		switch(direction)
		{
			case 0: // NORTH
			{
				roomX = startCellX - 1;
				roomY = startCellY - length + 1;

				if(!this._isAreaFree(roomX, roomY, 3, length)) {
					return false;
				}
				this._buildArea(roomX, roomY, 3, length);
			} break;

			case 1: // SOUTH
			{
				roomX = startCellX - 1;
				roomY = startCellY;

				if(!this._isAreaFree(roomX, roomY, 3, length)) {
					return false;
				}
				this._buildArea(roomX, roomY, 3, length);
			} break;

			case 2: // WEST
			{
				roomX = startCellX - length + 1;
				roomY = startCellY - 1;

				if(!this._isAreaFree(roomX, roomY, length, 3)) {
					return false;
				}
				this._buildArea(roomX, roomY, length, 3);
			} break;

			case 3: // EAST
			{
				roomX = startCellX;
				roomY = startCellY - 1;

				if(!this._isAreaFree(roomX, roomY, length, 3)) {
					return false;
				}
				this._buildArea(roomX, roomY, length, 3);
			} break;
		}

		return true;
	},

	_isAreaFree: function(startCellX, startCellY, sizeX, sizeY)
	{
		if(startCellX < 0) { return false; }
		if(startCellY < 0) { return false; }

		var endCellX = startCellX + sizeX;
		var endCellY = startCellY + sizeY;

		if(endCellX >= this.cellsX) { return false; }
		if(endCellY >= this.cellsY) { return false; }

		var id, gid;
		for(var y = startCellY; y < endCellY; y++)
		{
			id = startCellX + (y * this.cellsX);

			for(var x = startCellX; x < endCellX; x++)
			{
				gid = this.data[id++];
				if(gid === 1) {
					return false;
				} 
			}
		}

		return true;
	},

	_buildArea: function(startCellX, startCellY, roomSizeX, roomSizeY)
	{
		var x, y, id;
		var endCellX = startCellX + roomSizeX - 1;
		var endCellY = startCellY + roomSizeY - 1;

		for(y = startCellY; y <= endCellY; y++)
		{
			id = startCellX + (y * this.cellsX);

			for(x = startCellX; x <= endCellX; x++) 
			{
				if(x === startCellX || 
				   y === startCellY ||
				   x === endCellX || 
				   y === endCellY) 		
				{
					this.data[id++] = 2;
				}
				else 
				{
					this.data[id++] = 1;
				}
			}
		}

		this.rooms.push(new this.Room(startCellX, startCellY, endCellX, endCellY));
		this.numRooms++;
	},

	Room: function(minX, minY, maxX, maxY)
	{
		this.minX = minX;
		this.minY = minY;
		this.maxX = maxX;
		this.maxY = maxY;
	},

	//
	data: null,
	rooms: null,

	cellsX: 0, 
	cellsY: 0,

	numTries: 3000,
	numRooms: 0
});
