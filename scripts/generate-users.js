const { faker } = require("@faker-js/faker");
const fs = require("fs");
const path = require("path");

const outFile = path.join(__dirname, "..", "public", "users.json");
const total = 100000;

const cities = [
  "Mumbai","Delhi","Bengaluru","Chennai","Kolkata",
  "Pune","Hyderabad","Ahmedabad","Jaipur","Surat"
];
const occupations = [
  "Software Engineer","Designer","Product Manager","Teacher","Doctor",
  "Data Scientist","Sales Executive","Marketing Manager","Accountant","Student"
];

function rand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

console.log(`Generating ${total} users → ${outFile} ...`);

const stream = fs.createWriteStream(outFile, { encoding: "utf8" });
stream.write("[");

for(let i=0;i<total;i++){
  const user = {
    id: i+1,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    age: Math.floor(Math.random()*48) + 18,
    city: rand(cities),
    occupation: rand(occupations)
  };
  stream.write(JSON.stringify(user));
  if(i !== total-1) stream.write(",");
}

stream.write("]");
stream.end(() => console.log("✅ Done! users.json created."));
