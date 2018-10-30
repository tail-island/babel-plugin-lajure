export default function plugin({types: t}) {
  const isImportLajure = (importDeclarationPath) => {
    return t.isStringLiteral(importDeclarationPath.node.source, {value: 'lajure'});
  };

  const isRequireLajure = (callExpressionPath) => {
    return t.isIdentifier(callExpressionPath.node.callee, {name: 'require'}) && callExpressionPath.node.arguments.find(argument => t.isStringLiteral(argument, {value: 'lajure'}));
  };

  const isCallTCall = (callExpressionPath) => {
    return t.isIdentifier(callExpressionPath.node.callee, {name: 'tCall'});
  };

  const isCallTCondCall = (callExpressionPath) => {
    return t.isIdentifier(callExpressionPath.node.callee, {name: 'tCondCall'});
  };

  const isCallTSomeCall = (callExpressionPath) => {
    return t.isIdentifier(callExpressionPath.node.callee, {name: 'tSomeCall'});

  };

  const isCallLazySeq = (callExpressionPath) => {
    return t.isIdentifier(callExpressionPath.node.callee, {name: 'lazySeq'});

  };

  const functionIdentifierFromImport = (importDeclarationPath, name) => {
    const functionName = (() => {
      const importSpecifier = importDeclarationPath.node.specifiers.find(specifier => t.isImportSpecifier(specifier) && specifier.imported.name == name);
      if (!importSpecifier) {
        return undefined;
      }

      return importSpecifier.local.name;
    })();

    if (functionName) {
      return t.Identifier(functionName);
    }

    const packageName = (() => {
      const importDefaultSpecifier = importDeclarationPath.node.specifiers.find(specifier => t.isImportDefaultSpecifier(specifier));
      if (!importDefaultSpecifier) {
        return undefined;
      }

      return importDefaultSpecifier.local.name;
    })();

    if (packageName) {
      return t.memberExpression(t.identifier(packageName), t.Identifier(name));
    }

    return undefined;
  };

  const functionIdentifierFromRequire = (requireExpressionPath, name) => {
    const id = requireExpressionPath.parent.id;

    const functionName = (() => {
      if (!t.isObjectPattern(id)) {
        return undefined;
      }

      const objectProperty = id.properties.find(property => t.isObjectProperty(property) && property.key.name == name);
      if (!objectProperty) {
        return undefined;
      }

      return objectProperty.value.name;
    })();

    if (functionName) {
      return t.Identifier(functionName);
    }

    const packageName = (() => {
      if (!t.isIdentifier(id)) {
        return undefined;
      }

      return id.name;
    })();

    if (packageName) {
      return t.memberExpression(t.identifier(packageName), t.Identifier('call'));
    }

    return undefined;
  };

  return {
    name: "babel-plugin-lajure",
    visitor: {
      ImportDeclaration(path) {
        if (isImportLajure(path)) {
          this.callIdentifier      = functionIdentifierFromImport(path, 'call');
          this.condCallIdentifier  = functionIdentifierFromImport(path, 'condCall');
          this.someCallIdentifier  = functionIdentifierFromImport(path, 'someCall');
          this.lazySeqFnIdentifier = functionIdentifierFromImport(path, 'lazySeqFn');
        }
      },

      CallExpression(path) {
        if (isRequireLajure(path)) {
          this.callIdentifier      = functionIdentifierFromRequire(path, 'call');
          this.condCallIdentifier  = functionIdentifierFromRequire(path, 'condCall');
          this.someCallIdentifier  = functionIdentifierFromRequire(path, 'someCall');
          this.lazySeqFnIdentifier = functionIdentifierFromRequire(path, 'lazySeqFn');
        }

        if ((isCallTCall(path) && !this.callIdentifier) || (isCallTCondCall(path) && !this.callCondCallIdentifier) || (isCallTSomeCall(path) && !this.callSomeCallIdentifier) || (isCallLazySeq(path) && !this.lazySeqFnIdentifier)) {
          const packageIdentifier = path.scope.generateUidIdentifier('L');
          path.findParent(path => path.isProgram()).node.body.unshift(t.importDeclaration([t.importNamespaceSpecifier(packageIdentifier)], t.stringLiteral('lajure')));

          if (!this.callIdentifier) {
            this.callIdentifier = t.memberExpression(packageIdentifier, t.identifier('call'));
          }

          if (!this.condCallIdentifier) {
            this.condCallIdentifier = t.memberExpression(packageIdentifier, t.identifier('condCall'));
          }

          if (!this.someCallIdentifier) {
            this.someCallIdentifier = t.memberExpression(packageIdentifier, t.identifier('someCall'));
          }

          if (!this.lazySeqFnIdentifier) {
            this.lazySeqFnIdentifier = t.memberExpression(packageIdentifier, t.identifier('lazySeqFn'));
          }
        }

        const convertArgument = (body, argIdentifier) => {
          if (t.isCallExpression(body)) {
            const underscoreIndex = body.arguments.findIndex(argument => t.isIdentifier(argument, {name: '_'}));

            if (underscoreIndex >= 0) {
              body.arguments[underscoreIndex] = argIdentifier;
            } else {
              body.arguments.push(argIdentifier);
            }

            return body;
          }

          if (t.isArrowFunctionExpression(body) || t.isIdentifier(body)) {
            return t.callExpression(body, [argIdentifier]);
          }

          throw 'Invalid arguments';
        };

        if (isCallTCall(path)) {
          path.node.callee = this.callIdentifier;

          const argIdentifier = path.scope.generateUidIdentifier('x');
          for (let i = 1; i < path.node.arguments.length; ++i) {
            path.node.arguments[i] = t.arrowFunctionExpression([argIdentifier], convertArgument(path.node.arguments[i], argIdentifier));
          }
        }

        if (isCallTCondCall(path)) {
          path.node.callee = this.condCallIdentifier;

          const argIdentifier = path.scope.generateUidIdentifier('x');2
          for (let i = 2; i < path.node.arguments.length; i += 2) {
            path.node.arguments[i] = t.arrowFunctionExpression([argIdentifier], convertArgument(path.node.arguments[i], argIdentifier));
          }
        }

        if (isCallTSomeCall(path)) {
          path.node.callee = this.someCallIdentifier;

          const argIdentifier = path.scope.generateUidIdentifier('x');
          for (let i = 1; i < path.node.arguments.length; ++i) {
            path.node.arguments[i] = t.arrowFunctionExpression([argIdentifier], convertArgument(path.node.arguments[i], argIdentifier));
          }
        }

        if (isCallLazySeq(path)) {
          path.node.callee = this.lazySeqFnIdentifier;
          path.node.arguments[0] = t.arrowFunctionExpression([], path.node.arguments[0]);
        }
      }
    }
  };
};
