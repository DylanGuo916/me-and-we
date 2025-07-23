import { PrismaClient } from '../lib/generated/prisma'
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. 插入用户，获取真实 id
  const users = await Promise.all(
    Array.from({ length: 10 }).map(() =>
      prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          avatar: faker.image.avatar(),
          createdAt: faker.date.past(),
        },
      }),
    )
  )
  const userIds = users.map(u => u.id)

  // 2. 插入社区，ownerId 来自 userIds
  const communities = await Promise.all(
    Array.from({ length: 5 }).map(() =>
      prisma.community.create({
        data: {
          name: faker.company.name(),
          description: faker.lorem.sentence(),
          ownerId: faker.helpers.arrayElement(userIds),
          createdAt: faker.date.recent(),
        },
      })
    )
  )
  const communityIds = communities.map(c => c.id)

  // 3. 插入帖子，关联用户和社区
  await Promise.all(
    Array.from({ length: 20 }).map(() =>
      prisma.post.create({
        data: {
          title: faker.lorem.sentence(),
          content: faker.lorem.paragraphs(2),
          authorId: faker.helpers.arrayElement(userIds),
          communityId: faker.helpers.arrayElement(communityIds),
          createdAt: faker.date.recent(),
        },
      })
    )
  )

  // 4. 插入用户-社区关系（避免重复）
  const relations = new Set<string>()
  const userCommunityData = []

  while (userCommunityData.length < 30) {
    const userId = faker.helpers.arrayElement(userIds)
    const communityId = faker.helpers.arrayElement(communityIds)
    const key = `${userId}_${communityId}`

    if (!relations.has(key)) {
      relations.add(key)
      userCommunityData.push({ userId, communityId })
    }
  }

  await prisma.userCommunity.createMany({ data: userCommunityData })

  console.log('✅ Done seeding!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
