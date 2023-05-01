import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { GameAuth, filterQuery } from './interfaces/games.interface';
import { Observable, concatMap, from, map } from 'rxjs';

@Injectable()
export class GamesService {
  private API = 'https://api.igdb.com/v4';
  private CLIENT_ID = process.env['CLIENT_ID'];

  constructor(
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private getTwitchRequestHeaders() {
    const gameAuth$: Observable<GameAuth> = from(
      this.cacheManager.get('game-auth'),
    );

    return gameAuth$.pipe(
      map((auth) => {
        if (auth?.access_token) {
          return {
            headers: {
              'Client-ID': this.CLIENT_ID,
              Authorization: `Bearer ${auth?.access_token}`,
            },
          };
        } else throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }),
    );
  }

  findOneById(id: number) {
    return this.getTwitchRequestHeaders().pipe(
      concatMap((headers) =>
        this.httpService
          .post(
            `${this.API}/games`,
            `fields name,cover.image_id,cover.id; where id = ${id};`,
            headers,
          )
          .pipe(map((res) => res.data)),
      ),
    );
  }

  findHowManyWithFilter(filter: filterQuery) {
    return this.getTwitchRequestHeaders().pipe(
      concatMap((headers) =>
        this.httpService
          .post(
            `${this.API}/games/count`,
            `where ${filter.fieldName} ${filter.condition} ${filter.parameter};`,
            headers,
          )
          .pipe(map((res) => res.data)),
      ),
    );
  }

  findBySearch(search: string, filter?: filterQuery) {
    let query = `search "${search}"; limit 500; fields name;`;

    if (filter && filter.fieldName) {
      query += `where ${filter.fieldName} ${filter.condition} ${filter.parameter};`;
    }

    return this.getTwitchRequestHeaders().pipe(
      concatMap((headers) =>
        this.httpService
          .post(`${this.API}/games`, `${query}`, headers)
          .pipe(map((res) => res.data)),
      ),
    );
  }

  findOneByOffset(offset: number, filter: filterQuery) {
    return this.getTwitchRequestHeaders().pipe(
      concatMap((headers) =>
        this.httpService
          .post(
            `${this.API}/games`,
            `fields name,cover.image_id,cover.id; where ${filter.fieldName} ${filter.condition} ${filter.parameter}; limit 1; offset ${offset};`,
            headers,
          )
          .pipe(map((res) => res.data)),
      ),
    );
  }
}
