# Vue 3 Migration Strategy

## Overview

This document outlines the strategy for migrating AbsG5 from Vue 2 to Vue 3.

**Approach**: Progressive migration with compatibility mode initially, then gradual component updates.

---

## Migration Phases

### Phase 3A: Core Setup (Current)
- ✅ Install Vite + Vue 3 dependencies
- ✅ Create Vite configuration
- ⏳ Move index.html to root
- ⏳ Update main.js for Vue 3
- ⏳ Set up Pinia (replace Vuex)
- ⏳ Update Vue Router to v4

### Phase 3B: Component Migration
- Migrate core components
- Update lifecycle hooks
- Fix v-model usage
- Update event emitters

### Phase 3C: Vuetify 3
- Install Vuetify 3
- Update component syntax
- Fix styling issues

---

## Key Breaking Changes

### 1. Global API Changes
```javascript
// Vue 2
import Vue from 'vue'
new Vue({...})

// Vue 3
import { createApp } from 'vue'
createApp({...})
```

### 2. V-Model Changes
```vue
<!-- Vue 2 -->
<component v-model="value" />

<!-- Vue 3 (same, but can have multiple) -->
<component v-model:title="title" v-model:content="content" />
```

### 3. Lifecycle Hooks
```javascript
// Vue 2
beforeDestroy() {}
destroyed() {}

// Vue 3
beforeUnmount() {}
unmounted() {}
```

### 4. Event Emitters
```javascript
// Vue 2
this.$emit('event', data)

// Vue 3 (same, but needs declaration)
emits: ['event']
this.$emit('event', data)
```

### 5. Filters Removed
```vue
<!-- Vue 2 -->
{{ value | filter }}

<!-- Vue 3 (use computed or methods) -->
{{ filterValue(value) }}
```

---

## Dependencies Migration Map

### Core
- `vue` 2.6.14 → 3.4.15
- `vue-router` 2.0.0 → 4.2.5
- `vuex` 3.6.2 → **pinia** 2.1.7 (replacement)
- `vuetify` 2.6.3 → 3.5.1

### Build Tools
- `@vue/cli-service` → **vite** 5.0.11
- `webpack` → (removed, Vite uses Rollup)

### Libraries
- `axios` 0.21.4 → 1.6.5 ✅
- `date-fns` 2.28.0 → 3.0.6 ✅
- `highcharts-vue` 1.4.0 → 2.0.1
- `vuedraggable` 2.24.3 → 4.1.0
- `leaflet` 1.7.1 → 1.9.4

### Removed (Vue 2 specific)
- `vue-template-compiler`
- `@vue/cli-*` plugins
- `babel-eslint`
- `vue-cli-plugin-vuetify`

---

## File Structure Changes

### Before (Vue CLI)
```
absg-client/
├── public/
│   └── index.html
├── src/
│   ├── main.js
│   ├── App.vue
│   └── ...
├── vue.config.js
└── package.json
```

### After (Vite)
```
absg-client/
├── index.html          # Moved to root!
├── src/
│   ├── main.js
│   ├── App.vue
│   └── ...
├── vite.config.js
└── package.json
```

---

## Migration Checklist

### Setup
- [x] Create package.json.vue3
- [x] Create vite.config.js
- [ ] Move index.html to root
- [ ] Update index.html for Vite
- [ ] Backup current package.json
- [ ] Switch to Vue 3 dependencies

### Main App
- [ ] Update main.js to Vue 3 API
- [ ] Create Pinia stores
- [ ] Update Vue Router config
- [ ] Set up Vuetify 3

### Components (Progressive)
- [ ] Update App.vue
- [ ] Update router views
- [ ] Update store usage
- [ ] Fix component syntax

### Testing
- [ ] Test dev server
- [ ] Test build process
- [ ] Test all routes
- [ ] Test all features

---

## Risk Mitigation

### Backup Strategy
1. Keep Vue 2 package.json as backup
2. Git commits after each major step
3. Test thoroughly before proceeding

### Rollback Plan
```bash
# If issues occur:
git checkout absg-client/package.json
npm install
npm run dev
```

### Progressive Approach
1. Get basic app running first
2. Fix critical components
3. Gradually update remaining components
4. Polish and optimize

---

## Known Issues & Solutions

### Issue: Import errors
**Solution**: Update imports to use `import { x } from 'vue'`

### Issue: $listeners not found
**Solution**: Merged into $attrs in Vue 3

### Issue: Filters not working
**Solution**: Convert to computed properties or methods

### Issue: Vuetify components broken
**Solution**: Update to Vuetify 3 syntax (separate phase)

---

## Next Steps

1. ✅ Create Vite config
2. ⏳ Move and update index.html
3. ⏳ Update main.js
4. ⏳ Create Pinia stores
5. ⏳ Update router
6. ⏳ Test basic app

---

**Status**: In Progress  
**Current Phase**: 3A - Core Setup  
**Date**: 2025-11-22
