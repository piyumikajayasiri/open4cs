# Evaluation test dataset

12 labelled software test cases. No database import is performed.

## Two ready-to-enter examples

Enter either column at `/evaluate`. Option labels use spaces instead of underscores.

| Field | TC-01 Ruby | TC-02 Blue sapphire |
| --- | --- | --- |
| Variety | RUBY | SAPPHIRE |
| Origin | Sri Lanka | Sri Lanka |
| Origin source | UNVERIFIED | UNVERIFIED |
| Shape | OVAL | OVAL |
| Treatment | HEATED | UNHEATED |
| Weight (ct) | 1.5 | 2 |
| Hue | RED | BLUE |
| Tone | 5 | 5 |
| Saturation | STRONG | VIVID |
| Distribution | EVEN | EVEN |
| Zoning | MINOR | NONE |
| Naked eye | SLIGHTLY_INCLUDED | CLEAN |
| 10× loupe | MODERATE | MINOR |
| Inclusion severity | MINOR | MINOR |
| Length (mm) | 8 | 9 |
| Width (mm) | 6 | 7 |
| Depth (mm) | 3.9 | 4.55 |
| Symmetry | GOOD | EXCELLENT |
| Polish | EXCELLENT | GOOD |
| Windowing | MINOR | NONE |
| Extinction | NONE | MINOR |
| Bulging | NONE | NONE |

## Expected results

These expectations use the source-controlled mock rules/history. Changes to active database data or rules can change results.

| Case | Expected behavior |
| --- | --- |
| TC-01: Heated oval ruby with matching historical fixtures | Save; overall 7.5/10; USD 1080–1620 mock range |
| TC-02: Unheated oval blue sapphire with matching historical fixtures | Save; overall 9.2/10; USD 960–1440 mock range |
| TC-03: Heated oval pink sapphire | Save; overall 9.2/10; USD 480–720 mock range |
| TC-04: Heated oval yellow sapphire | Save; overall 9.2/10; USD 288–432 mock range |
| TC-05: Unknown treatment: save scores without a price | Save; overall 9.2/10; price unavailable |
| TC-06: Emerald cut: no matching mock historical shapes | Save; overall 9.2/10; price unavailable |
| TC-07: Large weight: no comparable mock weight coverage | Save; overall 7.8/10; price unavailable |
| TC-08: Zero carat weight is rejected | Reject: caratWeight |
| TC-09: Fractional tone is rejected | Reject: color.tone |
| TC-10: Length shorter than width is rejected | Reject: cut.length |
| TC-11: Round shape with excessive length-width ratio is rejected | Reject: cut.width |
| TC-12: Ruby with unsupported blue hue is rejected | Reject: color.hue |

## JSON / API use

Full observations and expected outcomes are in `evaluation-test-cases.json`.
For a signed-in API test, submit one case's `observations` and a fresh UUID v4
`submissionKey` to `POST /api/evaluations`. The expected block is for comparison
only. Do not import this dataset into real reference or historical collections.
