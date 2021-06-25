;(function(exports) {
  var message;
  var library = {
    head: function(x) {
      return x[0];
    },

    tail: function(x) {
      return x.slice(1);
    },

    print: function(x) {
      console.log(x);
      return x;
    },
    
    add: function(x) {
      return x.reduce((a, b) => a + b); 
    },
    
    sub: function(x) {
      return x.reduce((a, b) => a - b); 
    },
    
    mult: function(x) {
      return x.reduce((a, b) => a * b); 
    },
    
    div: function(x) {
      return x.reduce((a, b) => a / b); 
    },

    push: function(x) {
      const result = x[1]
      result.push(x[0]);
      return result;
    },

    get: function(x) {
      return x[1][x[0]];
    },

    eval: function(x) {
      message.channel.send(x[0]);
      message.delete();
    }
  };

  var Context = function(scope, parent) {
    this.scope = scope;
    this.parent = parent;

    this.get = function(identifier) {
      if (identifier in this.scope) {
        return this.scope[identifier];
      } else if (this.parent !== undefined) {
        return this.parent.get(identifier);
      }
    };
  };

  var special = {
    let: function(input, context) {
      var letContext = input[1].reduce(function(acc, x) {
        acc.scope[x[0].value] = interpret(x[1], context);
        return acc;
      }, new Context({}, context));

      return interpret(input[2], letContext);
    },
    
    define: function(input, context) {
      context.scope[input[1][0].value] = function() {
        console.log('args');
        console.log(arguments);
        var lambdaArguments = arguments;
        var lambdaScope = input[1][1].reduce(function(acc, x, i) {
          acc[x.value] = lambdaArguments[i];
          return acc;
        }, {});
        return interpret(input[1][2], new Context(lambdaScope, context));
      };
      return interpret(input[2], context)//inpt context
    },
        
    lambda: function(input, context) {
      return function() {
        var lambdaArguments = arguments;
        var lambdaScope = input[1].reduce(function(acc, x, i) {
          acc[x.value] = lambdaArguments[i];
          return acc;
        }, {});

        return interpret(input[2], new Context(lambdaScope, context));
      };
    },

    if: function(input, context) {
      return interpret(input[1], context) ?
        interpret(input[2], context) :
        interpret(input[3], context);
    }
  };

  var interpretList = function(input, context) {
    if (input.length > 0 && input[0].value in special) {
      return special[input[0].value](input, context);
    } else {
      var list = input.map(function(x) { return interpret(x, context); });
      if (list[0] instanceof Function) {
        return list[0].apply(undefined, list.slice(1));
      } else {
        return list;
      }
    }
  };

  var interpret = function(input, context) {
    if (context === undefined) {
      return interpret(input, new Context(library));
    } else if (input instanceof Array) {
      return interpretList(input, context);
    } else if (input.type === "identifier") {
      return context.get(input.value);
    } else if (input.type === "number" || input.type === "string") {
      return input.value;
    }
  };

  var categorize = function(input) {
    if (!isNaN(parseFloat(input))) {
      return { type:'number', value: parseFloat(input) };
    } else if (input[0] === '"' && input.slice(-1) === '"') {
      return { type:'string', value: input.slice(1, -1) };
    } else {
      return { type:'identifier', value: input };
    }
  };

  var parenthesize = function(input, list) {
    if (list === undefined) {
      return parenthesize(input, []);
    } else {
      var token = input.shift();
      if (token === undefined) {
        return list.pop();
      } else if (token === "(") {
        list.push(parenthesize(input, []));
        return parenthesize(input, list);
      } else if (token === ")") {
        return list;
      } else {
        return parenthesize(input, list.concat(categorize(token)));
      }
    }
  };

  var tokenize = function(input) {
    return input.split('"')
                .map(function(x, i) {
                   if (i % 2 === 0) { // not in string
                     return x.replace(/\(/g, ' ( ')
                             .replace(/\)/g, ' ) ');
                   } else { // in string
                     return x.replace(/ /g, "!whitespace!");
                   }
                 })
                .join('"')
                .trim()
                .split(/\s+/)
                .map(function(x) {
                  return x.replace(/!whitespace!/g, " ");
                });
  };

  var parse = function(msg, input) {
    message = msg;
    return parenthesize(tokenize(input));
  };

  exports.littleLisp = {
    parse: parse,
    interpret: interpret
  };
})(typeof exports === 'undefined' ? this : exports);
