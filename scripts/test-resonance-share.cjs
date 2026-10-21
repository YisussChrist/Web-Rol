const {chromium}=require('playwright');
const {pathToFileURL}=require('url');
const path=require('path');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge',args:['--allow-file-access-from-files']});
 try {
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{HTMLMediaElement.prototype.play=async function(){};HTMLMediaElement.prototype.load=function(){};});
  await page.goto(pathToFileURL(path.resolve('index.html')).href+'#route=OST%2Findex.html');
  await page.frameLocator('#siteFrame').locator('#catalog').waitFor();
  await page.evaluate(()=>{ResonanceShell.setTrack(7,false);ResonanceShell.showTrackShare(7);});
  await page.locator('#songShareCover').evaluate(img=>img.decode());
  const title=await page.locator('#songShareTitle').textContent();
  const link=await page.locator('#songShareLink').inputValue();
  assert(link.includes('track'));
  await page.locator('#closeSongShare').click();await page.goto(link);
  await page.locator('#songShareDialog').waitFor({state:'visible'});
  assert.equal(await page.locator('#songShareTitle').textContent(),title);
  assert.equal(await page.evaluate(()=>ResonanceShell.getState().current),7);
  await page.locator('#copySongLink').click();assert(await page.locator('#songShareStatus').textContent());
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'docs/resonance-compartir-390.png'});
  assert.equal(await page.locator('#songShareDialog').evaluate(e=>e.scrollWidth>e.clientWidth),false);
  await page.keyboard.press('Escape');assert.equal(await page.locator('#songShareDialog').isVisible(),false);
  assert.deepEqual(errors,[]);console.log('Song link, artwork, copy feedback, mobile and Escape passed:',title);
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
