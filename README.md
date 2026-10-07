# Open 4Cs Gemstone Evaluation and Price Suggestion System

Open 4Cs is an educational and decision-support web application for evaluating selected cut and polished corundum gemstones using the 4Cs:

- Color
- Clarity
- Cut
- Carat Weight

The system also considers supporting information such as treatment, origin, information reliability, reference gemstones, and historical pricing to provide an explainable B2B price suggestion and educational recommendations.

The project was developed for the Open University of Sri Lanka with domain guidance and validation planned with the Ceylon Academy of Gemmological Science (CAGS).

## Important Disclaimer

Open 4Cs is an educational and decision-support system.

It does not:

- certify gemstones;
- authenticate gemstone origin;
- automatically detect gemstone treatment;
- perform AI or computer-vision gemstone grading;
- replace laboratory testing or professional gemological examination;
- provide a guaranteed selling price or professional valuation.

Scores, comparisons, recommendations, and price suggestions should be interpreted as prototype decision-support outputs based on the information supplied to the system and its configured reference data.

## Main Features

### User Features

- User registration and login
- User categories: Student, Trader, Gemologist, and Professional
- Step-by-step gemstone evaluation
- Beginner-friendly explanations of gemological terminology
- Color evaluation
- Clarity evaluation
- Cut and measurement evaluation
- Dimension-aware Carat evaluation
- Overall 4C score
- Reference gemstone comparison
- B2B price suggestion and price range
- Treatment and origin considerations
- Information reliability indicators
- Rule-based educational recommendations
- Saved evaluation history
- Side-by-side evaluation comparison
- Downloadable PDF evaluation reports

### CAGS Administration

Authorized CAGS administrators can access protected management and audit features for:

- Reference gemstones
- Supported gemstone varieties
- Treatment information
- Origin information
- Evaluation rule-version visibility
- Historical reference pricing
- Recommendation-rule descriptions

Core prototype evaluation rules remain engine-controlled so administrative content changes cannot silently alter evaluation behavior.

## Technology Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- MongoDB Community Server
- Mongoose
- JWT-based session authentication
- bcryptjs
- pdf-lib

## Prerequisites

Before running the project, install:

- Node.js
- npm
- MongoDB Community Server

MongoDB Compass is optional but useful for viewing the local database.

## Installation

Clone the repository and install dependencies:

```bash
cd open4cs
npm install
```

## Environment Variables

Create a `.env.local` file in the project root.

```env
MONGODB_URI=mongodb://127.0.0.1:27017/gemstone_evaluation
SESSION_SECRET=replace-with-a-long-random-secret
```

Do not commit `.env.local` or expose the session secret.

## MongoDB Setup

Start MongoDB Community Server before running Open 4Cs.

The default local development database is:

```text
gemstone_evaluation
```

Default connection:

```text
mongodb://127.0.0.1:27017/gemstone_evaluation
```

The application uses MongoDB through Mongoose.

Some supported registries are initialized duplicate-safely by their application/API flows. A demonstration environment may still require prepared reference gemstones, rule-version data, historical pricing records, and an authorized CAGS administrator account.

## Development

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Production Build

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

For production deployments, use a strong `SESSION_SECRET`, configure the appropriate MongoDB connection, and serve the application over HTTPS.

## Type Checking

Run:

```bash
npx tsc --noEmit
```

## Typical User Workflow

1. Create an account or log in.
2. Start a gemstone evaluation.
3. Enter the gemstone variety and carat weight.
4. Record Color observations.
5. Record Clarity observations.
6. Enter Cut measurements and observations.
7. Enter treatment, origin, and information reliability details.
8. Submit the evaluation.
9. Review the 4C scores, reference comparison, price suggestion, recommendations, and reliability information.
10. View the saved evaluation in history.
11. Compare two saved evaluations if required.
12. Download the PDF evaluation report.

## CAGS Administrator Workflow

An authorized CAGS administrator can log in and open the Admin dashboard to review and manage supported administrative data.

Administrative access is protected by role-based access control.

Public registration creates normal user accounts only and cannot create a CAGS administrator.

## Evaluation Approach

The current prototype uses transparent, rule-based evaluation logic.

The overall 4C prototype weighting is:

| Factor | Weight |
| --- | ---: |
| Color | 35% |
| Clarity | 25% |
| Cut | 20% |
| Carat | 20% |

These values are prototype parameters and should be reviewed and validated by CAGS experts before being treated as authoritative gemological criteria.

Reference comparison, treatment/origin adjustments, price-range parameters, Carat size-consistency rules, and recommendation rules are also subject to expert validation.

## Pricing

The system uses suitable reference gemstones and similarity information to produce an estimated B2B price suggestion where sufficient reference data is available.

The system prevents incompatible currencies from being averaged together.

Historical pricing records provide an audit trail of changes to reference prices. New evaluations use current reference data; historical evaluation results retain their saved price snapshots.

Price outputs are educational prototype suggestions and are not guaranteed selling prices.

## Testing

The project has undergone a formal 72-case system test matrix covering:

- Authentication and authorization
- Input validation
- 4C evaluation
- Reference comparison and pricing
- Recommendations and reliability
- Persistence and user isolation
- Evaluation history and comparison
- PDF reporting
- CAGS administration
- Security and scope boundaries
- Responsive and beginner-friendly UI

Current system-test result:

```text
72 PASS
0 FAIL
0 NOT TESTED
```

TypeScript checking and the Next.js production build also pass.

## Expert Validation

A five-case CAGS validation package has been prepared covering:

- Strong-quality observations
- Clarity concerns
- Cut concerns
- Color concerns
- Low-information and verification concerns

Prototype scoring rules, weights, pricing assumptions, Carat-size relationships, and recommendations should be reviewed against CAGS expert judgment before final academic conclusions are made.

## Project Status

Functional implementation: Complete

System testing: Complete

CAGS validation package: Prepared

CAGS expert validation: Pending external expert review
