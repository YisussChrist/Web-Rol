// Run with Playwright available: node scripts/test-pokedamage.cjs
// Optional: POKEDAMAGE_SCREENSHOTS=<directory>, POKEDAMAGE_BROWSER=msedge
const assert = require('node:assert/strict');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {chromium} = require('playwright');

(async () => {
  const browser = await chromium.launch({channel:process.env.POKEDAMAGE_BROWSER || 'msedge',headless:true});
  try {
    const page = await browser.newPage({viewport:{width:1440,height:1000}});
    const errors = [];
    page.on('pageerror',error => errors.push(error.message));
    // Tests deliberately run offline; artwork must not affect calculations.
    await page.route('https://**',route => route.abort());
    await page.goto(pathToFileURL(path.resolve(__dirname,'../Pokemon/dsadsa/index.html')).href);
    assert.match(await page.locator('#result').innerText(),/288–340 PS/);
    assert.equal(await page.locator('#attackerItem option').count(),584);
    assert.equal(await page.locator('#moveExamples option').count(),942);

    const checks = await page.evaluate(() => {
      const passed = [];
      const assert = (condition,label) => { if (!condition) throw new Error(label); passed.push(label); };
      const set = (id,value) => document.getElementById(id).value = String(value);
      const chooseMove = name => { set('moveName',name); loadMove(); };
      const result = () => { const atk = makePokemon('attacker'); return calc.calculate(gen,atk,makePokemon('defender'),makeMove(atk),makeField()); };
      const max = () => result().range()[1];
      const output = () => { calculateDamage(); return document.getElementById('result').textContent; };

      loadExample();
      assert(makePokemon('attacker').rawStats.atk === 93 && makePokemon('attacker').rawStats.spa === 141,'Modest affects Attack and Special Attack separately');
      const baseline = max(); set('attackerItem','Life Orb'); assert(max() > baseline,'Life Orb boosts damage');
      set('magicRoom','yes'); assert(max() === baseline,'Magic Room suppresses Life Orb');
      set('magicRoom','no'); set('attackerItem','');
      set('defenderItem','Occa Berry'); assert(max() < baseline && max() > baseline * .45,'Occa Berry reduces super-effective Fire damage');
      set('defenderItem','');
      chooseMove('Surf'); const water = max(); set('attackerItem','Charcoal'); assert(max() === water,'Charcoal does not boost Water moves');
      set('attackerItem','');

      loadPokemon('defender','Shedinja'); chooseMove('Surf');
      assert(makePokemon('defender').maxHP() === 1,'Shedinja has exactly 1 HP');
      assert(max() === 0,'Wonder Guard blocks neutral hits');
      chooseMove('Flamethrower'); assert(max() > 0,'Wonder Guard permits super-effective hits');
      loadPokemon('defender','Garchomp'); chooseMove('Thunderbolt'); assert(max() === 0,'Ground type is immune to Electric');

      loadExample(); set('critical','yes'); const crit = max();
      set('spAttackBoostInline','-6'); set('spDefenseBoostInline','6');
      assert(max() === crit,'Critical ignores negative offense and positive defense stages');
      set('critical','no'); assert(max() < crit,'Non-critical uses those stages');

      loadExample(); set('defenderItem','Focus Sash');
      assert(output().includes('0.0% de probabilidad de KO') && output().includes('Tras el golpe: 1–1 PS'),'Focus Sash prevents full-HP single-hit KO');
      set('currentHp','144'); assert(output().includes('100.0% de probabilidad de KO'),'Focus Sash fails when HP is not full');
      set('currentHp','0'); set('defenderItem',''); set('defenderAbility','Sturdy');
      assert(output().includes('0.0% de probabilidad de KO'),'Sturdy prevents full-HP KO');
      set('attackerAbility','Mold Breaker'); assert(output().includes('100.0% de probabilidad de KO'),'Mold Breaker bypasses Sturdy');
      set('defenderAbility',''); set('defenderItem','Focus Band');
      assert(output().includes('90.0% de probabilidad de KO') && output().includes('Tras el golpe: 0–1 PS'),'Focus Band includes 10% survival');

      loadExample(); chooseMove('Swords Dance'); assert(output().includes('0–0 PS'),'Status move never reuses old damage power');
      loadPokemon('attacker','Cloyster'); loadPokemon('defender','Dragonite'); chooseMove('Icicle Spear'); set('moveHits','5');
      const multi = result(); assert(Array.isArray(multi.damage[0]) && multi.damage.length === 5,'Engine returns five independent hit distributions');
      assert(multi.range()[0] === multi.damage.reduce((sum,rolls) => sum + rolls[0],0),'Multihit range sums the per-hit damage');
      assert(output().includes('probabilidad de KO multigolpe no se estima'),'Multihit KO probability is not misreported as a single random roll');

      loadExample(); set('moveMode','manual'); set('moveType','Water'); set('moveCategory','special'); set('movePower','60'); set('moveTag','blade');
      const noSharpness = max(); set('attackerAbility','Sharpness'); assert(max() > noSharpness,'Manual slicing flag activates Sharpness');
      set('zMoveMode','auto'); assert(makeMove(makePokemon('attacker')).bp === 120,'Automatic Z power follows manual base power');

      loadExample(); set('atkEV','252'); set('spaEV','252'); set('atkSpeEV','252');
      assert(output().includes('supera el límite de 510 EV'),'EV total above 510 is rejected');
      set('atkEV','0'); set('spaEV','0'); set('atkSpeEV','0'); set('hpIV','32');
      assert(output().includes('Revisa los valores numéricos'),'IV above 31 is rejected');
      set('hpIV','31'); set('currentHp','999'); assert(output().includes('no pueden superar'),'Current HP above maximum is rejected');
      loadExample(); set('currentHp','10'); loadPokemon('defender','Blissey'); assert(val('currentHp') === '0','Loading a defender resets HP to automatic full');
      set('attackerItem','Life Orb'); fillItems('attacker','baya'); assert(val('attackerItem') === 'Life Orb','Filtering items preserves equipped item');
      fillItems('attacker',''); set('defenderLevel','73'); set('defenseNature','Calm'); saveState();
      return passed;
    });
    await page.reload();
    assert.equal(await page.locator('#defenderLevel').inputValue(),'73');
    assert.equal(await page.locator('#defenseNature').inputValue(),'Calm');
    assert.equal(await page.locator('#attackerItem').inputValue(),'Life Orb');
    assert.match(await page.locator('#result').innerText(),/Blissey/);
    await page.locator('#attackerName').fill('unrecognized-pokemon');
    await page.locator('#calculateDamage').click();
    assert.match(await page.locator('#result').innerText(),/Carga primero/);
    await page.locator('#loadExample').click();
    if (process.env.POKEDAMAGE_SCREENSHOTS) await page.screenshot({path:path.join(process.env.POKEDAMAGE_SCREENSHOTS,'pokedamage-desktop.png'),fullPage:true});
    for (const width of [1024,390,320]) {
      await page.setViewportSize({width,height:844});
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),`No page overflow at ${width}px`);
      if (width === 390 && process.env.POKEDAMAGE_SCREENSHOTS) await page.screenshot({path:path.join(process.env.POKEDAMAGE_SCREENSHOTS,'pokedamage-mobile.png'),fullPage:true});
    }
    assert.deepEqual(errors,[]);
    console.log(`Pokémon calculator checks passed, including ${checks.length} mechanics checks, offline loading, persistence and mobile layouts.`);
    checks.forEach(check => console.log(`✓ ${check}`));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
