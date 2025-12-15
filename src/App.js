import './App.css';
import { useState } from 'react';

function findCombinationsFromText(text) {
  if (!text || typeof text !== 'string') return [];

  const HIERARCHY = [
    'Group',
    'Category',
    'Subcategory',
    'Make',
    'Model',
    'Diagram'
  ];

  let clean = text
    .replace(/[^A-Za-z0-9,_-]/g, '')   // remove junk
    .replace(/[,]+/g, '-')             // normalize commas → hyphens
    .replace(/-{2,}/g, '-')             // no double hyphens
    .replace(/^-+|-+$/g, '')            // trim hyphens
    .trim();


  // 2. Extract tags using prefix-aware stopping
  const found = {};
  const prefixRegex = HIERARCHY.join('|');

  for (const prefix of HIERARCHY) {
    const regex = new RegExp(
      `${prefix}_([A-Za-z0-9-]+?)(?=(${prefixRegex})_|$)`,
      'g'
    );

    const matches = [...clean.matchAll(regex)];

    // duplicate prefix → invalid
    if (matches.length > 1) return [];

    if (matches.length === 1) {
      let value = matches[0][1]
        .replace(/^-+/, '')      // remove leading hyphens
        .replace(/-+$/, '')      // remove trailing hyphens
        .replace(/-{2,}/g, '-'); // collapse double hyphens

      found[prefix] = `${prefix}_${value}`;
    }

  }

  const allTokens = clean.split('-');

  for (const token of allTokens) {
    if (!token.includes('_')) continue;

    const prefix = token.split('_')[0];
    if (!HIERARCHY.includes(prefix)) {
      return [];
    }
  }


  // 3. Special rule: only Make → Model → Diagram allowed
  const existing = Object.keys(found);
  const onlyLower =
    existing.every(p => ['Make', 'Model', 'Diagram'].includes(p));

  const orderedPrefixes = onlyLower
    ? ['Make', 'Model', 'Diagram']
    : HIERARCHY;

  const ordered = orderedPrefixes
    .filter(p => found[p])
    .map(p => found[p]);

  if (ordered.length === 0) return [];

  // 4. Build combinations (most specific → least)
  const combinations = [];
  for (let i = ordered.length; i > 0; i--) {
    combinations.push(ordered.slice(0, i));
  }

  return combinations;
}


function App() {
  const [input, setInput] = useState('');

  const combinations = findCombinationsFromText(input);

  return (
    <div className="App" style={{ padding: '40px' }}>
      <h1>Tag Combination Generator</h1>

      <textarea
        rows={4}
        style={{ width: '100%', maxWidth: '600px' }}
        placeholder="Enter metafield text..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <h3 style={{ marginTop: '20px' }}>Output</h3>

      {combinations.length === 0 ? (
        <p>No valid tags found</p>
      ) : (
        <ul>
          {combinations.map((combo, index) => (
            <li key={index}>
              [{combo.map(tag => `'${tag}'`).join(', ')}]
            </li>

          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
