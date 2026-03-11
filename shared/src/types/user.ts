export enum Sex {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export interface User {
  id: string
  username: string
  displayName: string
  firstName: string | null
  lastName: string | null
  email: string
  bio: string | null
  contacts: string | null
  sex: Sex | null
  avatarUrl: string | null
  emailVerified: boolean
  verified: boolean
  createdAt: string
}

export interface CatProfile extends User {
  followingCount: number
  followersCount: number
  isFollowing: boolean
  isOwn: boolean
}
