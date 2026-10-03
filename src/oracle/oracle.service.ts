import { BadRequestException, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createPool, OUT_FORMAT_OBJECT, Pool } from 'oracledb';

interface OptionsProps {
  isMany?: boolean
  findOne?: boolean
}

@Injectable()
export class OracleService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool

  async onModuleInit() {
    this.pool = await createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      connectString: process.env.DB_CONNECT_STRING,
      poolMin: 1,
      poolMax: 50,
      poolIncrement: 1,
      poolPingInterval: 120,
      poolTimeout: 300
    })
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.close(10)
    }
  }

  async query<T> (query: string, params?: any, options?: OptionsProps): Promise<T | any> {
    let connection

    try {
      connection = await this.pool.getConnection()

      let results = await connection.execute(query, params ? params : {}, {
        outFormat: OUT_FORMAT_OBJECT
      })

      return results.rows
    } catch (err) {
      console.log(`Erro ao executar query \n\n ${query}\n\n ${err}`)
      throw new BadRequestException('Erro ao conectar com o banco de dados')
    } finally {
      if (connection) {
        try {
          await connection.close()
        } catch (err) {
          console.log('Erro ao fechar conexão: ', err)
          throw new BadRequestException('Erro ao fechar conexão com o banco de dados')
        }
      }
    }
  }
}
