const createTestServer = require('./helper')
const { UPDATE_SETTINGS } = require('./queries')

const mockUser = {
  id: 1,
  email: 'user@example.com',
  avatar: 'http://placeholder.com',
  verified: true,
  createdAt: new Date(2021, 2, 11).getTime(),
  role: 'MEMBER'
}

describe('mutations', () => {
  test('updateSettings', async () => {
    const { mutate } = createTestServer({
      user: mockUser,
      models: {
        Settings: {
          updateOne: jest.fn((_, input) => ({
            id: 1,
            ...input
          }))
        },
        User: {
          findOne: jest.fn(() => mockUser)
        }
      }
    })

    const res = await mutate({
      mutation: UPDATE_SETTINGS,
      variables: {
        input: {
          theme: 'DARK',
          emailNotifications: true,
          pushNotifications: true
        }
      }
    })
    expect(res).toMatchSnapshot()
  })
})
