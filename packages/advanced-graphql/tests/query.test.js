const createTestServer = require('./helper')
const { FEED, ME } = require('./queries')

const mockUser = {
  id: 1,
  email: 'user@example.com',
  avatar: 'http://placeholder.com',
  verified: true,
  createdAt: new Date(2021, 2, 11).getTime(),
  role: 'MEMBER'
}

describe('queries', () => {
  test('feed', async () => {
    const { query } = createTestServer({
      user: mockUser,
      models: {
        Post: {
          findMany: jest.fn(() => [
            {
              id: 1,
              message: 'hello',
              createdAt: 12345839,
              likes: 20,
              views: 300
            }
          ])
        }
      }
    })

    const res = await query({ query: FEED })
    expect(res).toMatchSnapshot()
  })

  test('me', async () => {
    const { query } = createTestServer({
      user: mockUser,
      models: {
        Settings: {
          findOne: jest.fn(() => ({
            theme: 'DARK',
            emailNotifications: true,
            pushNotifications: false
          }))
        }
      }
    })

    const res = await query({ query: ME })
    expect(res).toMatchSnapshot()
  })
})
