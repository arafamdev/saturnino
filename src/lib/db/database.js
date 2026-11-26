import Dexie from 'dexie'

const DATABASE_NAME = 'saturnino'
const DATABASE_VERSION = 1

export function createDatabase(databaseName = DATABASE_NAME) {
  const database = new Dexie(databaseName)

  // Define primary keys and indexes for the initial schema.
  database.version(DATABASE_VERSION).stores({
    projects: 'id, updatedAt',
    tasks: 'id, projectId, [projectId+status+position]',
  })

  return database
}

export const database = createDatabase()
