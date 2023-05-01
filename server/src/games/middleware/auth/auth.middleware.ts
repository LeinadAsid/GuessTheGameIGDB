import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { catchError, finalize, map, of, take, tap, throwError } from 'rxjs';
import { GameAuth } from 'src/games/interfaces/games.interface';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly CLIENT_ID = process.env['CLIENT_ID'];
  private readonly CLIENT_SECRET = process.env['SECRET'];

  constructor(
    private httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async use(req: any, res: any, next: (err?) => void) {
    const gameAuth: GameAuth = await this.cacheManager.get('game-auth');

    if (!gameAuth || !this.tokenIsStillValid(gameAuth)) {
      this.getToken()
        .pipe(
          map((val) => val.data as GameAuth),
          take(1),
          catchError((err) => {
            return of(
              new HttpException(
                { message: 'Service Unavailable', err },
                HttpStatus.SERVICE_UNAVAILABLE,
              ),
            );
          }),
          finalize(() => {
            next();
          }),
        )
        .subscribe((credentials) => {
          if (credentials instanceof HttpException) {
            return next(credentials);
          } else {
            credentials ? this.cacheCredentials(credentials) : null;
          }
        });
    } else next();
  }

  private tokenIsStillValid(gameAuth: GameAuth): boolean {
    return (
      (gameAuth?.issued_at * 1000 ?? Date.now()) +
        (gameAuth?.expires_in * 1000 ?? Date.now()) >=
      Date.now()
    );
  }

  private getToken() {
    if (!this.CLIENT_ID || !this.CLIENT_SECRET) {
      throw new Error('No credentials provided');
    }

    return this.httpService.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: this.CLIENT_ID,
        client_secret: this.CLIENT_SECRET,
        grant_type: 'client_credentials',
      },
    });
  }

  private cacheCredentials(credentials: GameAuth) {
    if (
      credentials?.access_token &&
      credentials?.expires_in &&
      credentials?.token_type
    ) {
      this.cacheManager.set(
        'game-auth',
        {
          access_token: credentials.access_token,
          expires_in: credentials.expires_in,
          issued_at: Date.now(),
          token_type: credentials.token_type,
          client_id: this.CLIENT_ID,
        },
        0,
      );
    } else {
      throw throwError(() => new Error('Unable to retrieve auth token'));
    }
  }
}
