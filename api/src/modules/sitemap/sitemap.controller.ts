import { Controller, Get, Header, Req } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { type FastifyRequest } from 'fastify'

import { SitemapService } from './sitemap.service'

@ApiTags('Sitemap')
@Controller()
export class SitemapController {
  constructor(private readonly sitemapService: SitemapService) {}

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: 'Get XML sitemap' })
  @ApiResponse({ status: 200, description: 'XML sitemap' })
  async getSitemap(@Req() req: FastifyRequest): Promise<string> {
    const host = req.headers.host || 'meowter.app'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const baseUrl = `${protocol}://${host}`

    return this.sitemapService.generateSitemap(baseUrl)
  }
}
