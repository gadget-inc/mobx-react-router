var global, factory;

global = this, factory = function(exports, history, mobx) {
  function _defineProperty(obj, key, value) {
    return key in obj ? Object.defineProperty(obj, key, {
      value,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }) : obj[key] = value, obj;
  }
  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter((function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      }))), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), !0).forEach((function(key) {
        _defineProperty(target, key, source[key]);
      })) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach((function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      }));
    }
    return target;
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || !1, descriptor.configurable = !0, 
      "value" in descriptor && (descriptor.writable = !0), Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  /**
   * Parse a string for the raw tokens.
   */
  function parse(str, options) {
    void 0 === options && (options = {});
    for (var tokens = 
    /**
   * Tokenize input string.
   */
    function(str) {
      for (var tokens = [], i = 0; i < str.length; ) {
        var char = str[i];
        if ("*" !== char && "+" !== char && "?" !== char) if ("\\" !== char) if ("{" !== char) if ("}" !== char) if (":" !== char) if ("(" !== char) tokens.push({
          type: "CHAR",
          index: i,
          value: str[i++]
        }); else {
          var count = 1, pattern = "";
          if ("?" === str[j = i + 1]) throw new TypeError('Pattern cannot start with "?" at ' + j);
          for (;j < str.length; ) if ("\\" !== str[j]) {
            if (")" === str[j]) {
              if (0 == --count) {
                j++;
                break;
              }
            } else if ("(" === str[j] && (count++, "?" !== str[j + 1])) throw new TypeError("Capturing groups are not allowed at " + j);
            pattern += str[j++];
          } else pattern += str[j++] + str[j++];
          if (count) throw new TypeError("Unbalanced pattern at " + i);
          if (!pattern) throw new TypeError("Missing pattern at " + i);
          tokens.push({
            type: "PATTERN",
            index: i,
            value: pattern
          }), i = j;
        } else {
          for (var name = "", j = i + 1; j < str.length; ) {
            var code = str.charCodeAt(j);
            if (
            // `0-9`
            !(code >= 48 && code <= 57 || 
            // `A-Z`
            code >= 65 && code <= 90 || 
            // `a-z`
            code >= 97 && code <= 122 || 
            // `_`
            95 === code)) break;
            name += str[j++];
          }
          if (!name) throw new TypeError("Missing parameter name at " + i);
          tokens.push({
            type: "NAME",
            index: i,
            value: name
          }), i = j;
        } else tokens.push({
          type: "CLOSE",
          index: i,
          value: str[i++]
        }); else tokens.push({
          type: "OPEN",
          index: i,
          value: str[i++]
        }); else tokens.push({
          type: "ESCAPED_CHAR",
          index: i++,
          value: str[i++]
        }); else tokens.push({
          type: "MODIFIER",
          index: i,
          value: str[i++]
        });
      }
      return tokens.push({
        type: "END",
        index: i,
        value: ""
      }), tokens;
    }(str), _a = options.prefixes, prefixes = void 0 === _a ? "./" : _a, defaultPattern = "[^" + escapeString(options.delimiter || "/#?") + "]+?", result = [], key = 0, i = 0, path = "", tryConsume = function(type) {
      if (i < tokens.length && tokens[i].type === type) return tokens[i++].value;
    }, mustConsume = function(type) {
      var value = tryConsume(type);
      if (void 0 !== value) return value;
      var _a = tokens[i], nextType = _a.type, index = _a.index;
      throw new TypeError("Unexpected " + nextType + " at " + index + ", expected " + type);
    }, consumeText = function() {
      // tslint:disable-next-line
      for (var value, result = ""; value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR"); ) result += value;
      return result;
    }; i < tokens.length; ) {
      var char = tryConsume("CHAR"), name = tryConsume("NAME"), pattern = tryConsume("PATTERN");
      if (name || pattern) {
        var prefix = char || "";
        -1 === prefixes.indexOf(prefix) && (path += prefix, prefix = ""), path && (result.push(path), 
        path = ""), result.push({
          name: name || key++,
          prefix,
          suffix: "",
          pattern: pattern || defaultPattern,
          modifier: tryConsume("MODIFIER") || ""
        });
      } else {
        var value = char || tryConsume("ESCAPED_CHAR");
        if (value) path += value; else if (path && (result.push(path), path = ""), tryConsume("OPEN")) {
          prefix = consumeText();
          var name_1 = tryConsume("NAME") || "", pattern_1 = tryConsume("PATTERN") || "", suffix = consumeText();
          mustConsume("CLOSE"), result.push({
            name: name_1 || (pattern_1 ? key++ : ""),
            pattern: name_1 && !pattern_1 ? defaultPattern : pattern_1,
            prefix,
            suffix,
            modifier: tryConsume("MODIFIER") || ""
          });
        } else mustConsume("END");
      }
    }
    return result;
  }
  /**
   * Create path match function from `path-to-regexp` spec.
   */  function match(str, options) {
    var keys = [];
    /**
   * Create a path match function from `path-to-regexp` output.
   */
    return function(re, keys, options) {
      void 0 === options && (options = {});
      var _a = options.decode, decode = void 0 === _a ? function(x) {
        return x;
      } : _a;
      return function(pathname) {
        var m = re.exec(pathname);
        if (!m) return !1;
        for (var path = m[0], index = m.index, params = Object.create(null), _loop_1 = function(i) {
          // tslint:disable-next-line
          if (void 0 === m[i]) return "continue";
          var key = keys[i - 1];
          "*" === key.modifier || "+" === key.modifier ? params[key.name] = m[i].split(key.prefix + key.suffix).map((function(value) {
            return decode(value, key);
          })) : params[key.name] = decode(m[i], key);
        }, i = 1; i < m.length; i++) _loop_1(i);
        return {
          path,
          index,
          params
        };
      };
    }
    /**
   * Escape a regular expression string.
   */ (pathToRegexp(str, keys, options), keys, options);
  }
  function escapeString(str) {
    return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
  }
  /**
   * Get the flags for a regexp from the options.
   */  function flags(options) {
    return options && options.sensitive ? "" : "i";
  }
  /**
   * Pull out keys from a regexp.
   */  
  /**
   * Create a path regexp from string input.
   */
  function stringToRegexp(path, keys, options) {
    /**
   * Expose a function for taking tokens and returning a RegExp.
   */
    return function(tokens, keys, options) {
      void 0 === options && (options = {});
      // Iterate over the tokens and create our regexp string.
      for (var _a = options.strict, strict = void 0 !== _a && _a, _b = options.start, start = void 0 === _b || _b, _c = options.end, end = void 0 === _c || _c, _d = options.encode, encode = void 0 === _d ? function(x) {
        return x;
      } : _d, endsWith = "[" + escapeString(options.endsWith || "") + "]|$", delimiter = "[" + escapeString(options.delimiter || "/#?") + "]", route = start ? "^" : "", _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
        var token = tokens_1[_i];
        if ("string" == typeof token) route += escapeString(encode(token)); else {
          var prefix = escapeString(encode(token.prefix)), suffix = escapeString(encode(token.suffix));
          if (token.pattern) if (keys && keys.push(token), prefix || suffix) if ("+" === token.modifier || "*" === token.modifier) {
            var mod = "*" === token.modifier ? "?" : "";
            route += "(?:" + prefix + "((?:" + token.pattern + ")(?:" + suffix + prefix + "(?:" + token.pattern + "))*)" + suffix + ")" + mod;
          } else route += "(?:" + prefix + "(" + token.pattern + ")" + suffix + ")" + token.modifier; else route += "(" + token.pattern + ")" + token.modifier; else route += "(?:" + prefix + suffix + ")" + token.modifier;
        }
      }
      if (end) strict || (route += delimiter + "?"), route += options.endsWith ? "(?=" + endsWith + ")" : "$"; else {
        var endToken = tokens[tokens.length - 1], isEndDelimited = "string" == typeof endToken ? delimiter.indexOf(endToken[endToken.length - 1]) > -1 : // tslint:disable-next-line
        void 0 === endToken;
        strict || (route += "(?:" + delimiter + "(?=" + endsWith + "))?"), isEndDelimited || (route += "(?=" + delimiter + "|" + endsWith + ")");
      }
      return new RegExp(route, flags(options));
    }
    /**
   * Normalize the given path string, returning a regular expression.
   *
   * An empty array can be passed in for the keys, which will hold the
   * placeholder key descriptions. For example, using `/user/:id`, `keys` will
   * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
   */ (parse(path, options), keys, options);
  }
  function pathToRegexp(path, keys, options) {
    return path instanceof RegExp ? function(path, keys) {
      if (!keys) return path;
      for (var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g, index = 0, execResult = groupsRegex.exec(path.source); execResult; ) keys.push({
        // Use parenthesized substring match if available, index otherwise
        name: execResult[1] || index++,
        prefix: "",
        suffix: "",
        modifier: "",
        pattern: ""
      }), execResult = groupsRegex.exec(path.source);
      return path;
    }
    /**
   * Transform an array into a regexp.
   */ (path, keys) : Array.isArray(path) ? function(paths, keys, options) {
      var parts = paths.map((function(path) {
        return pathToRegexp(path, keys, options).source;
      }));
      return new RegExp("(?:" + parts.join("|") + ")", flags(options));
    }(path, keys, options) : stringToRegexp(path, keys, options);
  }
  var join = function() {
    for (var _len = arguments.length, paths = new Array(_len), _key = 0; _key < _len; _key++) paths[_key] = arguments[_key];
    return paths.reduce((function(prev, curr) {
      return "".concat(prev.replace(/\/$/, ""), "/").concat(curr.replace(/^\//, ""));
    }));
  }, RouterStore =  function() {
    function RouterStore(history$1, basePath) {
      var _this = this;
      !function(instance, Constructor) {
        if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
      }(this, RouterStore), this.history = history$1, this.basePath = basePath, this.pathList = [], 
      this.state = {
        action: history.Action.Pop,
        location: {
          key: "default",
          pathname: "",
          search: "",
          state: {},
          hash: ""
        }
      }, this.go = void 0, this.back = void 0, this.forward = void 0, this.updateState = mobx.action((function(newState) {
        var pathname = _this.basePath ? newState.location.pathname.replace(_this.basePath, "") : newState.location.pathname;
        "" === pathname && (pathname = "/"), _this.state = {
          action: newState.action,
          location: _objectSpread2(_objectSpread2({}, newState.location), {}, {
            pathname
          })
        };
      })), this.subscribe = void 0, this.stopSyncWithHistory = void 0, this.go = history$1.go.bind(history$1), 
      this.back = history$1.back.bind(history$1), this.forward = history$1.forward.bind(history$1), 
      mobx.makeObservable(this, {
        state: mobx.observable,
        location: mobx.computed,
        query: mobx.computed,
        pathList: mobx.observable,
        hashValue: mobx.computed,
        pathValue: mobx.computed,
        appendPathList: mobx.action,
        prependPathList: mobx.action
      }), 
      /**
       * Listen for changes to location state in store
       * and run listener at once
       */
      this.subscribe = function(listener) {
        var unlisten = history$1.listen(listener);
        return listener({
          action: history$1.action,
          location: history$1.location
        }), unlisten;
      }, this.stopSyncWithHistory = this.subscribe(this.updateState);
    }
    var Constructor, protoProps, staticProps;
    return Constructor = RouterStore, protoProps = [ {
      key: "location",
      get: 
      /** @readonly */
      function() {
        return this.state.location;
      }
    }, {
      key: "push",
      value: function(to, state) {
        this.history.push(this.addBasename(to), state);
      }
    }, {
      key: "replace",
      value: function(to, state) {
        this.history.replace(this.addBasename(to), state);
      }
    }, {
      key: "query",
      get: 
      /**
       * get query format from location.search
       * @readonly
       * */
      function() {
        var search = this.location.search, query = {};
        return search && new URLSearchParams(search).forEach((function(value, name) {
          query[name] ? Array.isArray(query[name]) ? query[name].push(value) : query[name] = [ query[name], value ] : query[name] = value;
        })), query;
      }
      /**
       * get hash, not include '#'
       * @readonly
       * */    }, {
      key: "hashValue",
      get: function() {
        var hash = this.location.hash;
        return hash ? hash.slice(1) : "";
      }
      /**
       * get path variable value, example:
       * /path/:name => /path/abc
       * router.pathValue.name => ac
       *
       * @readonly
       * */    }, {
      key: "pathValue",
      get: function() {
        var pathname = this.location.pathname, param = {}, hasPathValue = !1;
        return this.pathList.find((function(path) {
          var matchResult = match(path, {
            decode: decodeURIComponent
          })(pathname);
          return matchResult && matchResult && (param = matchResult.params, hasPathValue = !0), 
          hasPathValue;
        })), param;
      }
      /**
       * append new path to router.pathList, like '/abc/:name'
       * Note: the pathList order will affect pathValue
       * */    }, {
      key: "appendPathList",
      value: function() {
        var _this$pathList;
        (_this$pathList = this.pathList).push.apply(_this$pathList, arguments);
      }
      /**
       * preppend new path to router.pathList, like '/abc/:name'
       * Note: the pathList order will affect pathValue
       * */    }, {
      key: "prependPathList",
      value: function() {
        var _this$pathList2;
        (_this$pathList2 = this.pathList).unshift.apply(_this$pathList2, arguments);
      }
    }, {
      key: "addBasename",
      value: function(to) {
        if (!this.basePath) return to;
        if ("string" == typeof to) {
          if (!to.startsWith(this.basePath)) return join(this.basePath, to);
        } else to.pathname && !to.pathname.startsWith(this.basePath) && (to.pathname = join(this.basePath, to.pathname));
        return to;
      }
    } ], protoProps && _defineProperties(Constructor.prototype, protoProps), staticProps && _defineProperties(Constructor, staticProps), 
    Object.defineProperty(Constructor, "prototype", {
      writable: !1
    }), RouterStore;
  }();
  exports.RouterStore = RouterStore, Object.defineProperty(exports, "__esModule", {
    value: !0
  });
}, "object" == typeof exports && "undefined" != typeof module ? factory(exports, require("history"), require("mobx")) : "function" == typeof define && define.amd ? define([ "exports", "history", "mobx" ], factory) : factory((global = "undefined" != typeof globalThis ? globalThis : global || self).MobxReactRouter = {}, global.HistoryLibrary, global.mobx);
//# sourceMappingURL=mobx-react-router.js.map
