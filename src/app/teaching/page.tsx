import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import { ContactFormDrawer } from "../components";
import SwipeLink from "../components/SwipeLink";
import styles from "./teaching.module.css";

const newsreader = Newsreader({ subsets: ["latin"] });

function WhatsAppIcon() {
  return (
    <span aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        width="1em"
        height="1em"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.098-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </span>
  );
}

export const metadata: Metadata = {
  title: "Teacher Curtis | Curtis Alexander Huang",
  description:
    "Experienced private tutor, science and mathematics educator, and programming instructor in Hong Kong.",
};

export default function TeachingPage() {
  return (
    <div className={`${styles.page} ${newsreader.className}`}>
      <main className={styles.main}>
        <header className={styles.masthead}>
          <SwipeLink direction="left" href="/" className={styles.backLink}>
            ← Back to homepage
          </SwipeLink>
          <p className={styles.eyebrow}>Private educator</p>
          <h1 className={styles.title}>Teacher Curtis</h1>
          <div className={styles.contactList} aria-label="Contact information">
            <p>
              <span>WhatsApp</span>
              <a href="https://wa.me/85255781337">+852 5578 1337</a>
            </p>

            <p>
              <span>Facebook</span>
              <a
                className={styles.socialIcon}
                href="https://www.facebook.com/profile.php?id=61593049071956"
                aria-label="Teacher Curtis on Facebook"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="1.15em"
                  height="1.15em"
                  aria-hidden="true"
                >
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.026 1.792-4.698 4.533-4.698 1.312 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.931-1.956 1.887v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
                </svg>
              </a>
            </p>
            <a className={styles.topCta} href="https://wa.me/85255781337">
              Whatsapp me
              <WhatsAppIcon />
            </a>
            <ContactFormDrawer
              triggerClassName={styles.topCta}
              triggerLabel="Send a message"
              title="Get in touch"
              description="Tell me about the student, subjects, and scheduling needs, and I will follow up by email."
            />
          </div>
        </header>

        <section className={styles.section} aria-labelledby="profile">
          <h2 id="profile" className={styles.sectionTitle}>
            <span>01</span> Profile
          </h2>
          <ul className={styles.primaryList}>
            <li>Born and raised in California, USA</li>
            <li>Native English speaker</li>
            <li>Conversational in Cantonese and Spanish; beginner Japanese</li>
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="academic-qualification">
          <h2 id="academic-qualification" className={styles.sectionTitle}>
            <span>02</span> Academic qualifications
          </h2>
          <ul className={styles.primaryList}>
            <li>Bachelor of Science in Bioengineering, UC Berkeley</li>
            <li>
              <p>Research positions:</p>
              <ul className={styles.detailList}>
                <li>UC Berkeley — Biomedical Engineering & Comparative Biomechanics</li>
                <li>UC Irvine — Environmental Science (Air Pollution Laboratory)</li>
                <li>HKU — Ecology (Arboreal Ants in Mangrove Ecosystems)</li>
              </ul>
            </li>
            <li>TEFL certificate</li>
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="exam-scores">
          <h2 id="exam-scores" className={styles.sectionTitle}>
            <span>03</span> Exam scores
          </h2>
          <ul className={styles.primaryList}>
            <li>
              <p>IB Diploma, 42 out of 45 points:</p>
              <ul className={`${styles.detailList} ${styles.subjectList}`}>
                <li>Physics HL</li>
                <li>Biology HL</li>
                <li>English HL</li>
                <li>Spanish SL</li>
                <li>History SL</li>
                <li>Mathematics SL</li>
              </ul>
            </li>
            <li>
              <p>
                10 Advanced Placement (AP) exams (US; equivalent to A levels), with scores of 5 out
                of 5:
              </p>
              <ul className={`${styles.detailList} ${styles.subjectList}`}>
                <li>Physics B</li>
                <li>Physics C - E&amp;M</li>
                <li>Physics C - Mechanics</li>
                <li>Biology</li>
                <li>Calculus AB</li>
                <li>Calculus BC</li>
                <li>European History</li>
                <li>US History</li>
                <li>English Literature</li>
                <li>English Language</li>
              </ul>
            </li>
            <li>ACT score: 35 out of 36 (equivalent to 2380 out of 2400 on the old SAT)</li>
            <li>GPA 4.0 throughout primary and secondary school</li>
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="teaching-experience">
          <h2 id="teaching-experience" className={styles.sectionTitle}>
            <span>04</span> Teaching experience
          </h2>
          <ul className={styles.primaryList}>
            <li>20+ years of tutoring experience</li>
            <li>Students aged 6–22, including those with learning disabilities</li>
            <li>
              <p>Exam preparation by level:</p>
              <ul className={styles.detailList}>
                <li>
                  <span className={styles.detailLabel}>Primary</span> - KS2 SATs (UK), entrance
                  exams, ISEB Pre-Tests, and SSAT
                </li>
                <li>
                  <span className={styles.detailLabel}>Secondary</span> - IGCSE, GCSE, ACT, SAT
                  (US), TOEFL, IB Diploma, and A levels
                </li>
                <li>
                  <span className={styles.detailLabel}>University</span> - science (Biology,
                  Chemistry, and Physics) and mathematics (Calculus and Statistics)
                </li>
              </ul>
            </li>
            <li>
              Instruction in JavaScript/TypeScript, C++, Pascal, HTML/CSS, and Python for full-stack
              web development and computer science
            </li>
            <li>Scratch and EV3 programming, and LEGO robotics, for primary school students</li>
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="results">
          <h2 id="results" className={styles.sectionTitle}>
            <span>05</span> Results
          </h2>
          <div className={styles.sectionContent}>
            <p>Students have received offers from and attended institutions including:</p>
            <div className={styles.resultsGroups}>
              <div>
                <h3>US</h3>
                <ul className={`${styles.detailList} ${styles.institutionList}`}>
                  <li>University of California, Los Angeles (UCLA)</li>
                  <li>University of California, Berkeley (UC Berkeley)</li>
                  <li>University of California, Irvine (UC Irvine)</li>
                  <li>Stanford University</li>
                  <li>Harvard University</li>
                  <li>New York University (NYU)</li>
                </ul>
              </div>
              <div>
                <h3>Hong Kong</h3>
                <ul className={`${styles.detailList} ${styles.institutionList}`}>
                  <li>The University of Hong Kong (HKU)</li>
                  <li>Hong Kong International School (HKIS)</li>
                  <li>Kellett School</li>
                  <li>Harrow International School Hong Kong</li>
                  <li>French International School of Hong Kong</li>
                  <li>German Swiss International School</li>
                  <li>Diocesan Girls’ School (DGS)</li>
                  <li>La Salle College</li>
                </ul>
              </div>
              <div>
                <h3>UK</h3>
                <ul className={`${styles.detailList} ${styles.institutionList}`}>
                  <li>Imperial College London</li>
                  <li>University of Cambridge</li>
                  <li>Harrow School</li>
                  <li>Cheltenham Ladies’ College (CLC)</li>
                  <li>Eton College</li>
                  <li>Winchester College</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="music">
          <h2 id="music" className={styles.sectionTitle}>
            <span>06</span> Music
          </h2>
          <ul className={styles.primaryList}>
            <li>30+ years of violin experience</li>
            <li>Extensive experience in chamber music, orchestras, and solo performance</li>
          </ul>
        </section>

        <footer className={styles.footer}>
          <p>Available for private tutoring and educational consultation.</p>
          <div className={styles.footerActions}>
            <a href="https://wa.me/85255781337">
              WhatsApp me
              <WhatsAppIcon />
            </a>
            <ContactFormDrawer
              triggerClassName={styles.footerButton}
              triggerLabel="Send a message"
              title="Get in touch"
              description="Use the form for tutoring, mentoring, or educational consultation inquiries."
            />
          </div>
        </footer>
      </main>
    </div>
  );
}
