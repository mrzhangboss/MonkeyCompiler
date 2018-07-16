class Token {
    constructor(type, literal, lineNumber) {
        this.tokenType = type
        this.literal = literal
        this.lineNumber = lineNumber
    }
//change here
    getType() {
        return this.tokenType
    }

    getLiteral() {
        return this.literal
    }

    getLineNumber() {
        return this.lineNumber
    }

};

class MonkeyLexer {

    constructor(sourceCode) {
        this.initTokenType()
        this.initKeywords()
        this.sourceCode = sourceCode
        this.position = 0
        this.readPosition = 0
        this.lineCount = 0
        this.ch = ''

        //change here
        this.observer = null
        this.observerContext = null
    }

    initTokenType() {
        this.ILLEGAL = -2
        this.EOF = -1
        this.LET = 0
        this.IDENTIFIER = 1
        this.EQUAL_SIGN = 2
        this.PLUS_SIGN = 3
        this.INTEGER = 4
        this.SEMICOLON = 5
        //change here
        this.IF = 6
        this.ELSE = 7
    }
    //change here
    initKeywords() {
        this.keyWordMap = [];
        this.keyWordMap["let"] = new Token(this.LET, "let", 0)
        this.keyWordMap["if"] = new Token(this.IF, "if", 0)
        this.keyWordMap["else"] = new Token(this.ELSE, "else", 0)
    }

    //change here
    setLexingOberver(o, context) {
        if (o !== null && o !== undefined) {
            this.observer = o
            this.observerContext = context
        }
    }

    getKeyWords() {
        return this.keyWordMap
    }

    readChar() {
        if (this.readPosition >= this.sourceCode.length) {
            this.ch = -1
        } else {
            this.ch = this.sourceCode[this.readPosition]
        }

        this.readPosition++
    }

    skipWhiteSpaceAndNewLine() {
        /*
        忽略空格
        */
        //change here
        while (this.ch === ' ' || this.ch === '\t'
        || this.ch === '\u00a0'
        || this.ch === '\n') {
            if (this.ch === '\t' || this.ch === '\n') {
                this.lineCount++;
            }
            this.readChar()
        }
    }

    nextToken () {
        var tok
        this.skipWhiteSpaceAndNewLine()
        var lineCount = this.lineCount
        var needReadChar = true;
        //change here
        this.position = this.readPosition

        switch (this.ch) {
            case '=':
                tok = new Token(this.EQUAL_SIGN, "=", lineCount)
                break
            case ';':
                tok = new Token(this.SEMICOLON, ";", lineCount)
                break;
            case '+':
                tok = new Token(this.PLUS_SIGN, "+", lineCount)
                break;
            //change here
            case -1:
                tok = new Token(this.EOF, "", lineCount)
                break;

            default:
                var res = this.readIdentifier()
                if (res !== false) {
                    //change here
                    if (this.keyWordMap[res] !== undefined) {
                        tok = this.keyWordMap[res]
                    } else {
                        tok = new Token(this.IDENTIFIER, res, lineCount)
                    }
                } else {
                    res = this.readNumber()
                    if (res !== false) {
                        tok = new Token(this.INTEGER, res, lineCount)
                    }
                }

                if (res === false) {
                    tok = undefined
                }
                needReadChar = false;

        }

        if (needReadChar === true) {
            this.readChar()
        }

        //change here
        if (tok !== undefined) {
            this.notifyObserver(tok)
        }
        return tok
    }

    //change here
    notifyObserver(token) {
        this.observer.notifyTokenCreation(token,
            this.observerContext, this.position - 1,
            this.readPosition)
    }


    isLetter(ch) {
        return ('a' <= ch && ch <= 'z') ||
            ('A' <= ch && ch <= 'Z') ||
            (ch === '_')
    }

    readIdentifier() {
        var identifier = ""
        while (this.isLetter(this.ch)) {
            identifier += this.ch
            this.readChar()
        }

        if (identifier.length > 0) {
            return identifier
        } else {
            return false
        }
    }

    isDigit(ch) {
        return '0' <= ch && ch <= '9'
    }

    readNumber() {
        var number = ""
        var c = this.isDigit(this.ch)
        while (this.isDigit(this.ch)) {
            number += this.ch
            this.readChar()
        }

        if (number.length > 0) {
            return number
        } else {
            return false
        }
    }

    lexing() {
        this.readChar()

        var tokens = []
        var token = this.nextToken()
        while(token !== undefined &&
        token.getType() !== this.EOF) {
            console.log(token)
            tokens.push(token)
            token = this.nextToken()
        }
    }
}

export default MonkeyLexer