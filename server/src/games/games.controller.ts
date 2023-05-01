import { Controller, Get, HttpException, Param, Query } from '@nestjs/common';
import { GamesService } from './games.service';
import { AxiosError } from 'axios';
import { catchError } from 'rxjs';
import { filterQueryDTO, getOne, getOneOffset, search } from './dto/games.dto';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Get('/find/:id')
  findOne(@Param() params: getOne) {
    return this.gamesService.findOneById(parseInt(params.id)).pipe(
      catchError((err: AxiosError) => {
        throw new HttpException(
          { message: err.message, err },
          err.response.status,
        );
      }),
    );
  }

  @Get('/offset/:offset')
  findByOffset(@Param() params: getOneOffset, @Query() query?: filterQueryDTO) {
    return this.gamesService
      .findOneByOffset(parseInt(params.offset), query)
      .pipe(
        catchError((err: AxiosError) => {
          throw new HttpException(
            { message: err.message, err },
            err.response.status,
          );
        }),
      );
  }

  @Get('/search/:search')
  findBySearch(@Param() params: search, @Query() query?: filterQueryDTO) {
    return this.gamesService.findBySearch(params.search, query).pipe(
      catchError((err: AxiosError) => {
        throw new HttpException(
          { message: err.message, err },
          err.response.status,
        );
      }),
    );
  }

  @Get('/count')
  howMany(@Query() query: filterQueryDTO) {
    return this.gamesService.findHowManyWithFilter({ ...query }).pipe(
      catchError((err: AxiosError) => {
        throw new HttpException(
          { message: err.message, err },
          err.response.status,
        );
      }),
    );
  }
}
