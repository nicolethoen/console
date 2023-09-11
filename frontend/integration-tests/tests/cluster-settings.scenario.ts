import { browser, ExpectedConditions as until } from 'protractor';

import { appHost, checkLogs, checkErrors, BROWSER_TIMEOUT } from '../protractor.conf';
import * as crudView from '../views/crud.view';
import * as clusterSettingsView from '../views/cluster-settings.view';
import * as horizontalnavView from '../views/horizontal-nav.view';

describe('Cluster Settings', () => {
  beforeEach(async () => {
    await browser.get(`${appHost}/settings/cluster`);
    await crudView.isLoaded();
  });

  afterEach(() => {
    checkLogs();
    checkErrors();
  });

  it('display page title, horizontal navigation tab headings and pages', async () => {
    expect(clusterSettingsView.heading.isPresent()).toBe(true);
    await horizontalnavView.clickHorizontalTab('Details');
    await crudView.isLoaded();
    await horizontalnavView.clickHorizontalTab('ClusterOperators');
    await crudView.isLoaded();
    await horizontalnavView.clickHorizontalTab('Configuration');
    await crudView.isLoaded(browser.$('.co-m-table-grid'));
  });

  it('display overview channel update modal and click cancel', async () => {
    await horizontalnavView.clickHorizontalTab('Details');
    await crudView.isLoaded();

    const channelUpdateLink = await clusterSettingsView.channelUpdateLink;
    expect(await channelUpdateLink.isPresent()).toBe(true);

    await channelUpdateLink.click();
    await crudView.isLoaded();

    const channelPopupCancelButton = await clusterSettingsView.channelPopupCancelButton;
    expect(await channelPopupCancelButton.isPresent()).toBe(true);

    await channelPopupCancelButton.click();
    await crudView.isLoaded();
  });

  it('display Cluster Operators page, click resource item link to display details. Check if the resource link title equals the details page header', async () => {
    await horizontalnavView.clickHorizontalTab('ClusterOperators');
    await crudView.isLoaded();

    const clusterOperatorResourceLink = await clusterSettingsView.clusterOperatorResourceLink;
    expect(await clusterOperatorResourceLink.isPresent()).toBe(true);

    await clusterOperatorResourceLink.click();
    await crudView.isLoaded();

    const clusterResourceDetailsTitle = await clusterSettingsView.clusterResourceDetailsTitle;
    expect(await clusterResourceDetailsTitle.isPresent()).toBe(true);
    expect(await clusterResourceDetailsTitle.getText()).toBe('console');

    await horizontalnavView.clickHorizontalTab('YAML');
    await crudView.isLoaded();
  });

  it('display Configuration page, click Configuration Resource item link and display details. Check if the resource link title equals the details page header', async () => {
    await horizontalnavView.clickHorizontalTab('Configuration');
    await crudView.isLoaded(browser.$('.co-m-table-grid'));

    await browser.wait(
      until.presenceOf(browser.$('[data-test-action="Console"]')),
      BROWSER_TIMEOUT,
    );
    expect(await clusterSettingsView.globalConfigResourceLink.isPresent()).toBe(true);

    await clusterSettingsView.globalConfigResourceLink.click();
    await crudView.isLoaded();

    const clusterResourceDetailsTitle = await clusterSettingsView.clusterResourceDetailsTitle;
    expect(await clusterResourceDetailsTitle.isPresent()).toBe(true);
    expect(await clusterResourceDetailsTitle.getText()).toBe('cluster');

    await horizontalnavView.clickHorizontalTab('YAML');
    await crudView.isLoaded();
  });

  it('display Configuration page, click dropdown link to edit resource and display details, and check if details header is correct.', async () => {
    await horizontalnavView.clickHorizontalTab('Configuration');
    await crudView.isLoaded(browser.$('.co-m-table-grid'));

    await browser.wait(
      until.presenceOf(browser.$('[data-test-action="Console"]')),
      BROWSER_TIMEOUT,
    );
    await clusterSettingsView.globalConfigResourceRow.click();
    await crudView.isLoaded();

    expect(await crudView.actionForLabel('Edit Console resource').isPresent()).toBe(true);
    await crudView.actionForLabel('Edit Console resource').click();
    await crudView.isLoaded();

    const clusterResourceDetailsTitle = await clusterSettingsView.clusterResourceDetailsTitle;
    expect(await clusterResourceDetailsTitle.isPresent()).toBe(true);
    expect(await clusterResourceDetailsTitle.getText()).toBe('cluster');
  });

  it('display Configuration page, click Explore Console API in dropdown link and display details, and check if details header is correct.', async () => {
    await horizontalnavView.clickHorizontalTab('Configuration');
    await crudView.isLoaded(browser.$('.co-m-table-grid'));

    await browser.wait(
      until.presenceOf(browser.$('[data-test-action="Console"]')),
      BROWSER_TIMEOUT,
    );
    await clusterSettingsView.globalConfigResourceRow.click();
    await crudView.isLoaded();

    expect(await crudView.actionForLabel('Explore Console API').isPresent()).toBe(true);
    await crudView.actionForLabel('Explore Console API').click();
    await clusterSettingsView.globalConfigDetailsTitleIsLoaded();

    const globalConfigDetailsTitle = await clusterSettingsView.globalConfigDetailsTitle;
    expect(await globalConfigDetailsTitle.getText()).toBe('Console');
  });
});
