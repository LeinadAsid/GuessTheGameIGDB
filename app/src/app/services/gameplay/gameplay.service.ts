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

  private gameData: gameData[] = [
    {
      cover:
        'https://cdn.mobygames.com/06225314-e118-11ed-9572-02420a000157.webp',
      genres: ['Zombie', 'Action', 'FPS'],

      title: 'Dead Island 2',

      year: 2023,
    },

    {
      cover:
        'https://cdn.mobygames.com/f8f7cc6a-aba1-11ed-8b6f-02420a00019c.webp',
      genres: ['Sidescroller', 'Action', 'Robots'],

      title: 'Megaman X6',

      year: 2001,
    },

    {
      cover:
        'https://cdn.mobygames.com/covers/4130110-super-street-fighter-ii-genesis-front-cover.jpg',
      genres: ['2D Fighter'],

      title: 'Super Street Fighter II',

      year: 1993,
    },

    {
      cover:
        'https://cdn.mobygames.com/covers/5326229-fallout-3-windows-front-cover.jpg',
      genres: ['Post apocalyptic', 'FPS', 'RPG'],
      title: 'Fallout 3',
      year: 2008,
    },

    {
      cover:
        'https://cdn.mobygames.com/covers/5477662-the-elder-scrolls-v-skyrim-windows-front-cover.jpg',
      genres: ['Fantasy', 'RPG'],
      title: 'The Elder Scrolls V: Skyrim',
      year: 2011,
    },

    {
      cover:
        'https://cdn.mobygames.com/covers/4298102-super-smash-bros-ultimate-nintendo-switch-front-cover.jpg',
      title: 'Super Smash Bros. Ultimate',
      year: 2018,
      genres: ['Platform', 'Fighter', '2D'],
    },

    {
      cover:
        'https://cdn.mobygames.com/covers/6296552-portal-2-windows-front-cover.jpg',
      title: 'Portal 2',
      year: 2011,
      genres: ['Puzzle', 'FPS'],
    },
  ];

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

  getAllGames() {
    return from([this.gameData]);
  }

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
