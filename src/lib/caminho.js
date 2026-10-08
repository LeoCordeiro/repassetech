// Endereço com caminho (domínio/quero-vender, link colado sem o #): o servidor entrega o index.html (public/_redirects) e
// aqui o caminho vira a rota do hash ANTES de o router ler o endereço (o createWebHashHistory usa o caminho como base: sem
// isto os links saíam como /quero-vender/#/loja). Caminho que não é rota cai na página "não encontrada" do router.
if (typeof window !== 'undefined') {
  const { pathname, search, hash } = window.location
  if (pathname !== '/' && pathname !== '/index.html') {
    const rota = hash || `#${pathname.replace(/\/+$/, '') || '/'}${search}`
    window.history.replaceState(window.history.state, '', `/${rota}`)
  }
}
