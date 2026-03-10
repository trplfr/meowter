import { Inject, Injectable } from '@nestjs/common'
import { desc, isNull } from 'drizzle-orm'

import { DB, type Db } from '../../db/db.module'
import { cats, meows } from '../../db/schema'

interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: string
  priority?: string
}

@Injectable()
export class SitemapService {
  constructor(@Inject(DB) private readonly db: Db) {}

  async generateSitemap(baseUrl: string): Promise<string> {
    const urls: SitemapUrl[] = [
      { loc: baseUrl, changefreq: 'daily', priority: '1.0' },
      { loc: `${baseUrl}/login`, changefreq: 'monthly', priority: '0.3' },
      { loc: `${baseUrl}/register`, changefreq: 'monthly', priority: '0.5' }
    ]

    // профили котов
    const catRows = await this.db
      .select({
        username: cats.username,
        updatedAt: cats.updatedAt
      })
      .from(cats)
      .where(isNull(cats.deletedAt))
      .orderBy(desc(cats.updatedAt))

    for (const cat of catRows) {
      urls.push({
        loc: `${baseUrl}/cat/${cat.username}`,
        lastmod: cat.updatedAt.toISOString().split('T')[0],
        changefreq: 'daily',
        priority: '0.8'
      })
    }

    // публичные мяуты
    const meowRows = await this.db
      .select({
        id: meows.id,
        updatedAt: meows.updatedAt
      })
      .from(meows)
      .where(isNull(meows.deletedAt))
      .orderBy(desc(meows.updatedAt))
      .limit(5000)

    for (const meow of meowRows) {
      urls.push({
        loc: `${baseUrl}/meow/${meow.id}`,
        lastmod: meow.updatedAt.toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.6'
      })
    }

    return this.buildXml(urls)
  }

  private buildXml(urls: SitemapUrl[]): string {
    const entries = urls
      .map(url => {
        let entry = `  <url>\n    <loc>${this.escapeXml(url.loc)}</loc>`

        if (url.lastmod) {
          entry += `\n    <lastmod>${url.lastmod}</lastmod>`
        }

        if (url.changefreq) {
          entry += `\n    <changefreq>${url.changefreq}</changefreq>`
        }

        if (url.priority) {
          entry += `\n    <priority>${url.priority}</priority>`
        }

        entry += '\n  </url>'
        return entry
      })
      .join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }
}
