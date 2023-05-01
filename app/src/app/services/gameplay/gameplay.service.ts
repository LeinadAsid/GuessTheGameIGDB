import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  from,
  map,
  of,
  shareReplay,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { gameData } from 'src/app/interfaces/gameData.interface';
import { GameDataService } from '../game-data/game-data.service';

@Injectable({
  providedIn: 'root',
})
export class GameplayService {
  gameDataService = inject(GameDataService);

  private _refreshGame$ = new BehaviorSubject<void>(undefined);


  private _concludedGames = new BehaviorSubject<number[]>([]);

  private _listOfIdsWithoutConcluded = this._concludedGames.pipe(
    switchMap((concludedGames) => {
      return this.gameDataService.maxId$.pipe(
        map((maxId) => {
          const listMaxId = [...Array(maxId).keys()];
          const completedIdSet = new Set(concludedGames);
          return listMaxId.filter((id) => !completedIdSet.has(id));
        })
      );
    })
  );

  randomGame$ = this._refreshGame$.pipe(
    tap((val) => this.loadingGame$.next(true)),
    switchMap((shouldRefresh) => this.getRandomNonConcludedGame()),
    map((game) => game[0]),
    tap((val) => this.loadingGame$.next(false)),
    shareReplay(1)
  );
  streak$ = new BehaviorSubject<number>(0);
  lost$ = new BehaviorSubject<boolean>(false);
  loadingGame$ = new BehaviorSubject<boolean>(false);


  constructor() {}

  generateRandomId() {
    return this._listOfIdsWithoutConcluded.pipe(
      map((list) => Math.floor(Math.random() * list.length))
    );
  }

  getRandomNonConcludedGame() {
    return this.generateRandomId().pipe(
      switchMap((id) => this.gameDataService.getOneByOffset(id))
    );
  }

  reset() {
    this.lost$.next(false);
    this.streak$.next(0);
    this._concludedGames.next([]);
    this._refreshGame$.next();
  }

  progress() {
    this.streak$.next(this.streak$.value + 1);
    this._refreshGame$.next();
  }

  lost() {
    this.lost$.next(true);
  }

  isGuessCorrect(guess: string) {
    return this.gameDataService.getResultsBySearch(guess).pipe(
      map((list) => {
        const foundGame = list.find((game) => game.name === guess);
        return foundGame ? true : false;
      }),

      switchMap((validGuess) => {
        if (validGuess) {
          return this.randomGame$.pipe(map((game) => game.name === guess));
        } else {
          return of(null);
        }
      })
    );
  }
}
