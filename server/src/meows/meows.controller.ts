import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'

import { MeowsService } from './meows.service'
import { Meow } from './meow.model'

import { CreateMeowDTO } from './dto/create-meow.dto'

@Controller('meows')
export class MeowsController {
  constructor(private meowsService: MeowsService) {}

  @Get()
  getAllMeows(): Meow[] {
    return this.meowsService.getAllMeows()
  }

  @Get('/:id')
  getMeowById(@Param('id') id: string) {
    return this.meowsService.getMeowById(id)
  }

  @Post()
  createMeow(@Body() createMeowDTO: CreateMeowDTO): Meow {
    return this.meowsService.createMeow(createMeowDTO)
  }

  @Delete('/:id')
  deleteMeow(@Param('id') id: string) {
    return this.meowsService.deleteMeow(id)
  }
}
