import { database } from '@/lib/db/database'

import { DEFAULT_PROJECT_COLOR, PROJECT_COLORS } from '../data/projectColors'

function normalizeProjectData({
  name,
  description = '',
  color = DEFAULT_PROJECT_COLOR,
}) {
  if (typeof name !== 'string' || !name.trim()) {
    throw new Error('PROJECT_NAME_REQUIRED')
  }

  const normalizedName = name.trim()

  if (normalizedName.length > 80) {
    throw new Error('PROJECT_NAME_TOO_LONG')
  }

  if (typeof description !== 'string') {
    throw new Error('PROJECT_DESCRIPTION_INVALID')
  }

  const normalizedDescription = description.trim()

  if (normalizedDescription.length > 500) {
    throw new Error('PROJECT_DESCRIPTION_TOO_LONG')
  }

  const isValidColor = PROJECT_COLORS.some(
    (projectColor) => projectColor.value === color,
  )

  if (!isValidColor) {
    throw new Error('PROJECT_COLOR_INVALID')
  }

  return {
    name: normalizedName,
    description: normalizedDescription,
    color,
  }
}

export function createProjectRepository(db = database) {
  async function getProjects() {
    return db.projects.orderBy('updatedAt').reverse().toArray()
  }

  async function getProjectById(projectId) {
    return db.projects.get(projectId)
  }

  async function createProject(projectData) {
    const normalizedData = normalizeProjectData(projectData)
    const timestamp = new Date().toISOString()

    const project = {
      id: crypto.randomUUID(),
      ...normalizedData,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    await db.projects.add(project)

    return project
  }

  async function updateProject(projectId, projectData) {
    const normalizedData = normalizeProjectData(projectData)

    return db.transaction('rw', db.projects, async () => {
      const existingProject = await db.projects.get(projectId)

      if (!existingProject) {
        throw new Error('PROJECT_NOT_FOUND')
      }

      const updatedProject = {
        ...existingProject,
        ...normalizedData,
        updatedAt: new Date().toISOString(),
      }

      await db.projects.put(updatedProject)

      return updatedProject
    })
  }

  async function deleteProject(projectId) {
    return db.transaction('rw', db.projects, db.tasks, async () => {
      const existingProject = await db.projects.get(projectId)

      if (!existingProject) {
        throw new Error('PROJECT_NOT_FOUND')
      }

      // Delete related tasks and the project atomically.
      await db.tasks.where('projectId').equals(projectId).delete()
      await db.projects.delete(projectId)
    })
  }

  return {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
  }
}

export const projectRepository = createProjectRepository()
