import fs from "fs";

const users = JSON.parse(fs.readFileSync("users.json", "utf-8"));

function extractHobbies(user) {
  if (Array.isArray(user.hobbies)) return user.hobbies;
  if (Array.isArray(user.hobby)) return user.hobby;
  if (user.hobby) return [user.hobby];
  return [];
}

function calculateScore(mainUser, candidate, currentTime, weights) {
  const lastSeenTime = new Date(candidate.lastSeen).getTime();
  const recencyDays = (currentTime - lastSeenTime) / (1000 * 60 * 60 * 24);
  const scoreRecency = Math.max(0, 1 - recencyDays / 90); //son görülme 90 günden fazla olanları hesaplamaya almıyoruz burada da son görülmeye en yakın olana göre oran veriyoruz

  const mainBirth = new Date(mainUser.birthDate).getTime();
  const candidateBirth = new Date(candidate.birthDate).getTime();
  const ageDiff =
    Math.abs(mainBirth - candidateBirth) / (1000 * 60 * 60 * 24 * 365.25);
  const scoreAge = Math.max(0, 1 - ageDiff / 47); //burada da yaş farkı ne kadar az olursa skor o kadar yüksek olur

  const mainHobbies = extractHobbies(mainUser);
  const candidateHobbies = extractHobbies(candidate);
  const commonHobbies = mainHobbies.filter((h) => candidateHobbies.includes(h));

  // hobi skoru hesaplama - ortak hobi sayısına göre 0 ile 1 arasında değer
  const maxPossibleCommonHobbies = Math.min(
    mainHobbies.length,
    candidateHobbies.length
  );
  const scoreHobby =
    maxPossibleCommonHobbies > 0
      ? commonHobbies.length / maxPossibleCommonHobbies
      : 0;

  const total =
    weights.recency * scoreRecency +
    weights.age * scoreAge +
    weights.hobby * scoreHobby;

  return {
    total,
    details: {
      recency: scoreRecency,
      age: scoreAge,
      hobby: scoreHobby,
      commonHobbies,
    },
  };
}

function findMatchesWithScoring(mainUserId, allUsers, topN = 5) {
  const mainUser = allUsers.find((u) => u.name === mainUserId);
  if (!mainUser) {
    console.error("Ana kullanıcı bulunamadı!");
    return [];
  }

  const currentTime = Date.now();
  const weights = { recency: 0.4, age: 0.3, hobby: 0.3 };

  let matches = allUsers
    .filter(
      (user) =>
        user.name !== mainUser.name &&
        mainUser.learnedLanguage === user.nativeLanguage &&
        mainUser.nativeLanguage === user.learnedLanguage
    )
    .map((user) => {
      const scoreData = calculateScore(mainUser, user, currentTime, weights);
      return {
        user,
        score: scoreData.total,
        scores_detail: scoreData.details,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  // Eğer hiç eşleşme bulunamazsa, rastgele kullanıcıları eşleştir
  if (matches.length === 0) {
    console.log(
      "Uygun dil eşleşmesi bulunamadı. Rastgele eşleşmeler öneriliyor..."
    );

    matches = allUsers
      .filter((user) => user.name !== mainUser.name)
      .map((user) => {
        const scoreData = calculateScore(mainUser, user, currentTime, weights);
        return {
          user,
          score: scoreData.total,
          scores_detail: scoreData.details,
          random_match: true, // Rastgele eşleşme olduğunu belirtmek için
        };
      })
      .sort(() => 0.5 - Math.random()) // Rastgele sırala
      .slice(0, topN);
  }

  return matches;
}

const mainUserName = "User9997";
const top5Matches = findMatchesWithScoring(mainUserName, users, 5);

console.log(`\n📊 En iyi 5 eşleşme (${mainUserName} için):`);
top5Matches.forEach((match, i) => {
  const { user, score, scores_detail } = match;
  const hobbies = extractHobbies(user);
  console.log(
    `\n${i + 1}. Kullanıcı: ${user.name}\n` +
      `Skor: ${score.toFixed(4)}\n` +
      `Son Görülme: ${user.lastSeen}\n` +
      `Yaş Skoru: ${scores_detail.age.toFixed(2)}\n` +
      `Hobi Skoru: ${scores_detail.hobby} ` +
      `${
        scores_detail.commonHobbies.length > 0
          ? `(Ortak hobiler: ${scores_detail.commonHobbies.join(", ")})`
          : "(Ortak hobi yok)"
      }` +
      `\nTüm Hobiler: ${hobbies.join(", ")}`
  );
});
