import 'fake-indexeddb/auto'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createDatabase } from '@/lib/db/database'

import { DEFAULT_PROJECT_COLOR } from '../data/projectColors'
import { createProjectRepository } from './projectRepository'

describe('Project repository', () => {
  let testDatabase
  let repository

  beforeEach(async () => {
    testDatabase = createDatabase(
      `saturnino-project-test-${crypto.randomUUID()}`,
    )

    await testDatabase.open()

    repository = createProjectRepository(testDatabase)
  })

  afterEach(async () => {
    await testDatabase.delete()
  })

  it('returns an empty list when no projects exist', async () => {
    expect(await repository.getProjects()).toEqual([])
  })

  it('creates and persists a project', async () => {
    const project = await repository.createProject({
      name: 'Saturnino',
      description: 'Task management application',
      color: DEFAULT_PROJECT_COLOR,
    })

    expect(project).toEqual({
      id: expect.any(String),
      name: 'Saturnino',
      description: 'Task management application',
      color: DEFAULT_PROJECT_COLOR,
      isFavorite: false,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })

    expect(project.createdAt).toBe(project.updatedAt)

    expect(await testDatabase.projects.get(project.id)).toEqual(project)
  })

  it('normalizes project names and descriptions', async () => {
    const project = await repository.createProject({
      name: '   Saturnino   ',
      description: '   My project   ',
    })

    expect(project.name).toBe('Saturnino')
    expect(project.description).toBe('My project')
  })

  it('uses default values for optional fields', async () => {
    const project = await repository.createProject({
      name: 'Saturnino',
    })

    expect(project.description).toBe('')
    expect(project.color).toBe(DEFAULT_PROJECT_COLOR)
  })

  it('generates unique project identifiers', async () => {
    const firstProject = await repository.createProject({
      name: 'First project',
    })

    const secondProject = await repository.createProject({
      name: 'Second project',
    })

    expect(firstProject.id).not.toBe(secondProject.id)
  })

  it('rejects an empty project name', async () => {
    await expect(
      repository.createProject({
        name: '   ',
      }),
    ).rejects.toThrow('PROJECT_NAME_REQUIRED')

    expect(await testDatabase.projects.count()).toBe(0)
  })

  it('rejects a project name longer than 80 characters', async () => {
    await expect(
      repository.createProject({
        name: 'a'.repeat(81),
      }),
    ).rejects.toThrow('PROJECT_NAME_TOO_LONG')
  })

  it('rejects a non-string description', async () => {
    await expect(
      repository.createProject({
        name: 'Saturnino',
        description: 123,
      }),
    ).rejects.toThrow('PROJECT_DESCRIPTION_INVALID')
  })

  it('rejects a description longer than 500 characters', async () => {
    await expect(
      repository.createProject({
        name: 'Saturnino',
        description: 'a'.repeat(501),
      }),
    ).rejects.toThrow('PROJECT_DESCRIPTION_TOO_LONG')
  })

  it('rejects an unsupported project color', async () => {
    await expect(
      repository.createProject({
        name: 'Saturnino',
        color: '#000000',
      }),
    ).rejects.toThrow('PROJECT_COLOR_INVALID')
  })

  it('retrieves a project by its identifier', async () => {
    const project = await repository.createProject({
      name: 'Saturnino',
    })

    expect(await repository.getProjectById(project.id)).toEqual(project)
  })

  it('returns undefined when a project does not exist', async () => {
    expect(await repository.getProjectById('missing-project')).toBeUndefined()
  })

  it('lists projects by most recently updated first', async () => {
    const firstProject = await repository.createProject({
      name: 'First project',
    })

    const secondProject = await repository.createProject({
      name: 'Second project',
    })

    await testDatabase.projects.update(firstProject.id, {
      updatedAt: '2026-01-01T10:00:00.000Z',
    })

    await testDatabase.projects.update(secondProject.id, {
      updatedAt: '2026-01-02T10:00:00.000Z',
    })

    const projects = await repository.getProjects()

    expect(projects.map((project) => project.id)).toEqual([
      secondProject.id,
      firstProject.id,
    ])
  })

  it('updates a project while preserving its identity', async () => {
    const project = await repository.createProject({
      name: 'Original project',
    })

    const updatedProject = await repository.updateProject(project.id, {
      name: 'Updated project',
      description: 'Updated description',
      color: '#34D399',
    })

    expect(updatedProject.id).toBe(project.id)
    expect(updatedProject.createdAt).toBe(project.createdAt)
    expect(updatedProject.name).toBe('Updated project')
    expect(updatedProject.description).toBe('Updated description')
    expect(updatedProject.color).toBe('#34D399')

    expect(await repository.getProjectById(project.id)).toEqual(updatedProject)
  })

  it('updates the last modification timestamp', async () => {
    const project = await repository.createProject({
      name: 'Saturnino',
    })

    const previousTimestamp = '2026-01-01T10:00:00.000Z'

    await testDatabase.projects.update(project.id, {
      updatedAt: previousTimestamp,
    })

    const updatedProject = await repository.updateProject(project.id, {
      name: 'Updated Saturnino',
    })

    expect(updatedProject.updatedAt).not.toBe(previousTimestamp)
  })

  it('rejects updates to a missing project', async () => {
    await expect(
      repository.updateProject('missing-project', {
        name: 'Updated project',
      }),
    ).rejects.toThrow('PROJECT_NOT_FOUND')
  })

  it('preserves existing data when an update is invalid', async () => {
    const project = await repository.createProject({
      name: 'Saturnino',
    })

    await expect(
      repository.updateProject(project.id, {
        name: '',
      }),
    ).rejects.toThrow('PROJECT_NAME_REQUIRED')

    expect(await repository.getProjectById(project.id)).toEqual(project)
  })

  it('deletes a project', async () => {
    const project = await repository.createProject({
      name: 'Saturnino',
    })

    await repository.deleteProject(project.id)

    expect(await repository.getProjectById(project.id)).toBeUndefined()
  })

  it('deletes related tasks without affecting other projects', async () => {
    const firstProject = await repository.createProject({
      name: 'First project',
    })

    const secondProject = await repository.createProject({
      name: 'Second project',
    })

    await testDatabase.tasks.bulkAdd([
      {
        id: 'task-1',
        projectId: firstProject.id,
        title: 'First task',
        status: 'todo',
        position: 0,
      },
      {
        id: 'task-2',
        projectId: firstProject.id,
        title: 'Second task',
        status: 'todo',
        position: 1,
      },
      {
        id: 'task-3',
        projectId: secondProject.id,
        title: 'Unrelated task',
        status: 'todo',
        position: 0,
      },
    ])

    await repository.deleteProject(firstProject.id)

    expect(await repository.getProjectById(firstProject.id)).toBeUndefined()

    expect(
      await testDatabase.tasks
        .where('projectId')
        .equals(firstProject.id)
        .count(),
    ).toBe(0)

    expect(await repository.getProjectById(secondProject.id)).toEqual(
      secondProject,
    )

    expect(await testDatabase.tasks.get('task-3')).toBeDefined()
  })

  it('rolls back task deletion when project deletion fails', async () => {
    const project = await repository.createProject({
      name: 'Saturnino',
    })

    const task = {
      id: 'rollback-task',
      projectId: project.id,
      title: 'Preserve this task',
      status: 'todo',
      position: 0,
    }

    await testDatabase.tasks.add(task)

    // Simulate a failure after the related tasks have been deleted.
    const deleteProjectSpy = vi
      .spyOn(testDatabase.projects, 'delete')
      .mockRejectedValueOnce(new Error('PROJECT_DELETE_FAILED'))

    try {
      await expect(repository.deleteProject(project.id)).rejects.toThrow(
        'PROJECT_DELETE_FAILED',
      )

      expect(deleteProjectSpy).toHaveBeenCalledWith(project.id)

      // Verify that the transaction preserves both records.
      expect(await repository.getProjectById(project.id)).toEqual(project)

      expect(await testDatabase.tasks.get(task.id)).toEqual(task)
    } finally {
      deleteProjectSpy.mockRestore()
    }
  })

  it('rejects deletion of a missing project', async () => {
    await expect(repository.deleteProject('missing-project')).rejects.toThrow(
      'PROJECT_NOT_FOUND',
    )
  })
})
