const { PubSub, withFilter } = require('apollo-server')
const { authenticated, authorized } = require('./auth')
const { NEW_POST_EVENT } = require('./events')

const pubSub = new PubSub()

/**
 * Anything Query / Mutation resolver
 * using a user for a DB query
 * requires user authentication
 */
module.exports = {
  Query: {
    // using @authenticated directive
    me: (_, __, { user }) => {
      return user
    },
    posts: authenticated((_, __, { user, models }) => {
      return models.Post.findMany({ author: user.id })
    }),
    post: authenticated((_, { id }, { user, models }) => {
      return models.Post.findOne({ id, author: user.id })
    }),
    userSettings: authenticated((_, __, { user, models }) => {
      return models.Settings.findOne({ user: user.id })
    }),
    // public resolver
    feed(_, __, { models }) {
      return models.Post.findMany()
    }
  },
  Mutation: {
    updateSettings: authenticated((_, { input }, { user, models }) => {
      return models.Settings.updateOne({ user: user.id }, input)
    }),
    createPost: authenticated((_, { input }, { user, models }) => {
      const post = models.Post.createOne({
        ...input,
        author: user.id,
        likes: 0,
        views: 0
      })

      pubSub.publish(NEW_POST_EVENT, { newPost: post })

      return post
    }),
    updateMe: authenticated((_, { input }, { user, models }) => {
      return models.User.updateOne({ id: user.id }, input)
    }),
    // using @authenticated & @authorized directives
    invite: (_, { input }, { user }) => {
      return {
        from: {
          ...user
        },
        role: input.role,
        createdAt: Date.now(),
        email: input.email
      }
    },
    signup(_, { input }, { models, createToken }) {
      const existing = models.User.findOne({ email: input.email })

      if (existing) {
        throw new Error('nope')
      }
      const user = models.User.createOne({
        ...input,
        verified: false,
        avatar: 'http'
      })
      const token = createToken(user)
      return { token, user }
    },
    signin(_, { input }, { models, createToken }) {
      const user = models.User.findOne(input)

      if (!user) {
        throw new Error('nope')
      }

      const token = createToken(user)
      return { token, user }
    }
  },
  Subscription: {
    newPost: {
      subscribe: authenticated(
        withFilter(
          () => pubSub.asyncIterator(NEW_POST_EVENT),
          (payload, variables) => {
            return payload.newPost.author === variables.input.author
          }
        )
      )
    }
  },
  User: {
    posts(root, _, { user, models }) {
      if (root.id !== user.id) {
        throw new Error('nope')
      }

      return models.Post.findMany({ author: root.id })
    },
    settings(_, __, { user, models }) {
      return models.Settings.findOne({ user: user.id })
    }
  },
  Settings: {
    user(settings, _, { models }) {
      return models.User.findOne({ id: settings.user })
    }
  },
  Post: {
    author(post, _, { models }) {
      return models.User.findOne({ id: post.author })
    }
  }
}
