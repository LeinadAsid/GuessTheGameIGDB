export interface gameData {
  cover: string,
  title: string,
  genres: string[],
  year: number,
}

export interface Gamecount {
  count: number;
}

export interface GameSearch {
  id: number,
  name: string,
}

export interface GameDetails {
  id: number,
  cover: GameCover,
  name: string;
}


export interface GameCover {
  id: number,
  image_id: string,
}

export type GameCoverSizes = 'cover_small' | 'screenshot_med' | 'cover_big' | 'logo_med' | 'screenshot_big' | 'screenshot_huge' | 'thumb' | 'micro' | '720p' | '1080p';
