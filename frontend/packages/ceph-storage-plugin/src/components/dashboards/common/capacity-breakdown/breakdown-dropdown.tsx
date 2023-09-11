import * as React from 'react';

import {
  SelectOption as SelectOptionDeprecated,
  SelectGroup as SelectGroupDeprecated,
  OptionsMenuItemGroup as OptionsMenuItemGroupDeprecated,
  OptionsMenuItem as OptionsMenuItemDeprecated,
} from '@patternfly/react-core/deprecated';

type GroupedSelectItems = {
  group: string;
  items: { name: string; id: string }[];
}[];

export const getSelectOptions = (
  selectItems: { name: string; id: string }[],
): React.ReactElement[] =>
  selectItems.map(({ id, name }) => (
    <SelectOptionDeprecated key={id} value={id}>
      {name}
    </SelectOptionDeprecated>
  ));

export const getGroupedSelectOptions = (
  groupedSelectItems: GroupedSelectItems,
): React.ReactElement[] =>
  groupedSelectItems.map(({ group, items }) => (
    <SelectGroupDeprecated key={group} label={group}>
      {getSelectOptions(items)}
    </SelectGroupDeprecated>
  ));

export const getOptionsMenuItems = (
  dropdownItems: GroupedSelectItems,
  selectedItems: string[],
  onSelect: (e) => void,
) => {
  return dropdownItems.map(({ group, items }) => (
    <OptionsMenuItemGroupDeprecated
      className="nb-data-consumption-card__dropdown-item--hide-list-style"
      key={group}
      groupTitle={group}
    >
      {items.map((item) => (
        <OptionsMenuItemDeprecated
          onSelect={onSelect}
          isSelected={selectedItems.includes(item.id)}
          id={item.id}
          key={item.id}
        >
          {item.name}
        </OptionsMenuItemDeprecated>
      ))}
    </OptionsMenuItemGroupDeprecated>
  ));
};
