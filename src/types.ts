export interface User {
  id: number
  username: string
  created_at: string
}

export interface Memo {
  id: number
  title: string
  content: string
  is_public: boolean
  owner_id: number
  created_at: string
  updated_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}
