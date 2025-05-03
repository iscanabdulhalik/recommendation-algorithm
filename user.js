import languagesCode from "./languages.js";
import hobbies from "./hobbies.js";
import { faker } from "@faker-js/faker";
import fs from "fs";

const lastSeen = () => {
  const now = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(now.getMonth() - 3);

  return faker.date.between({
    from: threeMonthsAgo,
    to: now,
  });
};

const randomLearnedLanguage = () => {
  return faker.helpers.arrayElement(languagesCode).code;
};

const randomNativeLanguage = () => {
  return faker.helpers.arrayElement(languagesCode).code;
};

const randomHobbies = () => {
  const numberOfHobbies = faker.number.int({ min: 1, max: 5 });
  const userHobbies = [];

  const hobbyOptions = [...hobbies];

  for (let i = 0; i < numberOfHobbies; i++) {
    if (hobbyOptions.length === 0) break;

    const randomIndex = faker.number.int({
      min: 0,
      max: hobbyOptions.length - 1,
    });

    userHobbies.push(hobbyOptions[randomIndex].hobby);

    hobbyOptions.splice(randomIndex, 1);
  }

  return userHobbies;
};

const randomBirthDate = () => {
  return faker.date.birthdate({ min: 18, max: 65, mode: "age" });
};

class User {
  constructor(name) {
    this.name = name;
    this.learnedLanguage = randomLearnedLanguage();
    this.nativeLanguage = randomNativeLanguage();
    this.hobby = randomHobbies();
    this.birthDate = randomBirthDate();
    this.lastSeen = lastSeen();
  }
}

const users = [];

for (let i = 0; i < 10000; i++) {
  const user = new User(`User${i}`, `user${i}@mail.com`);
  users.push(user);
}

fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
