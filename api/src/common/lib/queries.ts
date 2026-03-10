import { cats } from '../../db/schema'

// общий select для автора (используется в meows, cats, notifications сервисах)
export const authorSelect = {
  id: cats.id,
  username: cats.username,
  displayName: cats.displayName,
  firstName: cats.firstName,
  lastName: cats.lastName,
  email: cats.email,
  bio: cats.bio,
  contacts: cats.contacts,
  sex: cats.sex,
  avatarUrl: cats.avatarUrl,
  verified: cats.verified,
  createdAt: cats.createdAt
}
