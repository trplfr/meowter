import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
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
  private logger = new Logger('MeowsController')

  constructor(private meowsService: MeowsService) {}

  @Get()
  getMeows(
    @Query(ValidationPipe) filterDTO: GetMeowsFilterDTO,
    @GetUser() user: User
  ): Promise<Meow[]> {
    this.logger.verbose(
      `User '${user.login}' retrieving all meows. Filters: ${JSON.stringify(
        filterDTO
      )}'`
    )

    return this.meowsService.getMeows(filterDTO, user)
  }

  @Get('/:id')
  getMeowById(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User
  ): Promise<Meow> {
    this.logger.verbose(`User '${user.login}' retrieving meow with id: ${id}`)

    return this.meowsService.getMeowById(id, user)
  }

  @Post()
  @UsePipes(ValidationPipe)
  createMeow(
    @Body() createMeowDTO: CreateMeowDTO,
    @GetUser() user: User
  ): Promise<Meow> {
    this.logger.verbose(`User '${user.login}' creating a new meow`)

    return this.meowsService.createMeow(createMeowDTO, user)
  }

  @Delete('/:id')
  deleteMeow(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User
  ): Promise<void> {
    this.logger.verbose(`User '${user.login}' deleted meow with id: ${id}`)

    return this.meowsService.deleteMeow(id, user)
  }
}
