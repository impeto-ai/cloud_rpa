import { chromium } from 'playwright';
import process from 'node:process';
import { Storage } from '@google-cloud/storage';

(async () => {
  const EMAIL  = process.env.ESO_USER;
  const PASS   = process.env.ESO_PASS;
  const BUCKET = process.env.SCREENSHOT_BUCKET || 'eso-rpa-screens';

  const storage = new Storage();
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page    = await (await browser.newContext()).newPage();

  try {
    await page.goto('https://core.sistemaeso.com.br/account/login',
                    { waitUntil: 'domcontentloaded' });

    await page.fill('#email', EMAIL);
    await page.fill('#Password', PASS);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('button.submit-btn')
    ]);

    if (page.url().includes('/account/login'))
      throw new Error('Login falhou — permaneceu na tela de login.');

    await page.waitForTimeout(3000);                // espera 3 s
    const localPath = '/tmp/dashboard.png';
    await page.screenshot({ path: localPath, fullPage: true });

    const fileName = `dashboard-${Date.now()}.png`;
    await storage.bucket(BUCKET).upload(localPath, { destination: fileName });

    console.log(`Login OK — cheguei ao sistema! Screenshot salvo em gs://${BUCKET}/${fileName}`);
  } catch (e) {
    console.error('Erro:', e.message);
    throw e;
  } finally {
    await browser.close();
  }
})();
