import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  GameCover,
  GameCoverSizes,
  gameData,
} from 'src/app/interfaces/gameData.interface';
import { FormsModule } from '@angular/forms';
import { GameplayService } from 'src/app/services/gameplay/gameplay.service';
import { environment } from 'src/environments/environment';
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  of,
  switchMap,
  take,
} from 'rxjs';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { GameDataService } from 'src/app/services/game-data/game-data.service';

@Component({
  selector: 'app-main-game',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxSkeletonLoaderModule],
  templateUrl: './main-game.component.html',
  styleUrls: ['./main-game.component.scss'],
})
export class MainGameComponent implements OnInit {
  gamePlayService = inject(GameplayService);
  gameDataService = inject(GameDataService);

  guessedGame: string = '';

  guessedGameBehavior$ = new BehaviorSubject<string>('');

  guessedGameWithDebounce$ = this.guessedGameBehavior$.pipe(
    debounceTime(300),
    distinctUntilChanged()
  );

  listOfPossibleGames$ = this.guessedGameWithDebounce$.pipe(
    switchMap((guess) => {
      if (!guess) {
        return of([]);
      }
      return this.gameDataService
        .getResultsBySearch(guess)
        .pipe(catchError((err) => of([])));
    })
  );

  ngOnInit(): void {
    this.listOfPossibleGames$.subscribe((val) => console.log(val));
  }

  handleGuess() {
    this.gamePlayService
      .isGuessCorrect(this.guessedGame)
      .pipe(take(1))
      .subscribe((result) => {
        if (result === null) {
          return;
        }

        if (result) {
          this.gamePlayService.progress();
          this.guessedGame = '';
        } else {
          this.gamePlayService.lost();
          this.guessedGame = '';
        }
      });
  }

  reset() {
    this.gamePlayService.reset();
  }

  getGameImage<T extends GameCoverSizes>(cover: GameCover, size: T) {
    return environment.imageURL
      .replace('{size}', size)
      .replace('{hash}', cover.image_id);
  }
}
