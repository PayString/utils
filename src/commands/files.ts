import { promises } from 'fs'

const MAX_ATTEMPTS = 10

export async function writeFile(
  filename: string,
  data: string,
  index = 0,
): Promise<string> {
  const suffixedFilename = index === 0 ? filename : `${filename}.${index}`
  return promises
    .writeFile(suffixedFilename, data, { flag: 'wx' })
    .then(() => suffixedFilename)
    .catch(async (err) => {
      if (index <= MAX_ATTEMPTS) {
        return writeFile(filename, data, index + 1)
      }
      throw err
    })
}

export async function overwriteFile(
  filename: string,
  data: string,
): Promise<void> {
  return promises.writeFile(filename, data)
}
