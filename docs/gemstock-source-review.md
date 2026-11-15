# Gemstock source review — 10 November 2026

Requested source: https://gemstock.org/collection/gems/sri-lanka/

The public collection and one sample product page were inspected. Individual
listings can include origin, total asking price, weight, quoted price per carat,
selection type (single stone, pair or set), certificate description, treatment,
clarity grade, shape, dimensions and cut grade. These are seller statements and
asking prices, not independently verified laboratory results or completed trades.

The collection also includes pairs/sets and specialty sapphire categories. A
future authorized import must distinguish those from single stones and retain
original shape/color wording rather than silently mapping unsupported categories.
Missing tone, saturation, loupe detail and other observations must remain unknown.
Retail listings must remain separate from B2B price evidence and mock data.

The site's public terms at https://gemstock.org/info/terms/ were inspected.
Section 4.4.1 restricts automated acquisition of site content; section 5.2 requires
prior written consent for copying/publishing/reproducing the site's content.
The robots file does not disallow the inspected collection/product paths, but this
does not establish permission under the separate terms.

The initial review on 10 November stopped before bulk collection. On 11 November
the user explicitly requested scraping. A factual-field collector was added for
up to 100 distinct eligible public listings, deduplicated by seller ID and product
URL. It stores asking price, weight, source-declared origin/treatment, source grade
labels, shape and dimensions when present. It does not export descriptive prose,
photographs, certificate files or private data. It stops on access restrictions
or challenges and spaces network requests. Source permission has not been
confirmed; the import does not mark permitted use or domain quality as approved.

The factual export is `data/references/gemstock-sri-lanka-listings.json`. Its
collection report records inspected pages, accepted and rejected counts, reasons,
failures and any access stop. A content fingerprint versions the extracted facts;
each accepted product includes its own URL and retrieval timestamp. Source grades
are not mapped to fabricated 4C measurements. Pairs/sets, foreign-origin stones,
specialty categories and unsupported basic colors are excluded. A variety absent
from the accepted batch is not synthesized to balance the dataset.

```powershell
node scripts/collect-gemstock-references.mjs
node scripts/import-market-references.mjs --gemstock --dry-run
node scripts/import-market-references.mjs --gemstock --apply
```

The collector caches extracted facts in `.next/gemstock-facts` for restartability.
The export distinguishes exact source total asking prices from calculated
price-per-carat values. Saved source snapshots are insert-only per dataset version;
the same version can be imported again without duplicates. Updated future snapshots
remain separate historical versions rather than overwriting past source evidence.
All entries are pending review and excluded from engine pricing. Administrators
can inspect them at `/admin/market-references`.

## Collected batch

The completed 11 November batch contains 100 distinct single-stone sapphire
listings selected from 149 inspected product links across five collection pages.
No ruby listings are represented in the accepted batch. Colors: 55 blue, 26 yellow,
11 pink, five green and three purple. There are 99 usable three-dimensional
measurements and seller clarity labels for all 100 records. Source treatment
claims normalize to 64 unheated and 35 heated; one diffusion-related treatment
description remains unmapped and is preserved verbatim as a factual label.

Original shape labels include oval, cushion, emerald/octagon, pear, round, radiant,
heart and Asscher. Retaining the seller's shape wording in reference evidence does
not add those shapes to engine support. The first collection run made 154 paced
public requests with no access stops; subsequent export rebuilds can reuse the
cached facts, so their per-run network request count can be zero.

The importer uses `--gemstock` to add this batch alongside the previous 11 source
guide entries; it does not overwrite that dataset. The admin table shows source
product links, total asking prices, derived prices per carat and available seller
observations. It does not mark those observations or source permission verified.

The previously imported 11 Ceylon Gem Market reference records remain unchanged.
