# BelizeIQ

[**Explore the public BelizeIQ site**](https://mykeil-tzul.github.io/belizeiq/)

I built BelizeIQ to share the food and places I associate with my Belizean roots and help people explore the data behind the country’s tourism story.

## What you can explore

- **Places** includes the Great Blue Hole, Caye Caulker, Xunantunich, and Lamanai.
- **Food** includes fry jacks, rice and beans with stew chicken, hudut, panades, garnaches, and fried tacos.
- **Tourism** compares national overnight and cruise arrivals for full calendar years from 2019 through 2024.
- **Districts** shows census populations for all six districts. Select a district on the map or use the dropdown.
- **Research questions** links three preset answers to the records that support them.

## Sources and methods

| Data | Source and coverage |
| --- | --- |
| [Tourism CSV](site/tourism.csv) | [UN Belize Country Analysis, Figure 1](https://belize.un.org/sites/default/files/2025-11/Belize%202025%20Country%20Analysis%20DIGITAL%20-%20NOV5%202025.pdf). Overnight arrivals sum the airport and land/sea border series. Cruise arrivals use their own series. |
| [District population CSV](site/districts.csv) | [Statistical Institute of Belize, 2022 Census](https://sib.org.bz/wp-content/uploads/CensusKeyFindingsReport_2022.pdf). These are resident counts. |
| [District boundaries](site/districts.geojson) | Belize features extracted from [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/). |
| Food descriptions | [Travel Belize cuisine guide](https://www.travelbelize.org/cuisine/) and [Maya and Mestizo corn-based dishes](https://www.travelbelize.org/blog/belize-maya-and-mestizo-corn-based-cuisines/). |

Tourism figures are national. District visitor totals require a separate district-level source. Destination and food images are AI-generated illustrations.

## Run locally

```bash
python3 -m http.server 8000 --directory site
```

Open `http://localhost:8000`. BelizeIQ uses static HTML, CSS and JavaScript. GitHub Actions publishes the `site/` directory to GitHub Pages. Earlier churn-dashboard work remains in the repository history.

## Ask BelizeIQ

Type a question or choose a common one. The research chat can look up arrival figures by year, compare or rank districts using the 2022 Census, and explain dishes and destinations featured in the site. It computes answers from the bundled tables and links the source. Questions about current tourism totals, district visitor numbers or unrelated subjects receive a coverage explanation. The chat runs in the browser without an LLM, and it does not send or save your questions.

Run `node --test tests/*.test.mjs` to check year comparisons, district rankings and unsupported questions.
