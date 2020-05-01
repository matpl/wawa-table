# wawa-table

## 0.1.16

### Fixed

- Add bind support in the header template

## 0.1.15

### Fixed

- Reset moreItems when fetchData function is changed

## 0.1.14

### Fixed

- Load the templates in the firstUpdated function if they are not loaded yet. Can happen if used within another LitElement

## 0.1.10

### Fixed

- Update loading after first update
- Do not fetch more items before an update for rendering items is complete
- No longer fetches more items once an empty array is returned

## 0.1.9

### Fixed

- Fixed refresh issues caused by unique IDs not being unique, and wawa-tr not being properly updated

## 0.1.4

### Fixed

- No longer loads until exhaustion when the table is removed before the fetch finishes
