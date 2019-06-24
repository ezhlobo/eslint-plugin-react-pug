function goThroughReferences(context, references, callback) {
  references.forEach((ref) => {
    const usage = ref.identifier && ref.identifier.parent

    if (usage && usage.type === 'MemberExpression' && usage.object === ref.identifier) {
      callback(ref.identifier.name)
    }

    if (usage && usage.type === 'VariableDeclarator' && usage.init === ref.identifier) {
      if (usage.id.type === 'Identifier') {
        callback(usage.id.name)

        const nestedVariables = context.getDeclaredVariables(usage)
          .find(item => item.name === usage.id.name)

        if (nestedVariables && nestedVariables.references) {
          goThroughReferences(
            context,
            nestedVariables.references.filter(item => item.identifier !== usage.id),
            callback,
          )
        }
      }

      if (usage.id.type === 'ObjectPattern') {
        usage.id.properties.forEach((property) => {
          if (property.type === 'Property') {
            callback(property.key.name)
          } else if (property.type === 'RestElement') {
            callback(property.argument.name)

            const nestedVariables = context.getDeclaredVariables(usage)
              .find(item => item.name === property.argument.name)

            if (nestedVariables && nestedVariables.references) {
              goThroughReferences(context, nestedVariables.references, callback)
            }
          }
        })
      }
    }
  })
}

module.exports = (context, component) => {
  const names = []

  const firstArgument = component.node.params[0]
  const declaredVariables = context.getDeclaredVariables(component.node)

  const push = item => names.push(item)

  if (firstArgument && firstArgument.type === 'Identifier') {
    // `getDeclaredVariables` executed for FunctionDeclaration returns
    // function name as the first argument, so we should skip it to get
    // props declaration
    const propsRefDeclarationIndex = component.node.type === 'FunctionDeclaration' ? 1 : 0

    const propsRefDeclaration = declaredVariables[propsRefDeclarationIndex]

    push(propsRefDeclaration.name)
    goThroughReferences(context, propsRefDeclaration.references, push)
  } else if (firstArgument && firstArgument.type === 'ObjectPattern') {
    const restElement = firstArgument.properties.find(property => property.type === 'RestElement')

    if (restElement) {
      push(restElement.argument.name)

      const restPropsDeclaration = declaredVariables
        .find(item => item.name === restElement.argument.name)

      if (restPropsDeclaration && restPropsDeclaration.references) {
        goThroughReferences(context, restPropsDeclaration.references, push)
      }
    }
  }

  return names
}
