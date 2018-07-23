
class Node {
    constructor (props) {
        this.tokenLiteral = ""
    }
    getLiteral() {
	    return this.tokenLiteral
	}
}

class Statement extends Node{ 
	statementNode () {
	    return this
	}
}

class Expression extends Node{
    constructor(props) {
        super(props)
        this.tokenLiteral = props.token.getLiteral()
    }
    expressionNode () {
        return this
    }
}

class Identifier extends Expression {
    constructor(props) {
        super(props)
        this.tokenLiteral = props.token.getLiteral()
        this.token = props.token
        this.value = ""
    }
}

class LetStatement extends Statement {
    constructor(props) {
        super(props)
        this.token = props.token
        this.name = props.identifier
        this.value = props.expression
        var s = "This is a Let statement, left is an identifer:"
        s += props.identifer.getLiteral()
        s += " right size is value of "
        s += this.value.getLiteral()
        this.tokenLiteral = s
    }
}

//change here 
class ReturnStatement extends Statement{
  constructor(props) {
    super(props)
    this.token = props.token
    this.expression = props.expression
    var s = "return with " + this.expression.getLiteral()
    this.tokenLiteral = s
  }
}

//change here
class ExpressionStatement extends Statement {
  constructor(props) {
    super(props)
    this.token = props.token
    this.expression = props.expression
    var s = "expression: " + this.expression.getLiteral()
    this.tokenLiteral = s
  }
}

//change here
class PrefixExpression extends Expression {
  constructor(props) {
    super(props)
    this.token = props.token
    this.operator = props.operator
    this.right = props.expression

    var s = "(" + this.operator + this.right.getLiteral()
        + ")"
  }
}

class IntegerLiteral extends Expression {
    constructor(props) {
        super(props)
        this.token = props.token
        this.value = props.value
        var s = "Integer value is: " + this.token.getLiteral()
        this.tokenLiteral = s
    }
}

class Program {
	constructor () {
	    this.statements = []
	}

    getLiteral() {
        if (this.statements.length > 0) {
            return this.statements[0].tokenLiteral()
        } else {
            return ""
        }
    }
}

class MonkeyCompilerParser {
    constructor(lexer) {
        this.lexer = lexer
        this.lexer.lexing()
        this.tokenPos = 0
        this.curToken = null
        this.peekToken = null
        this.nextToken()
        this.nextToken()
        this.program = new Program()

        //change here
        this.LOWEST = 0
        this.EQUALS = 1  // ==
        this.LESSGREATER = 2 // < or >
        this.SUM = 3
        this.PRODUCT = 4
        this.PREFIX = 5 //-X or !X
        this.CALL = 6  //myFunction(X)

        this.prefixParseFns = {}
        this.prefixParseFns[this.lexer.IDENTIFIER] = 
        this.parseIdentifier
        this.prefixParseFns[this.lexer.INTEGER] = 
        this.parseIntegerLiteral
        this.prefixParseFns[this.lexer.BANG_SIGN] = 
        this.parsePrefixExpression[this.lexer.MINUS_SIGN] =
        this.parsePrefixExpression
    }

    nextToken() {
        /*
        一次必须读入两个token,这样我们才了解当前解析代码的意图
        例如假设当前解析的代码是 5; 那么peekToken就对应的就是
        分号，这样解析器就知道当前解析的代码表示一个整数
        */
        this.curToken = this.peekToken
        this.peekToken = this.lexer.tokens[this.tokenPos]
        this.tokenPos++
    }

    parseProgram() {
        while (this.curToken.getType() !== this.lexer.EOF) {
            var stmt = this.parseStatement()
            if (stmt !== null) {
                this.program.statements.push(stmt)
            }
            this.nextToken()
        }
        return this.program
    }

    parseStatement() {
        switch (this.curToken.getType()) {
            case this.lexer.LET:
              return this.parseLetStatement()
            //change here
            case this.lexer.RETURN:
              return this.parseReturnStatement()
            default:
              //change here
              return this.parseExpressionStatement()
        }
    }
    //change here
    parseReturnStatement() {
      var props = {}
      props.token = this.curToken

      //change later
      if (!this.expectPeek(this.lexer.INTEGER)) {
        return null
      }

      var exprProps = {}
      exprProps.token = this.curToken;
      props.expression = new Expression(exprProps)

      if (!this.expectPeek(this.lexer.SEMICOLON)) {
           return null
       }

      return new ReturnStatement(props) 
    }

    //change here
    createIdentifier() {
       var identProps = {}
       identProps.token = this.curToken
       identProps.value = this.curToken.getLiteral()
       return new Identifier(identProps)
    }

    parseLetStatement() {
       var props = {}
       props.token = this.curToken
       //expectPeek 会调用nextToken将curToken转换为
       //下一个token
       if (!this.expectPeek(this.lexer.IDENTIFIER)) {
          return null
       }

       // change here
       props.identifer = this.createIdentifier()

       if (!this.expectPeek(this.lexer.ASSIGN_SIGN)) {
           return null
       }

       //change later
       if (!this.expectPeek(this.lexer.INTEGER)) {
           return null
       }


       var exprProps = {}
       exprProps.token = this.curToken
       props.expression = new Expression(exprProps)

       if (!this.expectPeek(this.lexer.SEMICOLON)) {
           return null
       }

       var letStatement = new LetStatement(props)
       return letStatement
    }

    //change here
    parseExpressionStatement() {
       var props = {}
       props.token = this.curToken
       props.expression = this.parseExpression(this.LOWEST)
       var stmt = new ExpressionStatement(props)

       if (this.peekTokenIs(this.lexer.SEMICOLON)) {
           this.nextToken()
       }

       return stmt
    }

    //change here
    parseExpression(precedence) {
        var prefix = this.prefixParseFns[this.curToken.getType()]
        if (prefix === null) {
            console.log("no parsing function found for token " + 
              this.curToken.getLiteral())
            return null
        }

        return prefix(this)
    }

    //change here
    parseIdentifier(caller) {
        return caller.createIdentifier()
    }

    //change here
    parseIntegerLiteral(caller) {
      var intProps = {}
      intProps.token = caller.curToken
      intProps.value = parseInt(caller.curToken.getLiteral())
      if (intProps.value === NaN) {
          console.log("could not parse token as integer")
          return null
      }

      return new IntegerLiteral(intProps)
    }

    //change here
    parsePrefixExpression(caller) {
      var props = {}
      props.token = this.curToken
      props.operator = this.curToken.getLiteral()
      caller.nextToken()
      props.right = caller.parseExpression(caller.PREFIX)

      return new PrefixExpression(props)
    }

    curTokenIs (tokenType) {
        return this.curToken.getType() === tokenType
    }

    peekTokenIs(tokenType) {
        return this.peekToken.getType() === tokenType
    }

    expectPeek(tokenType) {
        if (this.peekTokenIs(tokenType)) {
            this.nextToken()
            return true
        } else {
          // change here
            console.log(this.peekError(tokenType))
            return false
        }
    }

    //change here
    peekError(type) {
      var s = "expected next token to be " + 
      this.lexer.getLiteralByTokenType(type)
      return s
    }
}

export default MonkeyCompilerParser