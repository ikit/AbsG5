import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ForbiddenError, BadRequestError } from 'routing-controllers'

// Les vraies entités TypeORM ne se chargent pas sous Vitest (pas de métadonnées de décorateurs)
vi.mock('../../src/entities', () => ({
  Citation: class Citation {},
  Immt: class Immt {},
  Person: class Person {},
  LogModule: { citations: 'citations', photos: 'photos' },
  User: class User {
    roles: string[] = []
    is(role: string) {
      return this.roles.includes(role)
    }
  }
}))

// Un repository factice par entité, injecté via getRepository
const repos = new Map<unknown, any>()
vi.mock('../../src/middleware/database', () => ({
  getRepository: (target: unknown) => repos.get(target)
}))
vi.mock('../../src/middleware/logger', () => ({
  logger: { notice: vi.fn(), info: vi.fn(), warning: vi.fn(), error: vi.fn() }
}))

import { citationService } from '../../src/services/CitationService'
import { immtService } from '../../src/services/ImmtService'
import { Citation, Immt, User } from '../../src/entities'

function makeUser(id: number, roles: string[] = []): User {
  return Object.assign(new User(), { id, username: `user${id}`, roles })
}

const admin = makeUser(1, ['admin'])
const poster = makeUser(2)
const other = makeUser(3)

describe('CitationService.remove', () => {
  let repo: any
  const latest = { id: 10, poster: { id: poster.id } }
  const older = { id: 5, poster: { id: poster.id } }

  beforeEach(() => {
    repo = {
      findOne: vi.fn(async ({ where, order }) => {
        if (order) return latest
        return [latest, older].find(c => c.id === where.id) ?? null
      }),
      remove: vi.fn(async c => c)
    }
    repos.set(Citation, repo)
    citationService.initService()
  })

  it('autorise un admin à supprimer une ancienne citation', async () => {
    await citationService.remove(admin, older.id)
    expect(repo.remove).toHaveBeenCalledWith(older)
  })

  it('autorise le posteur à supprimer sa dernière citation', async () => {
    await citationService.remove(poster, latest.id)
    expect(repo.remove).toHaveBeenCalledWith(latest)
  })

  it('refuse au posteur une citation qui n\'est plus la dernière', async () => {
    await expect(citationService.remove(poster, older.id)).rejects.toBeInstanceOf(ForbiddenError)
    expect(repo.remove).not.toHaveBeenCalled()
  })

  it('refuse à un autre utilisateur', async () => {
    await expect(citationService.remove(other, latest.id)).rejects.toBeInstanceOf(ForbiddenError)
    expect(repo.remove).not.toHaveBeenCalled()
  })

  it('signale une citation inexistante', async () => {
    await expect(citationService.remove(admin, 999)).rejects.toBeInstanceOf(BadRequestError)
  })
})

describe('ImmtService.remove', () => {
  let repo: any
  const latest = { year: 2026, day: 100, user: { id: poster.id } }
  const older = { year: 2026, day: 50, user: { id: poster.id } }

  beforeEach(() => {
    repo = {
      findOne: vi.fn(async ({ where, order }) => {
        if (order) return latest
        return [latest, older].find(i => i.year === where.year && i.day === where.day) ?? null
      }),
      remove: vi.fn(async i => i)
    }
    repos.set(Immt, repo)
    immtService.initService()
  })

  it('autorise un admin à supprimer une ancienne immt', async () => {
    await immtService.remove(older.year, older.day, admin)
    expect(repo.remove).toHaveBeenCalledWith(older)
  })

  it('autorise le posteur à supprimer sa dernière immt', async () => {
    await immtService.remove(latest.year, latest.day, poster)
    expect(repo.remove).toHaveBeenCalledWith(latest)
  })

  it('refuse au posteur une immt qui n\'est plus la dernière', async () => {
    await expect(immtService.remove(older.year, older.day, poster)).rejects.toBeInstanceOf(ForbiddenError)
    expect(repo.remove).not.toHaveBeenCalled()
  })

  it('refuse à un autre utilisateur', async () => {
    await expect(immtService.remove(latest.year, latest.day, other)).rejects.toBeInstanceOf(ForbiddenError)
    expect(repo.remove).not.toHaveBeenCalled()
  })

  it('signale une immt inexistante', async () => {
    await expect(immtService.remove(2000, 1, admin)).rejects.toBeInstanceOf(BadRequestError)
  })
})
