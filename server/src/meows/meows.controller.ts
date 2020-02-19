import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'

import { MeowsService } from './meows.service'

import { CreateMeowDTO } from './dto/create-meow.dto'
import { GetMeowsFilterDTO } from './dto/get-meows-filter.dto'
import { Meow } from './meow.entity'
import { AuthGuard } from '@nestjs/passport'
import { User } from '../auth/user.entity'
import { GetUser } from '../auth/get-user.decorator'

@Controller('meows')
@UseGuards(AuthGuard())
export class MeowsController {
  constructor(private meowsService: MeowsService) {}

  @Get()
  getMeows(
    @Query(ValidationPipe) filterDTO: GetMeowsFilterDTO,
    @GetUser() user: User
  ): Promise<Meow[]> {
    return this.meowsService.getMeows(filterDTO, user)
  }

  @Get('/:id')
  getMeowById(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User
  ): Promise<Meow> {
    return this.meowsService.getMeowById(id, user)
  }

  @Post()
  @UsePipes(ValidationPipe)
  createMeow(
    @Body() createMeowDTO: CreateMeowDTO,
    @GetUser() user: User
  ): Promise<Meow> {
    return this.meowsService.createMeow(createMeowDTO, user)
  }

  @Delete('/:id')
  deleteMeow(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User
  ): Promise<void> {
    return this.meowsService.deleteMeow(id, user)
  }
}
