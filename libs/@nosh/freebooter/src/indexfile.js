// interpolates the configuration file into the index.html file

export async function loadIndex(cfgsection) {
  const index = await Bun.file(`${this.appRoot}/public/index.html`).read()
  const cfg = cfgsection
  return index.replaceAll(/:\w+/g, (match, key) => {
    return cfg[key] ?? ""
  })
}