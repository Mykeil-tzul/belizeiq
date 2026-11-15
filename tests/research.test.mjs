import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {answerQuestion} from "../site/research.mjs";
const csv = name => readFileSync(new URL("../site/"+name+".csv", import.meta.url),"utf8").trim().split("\n").slice(1).map(line=>line.split(","));
const data = {tourism:csv("tourism"),districts:csv("districts"),foods:[],places:[]};
test("research chat uses local data for comparisons",()=>{
  assert.match(answerQuestion("Compare cruise arrivals in 2019 and 2024",data).text,/2019.*1,170,558.*2024.*894,405/);
  assert.match(answerQuestion("Which district had the fewest residents?",data).text,/Toledo.*37,124/);
  assert.match(answerQuestion("Population of Cayo and Corozal in 2022?",data).text,/Cayo.*99,105.*Corozal.*45,310/);
});
test("research chat declines unsupported scopes",()=>{
  assert.match(answerQuestion("How many tourists visited Cayo?",data).text,/nationally/);
  assert.match(answerQuestion("How many tourists visited Belize in 2026?",data).text,/2019–2024/);
  assert.equal(answerQuestion("Explain quantum physics",data).source,undefined);
});
