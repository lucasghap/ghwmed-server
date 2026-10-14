import { Injectable, NotFoundException } from '@nestjs/common';
import { IntegrationType } from '@prisma/client';
import { findActiveIntegration } from 'src/common/integrations/find-active-integration';
import { OracleService } from 'src/oracle/oracle.service';
import { PrismaService } from 'src/prima.service';

const PAGE_SIZE = 50;
const MAX_SEARCH_TERMS = 10;
const ACCENTED = 'ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ';
const UNACCENTED = 'AAAAAEEEEIIIIOOOOOUUUUC';

/** Uppercase, accent-free terms, each one escaped for a LIKE pattern. */
function toSearchTerms(search?: string) {
  return (search ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, MAX_SEARCH_TERMS)
    .map((term) => `%${term.replace(/[\\%_]/g, '\\$&')}%`);
}

@Injectable()
export class MedicalRecordsService {
  constructor(
    private oracle: OracleService,
    private prisma: PrismaService,
  ) {}

  // Long hospitalizations reach hundreds of documents, so the list is paged.
  // Search terms may appear in any column and in any order; all must match.
  async findByAttendanceId(attendanceId: number, page: number, search?: string) {
    const terms = toSearchTerms(search);

    const searchableText = `TRANSLATE(UPPER(
      nvl(a.nm_documento, b.nm_objeto) || ' ' || p.nm_prestador || ' ' ||
      To_Char(a.dh_documento, 'dd/mm/yyyy hh24:mi') || ' ' || a.cd_documento_clinico
    ), '${ACCENTED}', '${UNACCENTED}')`;

    const searchFilter = terms
      .map((_, index) => `AND ${searchableText} LIKE :term${index} ESCAPE '\\'`)
      .join('\n');

    const documents = await this.oracle.query(`
      SELECT
        a.cd_documento_clinico "documentId"
      ,nvl(a.nm_documento, b.nm_objeto) "documentName"
      ,To_Char(a.dh_documento, 'dd/mm/yyyy hh24:mi') "date"
      ,p.nm_prestador "providerName"
        FROM dbamv.pw_documento_clinico a, dbamv.pagu_objeto b, dbamv.prestador p
      WHERE a.cd_objeto = b.cd_objeto
        AND a.cd_prestador = p.cd_prestador(+)
        AND a.cd_atendimento = :attendanceId
        -- MV only prints signed documents; closed ones come back empty.
        AND a.tp_status = 'ASSINADO'
        ${searchFilter}
      ORDER BY a.dh_documento DESC, a.cd_documento_clinico DESC
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `, {
      attendanceId,
      offset: (Math.max(page, 1) - 1) * PAGE_SIZE,
      limit: PAGE_SIZE + 1,
      ...Object.fromEntries(terms.map((term, index) => [`term${index}`, term])),
    })

    // One extra row is fetched only to know whether another page exists.
    return {
      data: documents.slice(0, PAGE_SIZE),
      nextPage: documents.length > PAGE_SIZE ? page + 1 : null,
    }
  }

  async findReportSource(documentId: number) {
    const [document] = await this.oracle.query(`
      SELECT a.cd_documento_clinico "documentId"
        FROM dbamv.pw_documento_clinico a
      WHERE a.cd_documento_clinico = :documentId
        AND a.tp_status = 'ASSINADO'
    `, {
      documentId
    })

    if (!document) {
      throw new NotFoundException('Documento não encontrado')
    }

    const integration = await findActiveIntegration(
      this.prisma,
      IntegrationType.MEDICAL_RECORD_DOCUMENT,
    )

    return { documentId, integration }
  }
}
