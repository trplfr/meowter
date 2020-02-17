import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'

import { MeowsService } from './meows.service'

import { CreateMeowDTO } from './dto/create-meow.dto'
import { GetMeowsFilterDTO } from './dto/get-meows-filter.dto'
import { Meow } from './meow.entity'

@Controller('meows')
export class MeowsController {
  constructor(private meowsService: MeowsService) {}

  @Get()
  getMeows(
    @Query(ValidationPipe) filterDTO: GetMeowsFilterDTO
  ): Promise<Meow[]> {
    return this.meowsService.getMeows(filterDTO)
  }

  @Get('/:id')
  getMeowById(@Param('id', ParseIntPipe) id: number): Promise<Meow> {
    return this.meowsService.getMeowById(id)
  }

  @Post()
  @UsePipes(ValidationPipe)
  createMeow(@Body() createMeowDTO: CreateMeowDTO): Promise<Meow> {
    return this.meowsService.createMeow(createMeowDTO)
  }

  @Delete('/:id')
  deleteMeow(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.meowsService.deleteMeow(id)
  }
}
