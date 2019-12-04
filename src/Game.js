import React, { Component } from 'react';
//import { thisExpression } from '@babel/types';
import './Game.css'

function Square(props){
    return(
        <button className="square" onClick={props.onClick}>
            {props.value}
        </button>
    );
}

class Board extends Component{
    renderSquare(x, y){
        return <Square
            key={x * 20 + y}
            value={ this.props.squares[x][y] }
            onClick={ () => this.props.onClick(x, y)} />
    };

    renderRow(row_number){
        let row = [];
        let size = this.props.squares.length;
        for(let column_number = 0; column_number < size; column_number++){
            row.push(this.renderSquare(row_number, column_number));
        }
        return row;
    };

    renderBoard(){
        let board = [];
        let size = this.props.squares.length;
        for(let row_number = 0; row_number < size; row_number++){
            board.push(
            <div 
                key={ row_number + 400 }
                className="board-row">
                { this.renderRow(row_number) } 
            </div>);
        }
        return board;
    };

    render(){
        return(<div>{ this.renderBoard() }</div>);
    };
}

export default class Game extends Component{
    constructor(props){
        super(props)
        this.state = {
            history : [
                {
                    squares: new Array(20).fill().map(() => new Array(20).fill("")),
                    steps: []
                }
            ],
            stepNumber: 0,
            xIsNext: true,
            winner: null
        }
    };

    handleClick(x, y){
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.map(arr => arr.concat());
        const steps = current.steps.map(arr => arr.concat());
        const winner = this.state.winner;

        if(winner || squares[x][y]){
            return;
        }

        squares[x][y] = this.state.xIsNext ? 'X' : 'O' ;
        steps.push([x,y]);

        let isEnd = calculateWiner(squares, x, y);

        if(isEnd){
            this.setState({
                history: history.concat([
                    {
                        squares: squares,
                        steps: steps
                    }
                ]),
                stepNumber: history.length,
                xIsNext: !this.state.xIsNext,
                winner: isEnd
            });
            return;
        }

        this.setState({
            history: history.concat([
                {
                    squares: squares,
                    steps: steps
                }
            ]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext
        });
    };

    jumpTo(step){
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
            winner: false
        });
    };

    render(){
        const history = this.state.history;
        const stepNumber = this.state.stepNumber;
        const current = history[stepNumber];
        const haveWinner = this.state.winner;
        const moves = history.map((step, move) => {
            const desc = move ? 
                `Go to move #${move} (${step.steps[move-1][0]},${step.steps[move-1][1]})` :
                `Go to game start!`;
            if(move === stepNumber){
                return(
                    <li key={move} className='step-highlight'>
                        <button onClick={()=>this.jumpTo(move)}>{desc}</button>
                    </li>
                );
            }else{
                return(
                    <li key={move}>
                        <button onClick={()=>this.jumpTo(move)}>{desc}</button>
                    </li>
                );
            }
        });

        let status;
        if(haveWinner){
            //TODO: winner la who
            status = 'Winner: ' + haveWinner;
        }else{
            status = "Next player: " + (this.state.xIsNext ? 'X' : 'O');
        }

        return(
            <div className="game">
                <div className="game-board">
                    <Board 
                        squares = {current.squares}
                        onClick = {(x,y) => this.handleClick(x,y)}/>
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        )
    }
}

function calculateWiner(square, nrow, ncol){
    let cell = square[nrow][ncol];
    let enemy = cell === 'X' ? 'O' : 'X';
    let win_template = cell.repeat(5);
    let almost_win_template = enemy + win_template + enemy;
    let boardRow = square[nrow].join('');
    let boardColumn =square.map(row => row[ncol]).join('');
    let boardRightDiagnol = square.map((row, i) => row[i + ncol - nrow] ).filter(x => x !== undefined).join('');
    let boardLeftDiagnol = square.map((row, i) => row[nrow + ncol - i] ).filter(x => x !== undefined).join('');

    let win_condition1 = boardRow.indexOf(win_template) !== -1 || 
          boardColumn.indexOf(win_template) !== -1 || 
          boardLeftDiagnol.indexOf(win_template) !== -1 || 
          boardRightDiagnol.indexOf(win_template) !== -1;

    let win_condition2 = boardRow.indexOf(almost_win_template) === -1 && 
          boardColumn.indexOf(almost_win_template) === -1 && 
          boardLeftDiagnol.indexOf(almost_win_template) === -1 &&
          boardRightDiagnol.indexOf(almost_win_template)  === -1;
    return win_condition1 && win_condition2;
};