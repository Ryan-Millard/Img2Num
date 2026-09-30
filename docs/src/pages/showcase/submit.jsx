import Layout from "@theme/Layout";
import { CheckCircle2, MoveRight } from "lucide-react";
import React from "react";
import styles from "../index.module.css";
import submitStyles from "./submit.module.css";

const issueUrl = "https://github.com/Ryan-Millard/Img2Num/issues/new";

const criteria = ["The project actually uses Img2Num.", "It is publicly reachable.", "It is not unlawful, NSFW, or spammy.", "Maintainers may decline or remove entries at their discretion."];

export default function ShowcaseSubmit() {
  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams({
      template: "showcase-submission.yml",
      project_name: formData.get("project_name"),
      project_url: formData.get("project_url"),
      repository_url: formData.get("repository_url"),
      description: formData.get("description"),
      binding: formData.get("binding"),
    });

    const screenshot = formData.get("screenshot");
    if (screenshot) {
      params.set("screenshot", screenshot);
    }

    window.location.href = `${issueUrl}?${params.toString()}`;
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
                  <label htmlFor="repository_url">Source repository</label>
                  <input id="repository_url" name="repository_url" type="url" placeholder="https://github.com/user/repository" required />
                </div>
              </div>

              <div className={submitStyles.field}>
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" rows={5} placeholder="What does your project do, and how does it use Img2Num?" required />
              </div>

              <div className={submitStyles.twoColumn}>
                <div className={submitStyles.field}>
                  <label htmlFor="binding">Img2Num binding used</label>
                  <select id="binding" name="binding" defaultValue="" required>
                    <option value="" disabled>
                      Select a binding
                    </option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="Python">Python</option>
                    <option value="C">C</option>
                    <option value="C++">C++</option>
                  </select>
                </div>

                <div className={submitStyles.field}>
                  <label htmlFor="screenshot">
                    Screenshot URL <span>optional</span>
                  </label>
                  <input id="screenshot" name="screenshot" type="url" placeholder="https://example.com/screenshot.png" />
                </div>
              </div>

              <label className={submitStyles.confirmation}>
                <input name="criteria" type="checkbox" required />
                <span>I confirm that this project meets the listing criteria.</span>
              </label>

              <div className={submitStyles.actions}>
                <p>You'll review the pre-filled issue on GitHub before submitting it.</p>
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
