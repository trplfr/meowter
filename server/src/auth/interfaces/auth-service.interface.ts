import { User } from '../../users/user.entity'

export interface ISignIn {
  currentUser: User
  accessToken: string
}
