import { BadRequestException, Injectable } from '@nestjs/common'
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs'
import { extname, join } from 'path'
import { randomUUID } from 'crypto'
import { PrismaService } from 'src/prima.service'
import { AUDIT_ACTIONS, AdminAuditService } from '../admin-audit.service'

const HEX_COLOR = /^#([0-9A-Fa-f]{6})$/
const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
]
const ALLOWED_FAVICON_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  'image/x-icon',
  'image/vnd.microsoft.icon',
]
const MAX_ASSET_SIZE = 2 * 1024 * 1024

export const BRANDING_ASSETS = {
  login_logo: 'login_logo',
  header_logo: 'header_logo',
  favicon: 'favicon',
} as const

export type BrandingAssetKind =
  (typeof BRANDING_ASSETS)[keyof typeof BRANDING_ASSETS]

const ASSET_COLUMNS: Record<
  BrandingAssetKind,
  'login_logo_path' | 'header_logo_path' | 'favicon_path'
> = {
  login_logo: 'login_logo_path',
  header_logo: 'header_logo_path',
  favicon: 'favicon_path',
}

export interface UploadedImage {
  originalname: string
  mimetype: string
  buffer: Buffer
  size: number
}

@Injectable()
export class AdminBrandingService {
  constructor(
    private prisma: PrismaService,
    private audit: AdminAuditService,
  ) {}

  async getSettings() {
    const settings = await this.getOrCreate()
    return this.toPublic(settings)
  }

  async updateColors(
    actorId: string,
    primaryColor?: string | null,
    secondaryColor?: string | null,
  ) {
    const primary = this.normalizeColor(primaryColor, 'cor primária')
    const secondary = this.normalizeColor(secondaryColor, 'cor secundária')

    const settings = await this.getOrCreate()

    const updated = await this.prisma.platformSettings.update({
      where: { id: settings.id },
      data: {
        primary_color: primary,
        secondary_color: secondary,
        updated_at: new Date(),
      },
    })

    await this.audit.record({
      actorId,
      action: AUDIT_ACTIONS.BRANDING_UPDATED,
      entity: 'platform_settings',
      entityId: updated.id,
      metadata: {
        primary_color: primary,
        secondary_color: secondary,
      },
    })

    return this.toPublic(updated)
  }

  async updateAsset(
    actorId: string,
    kind: BrandingAssetKind,
    file: UploadedImage,
  ) {
    this.assertKind(kind)

    if (!file) {
      throw new BadRequestException('Envie um arquivo')
    }

    const allowed =
      kind === BRANDING_ASSETS.favicon
        ? ALLOWED_FAVICON_TYPES
        : ALLOWED_IMAGE_TYPES

    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException(
        kind === BRANDING_ASSETS.favicon
          ? 'Formato inválido. Use ICO, PNG, JPG, WEBP ou SVG'
          : 'Formato inválido. Use PNG, JPG, WEBP ou SVG',
      )
    }

    if (file.size > MAX_ASSET_SIZE) {
      throw new BadRequestException('O arquivo deve ter no máximo 2 MB')
    }

    const settings = await this.getOrCreate()
    const uploadDir = this.getUploadDir()

    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true })
    }

    const column = ASSET_COLUMNS[kind]
    const currentPath = settings[column]

    if (currentPath) {
      this.removeAssetFile(currentPath)
    }

    const extension = this.resolveExtension(file, kind)
    const filename = `${kind}-${randomUUID()}${extension}`
    const absolutePath = join(uploadDir, filename)

    writeFileSync(absolutePath, file.buffer)

    const assetPath = `/uploads/branding/${filename}`

    const updated = await this.prisma.platformSettings.update({
      where: { id: settings.id },
      data: {
        [column]: assetPath,
        updated_at: new Date(),
      },
    })

    await this.audit.record({
      actorId,
      action: AUDIT_ACTIONS.BRANDING_ASSET_UPDATED,
      entity: 'platform_settings',
      entityId: updated.id,
      metadata: { kind },
    })

    return this.toPublic(updated)
  }

  async removeAsset(actorId: string, kind: BrandingAssetKind) {
    this.assertKind(kind)

    const settings = await this.getOrCreate()
    const column = ASSET_COLUMNS[kind]
    const currentPath = settings[column]

    if (currentPath) {
      this.removeAssetFile(currentPath)
    }

    const updated = await this.prisma.platformSettings.update({
      where: { id: settings.id },
      data: {
        [column]: null,
        updated_at: new Date(),
      },
    })

    await this.audit.record({
      actorId,
      action: AUDIT_ACTIONS.BRANDING_ASSET_REMOVED,
      entity: 'platform_settings',
      entityId: updated.id,
      metadata: { kind },
    })

    return this.toPublic(updated)
  }

  private async getOrCreate() {
    const existing = await this.prisma.platformSettings.findFirst()

    if (existing) {
      return existing
    }

    return this.prisma.platformSettings.create({
      data: { id: 'default' },
    })
  }

  private toPublic(settings: {
    id: string
    primary_color: string | null
    secondary_color: string | null
    login_logo_path: string | null
    header_logo_path: string | null
    favicon_path: string | null
    updated_at: Date
  }) {
    return {
      primary_color: settings.primary_color,
      secondary_color: settings.secondary_color,
      login_logo_url: settings.login_logo_path,
      header_logo_url: settings.header_logo_path,
      favicon_url: settings.favicon_path,
      updated_at: settings.updated_at,
    }
  }

  private normalizeColor(value: string | null | undefined, label: string) {
    if (value === undefined) {
      return undefined
    }

    if (value === null || value.trim() === '') {
      return null
    }

    const color = value.trim()

    if (!HEX_COLOR.test(color)) {
      throw new BadRequestException(
        `Informe a ${label} no formato hexadecimal (#RRGGBB)`,
      )
    }

    return color.toUpperCase()
  }

  private getUploadDir() {
    return join(process.cwd(), 'uploads', 'branding')
  }

  private resolveExtension(file: UploadedImage, kind: BrandingAssetKind) {
    const fromName = extname(file.originalname || '').toLowerCase()
    const allowed =
      kind === BRANDING_ASSETS.favicon
        ? ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico']
        : ['.png', '.jpg', '.jpeg', '.webp', '.svg']

    if (allowed.includes(fromName)) {
      return fromName === '.jpeg' ? '.jpg' : fromName
    }

    const fromType: Record<string, string> = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
      'image/x-icon': '.ico',
      'image/vnd.microsoft.icon': '.ico',
    }

    return fromType[file.mimetype] || '.png'
  }

  private removeAssetFile(assetPath: string) {
    const filename = assetPath.replace('/uploads/branding/', '')
    const absolutePath = join(this.getUploadDir(), filename)

    if (existsSync(absolutePath)) {
      unlinkSync(absolutePath)
    }
  }

  private assertKind(kind: string): asserts kind is BrandingAssetKind {
    if (!Object.values(BRANDING_ASSETS).includes(kind as BrandingAssetKind)) {
      throw new BadRequestException('Tipo de arquivo inválido')
    }
  }
}
