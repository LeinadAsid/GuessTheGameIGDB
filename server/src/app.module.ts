import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GamesModule } from './games/games.module';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    GamesModule,
    ConfigModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      ttl: 60 * 1000 * 10, // 10 minutos.
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
