import aboutPage from '@/config/about-page.json';

type AboutStorySection = {
  heading: string;
  paragraphs: string[];
};

type TeamMember = {
  id: string;
  name: string;
  role: string;
  origin: string;
  image: string;
  bio: string;
};

export function NativeAboutPage() {
  const page = aboutPage;
  const story = page.story as AboutStorySection[];
  const team = page.team as TeamMember[];

  return (
    <article className="native-page" data-route={page.route}>
      <div className="about-page">
      <header className="about-page__hero">
        <p className="about-page__eyebrow">International Poker Lovers Association NUTS</p>
        <h1>{page.title}</h1>
        <p className="about-page__lead">{page.description}</p>
      </header>

      <figure className="about-page__team-photo">
        <img
          src={page.teamPhoto.src}
          alt={page.teamPhoto.alt}
          width={1600}
          height={900}
          loading="eager"
          decoding="async"
        />
        <figcaption>
          Девять человек, один клуб — на групповом фото также Элина Джураева и Тимур Сарыев из
          службы поддержки
        </figcaption>
      </figure>

      <div className="about-page__story">
        {story.map((section) => (
          <section key={section.heading} className="about-page__section">
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </section>
        ))}
      </div>

      <section className="about-page__team" aria-labelledby="about-team-heading">
        <header className="about-page__team-header">
          <h2 id="about-team-heading">Команда, которая держит слово</h2>
          <p>
            Семь человек, которые отвечают за турниры, кэш, технологии, финансы и то, чтобы в чате
            было меньше хаоса. На групповом фото с ними — Элина Джураева (поддержка игроков,
            Душанбе) и Тимур Сарыев (комьюнити-менеджер, Бишкек). Они тоже реальные. Просто
            скромные.
          </p>
        </header>
        <ul className="about-page__team-grid">
          {team.map((member) => (
            <li key={member.id} className="about-page__member">
              <img
                className="about-page__member-photo"
                src={member.image}
                alt={member.name}
                width={400}
                height={533}
                loading="lazy"
                decoding="async"
              />
              <div className="about-page__member-body">
                <h3>{member.name}</h3>
                <p className="about-page__member-role">{member.role}</p>
                <p className="about-page__member-origin">{member.origin}</p>
                <p className="about-page__member-bio">{member.bio}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-page__office" aria-labelledby="about-office-heading">
        <header className="about-page__office-header">
          <h2 id="about-office-heading">Офис в Сочи</h2>
          <p>
            Юридический и фактический адрес совпадают — мы не любим сюрпризы, особенно в документах.
          </p>
        </header>

        <dl className="about-page__office-details">
          <div>
            <dt>Юридическое лицо</dt>
            <dd>{page.office.legalName}</dd>
          </div>
          <div>
            <dt>ИНН / ОГРН</dt>
            <dd>
              {page.office.inn} / {page.office.ogrn}
            </dd>
          </div>
          <div>
            <dt>Юридический адрес</dt>
            <dd>{page.office.legalAddress}</dd>
          </div>
          <div>
            <dt>Фактический адрес</dt>
            <dd>{page.office.actualAddress}</dd>
          </div>
          <div>
            <dt>Телефон</dt>
            <dd>
              <a href={page.office.phoneHref}>{page.office.phone}</a>
            </dd>
          </div>
          <div>
            <dt>E-mail</dt>
            <dd>
              <a href={`mailto:${page.office.email}`}>{page.office.email}</a>
            </dd>
          </div>
          <div>
            <dt>Часы работы</dt>
            <dd>{page.office.hours}</dd>
          </div>
        </dl>

        <div className="about-page__map-wrap">
          <iframe
            className="about-page__map"
            title="Офис NUTS на карте Сочи"
            src={page.office.mapEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </section>
      </div>
    </article>
  );
}
