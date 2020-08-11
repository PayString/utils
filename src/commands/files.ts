import { promises } from 'fs'

/**
 * Writes content to file and overwrites any existing file with the same name.
 *
 * @param filename - The filename to write to.
 * @param data - The content to write to the file.
 * @returns Promise because the file I/O is done async.
 */
export default async function overwriteFile(
  filename: string,
  data: string,
): Promise<void> {
  return promises.writeFile(filename, data)
}
