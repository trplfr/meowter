import { drizzle } from 'drizzle-orm/node-postgres'
import { sql, inArray } from 'drizzle-orm'
import { Pool } from 'pg'
import bcrypt from 'bcrypt'

import * as schema from './schema'

const { cats, meows, meowTags, likes, follows, comments, notifications } =
  schema

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

// смещение во времени: от now - offsetMinutes до now
const timeAgo = (minutesAgo: number) =>
  new Date(Date.now() - minutesAgo * 60 * 1000)

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

// ответы (reply) = мяут со ссылкой на оригинал + собственный ~тег
const seedReplies: string[] = [
  'Полностью поддерживаю! Сам давно увлекаюсь ~музыкой и все это чувствую',
  'О да, ~кофе решает! Особенно утренний',
  'А я вот думаю ~путешествия лучше планировать заранее, спонтанность не для меня',
  'Про ~спорт согласен, после тренировки мир другой',
  'Классная мысль про ~архитектуру, надо бы тоже сходить посмотреть',
  'У меня похожий опыт с ~программированием, это затягивает',
  'Согласна на счет ~книги, перечитаю обязательно',
  'Про ~фотографию интересно, какую камеру используешь?',
  'Солидарна! ~мода = способ выражения себя',
  'Тоже смотрела, ~кино потрясающее'
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

  // создаем мяуканья с разными таймстемпами
  // мяуты разбросаны от 7 дней назад до 5 минут назад
  const allInsertedMeows: {
    id: string
    authorId: string
    authorIndex: number
    minutesAgo: number
  }[] = []
  let minutesCounter = 7 * 24 * 60 // 7 дней

  for (let i = 0; i < insertedCats.length; i++) {
    const cat = insertedCats[i]
    const catMeows = seedMeows[i]

    for (const content of catMeows) {
      // каждый следующий мяут ближе к сегодня (с рандомным шагом)
      minutesCounter -= Math.floor(Math.random() * 200) + 30

      if (minutesCounter < 5) {
        minutesCounter = 5
      }

      const [inserted] = await db
        .insert(meows)
        .values({
          authorId: cat.id,
          content,
          createdAt: timeAgo(minutesCounter),
          updatedAt: timeAgo(minutesCounter)
        })
        .returning({ id: meows.id })

      const tags = parseTildes(content)
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
        authorIndex: i,
        minutesAgo: minutesCounter
      })
    }
  }

  console.log(`Создано ${allInsertedMeows.length} мяуканий`)

  // создаем ремяуты: каждый 2й кот ремяутит 1-2 чужих мяута
  let remeowCount = 0

  for (let i = 0; i < insertedCats.length; i += 2) {
    const cat = insertedCats[i]
    const otherMeows = allInsertedMeows.filter(m => m.authorId !== cat.id)
    const toRemeow = pickN(otherMeows, 1, 2)

    for (const original of toRemeow) {
      // ремяут произошел позже оригинала
      const remeowMinutesAgo = Math.max(
        5,
        original.minutesAgo - Math.floor(Math.random() * 120) - 10
      )

      const [remeow] = await db
        .insert(meows)
        .values({
          authorId: cat.id,
          content: '',
          remeowOfId: original.id,
          createdAt: timeAgo(remeowMinutesAgo),
          updatedAt: timeAgo(remeowMinutesAgo)
        })
        .returning({ id: meows.id })

      allInsertedMeows.push({
        id: remeow.id,
        authorId: cat.id,
        authorIndex: i,
        minutesAgo: remeowMinutesAgo
      })

      remeowCount++
    }
  }

  console.log(`Создано ${remeowCount} ремяутов`)

  // создаем ответы (reply): каждый 3й кот отвечает на 1-2 чужих мяута
  let replyCount = 0

  for (let i = 1; i < insertedCats.length; i += 3) {
    const cat = insertedCats[i]
    // только оригинальные мяуты (не ремяуты)
    const otherOriginalMeows = allInsertedMeows.filter(
      m => m.authorId !== cat.id && allInsertedMeows.find(x => x.id === m.id)
    )
    const toReply = pickN(otherOriginalMeows, 1, 2)

    for (const original of toReply) {
      const replyMinutesAgo = Math.max(
        3,
        original.minutesAgo - Math.floor(Math.random() * 180) - 15
      )
      const replyContent = pick(seedReplies)

      const [reply] = await db
        .insert(meows)
        .values({
          authorId: cat.id,
          content: replyContent,
          replyToId: original.id,
          createdAt: timeAgo(replyMinutesAgo),
          updatedAt: timeAgo(replyMinutesAgo)
        })
        .returning({ id: meows.id })

      // теги для ответа
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

      allInsertedMeows.push({
        id: reply.id,
        authorId: cat.id,
        authorIndex: i,
        minutesAgo: replyMinutesAgo
      })

      replyCount++
    }
  }

  console.log(`Создано ${replyCount} ответов`)

  // создаем комментарии: каждый кот оставляет 1-2 комментария на чужие мяуканья
  let commentCount = 0

  for (const cat of insertedCats) {
    const otherMeows = allInsertedMeows.filter(m => m.authorId !== cat.id)
    const toComment = pickN(otherMeows, 1, 2)

    for (const meow of toComment) {
      const commentMinutesAgo = Math.max(
        1,
        meow.minutesAgo - Math.floor(Math.random() * 60) - 5
      )

      await db.insert(comments).values({
        meowId: meow.id,
        authorId: cat.id,
        content: pick(seedComments),
        createdAt: timeAgo(commentMinutesAgo)
      })
      commentCount++
    }
  }

  console.log(`Создано ${commentCount} комментариев`)

  // создаем лайки: каждый кот лайкает 2-4 чужих мяуканья
  let likeCount = 0
  const likeSet = new Set<string>()

  for (const cat of insertedCats) {
    const otherMeows = allInsertedMeows.filter(m => m.authorId !== cat.id)
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
    const others = insertedCats.filter(c => c.id !== cat.id)
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

  // нотификации для @trplfr
  const [realUser] = await db
    .select({ id: cats.id, username: cats.username })
    .from(cats)
    .where(sql`${cats.username} = 'trplfr'`)

  if (realUser) {
    // находим мяуты @trplfr
    const realUserMeows = await db
      .select({ id: meows.id })
      .from(meows)
      .where(sql`${meows.authorId} = ${realUser.id}`)

    const notifActors = pickN(insertedCats, 5, 8)
    let notifCount = 0

    for (let ai = 0; ai < notifActors.length; ai++) {
      const actor = notifActors[ai]
      // разброс по времени: каждый актор действовал в разное время
      const baseMinutesAgo = 4000 - ai * 400 + Math.floor(Math.random() * 200)

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
        createdAt: timeAgo(baseMinutesAgo)
      })
      notifCount++

      // лайкаем 1-2 мяута trplfr
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
            createdAt: timeAgo(
              baseMinutesAgo - 30 - Math.floor(Math.random() * 60)
            )
          })
          notifCount++
        }
      }

      // ремяут мяута trplfr (первые 2 актора)
      if (ai < 2 && realUserMeows.length > 0) {
        const toRemeow = pick(realUserMeows)
        const remeowMinutesAgo =
          baseMinutesAgo - 60 - Math.floor(Math.random() * 120)

        const [remeow] = await db
          .insert(meows)
          .values({
            authorId: actor.id,
            content: '',
            remeowOfId: toRemeow.id,
            createdAt: timeAgo(Math.max(1, remeowMinutesAgo)),
            updatedAt: timeAgo(Math.max(1, remeowMinutesAgo))
          })
          .returning({ id: meows.id })

        await db.insert(notifications).values({
          userId: realUser.id,
          actorId: actor.id,
          type: 'REMEOW',
          meowId: toRemeow.id,
          createdAt: timeAgo(Math.max(1, remeowMinutesAgo))
        })
        notifCount++

        console.log(`  ${actor.username} ремяутнул мяут trplfr`)
      }

      // ответ на мяут trplfr (3й и 4й актор)
      if ((ai === 2 || ai === 3) && realUserMeows.length > 0) {
        const toReplyTo = pick(realUserMeows)
        const replyMinutesAgo =
          baseMinutesAgo - 90 - Math.floor(Math.random() * 60)
        const replyContent = pick(seedReplies)

        const [reply] = await db
          .insert(meows)
          .values({
            authorId: actor.id,
            content: replyContent,
            replyToId: toReplyTo.id,
            createdAt: timeAgo(Math.max(1, replyMinutesAgo)),
            updatedAt: timeAgo(Math.max(1, replyMinutesAgo))
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
          createdAt: timeAgo(Math.max(1, replyMinutesAgo))
        })
        notifCount++

        console.log(`  ${actor.username} ответил на мяут trplfr`)
      }

      // комментарий на мяут trplfr (5й+ актор)
      if (ai >= 4 && realUserMeows.length > 0) {
        const toCommentOn = pick(realUserMeows)
        const commentMinutesAgo =
          baseMinutesAgo - 45 - Math.floor(Math.random() * 90)

        await db.insert(comments).values({
          meowId: toCommentOn.id,
          authorId: actor.id,
          content: pick(seedComments),
          createdAt: timeAgo(Math.max(1, commentMinutesAgo))
        })

        console.log(`  ${actor.username} прокомментировал мяут trplfr`)
      }
    }

    console.log(`Создано ${notifCount} нотификаций для @${realUser.username}`)
  } else {
    console.log('Пользователь @trplfr не найден в базе, нотификации не созданы')
  }

  console.log('Сидирование завершено!')

  await pool.end()
}

seed().catch(err => {
  console.error('Ошибка сидирования:', err)
  process.exit(1)
})
