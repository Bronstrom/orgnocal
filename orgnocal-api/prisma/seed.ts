import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
const prisma = new PrismaClient()

// Wipe SQL database tables
async function clearAllData(chronologicalOrderedFilenames: string[]) {
  const modelNames = chronologicalOrderedFilenames.map((fileName) => {
    const modelName = path.basename(fileName, path.extname(fileName))
    return modelName.charAt(0).toUpperCase() + modelName.slice(1)
  })
  // Delete model data in order of filename list
  for (const modelName of modelNames) {
    const model: any = prisma[modelName as keyof typeof prisma]
    try {
      await model.deleteMany({})
      console.log(`Cleared data from ${modelName}`);
    } catch (error) {
      console.error(`Error discarding data from model: ${modelName} - ${error}`)
    }
  }
}

async function main() {
  const dataDirectory = path.join(__dirname, 'seedData')

  // Ensure dependencies to accounted for in order of filenames
  const chronologicalOrderedFilenames = [
    "user.json",
    "org.json",
    "project.json",
    "projectView.json",
    "taskLayer.json",
    "task.json",
    "comment.json",
  ]

  // Clear database data to prepare to re-seed data if data exists already
  await clearAllData(chronologicalOrderedFilenames)

  // Add seed data for each file
  for (const filename of chronologicalOrderedFilenames) {
    const filePath = path.join(dataDirectory, filename)
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    const modelName = path.basename(filename, path.extname(filename))
    const model: any = prisma[modelName as keyof typeof prisma]
    try {
      for (const data of jsonData) {
        await model.create({ data })
      }
      console.error(`Seeded model: ${modelName} with data from: ${filename}`)
    } catch (error) {
      console.error(`Error seeding data from model: ${modelName} - ${error}`)
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect())
  