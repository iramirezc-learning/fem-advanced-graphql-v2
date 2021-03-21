const { SchemaDirectiveVisitor } = require('apollo-server')
const { defaultFieldResolver, GraphQLString } = require('graphql')
const { formatDate } = require('./utils')

class LogDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    // Use current resolver or the default resolver
    const resolver = field.resolve || defaultFieldResolver

    // Declaration of the new query argument.
    // Query example: me { id(message: "Hello") }
    field.args.push({
      type: GraphQLString,
      name: 'message'
    })

    // Wrapper for the resolver function
    field.resolve = (root, args, ctx, info) => {
      /**
       * These `args` come from the query at field level,
       * example when querying:
       *   me {
       *     id(message: "Hello from Query")
       *   }
       * the logging output will be exactly: "Hello from Query"
       */
      const { message, ...rest } = args

      /**
       * The `this.args` points to the args given at schema level.
       * If type is:
       *   type User {
       *     id: ID! @log(message: "User Logger")
       *     ...
       *   }
       * then, when querying:
       *   me {
       *     id
       *   }
       * the logging output will be: "User Logger".
       *
       * If type is:
       *   type User {
       *     id: ID! @log
       *     ...
       *   }
       * and the directives default argument is: "Default Logger"
       * when querying:
       *   me {
       *     id
       *   }
       * the logging output will be: "Default Logger".
       */
      const { message: schemaMessage } = this.args

      // Actual core implementation for the @log directive.
      console.log(`[${message || schemaMessage}] requested object: `, { root })

      return resolver.call(this, root, rest, ctx, info)
    }
  }
}

class FormatDateDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver

    field.args.push({
      type: GraphQLString,
      name: 'format'
    })

    field.resolve = (root, { format, ...restArgs }, ctx, info) => {
      const { createdAt, ...restRoot } = root

      if (createdAt) {
        const { format: formatSchema } = this.args
        restRoot.createdAt = formatDate(createdAt, format || formatSchema)
      }

      return resolver.call(this, restRoot, restArgs, ctx, info)
    }
  }
}

module.exports = {
  LogDirective,
  FormatDateDirective
}
