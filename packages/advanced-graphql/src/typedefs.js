const gql = require('graphql-tag')

module.exports = gql`
  directive @authenticated on FIELD_DEFINITION
  directive @authorized(role: Role! = ADMIN) on FIELD_DEFINITION
  directive @formatDate(format: String = "Ppp") on FIELD_DEFINITION
  directive @log(message: String = "Default Logger") on FIELD_DEFINITION

  enum Theme {
    DARK
    LIGHT
  }

  enum Role {
    ADMIN
    MEMBER
    GUEST
  }

  type User {
    id: ID! @log(message: "User Logger")
    email: String!
    avatar: String!
    verified: Boolean!
    createdAt: String! @formatDate
    posts: [Post]!
    role: Role! @authorized
    settings: Settings!
  }

  type AuthUser {
    token: String!
    user: User!
  }

  type Post {
    id: ID!
    message: String!
    author: User!
    createdAt: String! @formatDate(format: "PPpp")
    likes: Int!
    views: Int!
  }

  type Settings {
    id: ID!
    user: User!
    theme: Theme!
    emailNotifications: Boolean!
    pushNotifications: Boolean!
  }

  type Invite {
    email: String!
    from: User!
    createdAt: String! @formatDate
    role: Role!
  }

  input NewPostInput {
    message: String!
  }

  input UpdateSettingsInput {
    theme: Theme
    emailNotifications: Boolean
    pushNotifications: Boolean
  }

  input UpdateUserInput {
    email: String
    avatar: String
    verified: Boolean
  }

  input InviteInput {
    email: String!
    role: Role!
  }

  input SignupInput {
    email: String!
    password: String!
    role: Role!
  }

  input SigninInput {
    email: String!
    password: String!
  }

  input NewPostSubscriptionInput {
    author: String!
  }

  type Query {
    me: User! @authenticated
    posts: [Post]!
    post(id: ID!): Post!
    userSettings: Settings!
    feed: [Post]!
  }

  type Mutation {
    updateSettings(input: UpdateSettingsInput!): Settings!
    createPost(input: NewPostInput!): Post!
    updateMe(input: UpdateUserInput!): User
    invite(input: InviteInput!): Invite! @authenticated @authorized
    signup(input: SignupInput!): AuthUser!
    signin(input: SigninInput!): AuthUser!
  }

  type Subscription {
    newPost(input: NewPostSubscriptionInput!): Post!
  }
`
