const persons = require('./persons.json');
const places = require('./places.json');
const users = require('./users.json');
const eventgs = require('./eventgs.json');
const citations = require('./citations.json');
const immts = require('./immts.json');
const forums = require('./forums.json');

export const PARAMETERS = [
    { key: 'agpa_phase_boundaries', value: `{ p1: '1/1-15/12', p2: '26/12', p3: '-30/12', p4: '34/12', p5:'5/1' }`},
    { key: 'log_last_autocheck', value: '1546845010' },
    { key: 'site_offline', value: null },
];

export const PLACES = [...places];

export const PERSONS = [...persons];
// TODO: link persons to places

export const USERS = [...users];
// TODO: link users to Persons

export const EVENTGS = [...eventgs];
// TODO: link events to Persons and Places

export const CITATIONS = [...citations];
// TODO: link to Persons and Users

export const IMMTS = [...immts];
export const FORUMS = [...forums];
export const DISCUSSIONS = [...forums];
export const MESSAGES = [...forums];
export const AGPA_CATS = [...forums];
export const AGPA_CATVARS = [...forums];
export const AGPA_PHOTOS = [...forums];
export const AGPA_VOTES = [...forums];
export const AGPA_AWARDS = [...forums];