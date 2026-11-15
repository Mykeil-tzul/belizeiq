const tourismSource = ["UN Belize Country Analysis · Figure 1", "https://belize.un.org/sites/default/files/2025-11/Belize%202025%20Country%20Analysis%20DIGITAL%20-%20NOV5%202025.pdf"];
const censusSource = ["Statistical Institute of Belize · 2022 Census", "https://sib.org.bz/wp-content/uploads/CensusKeyFindingsReport_2022.pdf"];
const cuisineSource = ["Travel Belize · Cuisine", "https://www.travelbelize.org/cuisine/"];
const placeSources = {
  reef: "https://www.travelbelize.org/attraction/blue-hole/",
  caye: "https://www.travelbelize.org/destinations/destinations/north-islands/caye-caulker/",
  xun: "https://www.travelbelize.org/attraction/xunantunich/",
  lamanai: "https://www.travelbelize.org/attraction/lamanai/",
};
const format = value => new Intl.NumberFormat("en-BZ").format(value);
const normalize = text => text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const contains = (query, phrase) => (" " + query + " ").includes(" " + normalize(phrase) + " ");

export const faq = [
  "How did overnight tourism recover after 2020?",
  "Compare cruise arrivals in 2019 and 2024",
  "Which district had the most residents in 2022?",
  "How many tourists visited each district?",
  "What is hudut?",
  "Where is the Great Blue Hole?",
];

export function answerQuestion(input, {tourism, districts, foods, places}) {
  const question = normalize(input);
  const years = [...new Set(question.match(/\b(?:19|20)\d{2}\b/g) || [])];
  const respond = (text, source) => ({text, source});
  const travel = /\b(touris\w*|visitor\w*|arrivals?|cruise|overnight)\b/.test(question);
  const residents = /\b(population|people|residents?|live|lives|census|populous)\b/.test(question);
  const foundDistricts = districts.filter(([name]) => contains(question, name === "Belize" ? "Belize District" : name));
  if (travel) {
    if (foundDistricts.length || /\b(district|districts|city|town|towns)\b/.test(question)) {
      return respond("The tourism figures cover Belize nationally. I don’t have visitor counts by district or town.", tourismSource);
    }
    if (years.some(year => !tourism.some(row => row[0] === year)) || /\b(latest|current|today|this year|last year)\b/.test(question)) {
      return respond("My tourism data covers full calendar years 2019–2024. I don’t have current figures or numbers outside those years.", tourismSource);
    }
    const indices = question.includes("cruise") && question.includes("overnight") ? [1, 2]
      : question.includes("cruise") ? [2] : question.includes("overnight") || /recover|pandemic/.test(question) ? [1] : [1, 2];
    const label = field => field === 1 ? "overnight" : "cruise";
    if (/\b(recover\w*|pandemic)\b/.test(question)) {
      const low = tourism.find(row => row[0] === "2020");
      const final = tourism.at(-1);
      return respond(indices.map(field => {
        const percent = ((final[field] / low[field] - 1) * 100).toFixed(1);
        return `${label(field)} arrivals rose from ${format(low[field])} in 2020 to ${format(final[field])} in ${final[0]} (+${percent}%).`;
      }).join(" "), tourismSource);
    }
    if (years.length) {
      return respond(years.map(year => {
        const row = tourism.find(item => item[0] === year);
        return year + " · " + indices.map(field => format(row[field]) + " " + label(field) + " arrivals").join(" and ");
      }).join(". ") + ".", tourismSource);
    }
    if (/\b(highest|most|peak|lowest|fewest)\b/.test(question)) {
      const direction = /lowest|fewest/.test(question) ? -1 : 1;
      return respond(indices.map(field => {
        const row = [...tourism].sort((a, b) => direction * (b[field] - a[field]))[0];
        return `${row[0]} had the ${direction === 1 ? "most" : "fewest"} ${label(field)} arrivals (${format(row[field])}) in the 2019–2024 series.`;
      }).join(" "), tourismSource);
    }
    return respond("I can show overnight and cruise arrivals by year from 2019 to 2024. Try asking for a year, comparing two years or looking up the peak year.", tourismSource);
  }
  if (residents || foundDistricts.length && /\b(compare|largest|smallest)\b/.test(question)) {
    if (years.some(year => year !== "2022") || /\b(latest|current|today|this year|last year|city|cities|town|towns)\b/.test(question)) {
      return respond("I have the 2022 census district counts. I don’t have a current population estimate or smaller-area counts in this dataset.", censusSource);
    }
    const sorted = [...districts].sort((a, b) => b[1] - a[1]);
    const selected = foundDistricts.length ? foundDistricts
      : /\b(fewest|least|smallest)\b/.test(question) ? sorted.slice(-1)
      : /\b(most|largest|highest|biggest|populous)\b/.test(question) ? sorted.slice(0, 1) : sorted;
    return respond("2022 Census · " + selected.map(([name, population]) => `${name} District: ${format(population)} residents`).join("; ") + ".", censusSource);
  }
  const place = places.find(([, name]) => contains(question, name));
  if (place && !/\b(price|cost|book|hours|open|safe|weather|ticket)\b/.test(question)) {
    return respond(`${place[1]} · ${place[2]}. ${place[3]}`, ["Travel Belize · " + place[1], placeSources[place[0]]]);
  }
  const food = foods.find(([, name]) => contains(question, name));
  if (food && !/\b(price|cost|recipe|calories|allerg\w*|cook|make|buy)\b/.test(question)) {
    return respond(`${food[1]} · ${food[2]}. ${food[3]}`, cuisineSource);
  }
  return respond("I couldn’t find a sourced answer. Try tourism arrivals, 2022 district populations, or a place or dish featured on BelizeIQ.");
}
