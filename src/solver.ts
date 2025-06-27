import { writeFile } from "fs";
import { Board } from "./board";
import { error } from "console";

export class SudokuSolver {
	Grid: Map<string, number[]>;
	private Boxes: string[][];
	constructor(board: Board) {
		console.log("Initialized sudoku solver");
		this.Grid = this.createCellPossibilities();
		this.Boxes = [
			["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3"],
			["D1", "D2", "D3", "E1", "E2", "E3", "F1", "F2", "F3"],
			["G1", "G2", "G3", "H1", "H2", "H3", "I1", "I2", "I3"],
			["A4", "A5", "A6", "B4", "B5", "B6", "C4", "C5", "C6"],
			["D4", "D5", "D6", "E4", "E5", "E6", "F4", "F5", "F6"],
			["G4", "G5", "G6", "H4", "H5", "H6", "I4", "I5", "I6"],
			["A7", "A8", "A9", "B7", "B8", "B9", "C7", "C8", "C9"],
			["D7", "D8", "D9", "E7", "E8", "E9", "F7", "F8", "F9"],
			["G7", "G8", "G9", "H7", "H8", "H9", "I7", "I8", "I9"],
		];
		board.grid.flat().forEach((n, index) => {
			if (n !== 0) {
				this.Grid.set(this.getCoordinate(index), [n]);
			}
		});
	}
	Solve() {
		let old_possibilites = 0;
		let possibilities = this.calculatePossibilites();
		while (possibilities >= 81) {
			this.solveLoop();
			old_possibilites = possibilities;
			possibilities = this.calculatePossibilites();
			if (old_possibilites === possibilities) {
				break;
			}
		}
		if (possibilities > 81) {
			console.log("Possibilites: " + possibilities + " Failed.");
			console.log(this.Grid);
			this.bfSolve(possibilities);
		}
	}
	private solveLoop() {
		this.filterByRow();
		this.filterByColumn();
		this.filterByBox();
	}

	private createCellPossibilities(): Map<string, number[]> {
		const possibilities: Map<string, number[]> = new Map();
		const rows = "ABCDEFGHI";
		const cols = "123456789";
		for (const r of rows) {
			for (const c of cols) {
				const key = `${r}${c}`;
				possibilities.set(key, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
			}
		}

		return possibilities;
	}
	private getCoordinate(n: number) {
		return (
			String.fromCharCode(Math.trunc(n / 9) + "A".charCodeAt(0)) +
			((n % 9) + 1).toString()
		);
	}

	private calculatePossibilites() {
		let possibilities = 0;
		this.Grid.forEach((v, _) => {
			possibilities += v.length;
		});
		return possibilities;
	}

	private filterByRow() {
		this.Grid.forEach((value, key) => {
			if (value.length === 1) {
				this.Grid.forEach((v, k) => {
					if (v.length !== 1 && k !== key && k[0] === key[0]) {
						let i = v.indexOf(value[0]);
						if (i !== -1) {
							v.splice(i, 1);
						}
					}
				});
			}
		});
	}

	private filterByColumn() {
		this.Grid.forEach((value, key) => {
			if (value.length === 1) {
				this.Grid.forEach((v, k) => {
					if (k[1] === key[1] && v.length !== 1 && k !== key) {
						let i = v.indexOf(value[0]);
						if (i !== -1) {
							v.splice(i, 1);
						}
					}
				});
			}
		});
	}

	private filterByBox() {
		this.Grid.forEach((value, key) => {
			if (value.length === 1) {
				let box = this.Boxes.find((box) => box.includes(key));
				if (box) {
					box.forEach((k) => {
						if (k !== key) {
							let arr = this.Grid.get(k);
							if (arr) {
								let i = arr.indexOf(value[0]);
								if (i !== -1) {
									arr.splice(i, 1);
								}
							}
						}
					});
				}
			}
		});
	}

	private printRowColBox(s: string, grid: Map<string, number>) {
		if (s.length > 1) {
			if (s[0] === "x") {
				grid.forEach((v, k) => {
					if (k[1] === s[1]) {
						process.stdout.write(v.toString() + " ");
					}
				});
				console.log();
			} else {
				grid.forEach((v, k) => {
					if (k[0] === s[0]) {
						process.stdout.write(v.toString() + " ");
					}
				});
				console.log();
			}
		}
	}

	private checkBoardIntegrity(grid: Map<string, number>): boolean {
		let status = true;

		for (const [key, value] of grid.entries()) {
			for (const [k, v] of grid.entries()) {
				if (k[1] === key[1] && v === value && key !== k) {
					return false;
				}
				if (k[0] === key[0] && v === value && key !== k) {
					return false;
				}
			}
			const box = this.Boxes.find((box) => box.includes(key));
			if (box) {
				for (let k of box) {
					let v = grid.get(k);
					if (v) {
						if (v === value && k !== key) {
							return false;
						}
					} else {
						console.error(grid);
						throw new Error("Failed to parse grid");
					}
				}
			}
		}

		return status;
	}

	public generateGridForIndex(iteration: number) {
		const indexer: number[] = [];
		const valueIndex: number[][] = [];
		this.Grid.forEach((value, _) => {
			valueIndex.push(value);
		});
		valueIndex.reverse();
		valueIndex.forEach((v) => {
			if (v.length > 1 && iteration > 0) {
				if (iteration >= valueIndex.length) {
					indexer.push(v.length - 1);
					iteration -= v.length - 1;
				} else {
					indexer.push(iteration);
					iteration = 0;
				}
			} else {
				indexer.push(0);
			}
		});
        indexer.reverse()
		let grid_copy = this.Grid;
		let new_grid = new Map<string, number>()
		grid_copy.forEach((val, key) => {
			new_grid.set(key, val[indexer[this.coordinateToNumber(key) - 1]]);
		});
		return new_grid;
	}

	private solveIndex(iteration: number, maxDepth: number) {
		let new_grid = this.generateGridForIndex(iteration);
		if (this.checkBoardIntegrity(new_grid)) {
			return new_grid;
		} else {
			if (iteration < 1000) {
				this.solveIndex(iteration + 1, maxDepth);
			} else {
				console.log("Failed");

				console.log(this.generateGridForIndex(4));
				console.log(this.generateGridForIndex(5));

				console.log(this.generateGridForIndex(6));

				console.log(this.generateGridForIndex(7));

				console.log(this.generateGridForIndex(8));
			}
		}
	}

	private bfSolve(maxDepth: number) {
		let grid = this.solveIndex(0, maxDepth);
		if (grid) {
			console.log(grid);
		} else {
			console.log("Failed to solve");
		}
	}

	private coordinateToNumber(s: string) {
		return (s.charCodeAt(0) - 65) * 9 + s.charCodeAt(1) - 48;
	}
}
