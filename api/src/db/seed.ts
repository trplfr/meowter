import { drizzle } from 'drizzle-orm/node-postgres'
import { sql, inArray } from 'drizzle-orm'
import { Pool } from 'pg'
import bcrypt from 'bcrypt'

import * as schema from './schema'

const { cats, meows, meowTags, likes, follows, comments, notifications } = schema

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

const seedCats: SeedCat[] = [
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
    username: 'barsik',
    email: 'barsik@meowter.ru',
    displayName: 'Барсик',
    firstName: 'Дмитрий',
    lastName: 'Мурлыкин',
    bio: 'Полосатый кот с характером. Фотографирую закаты и ем сметану',
    contacts: 't.me/barsik_photo',
    sex: 'MALE'
  },
  {
    username: 'pushok',
    email: 'pushok@meowter.ru',
    displayName: 'Пушок',
    firstName: 'Елена',
    lastName: 'Шерстякова',
    bio: 'Пушистая облачко. Обожаю книги и теплые пледы',
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
    username: 'vasiliy',
    email: 'vasiliy@meowter.ru',
    displayName: 'Василий',
    firstName: 'Иван',
    lastName: 'Лапкин',
    bio: 'Серьезный кот. Программирую и пью кофе литрами',
    contacts: 'github.com/vasiliy-cat',
    sex: 'MALE'
  },
  {
    username: 'klyaksa',
    email: 'klyaksa@meowter.ru',
    displayName: 'Клякса',
    firstName: 'Ольга',
    lastName: 'Пятнышкина',
    bio: 'Черно-белая кошка-художница. Рисую лапами и хвостом',
    contacts: null,
    sex: 'FEMALE'
  },
  {
    username: 'simba',
    email: 'simba@meowter.ru',
    displayName: 'Симба',
    firstName: 'Артем',
    lastName: 'Гривов',
    bio: 'Будущий лев. Слушаю рок и занимаюсь спортом',
    contacts: 'simba@meowter.ru',
    sex: 'MALE'
  },
  {
    username: 'luna_cat',
    email: 'luna@meowter.ru',
    displayName: 'Луна',
    firstName: 'Мария',
    lastName: 'Ночкина',
    bio: 'Ночная кошка. Люблю астрономию и поздние прогулки',
    contacts: 't.me/luna_stars',
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

// каждый массив = мяуканья одного кота, 3-5 штук
// теги в правильных падежных формах (стеммер нормализует)
const seedMeows: string[][] = [
  [
    'Сегодня целый день слушал ~музыку и наконец-то нашел новый жанр для себя',
    'Прочитал статью про ~архитектуру модернизма, теперь хочу съездить в Барселону',
    'Гулял по парку и думал о ~философии жизни. Кошки знают что-то, чего не знают люди',
    'Отличный ~кофе под ~книгу = идеальный вечер'
  ],
  [
    'Снял потрясающую ~фотографию заката с крыши соседнего дома',
    'Посмотрел документалку про ~космос, удивительно как мало мы знаем',
    'Сегодня попробовал новую технику в ~фотографии с длинной выдержкой, результат огонь',
    'Нашел классное место для ~путешествий на следующее лето, еду в Грузию'
  ],
  [
    'Дочитала ~книгу Мураками, не могу остановиться, начинаю следующую',
    'Уютный вечер с ~кофе и пледом, за окном дождь, счастье',
    'Открыла для себя ~музыку джаза, теперь слушаю Колтрейна каждый вечер',
    'Рекомендую всем ~книги "Маленький принц", перечитала в пятый раз',
    'Попробовала новый сорт ~кофе из Эфиопии, невероятный аромат'
  ],
  [
    'Забрался на крышу 25-этажки, вид на город = ~путешествие по джунглям',
    'Сегодня пробежал 10 км, ~спорт = лучший антидепрессант',
    'Нашел крутой маршрут для ~путешествий по Карелии, рекомендую',
    'Утренняя тренировка по ~спорту и потом завтрак на крыше, идеальное утро'
  ],
  [
    'Новая коллекция в ~моде весна-лето просто восхитительна',
    'Переделала комнату в стиле ~архитектуры минимализма, наконец-то порядок',
    'Увидела потрясающий аутфит, ~мода повсюду вдохновляет',
    'Сходила на выставку современного ~искусства в Третьяковку, впечатлена',
    'Сочетание ~моды и ~архитектуры в новом ТЦ = произведение искусства'
  ],
  [
    'Написал свой первый бот для Telegram, ~программирование за вечер',
    'Без ~кофе не могу начать утро, это уже ритуал',
    'Попробовал новый фреймворк, ~программирование вдохновляет',
    'Автоматизировал рутину через ~программирование на работе, свободен после обеда',
    'Идеальный стек: ~программирование на TypeScript и ~кофе каждые два часа'
  ],
  [
    'Нарисовала портрет соседского кота, ~искусство рождается из наблюдения',
    'Сходила на выставку ~фотографий в галерее, вдохновилась на новый проект',
    'Попробовала снять короткометражку на телефон, ~кино получилось атмосферным'
  ],
  [
    'Сегодня качал лапы в зале, ~спорт = жизнь',
    'Послушал новый альбом Rammstein, ~музыка которая заряжает',
    'Пробежал полумарафон! ~спортом заряжаешься на все остальное',
    'Посмотрел ~кино "Бойцовский клуб" в десятый раз, каждый раз нахожу что-то новое',
    'Купил новые кроссовки для ~спорта, теперь точно побью рекорд'
  ],
  [
    'Наблюдала Юпитер в телескоп, ~космос завораживает каждый раз',
    'Прочитала статью про ~технологии квантовых компьютеров, будущее уже здесь',
    'Сфотографировала Млечный Путь за городом, ~космос прекрасен',
    'Интересная лекция про ~технологии искусственного интеллекта, много вопросов'
  ],
  [
    'Попробовал новый рецепт ~пиццы с четырьмя сырами, невероятно вкусно',
    'Нашел ресторан с лучшей ~пиццей в городе, рекомендую на Покровке',
    'Приготовил тайский суп том-ям, ~кулинария удалась идеально',
    'Гастрономический тур по Италии = ~путешествие мечты всей жизни',
    'Сочетание ~кулинарии и ~путешествий = мой способ познавать мир'
  ]
]

const seedComments: string[] = [
  'Мур, отличный пост!',
  'Как интересно, расскажи подробнее!',
  'Полностью согласен, мяу!',
  'Тоже хочу попробовать!',
  'Классная фотка!',
  'Завидую, я так не умею',
  'Подписался, жду продолжения',
  'Мяу-мяу, красота!',
  'Это точно, лапки вверх!',
  'Надо будет тоже так сделать',
  'Вау, невероятно!',
  'Круто, продолжай!',
  'Лучший пост за неделю',
  'А где это находится?',
  'Хочу так же, мур!'
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
  const seedUsernames = seedCats.map((c) => c.username)
  const existingSeedCats = await db
    .select({ id: cats.id })
    .from(cats)
    .where(inArray(cats.username, seedUsernames))

  if (existingSeedCats.length > 0) {
    const ids = existingSeedCats.map((c) => c.id)

    // notifications может не существовать если миграция не применена
    await db.execute(sql`
      DELETE FROM notifications
      WHERE actor_id = ANY(${ids}::uuid[]) OR user_id = ANY(${ids}::uuid[])
    `).catch(() => {})

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
      seedCats.map((cat) => ({
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

  // создаем мяуканья
  const allInsertedMeows: { id: string; authorId: string; authorIndex: number }[] = []

  for (let i = 0; i < insertedCats.length; i++) {
    const cat = insertedCats[i]
    const catMeows = seedMeows[i]

    const inserted = await db
      .insert(meows)
      .values(
        catMeows.map((content) => ({
          authorId: cat.id,
          content
        }))
      )
      .returning({ id: meows.id })

    // создаем теги для каждого мяуканья (stem считается через PostgreSQL)
    for (let j = 0; j < inserted.length; j++) {
      const tags = parseTildes(catMeows[j])
      if (tags.length > 0) {
        await db.insert(meowTags).values(
          tags.map((t) => ({
            meowId: inserted[j].id,
            tag: t.tag,
            stem: sql`stem_tag(${t.tag})`,
            position: t.position
          }))
        )
      }

      allInsertedMeows.push({
        id: inserted[j].id,
        authorId: cat.id,
        authorIndex: i
      })
    }
  }

  console.log(`Создано ${allInsertedMeows.length} мяуканий`)

  // создаем комментарии: каждый кот оставляет 1-2 комментария на чужие мяуканья
  let commentCount = 0

  for (const cat of insertedCats) {
    const otherMeows = allInsertedMeows.filter((m) => m.authorId !== cat.id)
    const toComment = pickN(otherMeows, 1, 2)

    for (const meow of toComment) {
      await db.insert(comments).values({
        meowId: meow.id,
        authorId: cat.id,
        content: pick(seedComments)
      })
      commentCount++
    }
  }

  console.log(`Создано ${commentCount} комментариев`)

  // создаем лайки: каждый кот лайкает 2-4 чужих мяуканья
  let likeCount = 0
  const likeSet = new Set<string>()

  for (const cat of insertedCats) {
    const otherMeows = allInsertedMeows.filter((m) => m.authorId !== cat.id)
    const toLike = pickN(otherMeows, 2, 4)

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

  // создаем подписки: каждый кот подписывается на 2-4 других
  let followCount = 0
  const followSet = new Set<string>()

  for (const cat of insertedCats) {
    const others = insertedCats.filter((c) => c.id !== cat.id)
    const toFollow = pickN(others, 2, 4)

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

  // нотификации для @new (Valentine C.) = реальный юзер в базе
  const [realUser] = await db
    .select({ id: cats.id, username: cats.username })
    .from(cats)
    .where(sql`${cats.username} = 'new'`)

  if (realUser) {
    // находим мяуты @new
    const realUserMeows = await db
      .select({ id: meows.id })
      .from(meows)
      .where(sql`${meows.authorId} = ${realUser.id}`)

    const notifActors = pickN(insertedCats, 4, 6)
    let notifCount = 0

    for (const actor of notifActors) {
      // подписка
      await db.insert(follows).values({
        followerId: actor.id,
        followingId: realUser.id
      }).onConflictDoNothing()

      // нотификация о подписке
      await db.insert(notifications).values({
        userId: realUser.id,
        actorId: actor.id,
        type: 'FOLLOW'
      })
      notifCount++

      // лайкаем 1-2 мяута
      const toLikeMeows = pickN(realUserMeows, 1, Math.min(2, realUserMeows.length))

      for (const meow of toLikeMeows) {
        await db.insert(likes).values({
          userId: actor.id,
          meowId: meow.id
        }).onConflictDoNothing()

        await db.insert(notifications).values({
          userId: realUser.id,
          actorId: actor.id,
          type: 'MEOW_LIKE',
          meowId: meow.id
        })
        notifCount++
      }
    }

    console.log(`Создано ${notifCount} нотификаций для @${realUser.username}`)
  } else {
    console.log('Пользователь @new не найден в базе, нотификации не созданы')
  }

  console.log('Сидирование завершено!')

  await pool.end()
}

seed().catch((err) => {
  console.error('Ошибка сидирования:', err)
  process.exit(1)
})
