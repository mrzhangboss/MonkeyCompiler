import React , {Component} from 'react'
import rangy from 'rangy/lib/rangy-selectionsaverestore';
import MonkeyLexer from './MonkeyLexer'

class MonkeyCompilerEditer extends Component{

	constructor(props) {
		super(props)
		this.keyWords = props.keyWords
		rangy.init()
		this.keyWordClass = 'keyword'
		this.keyWordElementArray = []
		this.discardedElementsArray = []
	}

	getContent () {
		return this.divInstance.innerText
	}

    changeNode(n) {
      var f = n.childNodes; 
      for(var c in f) {
      	this.changeNode(f[c]);
      }
      if (n.data) {
      	console.log(n.parentNode.innerHTML)
      	this.lastBegin = 0
      	n.keyWordCount = 0;
      	var lexer = new MonkeyLexer(n.data)
      	lexer.setLexingOberver(this, n)
      	lexer.lexing()
      } 
    }

    notifyTokenCreation(token, elementNode, begin, end) {
    	if (this.keyWords[token.getLiteral()] !== undefined) {
    		var e = {}
    		e.node = elementNode
    		e.begin = begin
    		e.end = end
    		e.token = token
    		elementNode.keyWordCount++;
    		this.keyWordElementArray.push(e)
    	}
    }

    hightLightKeyWord(token, elementNode, begin, end) {
    	var strBefore = elementNode.data.substr(this.lastBegin, 
    		             begin - this.lastBegin)
    	strBefore = this.changeSpaceToNBSP(strBefore)
    	
    	var textNode = document.createTextNode(strBefore)
    	var parentNode = elementNode.parentNode
    	parentNode.insertBefore(textNode, elementNode)
    

    	var span = document.createElement('span')
    	span.style.color = 'green'
    	span.classList.add(this.keyWordClass)
    	span.appendChild(document.createTextNode(token.getLiteral()))
    	parentNode.insertBefore(span, elementNode)

    	this.lastBegin = end - 1

    	elementNode.keyWordCount--
    	console.log(this.divInstance.innerHTML)
    }

    changeSpaceToNBSP(str) {
    	var s = ""
    	for (var i = 0; i < str.length; i++) {
    		if (str[i] === ' ') {
    			s += '\u00a0'
    		}
    		else {
    			s += str[i]
    		}
    	}

    	return s;
    }

    hightLightSyntax() {
    	var i
    	for (i = 0; i < this.keyWordElementArray.length; i++) {
    		var e = this.keyWordElementArray[i]
    		this.currentElement = e.node
    		this.hightLightKeyWord(e.token, e.node, 
            e.begin, e.end)

            if (this.currentElement.keyWordCount === 0) {
                var end = this.currentElement.data.length
    	        var lastText = this.currentElement.data.substr(this.lastBegin, 
    		                    end)
    	        lastText = this.changeSpaceToNBSP(lastText)
    	        var parent = this.currentElement.parentNode
    	        var lastNode = document.createTextNode(lastText)
    	        parent.insertBefore(lastNode, this.currentElement)
    	        parent.removeChild(this.currentElement)
    	    }
    	}
    	this.keyWordElementArray = []
    }

	onDivContentChane(evt) {
		if (evt.key === 'Enter' || evt.key === " ") {
			return
		}
		        
		var bookmark = undefined
		if (evt.key !== 'Enter') {
			bookmark = rangy.getSelection().getBookmark(this.divInstance)
		}

		var spans = document.getElementsByClassName(this.keyWordClass);
        while (spans.length) {
            var p = spans[0].parentNode;
            var t = document.createTextNode(spans[0].innerText)
            p.insertBefore(t, spans[0])
            p.removeChild(spans[0])
        }

        //把所有相邻的text node 合并成一个
        this.divInstance.normalize();
        this.changeNode(this.divInstance)
        this.hightLightSyntax()

		if (evt.key !== 'Enter') {
			rangy.getSelection().moveToBookmark(bookmark)
		}
		
	}

	render() {
		let textAreaStyle = {
    	    height: 480,
    	    border: "1px solid black"
    	};
    	
    	return (
    		<div style={textAreaStyle} 
    		onKeyUp={this.onDivContentChane.bind(this)}
    		ref = {(ref) => {this.divInstance = ref}}
    		contentEditable>
    		</div>
    		);
	}
}

export default MonkeyCompilerEditer