import React , {Component} from 'react'
import * as bootstrap from 'react-bootstrap'
import MonkeyLexer from './MonkeyLexer'
import MonkeyCompilerEditer from './MonkeyCompilerEditer'

class MonkeyCompilerIDE extends Component {
    constructor(props) {
        super(props)
        this.lexer = new MonkeyLexer("")
    }

    onLexingClick () {
      this.lexer = new MonkeyLexer(this.inputInstance.getContent())
    	this.lexer.lexing()
    }

    render () {

        return (
          <bootstrap.Panel header="Monkey Compiler" bsStyle="success">
            <MonkeyCompilerEditer 
             ref={(ref) => {this.inputInstance = ref}}
             keyWords={this.lexer.getKeyWords()}/>
            <bootstrap.Button onClick={this.onLexingClick.bind(this)} 
             style={{marginTop: '16px'}}
             bsStyle="danger">
              Lexing
            </bootstrap.Button>
          </bootstrap.Panel>
          );
    }
}

export default MonkeyCompilerIDE