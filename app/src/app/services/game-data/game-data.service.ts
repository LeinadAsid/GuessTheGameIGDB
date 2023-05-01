import { ratingFilter } from './../../constants/game.constants';
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { from, map, shareReplay } from 'rxjs';
import {
  GameDetails,
  GameSearch,
  Gamecount,
  gameData,
} from 'src/app/interfaces/gameData.interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GameDataService {
  _ratingFilter = ratingFilter;

  private http = inject(HttpClient);

  maxId$ = this.getMaxId().pipe(
    map((res) => res.count),
    shareReplay(1)
  );

  constructor() {}

  getMaxId() {
    return this.http.get<Gamecount>(`${environment.apiBaseURL}/count`, {
      params: this._ratingFilter,
    });
  }

  getResultsBySearch(search: string) {
    return this.http.get<GameSearch[]>(
      `${environment.apiBaseURL}/search/${search}`,
      {
        params: this._ratingFilter,
      }
    );
  }

  getSpecificById(id: number) {
    return this.http.get<GameDetails[]>(
      `${environment.apiBaseURL}/find/${id}`,
      {
        params: this._ratingFilter,
      }
    );
  }

  getOneByOffset(offset: number) {
    return this.http.get<GameDetails[]>(
      `${environment.apiBaseURL}/offset/${offset}`,
      {
        params: this._ratingFilter,
      }
    );
  }
}
