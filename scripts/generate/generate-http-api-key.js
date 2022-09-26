import dotenv from 'dotenv'
import crypto from 'crypto'
import fs from 'fs'
import { prompt } from 'inquirer'
import path from 'path'

import { LogHelper } from '@/helpers/log-helper'
import { StringHelper } from '@/helpers/string-helper'

dotenv.config()

/**
 * Generate HTTP API key script
 * save it in the .env file
 */
const generateHttpApiKey = () =>
  new Promise(async (resolve, reject) => {
    LogHelper.info('Generating the HTTP API key...')

    try {
      const shasum = crypto.createHash('sha1')
      const str = StringHelper.random(11)
      const dotEnvPath = path.join(process.cwd(), '.env')
      const envVarKey = 'LEON_HTTP_API_KEY'
      let content = fs.readFileSync(dotEnvPath, 'utf8')

      shasum.update(str)
      const sha1 = shasum.digest('hex')

      let lines = content.split('\n')
      lines = lines.map((line) => {
        if (line.indexOf(`${envVarKey}=`) !== -1) {
          line = `${envVarKey}=${sha1}`
        }

        return line
      })

      content = lines.join('\n')

      fs.writeFileSync(dotEnvPath, content)
      LogHelper.success('HTTP API key generated')

      resolve()
    } catch (e) {
      LogHelper.error(e.message)
      reject(e)
    }
  })

export default () =>
  new Promise(async (resolve, reject) => {
    try {
      if (
        !process.env.LEON_HTTP_API_KEY ||
        process.env.LEON_HTTP_API_KEY === ''
      ) {
        await generateHttpApiKey()
      } else if (!process.env.IS_DOCKER) {
        const answer = await prompt({
          type: 'confirm',
          name: 'generate.httpApiKey',
          message: 'Do you want to regenerate the HTTP API key?',
          default: false
        })

        if (answer.generate.httpApiKey === true) {
          await generateHttpApiKey()
        }
      }

      resolve()
    } catch (e) {
      reject(e)
    }
  })
