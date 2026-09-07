import { Link } from "react-router-dom";
import HeroSlider from "../components/HeroSlider";

const ctaItems = [
  { title: "Правила безопасности", description: "Соблюдайте правила пользования газом в быту.", link: "/page/safety" },
  { title: "Видео инструкция", description: "Ознакомьтесь с правилами безопасности через видеоролики.", link: "/page/video-instructions" },
  { title: "Наши новости", description: "Будьте в курсе последних новостей Тараклия-ГАЗ.", link: "/news" },
];

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <section className="section info-bar">
        <div className="container">
          <p>
            График работы ООО "Тараклия-газ" 08:00 - 17:00{" "}
            <a href="mailto:office@taraclia-gaz.md">office@taraclia-gaz.md</a> — тел: 0-294-22-4-04. Аварийная
            служба тел: 904
          </p>
        </div>
      </section>
      <section className="section cta-grid">
        <div className="container">
          <div className="grid">
            {ctaItems.map((item) => (
              <Link key={item.link} to={item.link} className="cta-card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="section quick-links">
        <div className="container">
          <h2>Полезные ссылки</h2>
          <ul className="link-list">
            <li>
              <a href="https://www.moldovagaz.md/rus/goryachaya-liniya" target="_blank" rel="noreferrer">
                Линия „ANTIFRAUDĂ"
              </a>
            </li>
            <li>
              <a href="https://www.moldovagaz.md/rus/potrebiteli/usluga-onlayn-peredachi-dannyh-schetchika" target="_blank" rel="noreferrer">
                Показание Счётчика
              </a>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
