import assert from 'node:assert/strict';
import test from 'node:test';
import { categoryIcon, categoryLabel, initials, listingTypeLabel, statusLabel, unitLabel } from './utils.js';

test('marketplace labels are localized consistently', () => {
  assert.equal(listingTypeLabel('buy'), 'Се бара');
  assert.equal(listingTypeLabel('sell'), 'Се продава');
  assert.equal(statusLabel('inactive'), 'Неактивен');
  assert.equal(categoryLabel('tractors'), 'Трактори');
  assert.equal(unitLabel('kg'), 'кг');
});

test('category icons and initials use stable fallbacks', () => {
  assert.equal(categoryIcon('Farm equipment'), 'tractor');
  assert.equal(categoryIcon('Wheat'), 'wheat');
  assert.equal(initials('Elena Petrova'), 'EP');
  assert.equal(initials(''), '');
});
