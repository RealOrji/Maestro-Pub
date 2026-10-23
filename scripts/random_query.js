// A search term that can't match a real article: nonsense prefix + random consonants.
const consonants = 'bcdfghjklmnpqrstvwxz'
let query = 'qzxv'
for (let i = 0; i < 10; i++) {
  query += consonants[Math.floor(Math.random() * consonants.length)]
}
output.query = query
