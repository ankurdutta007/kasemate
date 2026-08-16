const VERIFIERS = {
  product: ['Prod 1', 'Prod 2'],
  consulting: ['Cons 1', 'Cons 2'],
  analyst: ['Analyst 1', 'Analyst 2'],
  general: ['Gen 1', 'Gen 2']
}

function getVerifiers(tracks) {
  const result = []
  if (tracks.length === 0) return result;

  if (tracks.length === 1) {
    const v = VERIFIERS[tracks[0]] || []
    result.push(...v.slice(0, 2))
  } else if (tracks.length === 2) {
    const v1 = VERIFIERS[tracks[0]] || []
    const v2 = VERIFIERS[tracks[1]] || []
    result.push(...v1.slice(0, 2), ...v2.slice(0, 2))
  } else if (tracks.length === 3) {
    const pool = []
    tracks.forEach(t => {
      const v = VERIFIERS[t] || []
      if (v[0]) result.push(v[0])
      if (v[1]) pool.push(v[1])
    })
    if (pool.length > 0) {
      const randomIndex = Math.floor(Math.random() * pool.length)
      result.push(pool[randomIndex])
    }
  } else if (tracks.length >= 4) {
    tracks.slice(0, 4).forEach(t => {
      const v = VERIFIERS[t] || []
      if (v[0]) result.push(v[0])
    })
  }
  
  return result.slice(0, 4)
}

console.log('1 track (consulting):', getVerifiers(['consulting']))
console.log('2 tracks (product, consulting):', getVerifiers(['product', 'consulting']))
console.log('3 tracks (product, consulting, analyst):', getVerifiers(['product', 'consulting', 'analyst']))
console.log('4 tracks:', getVerifiers(['product', 'consulting', 'analyst', 'general']))
