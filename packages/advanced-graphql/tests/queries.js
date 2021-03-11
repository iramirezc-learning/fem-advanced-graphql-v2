const gql = require('graphql-tag')

exports.FEED = gql`
  {
    feed {
      id
      message
      createdAt
      likes
      views
    }
  }
`

exports.ME = gql`
  {
    me {
      id
      email
      avatar
      verified
      createdAt
      role
      settings {
        theme
        pushNotifications
        emailNotifications
      }
    }
  }
`

exports.UPDATE_SETTINGS = gql`
  mutation UpdateSettings($input: UpdateSettingsInput!) {
    updateSettings(input: $input) {
      id
      user {
        id
        email
      }
      theme
      emailNotifications
      pushNotifications
    }
  }
`
