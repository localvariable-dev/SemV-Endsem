# Sem-V EndSem Training Hub
### Savitribai Phule Pune University (SPPU) : TE Computer Engineering (Semester V)

A structured academic repository and Strava-style training hub organizing university past papers, high-yield frequency analyses, video lecture sequences, and syllabus specifications for Third Year Computer Engineering.

---

## 🏃 Overview & Features

The repository includes a dedicated, self-contained single-page web app located in the [`Website/`](Website/) folder:

1. **Strava-Inspired Interface:** High-contrast athletic design with tabular numerals, glanceable statistics cards, and activity feed cards.
2. **53 Academic Resources Cataloged:**
   - **33 Verified Assets on Disk:** 21 university examination question papers (May 2023 to March 2026), 6 deep syllabus/recurrence guides, 4 video roadmaps, and 1 cognitive study mentor prompt.
   - **20 Syllabus Placeholders:** Clearly marked with a "Not available" badge for upcoming revision notes and Cloud Computing materials.
3. **High-Yield "Segments" (Trophy Strip):** Direct links to high-recurrence exam patterns:
   - *Theory of Computation:* PYQ Frequency Guide (Recurrence mapped across 8 papers).
   - *Computer Networks:* Deep Analysis & 100% Probability Question Predictions.
   - *Artificial Intelligence:* Unit IV Core Video Sequence (8 essential lectures, ~131 min).
   - *ToC Unit III Notes:* CFGs, Parse Trees, and Chomsky Normal Form (5/5 recurrence topic).
4. **Socratic Learning Coach:** Integrated system prompt drawer from `Skills/System-prompt.md` with one-click clipboard copy to turn any language model into an adaptive tutor.
5. **Multi-Dimensional Filtering:** Filter by Subject (ToC, CN, AI, CC, Curriculum, Skills), Resource Type, Exam Marks (End-Sem 70M vs In-Sem 30M), and Availability.
6. **Instant Search:** Press `/` or `Cmd+K` / `Ctrl+K` to search across subjects, years, units, and topics.
7. **Theme Switcher:** Fully functional Dark and Light modes.

---

## 📂 Repository Structure

```text
SemV-Endsem/
├── 2024 TE Syllabi.pdf
├── 2019 Syllabus_be_computer-engineering_third-year-te-semester-5-6-2019-pattern.pdf
├── ToC/
│   ├── TOC_Syllabus_2024_Pattern.md
│   ├── ToC_PYQ_Frequency_Guide.pdf
│   ├── Unit-III Notes.pdf
│   └── PYQs/ (8 question papers: May 2023 - Nov 2025)
├── CN/
│   ├── CN_Syllabus_2019_vs_2024_Comparison.pdf
│   ├── CN_PYQ_Deep_Analysis_and_Predictions_Dark.pdf
│   └── PYQs/ (8 question papers: May 2023 - Nov 2025)
├── AI/
│   ├── AI_PYQ_Questions_Mapped_to_2024_Syllabus.pdf
│   ├── AI_Unit_3_Recommended_Videos_Watchlist.pdf
│   ├── AI_Unit_4_Core_Videos_Sequence.pdf
│   ├── AI_Unit_4_Recommended_Videos_Watchlist.pdf
│   └── PYQs/ (5 question papers: Mar 2024 - Mar 2026)
├── CC/ (Cloud Computing: in progress)
├── Skills/
│   └── System-prompt.md (Socratic AI Learning Coach prompt)
└── Website/
    ├── index.html (Main application)
    ├── styles.css (Strava design tokens & dark/light themes)
    ├── data.js (Catalog dataset of 53 items)
    ├── app.js (Search, filter, modal & bookmark controllers)
    └── assets/
        ├── curriculum/
        ├── toc/ (notes & pyqs)
        ├── cn/ (predictions & pyqs)
        ├── ai/ (watchlists & pyqs)
        ├── skills/
        └── cc/
```

---

## 🚀 How to Run the Website

The website is completely static with zero external dependencies or build steps required.

### Option 1: Direct File Launch
Double-click `Website/index.html` in your file manager or run:
```bash
open Website/index.html
```

### Option 2: Local HTTP Server
```bash
cd Website
python3 -m http.server 3000
```
Then visit `http://localhost:3000` in any web browser.
