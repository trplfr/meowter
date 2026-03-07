import { type RouteInstance } from 'atomic-router'

export interface RouteConfig {
  path: string
  route: RouteInstance<any>
}

// TODO: заменить на dto из @shared когда будут контракты API
export interface CatProfileParams {
  username: string
}

export interface MeowThreadParams {
  username: string
  meowId: string
}
