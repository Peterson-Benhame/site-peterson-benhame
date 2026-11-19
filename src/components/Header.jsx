export default function Header() {
  return (
    <header className="site-header">
      <a aria-label="Peterson Benhame, início" className="brand" href="#inicio">
        <img alt="" className="brand-logo brand-logo--header" decoding="async" height="80" src="assets/img/logotipo-branco.png" width="240" />
      </a>
      <nav aria-label="Navegação principal">
        <a href="#jornada">A jornada</a>
        <a href="#sobre">Sobre mim</a>
        <a href="#duvidas">Dúvidas</a>
      </nav>
      <a className="header-cta" href="#candidatura">
        Candidatar-me <span aria-hidden="true">↗</span>
      </a>
    </header>
  );
}
