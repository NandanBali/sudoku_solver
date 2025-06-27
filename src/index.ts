import { Board } from "./board";
import { SudokuSolver } from "./solver";

const board = new Board();

if (board.readFromFile(process.argv[2])) {
	const solver = new SudokuSolver(board);
	solver.Solve();
	// if (solution) {
	// 	board.updateBoard(solution);
	// }
} else {
	console.log("Failed to read board");
}
