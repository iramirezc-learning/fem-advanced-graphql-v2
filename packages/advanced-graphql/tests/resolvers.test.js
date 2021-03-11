const resolvers = require('../src/resolvers')

describe('resolvers', () => {
  test('post', async () => {
    const user = { id: 1 }
    const post = {
      id: 10,
      message: 'Hello',
      author: user.id,
      createdAt: Date.now(),
      likes: 0,
      views: 0
    }
    const spyFindOne = jest.fn(() => post)

    const result = resolvers.Query.post(
      null,
      { id: 10 },
      {
        user,
        models: {
          Post: {
            findOne: spyFindOne
          }
        }
      }
    )

    expect(spyFindOne).toHaveBeenCalledTimes(1)
    expect(spyFindOne).toHaveBeenCalledWith({ id: post.id, author: user.id })
    expect(result).toEqual(post)
  })
})
