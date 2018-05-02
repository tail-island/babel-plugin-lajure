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

  const callIdentifierFromImport = (importDeclarationPath) => {
    const functionName = (() => {
      const importSpecifier = importDeclarationPath.node.specifiers.find(specifier => t.isImportSpecifier(specifier) && specifier.imported.name == 'call');
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
      return t.memberExpression(t.identifier(packageName), t.Identifier('call'));
    }

    return undefined;
  };

  const callIdentifierFromRequire = (requireExpressionPath) => {
    const id = requireExpressionPath.parent.id;

    const functionName = (() => {
      if (!t.isObjectPattern(id)) {
        return undefined;
      }

      const objectProperty = id.properties.find(property => t.isObjectProperty(property) && property.key.name == 'call');
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
          this.callIdentifier = callIdentifierFromImport(path);
        }
      },

      CallExpression(path) {
        if (isRequireLajure(path)) {
          this.callIdentifier = callIdentifierFromRequire(path);
        }

        if (isCallTCall(path)) {
          if (!this.callIdentifier) {
            const packageIdentifier = path.scope.generateUidIdentifier('L');
            path.findParent(path => path.isProgram()).node.body.unshift(t.importDeclaration([t.importNamespaceSpecifier(packageIdentifier)], t.stringLiteral('lajure')));

            this.callIdentifier = t.memberExpression(packageIdentifier, t.identifier('call'));
          }
          path.node.callee = this.callIdentifier;

          const argIdentifier = path.scope.generateUidIdentifier('x');
          for (let i = 1; i < path.node.arguments.length; ++i) {
            const argument = (() => {
              const body = path.node.arguments[i];

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
            })();

            path.node.arguments[i] = t.arrowFunctionExpression([argIdentifier], argument);
          }
        }
      }
    }
  };
};
