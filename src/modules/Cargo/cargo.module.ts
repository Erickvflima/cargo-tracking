import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CargoEntity } from './entities/cargo.entity';
import { CargoController } from './cargo.controller';
import { CargoService } from './cargo.service';

@Module({
  imports: [TypeOrmModule.forFeature([CargoEntity])],
  controllers: [CargoController],
  providers: [CargoService],
})
export class CargoModule {}
