export interface PaginationQuery {
  page?: string | number
  perPage?: string | number
}

export interface PaginationMeta {
  page: number
  perPage: number
  total: number
  totalPages: number
}

export interface PaginatedResult<T> {
  data: T[]
  meta: PaginationMeta
}

const DEFAULT_PAGE = 1
const DEFAULT_PER_PAGE = 10
const MAX_PER_PAGE = 50

export function resolvePagination(query: PaginationQuery) {
  const page = Math.max(1, Number(query.page) || DEFAULT_PAGE)
  const perPage = Math.min(
    MAX_PER_PAGE,
    Math.max(1, Number(query.perPage) || DEFAULT_PER_PAGE),
  )

  return {
    page,
    perPage,
    skip: (page - 1) * perPage,
    take: perPage,
  }
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  perPage: number,
): PaginatedResult<T> {
  return {
    data,
    meta: {
      page,
      perPage,
      total,
      totalPages: Math.max(1, Math.ceil(total / perPage) || 1),
    },
  }
}
