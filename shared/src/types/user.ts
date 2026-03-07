export interface User {
  id: string
  username: string
  displayName: string
  firstName: string | null
  lastName: string | null
  email: string
  bio: string | null
  contacts: string | null
  avatarUrl: string | null
  createdAt: string
}
