export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>SRL «Taraclia Gaz» © {new Date().getFullYear()}</p>
        <address className="footer-contacts">
          <span>тел: 0-294-22-4-04</span>
          <span>Аварийная служба: 904</span>
          <a href="mailto:office@taraclia-gaz.md">office@taraclia-gaz.md</a>
        </address>
      </div>
    </footer>
  );
}
