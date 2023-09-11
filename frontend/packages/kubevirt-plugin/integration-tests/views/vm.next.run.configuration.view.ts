import { $, $$ } from 'protractor';

export const isPCAlertPresent = async (): Promise<boolean> =>
  $('.pf-v5-c-alert.pf-m-inline.pf-m-warning.kv__pending_changes-alert').isPresent();

export const isPCInfoAlertPresent = async (): Promise<boolean> =>
  $('.pf-v5-c-alert.pf-m-inline.pf-m-info.kv__pending_changes-alert').isPresent();

export const alertHeadings = async (): Promise<string[]> =>
  $$('.pf-v5-c-breadcrumb.kv-warning--pf-v5-c-breadcrumb * .pf-v5-c-breadcrumb__heading').map((x) =>
    x.getText(),
  );

export const alertValues = async (): Promise<string[]> =>
  $$('.pf-v5-c-breadcrumb.kv-warning--pf-v5-c-breadcrumb * .kv-warning-changed-attrs').map((x) =>
    x.getText(),
  );
