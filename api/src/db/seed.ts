import { drizzle } from 'drizzle-orm/node-postgres'
import { sql, inArray } from 'drizzle-orm'
import { Pool } from 'pg'
import bcrypt from 'bcrypt'

import * as schema from './schema'

const {
  cats,
  meows,
  meowTags,
  likes,
  follows,
  comments,
  notifications,
  appSettings
} = schema

/* Tilde tag parser */

const parseTildes = (content: string): { tag: string; position: number }[] => {
  const regex = /~([\w\u0400-\u04FFёЁ]+)/g
  const result: { tag: string; position: number }[] = []
  let match: RegExpExecArray | null

  while ((match = regex.exec(content)) !== null) {
    result.push({
      tag: match[1],
      position: match.index
    })
  }

  return result
}

/* Helpers */

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

const pickN = <T>(arr: T[], min: number, max: number): T[] => {
  const count = min + Math.floor(Math.random() * (max - min + 1))
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// дата N дней назад + случайные часы/минуты
const daysAgo = (days: number, hoursOffset = 0) => {
  const ms =
    Date.now() -
    days * 24 * 60 * 60 * 1000 -
    hoursOffset * 60 * 60 * 1000 -
    Math.floor(Math.random() * 60) * 60 * 1000
  return new Date(ms)
}

/* Seed data */

const PASSWORD = 'meow123'
const SALT_ROUNDS = 10

interface SeedCat {
  username: string
  email: string
  displayName: string
  firstName: string
  lastName: string
  bio: string
  contacts: string | null
  sex: 'MALE' | 'FEMALE'
}

/* 5 русских котов */

const ruCats: SeedCat[] = [
  {
    username: 'murzik',
    email: 'murzik@meowter.ru',
    displayName: 'Мурзик',
    firstName: 'Алексей',
    lastName: 'Котов',
    bio: 'Рыжий кот-философ. Люблю лежать на подоконнике и наблюдать за миром',
    contacts: 'murzik@meowter.ru',
    sex: 'MALE'
  },
  {
    username: 'pushok',
    email: 'pushok@meowter.ru',
    displayName: 'Пушок',
    firstName: 'Елена',
    lastName: 'Шерстякова',
    bio: 'Пушистое облачко. Обожаю книги и теплые пледы',
    contacts: null,
    sex: 'FEMALE'
  },
  {
    username: 'ryzhik',
    email: 'ryzhik@meowter.ru',
    displayName: 'Рыжик',
    firstName: 'Максим',
    lastName: 'Усатов',
    bio: 'Рыжий и дерзкий. Путешествую по крышам и пишу об этом',
    contacts: 'ryzhik.blog',
    sex: 'MALE'
  },
  {
    username: 'snezhinka',
    email: 'snezhinka@meowter.ru',
    displayName: 'Снежинка',
    firstName: 'Анна',
    lastName: 'Белякова',
    bio: 'Белоснежная кошечка. Увлекаюсь модой и дизайном интерьеров',
    contacts: 't.me/snezhinka_style',
    sex: 'FEMALE'
  },
  {
    username: 'kompot',
    email: 'kompot@meowter.ru',
    displayName: 'Компот',
    firstName: 'Сергей',
    lastName: 'Вкусняшкин',
    bio: 'Толстый рыжий кот-гурман. Знаю все рестораны в городе',
    contacts: 'kompot.food',
    sex: 'MALE'
  }
]

/* 5 английских котов */

const enCats: SeedCat[] = [
  {
    username: 'whiskers',
    email: 'whiskers@meowter.app',
    displayName: 'Whiskers',
    firstName: 'James',
    lastName: 'Purrston',
    bio: 'Curious cat. Love exploring rooftops and writing about tech',
    contacts: 'whiskers@meowter.app',
    sex: 'MALE'
  },
  {
    username: 'mittens',
    email: 'mittens@meowter.app',
    displayName: 'Mittens',
    firstName: 'Sophie',
    lastName: 'Fluffington',
    bio: 'Cozy cat with big dreams. Books, tea, and rainy days',
    contacts: null,
    sex: 'FEMALE'
  },
  {
    username: 'shadow',
    email: 'shadow@meowter.app',
    displayName: 'Shadow',
    firstName: 'Alex',
    lastName: 'Nightpaw',
    bio: 'Stealthy cat. Into photography and night walks',
    contacts: 't.me/shadow_photo',
    sex: 'MALE'
  },
  {
    username: 'luna_cat',
    email: 'luna@meowter.app',
    displayName: 'Luna',
    firstName: 'Maria',
    lastName: 'Starwhisker',
    bio: 'Night cat. Astronomy nerd and stargazer',
    contacts: 'luna.stars',
    sex: 'FEMALE'
  },
  {
    username: 'ginger',
    email: 'ginger@meowter.app',
    displayName: 'Ginger',
    firstName: 'Tom',
    lastName: 'Pawsworth',
    bio: 'Adventurous ginger cat. Cooking, hiking, and good vibes',
    contacts: 'ginger@meowter.app',
    sex: 'MALE'
  }
]

const seedCats: SeedCat[] = [...ruCats, ...enCats]

/* Мяуты: каждый кот говорит на свою тему + все говорят про кофе/coffee */

interface SeedMeow {
  content: string
  daysAgo: number
  hoursOffset: number
}

// murzik: философия, музыка, кофе
const murzikMeows: SeedMeow[] = [
  { content: 'Сегодня сидел на подоконнике и думал про ~философию счастья. Кошки точно знают секрет', daysAgo: 5, hoursOffset: 2 },
  { content: 'Послушал новый альбом Radiohead, ~музыка для размышлений идеальна', daysAgo: 4, hoursOffset: 5 },
  { content: 'Утренний ~кофе на подоконнике, за окном дождь. Моменты ради которых стоит просыпаться', daysAgo: 3, hoursOffset: 1 },
  { content: 'Прочитал Ницше, теперь смотрю на мир по-другому. ~философия меняет все', daysAgo: 2, hoursOffset: 8 },
  { content: 'Нашел кофейню где варят ~кофе на песке. Вкус невероятный, как будто в Стамбуле', daysAgo: 1, hoursOffset: 3 },
  { content: 'Вечерний джаз и ~музыка Колтрейна, лучшее завершение дня', daysAgo: 0, hoursOffset: 6 }
]

// pushok: книги, уют, кофе
const pushokMeows: SeedMeow[] = [
  { content: 'Дочитала ~книгу Мураками "Норвежский лес", не могу остановиться плакать', daysAgo: 5, hoursOffset: 7 },
  { content: 'Уютный вечер: плед, свечи и горячий ~кофе. Что ещё нужно для счастья?', daysAgo: 4, hoursOffset: 1 },
  { content: 'Начала ~книгу "Маленький принц" в пятый раз. Каждый раз нахожу что-то новое', daysAgo: 3, hoursOffset: 4 },
  { content: 'Попробовала новый сорт ~кофе из Эфиопии. Цветочные ноты, невероятно', daysAgo: 2, hoursOffset: 2 },
  { content: 'Собрала ~книги в стопку на прикроватной тумбочке. Счастье измеряется в непрочитанных страницах', daysAgo: 1, hoursOffset: 9 },
  { content: 'Дождливое утро, горячий ~кофе и новая ~книга. Идеальный выходной', daysAgo: 0, hoursOffset: 3 },
  { content: 'Рекомендую всем ~книгу "Стоик" Драйзера, мощная история', daysAgo: 0, hoursOffset: 8 }
]

// ryzhik: путешествия, спорт, кофе
const ryzhikMeows: SeedMeow[] = [
  { content: 'Забрался на крышу 25-этажки, вид на закат = лучшее ~путешествие без билета', daysAgo: 4, hoursOffset: 6 },
  { content: 'Пробежал 10 км по набережной, ~спорт после дождя = кайф', daysAgo: 3, hoursOffset: 2 },
  { content: 'Взял ~кофе навынос и пошел гулять по старому городу. Лучший способ узнать место', daysAgo: 3, hoursOffset: 8 },
  { content: 'Нашел крутой маршрут для ~путешествий по Карелии, еду на выходных', daysAgo: 2, hoursOffset: 4 },
  { content: 'Утренняя тренировка, ~спорт = лучший антидепрессант. Потом ~кофе и день начался', daysAgo: 1, hoursOffset: 1 },
  { content: 'Вернулся из ~путешествия по Грузии. Горы, вино, хачапури. Рекомендую', daysAgo: 0, hoursOffset: 5 }
]

// snezhinka: мода, дизайн, кофе
const snezhinkaMeows: SeedMeow[] = [
  { content: 'Новая коллекция в ~моде весна-лето просто восхитительна, особенно пастельные тона', daysAgo: 5, hoursOffset: 3 },
  { content: 'Переделала комнату в стиле ~дизайн минимализма. Наконец-то порядок и воздух', daysAgo: 4, hoursOffset: 7 },
  { content: 'Сходила на выставку современного ~искусства, вдохновилась на новый проект', daysAgo: 3, hoursOffset: 5 },
  { content: 'Пью ~кофе в новой кофейне с потрясающим ~дизайном интерьера. Хочу так же дома', daysAgo: 2, hoursOffset: 2 },
  { content: 'Сочетание ~моды и архитектуры в новом ТЦ = произведение ~искусства', daysAgo: 1, hoursOffset: 6 },
  { content: '~кофе с миндальным молоком стал моим утренним ритуалом. Мелочи делают день', daysAgo: 0, hoursOffset: 1 },
  { content: 'Нашла потрясающий аутфит, ~мода вдохновляет каждый день', daysAgo: 0, hoursOffset: 9 }
]

// kompot: еда, кулинария, кофе
const kompotMeows: SeedMeow[] = [
  { content: 'Приготовил пасту карбонара по оригинальному рецепту, ~кулинария = терапия', daysAgo: 5, hoursOffset: 4 },
  { content: 'Нашел ресторан с лучшей ~пиццей в городе. Четыре сыра, тонкое тесто, мур', daysAgo: 4, hoursOffset: 2 },
  { content: 'Попробовал ~кофе со специями по-мароккански. Кардамон и корица = магия', daysAgo: 3, hoursOffset: 6 },
  { content: 'Гастрономический тур по Италии = ~путешествие мечты. Планирую на осень', daysAgo: 2, hoursOffset: 3 },
  { content: 'Приготовил тайский суп том-ям, ~кулинария из ЮВА = отдельный вид искусства', daysAgo: 1, hoursOffset: 7 },
  { content: 'Утро без ~кофе = не утро. Сегодня пробую новую кофемолку, помол решает', daysAgo: 1, hoursOffset: 1 },
  { content: 'Сочетание ~кулинарии и ~путешествий = мой способ познавать мир и себя', daysAgo: 0, hoursOffset: 4 }
]

// whiskers: tech, coding, coffee
const whiskersMeows: SeedMeow[] = [
  { content: 'Just deployed my first app with ~typescript and it feels amazing', daysAgo: 5, hoursOffset: 3 },
  { content: 'Morning ~coffee and a good IDE. The perfect start to any coding session', daysAgo: 4, hoursOffset: 1 },
  { content: 'Been exploring ~rust lately, the borrow checker is strict but fair', daysAgo: 3, hoursOffset: 5 },
  { content: 'Hot take: ~coffee is the real programming language. Without it nothing compiles', daysAgo: 2, hoursOffset: 2 },
  { content: 'Finally fixed that ~typescript generic issue that haunted me for days', daysAgo: 1, hoursOffset: 7 },
  { content: 'Two cups of ~coffee in and the code is flowing. Productive morning', daysAgo: 0, hoursOffset: 3 }
]

// mittens: books, cozy, coffee
const mittensMeows: SeedMeow[] = [
  { content: 'Finished reading "Norwegian Wood" by Murakami. My heart is full of ~books', daysAgo: 5, hoursOffset: 8 },
  { content: 'Rainy day + warm blanket + hot ~coffee = perfection. No notes', daysAgo: 4, hoursOffset: 2 },
  { content: 'Started a new ~book by Donna Tartt. "The Secret History" is gripping', daysAgo: 3, hoursOffset: 6 },
  { content: 'Tried a new Ethiopian blend today. ~coffee with floral notes is divine', daysAgo: 2, hoursOffset: 1 },
  { content: 'My ~books stack keeps growing. 12 unread and counting. No regrets', daysAgo: 1, hoursOffset: 4 },
  { content: 'Sunday morning ritual: fresh ~coffee, croissant, and a good ~book by the window', daysAgo: 0, hoursOffset: 2 },
  { content: 'Anyone else re-read ~books they loved as a child? "Matilda" still hits different', daysAgo: 0, hoursOffset: 9 }
]

// shadow: photography, night, coffee
const shadowMeows: SeedMeow[] = [
  { content: 'Captured the city skyline at midnight. ~photography at night is pure magic', daysAgo: 4, hoursOffset: 10 },
  { content: 'Late night ~coffee at a 24h diner. The vibe is unmatched', daysAgo: 3, hoursOffset: 11 },
  { content: 'Tried long exposure ~photography for the first time. Light trails everywhere', daysAgo: 3, hoursOffset: 3 },
  { content: 'Found a hidden rooftop spot. ~coffee and city lights at 2am. My kind of evening', daysAgo: 2, hoursOffset: 8 },
  { content: 'New lens arrived. Time to up my ~photography game this weekend', daysAgo: 1, hoursOffset: 5 },
  { content: 'Black ~coffee, black outfit, black camera. Consistency is key', daysAgo: 0, hoursOffset: 7 }
]

// luna_cat: astronomy, science, coffee
const lunaMeows: SeedMeow[] = [
  { content: 'Spotted Jupiter through my telescope last night. ~astronomy never gets old', daysAgo: 5, hoursOffset: 9 },
  { content: 'Read about quantum computing today. ~science is moving so fast', daysAgo: 4, hoursOffset: 4 },
  { content: 'Late night ~coffee while waiting for the meteor shower. Worth every minute', daysAgo: 3, hoursOffset: 10 },
  { content: 'Photographed the Milky Way outside the city. ~astronomy is best away from light pollution', daysAgo: 2, hoursOffset: 7 },
  { content: 'Fascinating lecture on AI and ~science ethics today. So many questions', daysAgo: 1, hoursOffset: 3 },
  { content: 'Morning ~coffee and a documentary about black holes. My brain is expanding', daysAgo: 0, hoursOffset: 1 },
  { content: '~astronomy fact: there are more stars in the universe than grains of sand on Earth', daysAgo: 0, hoursOffset: 6 }
]

// ginger: cooking, hiking, coffee
const gingerMeows: SeedMeow[] = [
  { content: 'Made the perfect sourdough bread today. ~cooking is an art and a science', daysAgo: 5, hoursOffset: 5 },
  { content: 'Morning ~coffee before a 15km ~hiking trail. Fuel for the adventure', daysAgo: 4, hoursOffset: 1 },
  { content: 'Discovered a waterfall on today\'s ~hiking trip. Nature never disappoints', daysAgo: 3, hoursOffset: 4 },
  { content: 'Tried brewing ~coffee over a campfire. Smoky and perfect', daysAgo: 2, hoursOffset: 6 },
  { content: 'Cooked a full Thai dinner from scratch. ~cooking Thai food is next level', daysAgo: 1, hoursOffset: 3 },
  { content: 'The best ~coffee I ever had was at a tiny cafe on a mountain trail. Simple and strong', daysAgo: 0, hoursOffset: 2 }
]

const allCatMeows: SeedMeow[][] = [
  murzikMeows,
  pushokMeows,
  ryzhikMeows,
  snezhinkaMeows,
  kompotMeows,
  whiskersMeows,
  mittensMeows,
  shadowMeows,
  lunaMeows,
  gingerMeows
]

/* Комментарии */

const ruComments: string[] = [
  'Мур, отличный пост!',
  'Как интересно, расскажи подробнее!',
  'Полностью согласен, мяу!',
  'Тоже хочу попробовать!',
  'Красота, мур-мур!',
  'Завидую, я так не умею',
  'Подписался, жду продолжения',
  'Мяу-мяу, это точно!',
  'Лапки вверх, поддерживаю!',
  'Надо будет тоже так сделать',
  'Вау, невероятно!',
  'Круто, продолжай!',
  'Лучший пост за неделю',
  'А где это находится?',
  'Хочу так же!'
]

// комменты с меншнами (AUTHOR заменяется на юзернейм автора поста)
const ruMentionComments: string[] = [
  '@AUTHOR мур, отличный пост!',
  '@AUTHOR а расскажи подробнее?',
  '@AUTHOR полностью согласен!',
  '@AUTHOR вау, круто!',
  '@AUTHOR надо будет тоже попробовать'
]

const enComments: string[] = [
  'Love this, meow!',
  'So relatable!',
  'Totally agree!',
  'Need to try this!',
  'Amazing shot!',
  'This is the way',
  'Subscribed, want more!',
  'Purrfect post!',
  'Same here!',
  'Couldn\'t agree more',
  'Wow, incredible!',
  'Keep it up!',
  'Best post this week',
  'Where is this?',
  'Goals right here!'
]

const enMentionComments: string[] = [
  '@AUTHOR love this, meow!',
  '@AUTHOR tell me more!',
  '@AUTHOR totally agree!',
  '@AUTHOR wow, amazing!',
  '@AUTHOR need to try this too'
]

/* Main seed function */

const seed = async () => {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('DATABASE_URL не задан. Укажите переменную окружения')
    process.exit(1)
  }

  const pool = new Pool({ connectionString: databaseUrl })
  const db = drizzle(pool, { schema })

  console.log('Начинаю сидирование...')

  // удаляем старые сидовые данные
  const seedUsernames = seedCats.map(c => c.username)
  const existingSeedCats = await db
    .select({ id: cats.id })
    .from(cats)
    .where(inArray(cats.username, seedUsernames))

  if (existingSeedCats.length > 0) {
    const ids = existingSeedCats.map(c => c.id)

    await db
      .execute(
        sql`
      DELETE FROM notifications
      WHERE actor_id = ANY(${ids}::uuid[]) OR user_id = ANY(${ids}::uuid[])
    `
      )
      .catch(() => {})

    await db.delete(comments).where(inArray(comments.authorId, ids))
    await db.delete(likes).where(inArray(likes.userId, ids))
    await db.delete(follows).where(inArray(follows.followerId, ids))
    await db.delete(follows).where(inArray(follows.followingId, ids))
    await db.delete(meows).where(inArray(meows.authorId, ids))
    await db.delete(cats).where(inArray(cats.id, ids))
    console.log(`Удалено ${existingSeedCats.length} старых сидовых котов`)
  }

  // хешируем пароль один раз
  const passwordHash = await bcrypt.hash(PASSWORD, SALT_ROUNDS)

  // создаем котов
  const insertedCats = await db
    .insert(cats)
    .values(
      seedCats.map(cat => ({
        username: cat.username,
        email: cat.email,
        passwordHash,
        displayName: cat.displayName,
        firstName: cat.firstName,
        lastName: cat.lastName,
        bio: cat.bio,
        contacts: cat.contacts,
        sex: cat.sex
      }))
    )
    .returning({ id: cats.id, username: cats.username })

  console.log(`Создано ${insertedCats.length} котов`)

  // русские = первые 5, английские = последние 5
  const ruCatIds = insertedCats.slice(0, 5)
  const enCatIds = insertedCats.slice(5, 10)

  // создаем мяуканья
  interface InsertedMeow {
    id: string
    authorId: string
    catIndex: number
    daysAgo: number
    isRu: boolean
  }

  const allInsertedMeows: InsertedMeow[] = []

  for (let i = 0; i < insertedCats.length; i++) {
    const cat = insertedCats[i]
    const catMeows = allCatMeows[i]

    for (const meowData of catMeows) {
      const createdAt = daysAgo(meowData.daysAgo, meowData.hoursOffset)

      const [inserted] = await db
        .insert(meows)
        .values({
          authorId: cat.id,
          content: meowData.content,
          createdAt,
          updatedAt: createdAt
        })
        .returning({ id: meows.id })

      const tags = parseTildes(meowData.content)
      if (tags.length > 0) {
        await db.insert(meowTags).values(
          tags.map(t => ({
            meowId: inserted.id,
            tag: t.tag,
            stem: sql`stem_tag(${t.tag})`,
            position: t.position
          }))
        )
      }

      allInsertedMeows.push({
        id: inserted.id,
        authorId: cat.id,
        catIndex: i,
        daysAgo: meowData.daysAgo,
        isRu: i < 5
      })
    }
  }

  console.log(`Создано ${allInsertedMeows.length} мяуканий`)

  // ремяуты: каждый кот ремяутит 1-2 поста из своей языковой группы
  let remeowCount = 0

  for (let i = 0; i < insertedCats.length; i++) {
    const cat = insertedCats[i]
    const isRu = i < 5
    const sameGroupMeows = allInsertedMeows.filter(
      m => m.authorId !== cat.id && m.isRu === isRu
    )
    const toRemeow = pickN(sameGroupMeows, 1, 2)

    for (const original of toRemeow) {
      const createdAt = daysAgo(
        Math.max(0, original.daysAgo - 1),
        Math.floor(Math.random() * 8)
      )

      await db
        .insert(meows)
        .values({
          authorId: cat.id,
          content: '',
          remeowOfId: original.id,
          createdAt,
          updatedAt: createdAt
        })

      remeowCount++
    }
  }

  console.log(`Создано ${remeowCount} ремяутов`)

  // реплаи: каждый 2й кот отвечает на 1-2 чужих мяута из своей группы
  const ruReplies: string[] = [
    'Полностью поддерживаю! Сам давно так думаю, мур',
    'О да, ~кофе утром = залог хорошего дня',
    'Интересная мысль, надо бы попробовать',
    'Согласен на все сто! У меня похожий опыт',
    'Мур, как красиво сказано'
  ]

  const enReplies: string[] = [
    'Totally agree! Been thinking the same, meow',
    'Oh yes, morning ~coffee is everything',
    'Interesting take, need to try this',
    'Couldn\'t have said it better myself!',
    'Meow, beautifully put'
  ]

  let replyCount = 0

  for (let i = 0; i < insertedCats.length; i += 2) {
    const cat = insertedCats[i]
    const isRu = i < 5
    const sameGroupMeows = allInsertedMeows.filter(
      m => m.authorId !== cat.id && m.isRu === isRu
    )
    const toReply = pickN(sameGroupMeows, 1, 2)
    const replies = isRu ? ruReplies : enReplies

    for (const original of toReply) {
      const createdAt = daysAgo(
        Math.max(0, original.daysAgo - 1),
        Math.floor(Math.random() * 6)
      )
      const replyContent = pick(replies)

      const [reply] = await db
        .insert(meows)
        .values({
          authorId: cat.id,
          content: replyContent,
          replyToId: original.id,
          createdAt,
          updatedAt: createdAt
        })
        .returning({ id: meows.id })

      const tags = parseTildes(replyContent)
      if (tags.length > 0) {
        await db.insert(meowTags).values(
          tags.map(t => ({
            meowId: reply.id,
            tag: t.tag,
            stem: sql`stem_tag(${t.tag})`,
            position: t.position
          }))
        )
      }

      replyCount++
    }
  }

  console.log(`Создано ${replyCount} реплаев`)

  // комментарии: каждый кот оставляет 3-5 комментариев на чужие мяуты
  // ~30% комментов содержат @меншн автора поста
  let commentCount = 0

  // маппинг authorId -> username для меншнов
  const catUsernameMap = new Map(insertedCats.map(c => [c.id, c.username]))

  for (let i = 0; i < insertedCats.length; i++) {
    const cat = insertedCats[i]
    const isRu = i < 5
    const otherMeows = allInsertedMeows.filter(m => m.authorId !== cat.id)
    const toComment = pickN(otherMeows, 3, 5)

    for (const meow of toComment) {
      const createdAt = daysAgo(
        Math.max(0, meow.daysAgo),
        Math.floor(Math.random() * 12)
      )

      const useMention = Math.random() < 0.3
      let content: string

      if (useMention) {
        const mentionPool = isRu ? ruMentionComments : enMentionComments
        const authorUsername = catUsernameMap.get(meow.authorId) ?? 'unknown'
        content = pick(mentionPool).replace('AUTHOR', authorUsername)
      } else {
        content = pick(isRu ? ruComments : enComments)
      }

      await db.insert(comments).values({
        meowId: meow.id,
        authorId: cat.id,
        content,
        createdAt
      })
      commentCount++
    }
  }

  console.log(`Создано ${commentCount} комментариев`)

  // лайки: каждый кот лайкает 5-8 чужих мяутов
  let likeCount = 0
  const likeSet = new Set<string>()

  for (const cat of insertedCats) {
    const otherMeows = allInsertedMeows.filter(m => m.authorId !== cat.id)
    const toLike = pickN(otherMeows, 5, 8)

    for (const meow of toLike) {
      const key = `${cat.id}:${meow.id}`
      if (likeSet.has(key)) {
        continue
      }
      likeSet.add(key)

      await db.insert(likes).values({
        userId: cat.id,
        meowId: meow.id
      })
      likeCount++
    }
  }

  console.log(`Создано ${likeCount} лайков`)

  // подписки: каждый кот подписывается на 3-5 других (в своей группе всех, + 1-2 из другой)
  let followCount = 0
  const followSet = new Set<string>()

  for (let i = 0; i < insertedCats.length; i++) {
    const cat = insertedCats[i]
    const isRu = i < 5
    const sameGroup = (isRu ? ruCatIds : enCatIds).filter(c => c.id !== cat.id)
    const otherGroup = isRu ? enCatIds : ruCatIds
    const crossFollow = pickN(otherGroup, 1, 2)
    const toFollow = [...sameGroup, ...crossFollow]

    for (const target of toFollow) {
      const key = `${cat.id}:${target.id}`
      if (followSet.has(key)) {
        continue
      }
      followSet.add(key)

      await db.insert(follows).values({
        followerId: cat.id,
        followingId: target.id
      })
      followCount++
    }
  }

  console.log(`Создано ${followCount} подписок`)

  // нотификации для @trplfr (если существует)
  const [realUser] = await db
    .select({ id: cats.id, username: cats.username })
    .from(cats)
    .where(sql`${cats.username} = 'trplfr'`)

  if (realUser) {
    const realUserMeows = await db
      .select({ id: meows.id })
      .from(meows)
      .where(sql`${meows.authorId} = ${realUser.id}`)

    const notifActors = pickN(insertedCats, 5, 8)
    let notifCount = 0

    for (let ai = 0; ai < notifActors.length; ai++) {
      const actor = notifActors[ai]
      const baseMinutesAgo = 4000 - ai * 400 + Math.floor(Math.random() * 200)
      const baseDays = Math.floor(baseMinutesAgo / (24 * 60))

      // подписка
      await db
        .insert(follows)
        .values({
          followerId: actor.id,
          followingId: realUser.id
        })
        .onConflictDoNothing()

      await db.insert(notifications).values({
        userId: realUser.id,
        actorId: actor.id,
        type: 'FOLLOW',
        createdAt: daysAgo(baseDays, ai * 2)
      })
      notifCount++

      // лайки на мяуты trplfr
      if (realUserMeows.length > 0) {
        const toLikeMeows = pickN(
          realUserMeows,
          1,
          Math.min(2, realUserMeows.length)
        )

        for (const meow of toLikeMeows) {
          await db
            .insert(likes)
            .values({
              userId: actor.id,
              meowId: meow.id
            })
            .onConflictDoNothing()

          await db.insert(notifications).values({
            userId: realUser.id,
            actorId: actor.id,
            type: 'MEOW_LIKE',
            meowId: meow.id,
            createdAt: daysAgo(Math.max(0, baseDays - 1), ai * 3)
          })
          notifCount++
        }
      }

      // ремяут (первые 2 актора)
      if (ai < 2 && realUserMeows.length > 0) {
        const toRemeow = pick(realUserMeows)
        const createdAt = daysAgo(Math.max(0, baseDays - 1), 6 + ai * 2)

        await db
          .insert(meows)
          .values({
            authorId: actor.id,
            content: '',
            remeowOfId: toRemeow.id,
            createdAt,
            updatedAt: createdAt
          })

        await db.insert(notifications).values({
          userId: realUser.id,
          actorId: actor.id,
          type: 'REMEOW',
          meowId: toRemeow.id,
          createdAt
        })
        notifCount++
      }

      // реплай (3й и 4й актор)
      if ((ai === 2 || ai === 3) && realUserMeows.length > 0) {
        const toReplyTo = pick(realUserMeows)
        const isRu = ai < 5
        const replyContent = isRu
          ? pick(ruReplies)
          : pick(enReplies)
        const createdAt = daysAgo(Math.max(0, baseDays - 1), 8 + ai)

        const [reply] = await db
          .insert(meows)
          .values({
            authorId: actor.id,
            content: replyContent,
            replyToId: toReplyTo.id,
            createdAt,
            updatedAt: createdAt
          })
          .returning({ id: meows.id })

        const tags = parseTildes(replyContent)
        if (tags.length > 0) {
          await db.insert(meowTags).values(
            tags.map(t => ({
              meowId: reply.id,
              tag: t.tag,
              stem: sql`stem_tag(${t.tag})`,
              position: t.position
            }))
          )
        }

        await db.insert(notifications).values({
          userId: realUser.id,
          actorId: actor.id,
          type: 'REPLY',
          meowId: reply.id,
          createdAt
        })
        notifCount++
      }

      // комментарий с @trplfr меншном (5й+ актор)
      if (ai >= 4 && realUserMeows.length > 0) {
        const toCommentOn = pick(realUserMeows)
        const createdAt = daysAgo(Math.max(0, baseDays), 10 + ai)
        const isRu = ai < 5
        const mentionContent = pick(
          isRu ? ruMentionComments : enMentionComments
        ).replace('AUTHOR', realUser.username)

        await db.insert(comments).values({
          meowId: toCommentOn.id,
          authorId: actor.id,
          content: mentionContent,
          createdAt
        })
      }
    }

    // меншны @trplfr в комментах на ЧУЖИЕ мяуты (3-4 штуки)
    const mentionActors = pickN(insertedCats, 3, 4)
    for (const actor of mentionActors) {
      const otherMeows = allInsertedMeows.filter(
        m => m.authorId !== realUser.id
      )
      const targetMeow = pick(otherMeows)
      const isRu = ruCatIds.some(c => c.id === actor.id)
      const mentionTexts = isRu
        ? [
            `@${realUser.username} смотри что пишут, мур!`,
            `@${realUser.username} тебе бы понравилось`,
            `@${realUser.username} как думаешь?`
          ]
        : [
            `@${realUser.username} check this out!`,
            `@${realUser.username} you would love this`,
            `@${realUser.username} what do you think?`
          ]
      const createdAt = daysAgo(
        Math.max(0, targetMeow.daysAgo),
        Math.floor(Math.random() * 10)
      )

      const [mentionComment] = await db
        .insert(comments)
        .values({
          meowId: targetMeow.id,
          authorId: actor.id,
          content: pick(mentionTexts),
          createdAt
        })
        .returning({ id: comments.id })

      await db.insert(notifications).values({
        userId: realUser.id,
        actorId: actor.id,
        type: 'MENTION',
        meowId: targetMeow.id,
        commentId: mentionComment.id,
        createdAt
      })
      notifCount++
    }

    console.log(`Создано ${notifCount} нотификаций для @${realUser.username}`)
  } else {
    console.log('Пользователь @trplfr не найден, нотификации пропущены')
  }

  // тема недели: кофе / coffee
  await db
    .insert(appSettings)
    .values([
      { key: 'topic_of_week_ru', value: 'кофе' },
      { key: 'topic_of_week_en', value: 'coffee' }
    ])
    .onConflictDoNothing()

  // обновляем если уже есть
  await db
    .execute(sql`
      UPDATE app_settings SET value = 'кофе' WHERE key = 'topic_of_week_ru';
      UPDATE app_settings SET value = 'coffee' WHERE key = 'topic_of_week_en';
    `)

  console.log('Тема недели: ~кофе / ~coffee')

  console.log('Сидирование завершено!')

  await pool.end()
}

seed().catch(err => {
  console.error('Ошибка сидирования:', err)
  process.exit(1)
})
