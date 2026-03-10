import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'

import { TopicsService } from './topics.service'

@ApiTags('Topics')
@Controller('topics')
export class TopicsController {
  constructor(private readonly topics: TopicsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Текущая тема недели' })
  @ApiResponse({ status: 200, description: 'Тема недели или null' })
  async getCurrentTopic() {
    return this.topics.getCurrentTopic()
  }
}
