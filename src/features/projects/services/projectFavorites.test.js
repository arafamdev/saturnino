import 'fake-indexeddb/auto'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createDatabase } from '@/lib/db/database'

import { createProjectRepository } from './projectRepository'

describe('Project favorites', () => {
  let db
  let repository

  beforeEach(() => {
    db = createDatabase(`saturnino-favorites-${crypto.randomUUID()}`)
    repository = createProjectRepository(db)
  })

  afterEach(async () => {
    db.close()
    await db.delete()
  })

  it('creates projects as non-favorites by default', async () => {
    const project = await repository.createProject({
      name: 'Saturnino',
    })

    expect(project.isFavorite).toBe(false)
  })

  it('adds a project to favorites', async () => {
    const project = await repository.createProject({
      name: 'Saturnino',
    })

    const updatedProject = await repository.toggleProjectFavorite(project.id)

    expect(updatedProject.isFavorite).toBe(true)
  })

  it('removes a project from favorites', async () => {
    const project = await repository.createProject({
      name: 'Saturnino',
    })

    await repository.toggleProjectFavorite(project.id)

    const updatedProject = await repository.toggleProjectFavorite(project.id)

    expect(updatedProject.isFavorite).toBe(false)
  })

  it('returns only favorite projects', async () => {
    const firstProject = await repository.createProject({
      name: 'Saturnino',
    })

    await repository.createProject({
      name: 'Atmos',
    })

    await repository.toggleProjectFavorite(firstProject.id)

    const favorites = await repository.getFavoriteProjects()

    expect(favorites).toHaveLength(1)
    expect(favorites[0].id).toBe(firstProject.id)
  })

  it('supports existing projects without a favorite property', async () => {
    const project = await repository.createProject({
      name: 'Legacy project',
    })

    delete project.isFavorite

    await db.projects.put(project)

    expect(await repository.getFavoriteProjects()).toEqual([])

    const updatedProject = await repository.toggleProjectFavorite(project.id)

    expect(updatedProject.isFavorite).toBe(true)
  })

  it('preserves favorite status when editing a project', async () => {
    const project = await repository.createProject({
      name: 'Saturnino',
    })

    await repository.toggleProjectFavorite(project.id)

    const updatedProject = await repository.updateProject(project.id, {
      name: 'Saturnino Updated',
    })

    expect(updatedProject.name).toBe('Saturnino Updated')
    expect(updatedProject.isFavorite).toBe(true)
  })

  it('removes deleted projects from favorites', async () => {
    const project = await repository.createProject({
      name: 'Saturnino',
    })

    await repository.toggleProjectFavorite(project.id)
    await repository.deleteProject(project.id)

    expect(await repository.getFavoriteProjects()).toEqual([])
  })

  it('preserves project timestamps when toggling favorites', async () => {
    const project = await repository.createProject({
      name: 'Saturnino',
    })

    const updatedProject = await repository.toggleProjectFavorite(project.id)

    expect(updatedProject.createdAt).toBe(project.createdAt)
    expect(updatedProject.updatedAt).toBe(project.updatedAt)
  })

  it('rejects toggling a project that does not exist', async () => {
    await expect(
      repository.toggleProjectFavorite('missing-project'),
    ).rejects.toThrow('PROJECT_NOT_FOUND')
  })

  it('persists favorite status across repository instances', async () => {
    const project = await repository.createProject({
      name: 'Saturnino',
    })

    await repository.toggleProjectFavorite(project.id)

    const anotherRepository = createProjectRepository(db)

    const storedProject = await anotherRepository.getProjectById(project.id)

    expect(storedProject.isFavorite).toBe(true)
  })

  it('handles concurrent favorite toggles atomically', async () => {
    const project = await repository.createProject({
      name: 'Saturnino',
    })

    await Promise.all([
      repository.toggleProjectFavorite(project.id),
      repository.toggleProjectFavorite(project.id),
    ])

    const storedProject = await repository.getProjectById(project.id)

    expect(storedProject.isFavorite).toBe(false)
  })
})
