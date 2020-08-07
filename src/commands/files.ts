import { promises } from 'fs'

export async function writeFile(filename: string, data: string, index = 0): Promise<String> {
  const suffixedFilename =  index === 0 ? filename : `${filename}.${index}`
  return await promises.writeFile(suffixedFilename, data, { flag: 'wx' })
    .then(() => suffixedFilename)
    .catch(err => {
      if (index <= 10) {
        return writeFile(filename, data, index+1)
      } else {
        throw err
      }
    })
}

export async function overwriteFile(filename: string, data: string): Promise<void> {
  return await promises.writeFile(filename, data)
}