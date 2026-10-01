import Layout from "@theme/Layout";
import { CheckCircle2, MoveRight } from "lucide-react";
import React, { useState } from "react";
import { createShowcaseDiscussionUrl } from "../../utils/showcase";
import styles from "../index.module.css";
import submitStyles from "./submit.module.css";

const criteria = ["The project actually uses Img2Num.", "It is publicly reachable.", "It is not unlawful, NSFW, or spammy.", "Maintainers may decline or remove entries at their discretion."];

/** Render the community showcase submission form. */
export default function ShowcaseSubmit() {
  const [binding, setBinding] = useState("");
  const [discussionUrl, setDiscussionUrl] = useState("");
  const [submitError, setSubmitError] = useState("");

  /** Validate the submission and open a pre-filled GitHub discussion. */
  function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    setDiscussionUrl("");
    try {
      const targetUrl = createShowcaseDiscussionUrl(new FormData(event.currentTarget));
      setDiscussionUrl(targetUrl);
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      setSubmitError(error.message);
    }
  }

  return (
    <Layout title="Submit your project" description="Submit a project built with Img2Num for consideration in the community showcase.">
      <main>
        <section className={styles.section}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowBar}></span>
            community showcase
          </div>

          <div className={submitStyles.header}>
            <h1 className={styles.heroTitle}>Submit your project</h1>
            <p className={submitStyles.lead}>Built something with Img2Num? Share it with the community and apply to have it listed in the showcase.</p>
          </div>

          <div className={submitStyles.layout}>
            <aside className={submitStyles.criteriaCard}>
              <span className={submitStyles.cardEyebrow}>Before you submit</span>
              <h2 className={submitStyles.cardTitle}>Listing criteria</h2>
              <p className={submitStyles.cardDescription}>Projects are reviewed before they are added to the community showcase.</p>

              <ul className={submitStyles.criteriaList}>
                {criteria.map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={18} aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </aside>

            <form className={submitStyles.formCard} onSubmit={handleSubmit}>
              <div className={submitStyles.field}>
                <label htmlFor="project_name">Project name</label>
                <input id="project_name" name="project_name" type="text" placeholder="My Img2Num project" required />
              </div>

              <div className={submitStyles.twoColumn}>
                <div className={submitStyles.field}>
                  <label htmlFor="project_url">Live project URL</label>
                  <input id="project_url" name="project_url" type="url" placeholder="https://example.com" required />
                </div>

                <div className={submitStyles.field}>
                  <label htmlFor="repository_url">
                    Source repository <span>optional</span>
                  </label>
                  <input id="repository_url" name="repository_url" type="url" placeholder="https://github.com/user/repository" />
                </div>
              </div>

              <div className={submitStyles.field}>
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows={5} placeholder="What does your project do, and how does it use Img2Num?" required />
              </div>

              <div className={submitStyles.twoColumn}>
                <div className={submitStyles.field}>
                  <label htmlFor="binding">Img2Num binding used</label>
                  <select id="binding" name="binding" value={binding} onChange={(event) => setBinding(event.target.value)} required>
                    <option value="" disabled>
                      Select a binding
                    </option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                    <option value="C">C</option>
                    <option value="C++">C++</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {binding === "Other" ? (
                  <div className={submitStyles.field}>
                    <label htmlFor="other_binding">Language or binding</label>
                    <input id="other_binding" name="other_binding" type="text" placeholder="Specify the language or binding" pattern={".*\\S.*"} required />
                  </div>
                ) : null}
              </div>

              <div className={submitStyles.field}>
                <label htmlFor="additional_links">
                  Additional links <span>optional</span>
                </label>
                <textarea id="additional_links" name="additional_links" rows={3} placeholder="Documentation: https://example.com/docs" />
              </div>

              <div className={submitStyles.imageHelp}>
                <h2>Project images</h2>
                <p>
                  Attach a screenshot in the GitHub discussion before posting. We recommend 1200 × 675 px (16:9) in PNG, JPEG, or WebP format. You can also attach a square logo; otherwise, we'll use a
                  code icon.
                </p>
                <p>Maintainers will save accepted images in the project so your card doesn't depend on an external image host.</p>
              </div>

              <label className={submitStyles.confirmation}>
                <input name="criteria" type="checkbox" required />
                <span>I confirm that this project meets the listing criteria.</span>
              </label>

              {submitError ? (
                <p className={submitStyles.formError} role="alert">
                  {submitError}
                </p>
              ) : null}

              {discussionUrl ? (
                <p role="status">
                  If the new tab didn't open,{" "}
                  <a href={discussionUrl} target="_blank" rel="noopener noreferrer">
                    continue to your discussion on GitHub
                  </a>
                  .
                </p>
              ) : null}

              <div className={submitStyles.actions}>
                <p>You'll review the pre-filled Showcase discussion and attach your images on GitHub in a new tab before posting.</p>
                <button className={`${styles.btnPrimary} ${submitStyles.submitButton}`} type="submit">
                  Continue on GitHub <MoveRight size={16} />
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </Layout>
  );
}
