import type { Metadata } from "next";
import { Newsreader } from "next/font/google";
import SwipeLink from "../components/SwipeLink";
import styles from "./teaching.module.css";

const newsreader = Newsreader({ subsets: ["latin"] });

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
          <p className={styles.eyebrow}>Private educator</p>
          <h1 className={styles.title}>Teacher Curtis</h1>
          <div className={styles.contactList} aria-label="Contact information">
            <p>
              <span>WhatsApp</span>
              <a href="https://wa.me/85255781337">+852 5578 1337</a>
            </p>
            <p>
              <span>Website</span>
              <SwipeLink direction="right" href="/">
                curtisahuang.com
              </SwipeLink>
            </p>
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
              Research positions at UC Berkeley (Biomedical Engineering), UC Irvine (Environmental
              Science), and HKU (Ecology)
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
                  <li>The Hong Kong Polytechnic University (PolyU)</li>
                  <li>City University of Hong Kong (CityU)</li>
                  <li>Hong Kong Baptist University (HKBU)</li>
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
          <a href="https://wa.me/85255781337">
            Start a conversation <span aria-hidden="true">↗</span>
          </a>
        </footer>
      </main>
    </div>
  );
}
