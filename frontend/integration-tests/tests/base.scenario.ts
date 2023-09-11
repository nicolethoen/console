import { browser, ExpectedConditions as until, $, $$ } from 'protractor';

import { appHost, testName } from '../protractor.conf';
import * as crudView from '../views/crud.view';

const BROWSER_TIMEOUT = 15000;

describe('Create a test namespace', () => {
  beforeAll(async () => {
    await browser.get(appHost);
    await crudView.isLoaded();
  });

  it('creates test namespace if necessary', async () => {
    // Use projects if OpenShift so non-admin users can run tests.
    const resource = browser.params.openshift === true ? 'projects' : 'namespaces';
    await browser.get(`${appHost}/k8s/cluster/${resource}`);

    await browser.wait(until.presenceOf($('.co-virtualized-table')), BROWSER_TIMEOUT);
    const isNamespaceRowPresent = await crudView.rowForName(testName).isPresent();

    if (!isNamespaceRowPresent) {
      await crudView.createYAMLButton.click();
      await browser.wait(until.presenceOf($('.modal-body__field')));
      await $$('.modal-body__field').get(0).$('input').sendKeys(testName);
      await $$('.modal-body__field').get(1).$('input').sendKeys(`test-name=${testName}`);
      await $('.modal-content').$('#confirm-action').click();
      await browser.wait(until.urlContains(`/${testName}`), BROWSER_TIMEOUT);
    }

    expect(browser.getCurrentUrl()).toContain(appHost);
  });
});
