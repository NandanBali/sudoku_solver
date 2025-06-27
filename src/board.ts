import * as fs from "fs";

export class Board {
	grid: number[][];
	constructor() {
		this.grid = Array.from({ length: 9 }, () => Array(9).fill(0));
	}
	readFromFile(filePath: string): boolean {
		try {
			const file = fs.readFileSync(filePath);
			file.filter((x) => x >= 48 && x < 58)
				.map((x, index) => {
					return x - 48;
				})
				.forEach((x, index) => {
					this.grid[Math.trunc(index / 9)][index % 9] = x;
				});
			return true;
		} catch (e) {
			console.log(e);
			return false;
		}
	}
	printBoard() {
		this.grid.forEach((line, index) => {
			if (index % 3 == 0 && index != 0) {
				console.log("___ ___ ___");
			}
			line.forEach((x, i) => {
				if (i % 3 == 0 && i != 0) {
					process.stdout.write("|");
				}
				if (x == 0) {
					process.stdout.write(".");
				} else {
					process.stdout.write(x.toString());
				}
			});
			console.log("");
		});
	}
	updateBoard(boardState: Map<string, number>) {
		boardState.forEach((value, key) => {
			this.grid[(key.charCodeAt(0) - 65)][(key.charCodeAt(1) - 49)] = value
		})
		this.printBoard()
		
	}
}
