import { IsIn, IsNumberString, IsString, ValidateIf } from 'class-validator';
import { condition } from '../interfaces/games.interface';
import { conditions } from '../constants/game.constants';

export class filterQueryDTO {
  @ValidateIf(
    (x) =>
      x.condition !== undefined || x.fieldName || x.parameter !== undefined,
  )
  @IsString()
  fieldName?: string;

  @ValidateIf(
    (x) =>
      x.condition || x.fieldName !== undefined || x.parameter !== undefined,
  )
  @IsIn(conditions)
  condition?: condition;

  @ValidateIf(
    (x) =>
      x.condition !== undefined || x.fieldName !== undefined || x.parameter,
  )
  @IsString()
  parameter?: string;
}

export class getOne {
  @IsNumberString()
  id: string;
}

export class search {
  @IsString()
  search: string;
}

export class getOneOffset {
  @IsNumberString()
  offset: string;
}
