const { SchemaDirectiveVisitor, AuthenticationError } = require('apollo-server')
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
    const { format: defaultFormat } = this.args

    field.args.push({
      type: GraphQLString,
      name: 'format'
    })

    field.resolve = async (root, { format, ...args }, ctx, info) => {
      const result = await resolver.call(this, root, args, ctx, info)
      return formatDate(result, format || defaultFormat)
    }

    field.type = GraphQLString
  }
}

class AuthenticationDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver

    field.resolve = (root, args, ctx, info) => {
      if (!ctx.user) {
        throw new AuthenticationError('Are you logged in?')
      }

      return resolver.call(this, root, args, ctx, info)
    }
  }
}

class AuthorizationDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const resolver = field.resolve || defaultFieldResolver
    const { role } = this.args

    field.resolve = (root, args, ctx, info) => {
      if (ctx && ctx.user && ctx.user.role !== role) {
        // In a real app I wouldn't reveal the current user role
        throw new AuthenticationError(
          `Unauthorized field '${field.name}' for user role: ${ctx.user.role}`
        )
      }

      return resolver.call(this, root, args, ctx, info)
    }
  }
}

module.exports = {
  AuthenticationDirective,
  AuthorizationDirective,
  LogDirective,
  FormatDateDirective
}
