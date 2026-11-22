# CAGS review pack - 17 November 2026

Status: unapproved research and project proposals. No database imports, active rule changes, source authentication or CAGS approval have been performed.

This pack contains 16 behavioural draft rules, two numerical simulation candidates, 11 pricing references and a blank B2B collection template. It does not contain a verified complete B2B quotation.

## Read these files

- [Draft rules](../../data/cags-review/2026-11-17/draft-evaluation-rules.json) - proposed behaviours with source IDs and explicit expert decisions.
- [Numerical candidates](../../data/cags-review/2026-11-17/numerical-candidates.json) - simulation-only Ruby and blue-sapphire definitions; every number is uncalibrated.
- [Parameter review](../../data/cags-review/2026-11-17/parameter-review.json) - what each experimental parameter means and what needs approval.
- [Pricing references](../../data/cags-review/2026-11-17/pricing-references.json) - original facts, missing values, calculations and conflicts.
- [Source register](../../data/cags-review/2026-11-17/sources.json) - primary URLs, locators, dates and limitations.
- [B2B collection template](../../data/cags-review/2026-11-17/b2b-collection-template.json) - request complete observations and a dated dealer quote.
- [CAGS decisions](../../data/cags-review/2026-11-17/cags-decisions.json) - blank review outcomes; no signatures or approvals invented.

## Evidence-supported principles and project choices

GIA describes colour as central to value, discusses inclusion effects and explains why cutting and weight interact. These qualitative observations do not prescribe our numeric weights. Ruby/pink-sapphire classification and fancy-sapphire colour criteria require separate decisions. [S01](https://www.gia.edu/ruby-quality-factor), [S02](https://www.gia.edu/sapphire-quality-factor).

CIBJO distinguishes geographic origin from quality and requires clear treatment communication. This supports separate provenance/treatment evidence, not an automatic origin premium. The inspected book is dated December 2022; confirm the current applicable edition. [S03](https://cibjo.org/wp-content/uploads/2023/01/22-12-22-Official-Gemstone-Book.pdf), printed pp.13 and 15.

Gemworld describes its reference market as US wholesale asking prices and evaluates cut without universal numerical proportions. Its proprietary grading tables are not imported. Gemval describes its estimates as retail averages. [S04](https://files.gemguide.com/20250212051006/2025-Workshop-handout-for-WOC.pdf), pp.1-3; [S08](https://gemval.com/faq/).

NGJA discusses colour-stability and disclosure concerns. It provides no numerical treatment premium for this project. Ask CAGS about stability evidence before extending the blue-only simulation to other colour groups. [S16](https://ngja.gov.lk/wp-content/uploads/2025/04/NGJA-Statement-on-Colour-Instability-in-Sapphire-varieties-and-Rubies.pdf).

GIA states that it does not grade sapphire quality. No project score should be called GIA-approved. [S18](https://www.gia.edu/sapphire/buyers-guide).

The proposed median estimator, numeric sample counts, age limits, tolerances, scoring tables and range width are our engineering hypotheses. They are not sourced grading standards or statistically established confidence limits.

## Simulation candidate A

| Parameter | Proposed experiment | Required CAGS decision |
| --- | --- | --- |
| Quality weighting | Colour 50%, clarity 25%, cut 25%; size 0% | Approve/revise percentages against expert cases |
| Scope | Ruby and blue sapphire only | Confirm category boundaries and supported shapes |
| Tone/depth penalties | Disabled while retaining observations | Calibrate masterstones and any defensible thresholds |
| Size score | Disabled | Decide separate size reporting; weight remains in pricing |
| Numeric observation tables | Prototype ordinal values retained for simulation | Review every value; inclusion benefits and exceptions are not fully modelled |
| Quality-based monetary adjustment | 0%; no origin or additional treatment multiplier | Calibrate only from appropriate paired evidence |
| Matching | Same variety/hue/shape/treatment; 25% weight tolerance; score difference <=2 | Validate relevance and avoid source concentration |
| Evidence count | 3-5 eligible quotations | Determine sufficient, independent evidence; three is not proof of reliability |
| Source age/currency | 180 days; USD only | Confirm market relevance, dates and explicit currency |
| Price band | Illustrative +/-20% | Replace using validation or withhold; not a confidence interval |

The candidate version is deliberately null. Files are wrapped as research data and cannot be directly activated. Allocate the next admin version only after resolving the decision log. Candidate sapphire hue is BLUE; other sapphire hues need their own review. Current engine limitations include incomplete inclusion-type/location handling, no tone/saturation interaction, no transparency field and no source-independence constraints. Even an internally accepted parameter set does not remove these limitations.

## Pricing reference inventory

| Reference | Basis | Weight | Published amount | Review limitation |
| --- | --- | --- | --- |
| CGH953 | Public ask | 4.06 ct | $ 17,500.00 total | Currency/quote date unconfirmed; incomplete observations |
| CGH931 | Public ask | 3.54 ct | $ 15,000.00 total | Currency/quote date unconfirmed; incomplete observations |
| CGH900 | Public ask | 3.54 ct | $ 8,500.00 total | Currency/quote date unconfirmed; incomplete observations |
| CGH905 | Public ask | 4.53 ct | $ 4,750.00 total | Currency/quote date unconfirmed; incomplete observations |
| S29529 | Public ask | 2 ct | $ 3,200.00 total | Currency/quote date unconfirmed; incomplete observations |
| S24346 | Public ask | 3.01 ct | $ 12,792.00 total | Currency/quote date unconfirmed; incomplete observations |
| GG-CEYLON-JAN2025 | Historical wholesale guide category | 1 ct category | $4,650-5,350 per ct | January 2025, not an individual quote; no full observations |
| CGM-2026-BLUE | Retail estimate | Not specified | USD 300-6,000+ per ct | Open-ended category range, not a hard floor or ceiling |
| CGM-2026-YELLOW | Retail estimate | Not specified | USD 30-1,200+ per ct | Open-ended category range, not a hard floor or ceiling |
| CGM-2026-PINK | Retail estimate | Not specified | USD 400-6,000+ per ct | Open-ended category range, not a hard floor or ceiling |
| CGM-2026-PURPLE | Retail estimate | Not specified | USD 100-4,000+ per ct | Open-ended category range, not a hard floor or ceiling |

Original listing symbols are retained. Dollar symbols have not been silently converted into confirmed ISO currency codes. Derived per-carat amounts are arithmetic in those native units, not validated currency-normalized valuations. Access date is not a quote date. Listing availability and certificate claims require seller/laboratory confirmation.

### Specific data-quality findings

- CGH905: blue in the title, black in the Details panel. Exclude until resolved. [S13](https://ceylongemhub.com/en/ad/ceylon-blue-sapphire-heated---4.53-cgh905).
- S24346: displayed total / weight gives 4,249.83 in native dollar units, while the page states 4,250 per carat. Both are retained; no corrected total is fabricated. Availability is also uncertain. [S15](https://www.thenaturalsapphirecompany.com/blue-sapphires/3.01ct-ceylon-sri-lankan-cushion-blue-sapphire-s24346/).
- The two ruby examples add leads for review, not evidence that Sri Lankan ruby pricing is now validated. The advertised certificate for CGH931 was not authenticated. [S10](https://ceylongemhub.com/en/ad/ruby-ceylon---4.06-cgh953), [S11](https://ceylongemhub.com/en/ad/ruby-ceylon-unheated---3.54-cts-cgh931).
- The GemGuide category benchmark is historical wholesale context, not a current Sri Lankan B2B transaction. [S07](https://files.gemguide.com/20250225101102/2025GG_MarAprilMktTrends.pdf), PDF p.1.
- The retail ranges overlap the existing Ceylon Gem Market dataset. Do not count them again as independent evidence. [S09](https://www.ceylongemmarket.com/sri-lanka-gems-price-list/).

## CAGS review meeting

1. Confirm scope and observation conditions, then annotate each behavioural rule.
2. Review each numerical assumption independently. Request a representative calibration set; do not sign off a template by its filename.
3. Request dated dealer/desk B2B quotations using the blank template. Confirm currency, trade basis, taxes/fees, origin/treatment evidence and permission.
4. Authenticate reports through the issuing laboratory; NGJA links its verification service from the [laboratory page](https://ngja.gov.lk/business_services/gem-testing-and-valuation/). Match the stone to the report.
5. Separate expert calibration cases from held-out evaluation cases. Record score agreement, price errors, unavailable-price cases and reference coverage; CAGS must set acceptance criteria before testing.
6. Independently review the completed data and definitions in the application. Sign only actual reviewed decisions.

## Access and reuse

The source register includes primary educational publications, standards, provider documentation and seller-originated facts. A primary seller page is reliable evidence of what was advertised, not independent evidence that the gemstone, price or treatment is authentic. Only concise facts and original paraphrases are retained; no marketing descriptions, images, paid tables or certificate scans were copied. Public access is not permission to redistribute a database. Reuse flags remain false pending review. GemGuide offers [API access arrangements](https://www.gemguide.com/the-gemguide-pricing/); this work did not subscribe, pay, contact sellers, send messages or obtain licences.

## What remains unresolved

There are zero verified complete B2B quotes in this pack. Current public records cannot supply all required colour/clarity/cut observations, and currency/quotation dates need confirmation on individual listings. No retailer-to-wholesale discount is assumed. Active rules and reference collections are unchanged.
