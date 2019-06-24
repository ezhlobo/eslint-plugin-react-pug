// ----------------------------------------------------------------------------
// THE CONTENT WAS MAINLY COPIED FROM THESE FILES:
// ----------------------------------------------------------------------------
//
// * https://github.com/yannickcr/eslint-plugin-react/blob/master/lib/rules/no-unused-prop-types.js
// * https://github.com/yannickcr/eslint-plugin-react/blob/master/lib/rules/prop-types.js
//

/* eslint-disable */

module.exports.createReportUndeclaredPropTypes = (context, components, configuration) => {
  const ignored = configuration.ignore || [];

  const MISSING_MESSAGE = '\'{{name}}\' is missing in props validation';

  /**
   * Checks if the prop is ignored
   * @param {String} name Name of the prop to check.
   * @returns {Boolean} True if the prop is ignored, false if not.
   */
  function isIgnored(name) {
    return ignored.indexOf(name) !== -1;
  }

  /**
   * Internal: Checks if the prop is declared
   * @param {Object} declaredPropTypes Description of propTypes declared in the current component
   * @param {String[]} keyList Dot separated name of the prop to check.
   * @returns {Boolean} True if the prop is declared, false if not.
   */
  function internalIsDeclaredInComponent(declaredPropTypes, keyList) {
    for (let i = 0, j = keyList.length; i < j; i++) {
      const key = keyList[i];
      const propType = (
        declaredPropTypes && (
          // Check if this key is declared
          (declaredPropTypes[key] || // If not, check if this type accepts any key
          declaredPropTypes.__ANY_KEY__) // eslint-disable-line no-underscore-dangle
        )
      );

      if (!propType) {
        // If it's a computed property, we can't make any further analysis, but is valid
        return key === '__COMPUTED_PROP__';
      }
      if (typeof propType === 'object' && !propType.type) {
        return true;
      }
      // Consider every children as declared
      if (propType.children === true || propType.containsSpread) {
        return true;
      }
      if (propType.acceptedProperties) {
        return key in propType.acceptedProperties;
      }
      if (propType.type === 'union') {
        // If we fall in this case, we know there is at least one complex type in the union
        if (i + 1 >= j) {
          // this is the last key, accept everything
          return true;
        }
        // non trivial, check all of them
        const unionTypes = propType.children;
        const unionPropType = {};
        for (let k = 0, z = unionTypes.length; k < z; k++) {
          unionPropType[key] = unionTypes[k];
          const isValid = internalIsDeclaredInComponent(
            unionPropType,
            keyList.slice(i)
          );
          if (isValid) {
            return true;
          }
        }

        // every possible union were invalid
        return false;
      }
      declaredPropTypes = propType.children;
    }
    return true;
  }

  /**
   * Checks if the prop is declared
   * @param {ASTNode} node The AST node being checked.
   * @param {String[]} names List of names of the prop to check.
   * @returns {Boolean} True if the prop is declared, false if not.
   */
  function isDeclaredInComponent(node, names) {
    while (node) {
      const component = components.get(node);

      const isDeclared = component && component.confidence === 2 &&
        internalIsDeclaredInComponent(component.declaredPropTypes || {}, names);
      if (isDeclared) {
        return true;
      }
      node = node.parent;
    }
    return false;
  }

  return (component) => {
    const undeclareds = (component.usedPropTypes || []).filter(propType => (
      propType.node &&
      !isIgnored(propType.allNames[0]) &&
      !isDeclaredInComponent(component.node, propType.allNames)
    ));
    undeclareds.forEach((propType) => {
      context.report({
        node: propType.node,
        message: MISSING_MESSAGE,
        data: {
          name: propType.allNames.join('.').replace(/\.__COMPUTED_PROP__/g, '[]')
        }
      });
    });
  }
}

module.exports.createReportUnusedPropTypes = (context, components, configuration) => {
  const UNUSED_MESSAGE = '\'{{name}}\' PropType is defined but prop is never used';

  function isPropUsed(node, prop) {
    const usedPropTypes = node.usedPropTypes || [];
    for (let i = 0, l = usedPropTypes.length; i < l; i++) {
      const usedProp = usedPropTypes[i];
      if (
        prop.type === 'shape' ||
        prop.name === '__ANY_KEY__' ||
        usedProp.name === prop.name
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Used to recursively loop through each declared prop type
   * @param {Object} component The component to process
   * @param {ASTNode[]|true} props List of props to validate
   */
  function reportUnusedPropType(component, props) {
    // Skip props that check instances
    if (props === true) {
      return;
    }

    Object.keys(props || {}).forEach((key) => {
      const prop = props[key];
      // Skip props that check instances
      if (prop === true) {
        return;
      }

      if (prop.type === 'shape' && configuration.skipShapeProps) {
        return;
      }

      if (prop.node && !isPropUsed(component, prop)) {
        context.report({
          node: prop.node.value || prop.node,
          message: UNUSED_MESSAGE,
          data: {
            name: prop.fullName
          }
        });
      }

      if (prop.children) {
        reportUnusedPropType(component, prop.children);
      }
    });
  }

  return (component) => {
    reportUnusedPropType(component, component.declaredPropTypes);
  }
}
