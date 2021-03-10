const { ApolloServer } = require('apollo-server')
const typeDefs = require('./typedefs')
const resolvers = require('./resolvers')
const { createToken, getUserFromToken } = require('./auth')
const db = require('./db')

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context({ req, connection }) {
    if (connection) {
      return { ...connection.context }
    }

    const token = req.headers.authorization
    const user = getUserFromToken(token)

    return { ...db, user, createToken }
  },
  subscriptions: {
    onConnect(params) {
      const token = params.authorization
      const user = getUserFromToken(token)

      return { ...db, user, createToken }
    }
  }
})

server.listen(4000).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})
