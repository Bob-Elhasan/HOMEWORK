# The School Staff

Sixty-one Claude Code agents in `.claude/agents/`, working alongside the tech team (`docs/team/README.md`). Names, backstories, and credentials are fictional personas that give each agent a consistent voice and clear ownership. They are not real people.

Everyone reads [`mission.md`](mission.md) (the pain we solve) and [`age-groups.md`](age-groups.md) (who we teach). Decisions that touch more than one person go to the [council](council.md).

## Leadership

| Agent | Name | Role |
|---|---|---|
| `principal` | Dr. Samira El-Masry | Principal and Council Chair |
| `course-designer-chief` | Dr. Adel Barakat | Chief Course Designer |
| `course-designer-early-years` | Nevine Shukry | Course Designer, Grades 2 to 4 |
| `course-designer-upper` | Hazem Rifaat | Course Designer, Grades 5 to 8 |
| `course-designer-ethics` | Dr. Inas Ghoneim | Course Designer, Ethics and Integrity |
| `course-designer-bilingual` | Bassem Naguib | Course Designer, Bilingual and Cross-Curriculum |

## Heads of department

| Agent | Name | Subject |
|---|---|---|
| `hod-arabic` | Dr. Fathy Abdel-Aziz | Arabic |
| `hod-social-studies` | Dr. Hoda Sabry | Social Studies |
| `hod-islamic` | Dr. Ibrahim El-Feky | Islamic Religion |
| `hod-christian` | Dr. Nabil Guirguis | Christian Religion |
| `hod-math` | Dr. Shereen Kamel | Math |
| `hod-science` | Dr. Medhat Shafik | Science |

## Grade heads

| Agent | Name | Grade |
|---|---|---|
| `grade-head-g2` | Afaf Mansy | Grade 2 (Primary 2) |
| `grade-head-g3` | Wael Hegazy | Grade 3 (Primary 3) |
| `grade-head-g4` | Sahar Raouf | Grade 4 (Primary 4) |
| `grade-head-g5` | Ashraf Labib | Grade 5 (Primary 5) |
| `grade-head-g6` | Nermeen Azmy | Grade 6 (Primary 6) |
| `grade-head-g7` | Khaled Sorour | Grade 7 (Preparatory 1) |
| `grade-head-g8` | Dr. Ola Tantawy | Grade 8 (Preparatory 2) |

## Teachers

One teacher per subject per grade. Agent names follow `teacher-<subject>-g<grade>`.

| Grade | Arabic | Social Studies (Discover in G2-3) | Islamic Religion | Christian Religion | Math | Science |
|---|---|---|---|---|---|---|
| G2 (Primary 2) | Zeinab Hamed | Nada Elwan | Abdallah Nasr | Mina Wadie | Ehab Salama | Engy Mahrous |
| G3 (Primary 3) | Osama Fouad | Walid Shawki | Hagar Ismail | Marina Habib | Lamiaa Ezz | Ramy Salah |
| G4 (Primary 4) | Rehab Saeed | Marwa Sultan | Yehia Darwish | Bishoy Nassif | Sameh Wagdy | Hend Sobhy |
| G5 (Primary 5) | Hany Mekky | Islam Badawy | Asmaa Ghanem | Christine Botros | Nesma Hamza | Mai Zahran |
| G6 (Primary 6) | Samia Ragab | Reem Abaza | Bilal Shehata | Kerolos Mikhail | Adham Kassem | Mohab Gad |
| G7 (Prep 1) | Moataz Helmy | Ayman Hussein | Fatma Rabie | Demiana Rizk | Dalia Youssry | Yara Fahmy |
| G8 (Prep 2) | Doaa Sherif | Shaimaa Fekry | Hamza Eid | Peter Ghali | Haitham Ramadan | Seif Mounir |

## How the staff work together

**Writing a lesson**
1. The teacher drafts it from the Ministry book or the verified standard for their grade.
2. The course designer for the grade band places it in the course sequence.
3. The head of department checks subject accuracy; the grade head checks age fit.
4. `course-designer-ethics` checks anything involving rewards, feedback, or sensitive content.
5. The tech team takes over: `curriculum-data-engineer`, `ai-tutor-engineer`, `ai-safety-red-teamer`, `qa-engineer`.

**Disagreements** go to the council (`/council <question>`). Heads of department hold a veto on subject accuracy, grade heads on age fit, and `course-designer-ethics` on ethics.

## Using the staff

- "Ask teacher-math-g4 to draft a lesson on CCSS 4.NF.B."
- "Have grade-head-g7 review this tutor reply for a 12-year-old."
- "Ask hod-arabic how grammar should progress from grade 4 to grade 6."
- "/council Should leaderboards exist for grade 2 children?"

New agents load when a session starts, so open a new session if someone does not appear.
