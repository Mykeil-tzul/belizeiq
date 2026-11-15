import {answerQuestion, faq} from "./research.mjs";
const byId = id => document.getElementById(id);
const fmt = value => new Intl.NumberFormat("en-BZ").format(value);
const places = [
  ["reef","Great Blue Hole","Lighthouse Reef","A marine sinkhole ringed by the turquoise waters of Lighthouse Reef."],
  ["caye","Caye Caulker","Belize District","A coral island with waterfront docks and access to the Belize Barrier Reef."],
  ["xun","Xunantunich","Cayo District","A Maya archaeological site with the towering El Castillo pyramid."],
  ["lamanai","Lamanai","Orange Walk District","A Maya site set amid forest near the New River Lagoon."]
];
const foods = [
  ["fry","Fry jacks","Breakfast","Puffed fried dough served with eggs, beans, or other savory sides."],
  ["rice","Rice and beans with stew chicken","Creole cooking","Coconut rice and red kidney beans with stew chicken, often served with potato salad."],
  ["hudut","Hudut","Garifuna cooking","Mashed plantains served with fish in a seasoned coconut broth."],
  ["panades","Panades","Street food","Golden masa turnovers filled with fish or beans, often served with onion sauce."],
  ["garnaches","Garnaches","Street food","Crisp corn tortillas topped with refried beans, grated cheese, and onion."],
  ["tacos","Fried tacos","Street food","Rolled tortillas fried until crisp and served with cabbage and salsa."]
];
function cards(id, entries) {
  byId(id).replaceChildren(...entries.map(([image,name,region,description]) => {
    const article = document.createElement("article");
    article.className = "card";
    if (image) {
      const img = document.createElement("img");
      img.src = `images/${image}.jpg`;
      img.alt = `Illustration of ${name}`;
      img.loading = "lazy";
      article.append(img);
    }
    const body = document.createElement("div");
    for (const [tag,text] of [["p",region],["h3",name],["p",description]]) {
      const item = document.createElement(tag);
      item.textContent = text;
      body.append(item);
    }
    article.append(body);
    return article;
  }));
}
async function load(file) {
  const response = await fetch(file);
  if (!response.ok) throw new Error(file);
  return response;
}
async function rows(file) {
  const csv = await (await load(file)).text();
  return csv.trim().split("\n").slice(1).map(line => line.split(","));
}
cards("place-grid",places);
cards("food-grid",foods);
async function tourism() {
  const values = await rows("tourism.csv");
  function render() {
    const field = byId("series").value === "overnight" ? 1 : 2;
    const max = Math.max(...values.map(item => Number(item[field])));
    byId("bars").replaceChildren(...values.map(item => {
      const [year] = item;
      const count = Number(item[field]);
      const row = document.createElement("div");
      row.className = "bar";
      const bar = document.createElement("button");
      bar.style.width = `${count / max * 100}%`;
      bar.setAttribute("aria-label", `${year}: ${fmt(count)} arrivals`);
      bar.setAttribute("aria-pressed", "false");
      bar.onclick = () => {
        byId("bars").querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed","false"));
        bar.setAttribute("aria-pressed","true");
        byId("tourism-detail").textContent = `${year} · ${fmt(count)} ${byId("series").value} arrivals`;
      };
      const total = document.createElement("span");
      total.textContent = fmt(count);
      row.append(year,bar,total);
      return row;
    }));
    byId("bars").lastChild.querySelector("button").click();
  }
  byId("series").onchange = render;
  render();
}
async function districts() {
  const population = Object.fromEntries(await rows("districts.csv"));
  const geo = await (await load("districts.geojson")).json();
  const polygons = feature => feature.geometry.type === "Polygon" ? [feature.geometry.coordinates] : feature.geometry.coordinates;
  const points = geo.features.flatMap(feature => polygons(feature).flat(2));
  const west = Math.min(...points.map(p => p[0]));
  const east = Math.max(...points.map(p => p[0]));
  const south = Math.min(...points.map(p => p[1]));
  const north = Math.max(...points.map(p => p[1]));
  const scale = Math.min(220/(east-west),280/(north-south));
  const map = byId("map");
  const paths = {};
  function select(name) {
    byId("district").value = name;
    byId("district-detail").textContent = `${name} District · ${fmt(population[name])} residents`;
    Object.entries(paths).forEach(([key,path]) => path.classList.toggle("active",key===name));
  }
  Object.keys(population).forEach(name => byId("district").add(new Option(name,name)));
  const max = Math.max(...Object.values(population));
  for (const feature of geo.features) {
    const name = feature.properties.name;
    const path = document.createElementNS("http://www.w3.org/2000/svg","path");
    const coord = ([x,y]) => `${(10+(x-west)*scale).toFixed(2)},${(10+(north-y)*scale).toFixed(2)}`;
    path.setAttribute("d", polygons(feature).flat().map(ring => "M"+ring.map(coord).join("L")+"Z").join(""));
    path.setAttribute("fill-rule","evenodd");
    path.setAttribute("fill",`hsl(167 53% ${82-49*population[name]/max}%)`);
    path.setAttribute("class","district");
    path.setAttribute("aria-label",name);
    path.onclick = () => select(name);
    paths[name] = path;
    map.append(path);
  }
  byId("district").onchange = event => select(event.target.value);
  select("Belize");
}
const researchData = Promise.all([rows("tourism.csv"), rows("districts.csv")])
  .then(([tourism, districts]) => ({tourism, districts, places, foods}))
  .catch(() => null);
function message(label, content, source) {
  const item = document.createElement("article");
  item.className = label === "You" ? "chat-question" : "chat-answer";
  const title = document.createElement("strong");
  title.textContent = label;
  const body = document.createElement("p");
  body.textContent = content;
  item.append(title, body);
  if (source) {
    const link = document.createElement("a");
    [link.textContent, link.href] = source;
    item.append(link);
  }
  return item;
}
async function ask(question) {
  const log = byId("research-log");
  const placeholder = message("BelizeIQ", "Looking at the sources…");
  log.append(message("You", question), placeholder);
  log.scrollTop = log.scrollHeight;
  const data = await researchData;
  const result = data ? answerQuestion(question, data) : {text:"The source files could not load. Try refreshing the page."};
  placeholder.replaceWith(message("BelizeIQ", result.text, result.source));
  log.scrollTop = log.scrollHeight;
}
for (const question of faq) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = question;
  button.onclick = () => ask(question);
  byId("research-faq").append(button);
}
byId("research-form").onsubmit = event => {
  event.preventDefault();
  const input = byId("research-input"), question = input.value.trim();
  if (!question) return;
  input.value = "";
  ask(question);
};
tourism().catch(() => {byId("tourism-detail").textContent = "Tourism data could not load.";});
districts().catch(() => {byId("district-detail").textContent = "District data could not load.";});
