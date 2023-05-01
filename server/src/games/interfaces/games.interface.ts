export interface GameAuth {
  access_token?: string;
  expires_in?: number;
  issued_at?: number;
  token_type?: string;
  client_id?: string;
}

export interface filterQuery {
  fieldName?: string;
  condition?: condition;
  parameter?: string;
}

export type condition = '>' | '<' | '=';
