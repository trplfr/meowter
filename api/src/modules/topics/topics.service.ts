import { Inject, Injectable } from '@nestjs/common'
import { like } from 'drizzle-orm'

import { DB, type Db } from '../../db/db.module'
import { appSettings } from '../../db/schema'

export interface WeeklyTopic {
  tags: {
    ru: string
    en: string
  }
}

@Injectable()
export class TopicsService {
  constructor(@Inject(DB) private readonly db: Db) {}

  async getCurrentTopic(): Promise<WeeklyTopic | null> {
    const rows = await this.db
      .select({
        key: appSettings.key,
        value: appSettings.value
      })
      .from(appSettings)
      .where(like(appSettings.key, 'topic_of_week%'))

    const settings = new Map(rows.map(r => [r.key, r.value]))
    const tagRu = settings.get('topic_of_week_ru')

    if (!tagRu) {
      return null
    }

    return {
      tags: {
        ru: tagRu,
        en: settings.get('topic_of_week_en') ?? tagRu
      }
    }
  }
}
