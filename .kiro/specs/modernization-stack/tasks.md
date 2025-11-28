# Implementation Plan - Modernization Stack AbsG5

## Phase 1: Backend Foundation & Security

- [x] 1. Prepare migration environment and backup








  - Create migration branch from main
  - Document current versions and configurations
  - Create full database backup
  - Set up rollback procedures
  - _Requirements: 10.2, 10.3_

- [x] 2. Update Node.js and TypeScript configuration



  - Update package.json to require Node.js 20.x LTS
  - Update TypeScript to 5.x
  - Update tsconfig.json to target ES2022
  - Update @types/node to match Node.js 20.x
  - Test compilation with new TypeScript version
  - _Requirements: 1.1, 1.2, 7.1_

- [x] 3. Migrate TypeORM from 0.2.x to 0.3.x



- [x] 3.1 Update TypeORM package and dependencies


  - Update typeorm to 0.3.x
  - Update pg driver to 8.12.x
  - Update reflect-metadata if needed
  - _Requirements: 1.3, 2.3_

- [x] 3.2 Migrate database configuration to DataSource API



  - Replace createConnections with DataSource
  - Update ormconfig.js to DataSource configuration
  - Update connection initialization in api.ts
  - _Requirements: 1.3_

- [x] 3.3 Update all entity files for TypeORM 0.3.x syntax


  - Update User entity with explicit column types
  - Update Photo entity
  - Update all other entities (Person, Forum, Citation, etc.)
  - Ensure all decorators use TypeORM 0.3.x syntax
  - _Requirements: 1.3, 6.3_

- [ ]* 3.4 Write property test for TypeORM DataSource API
  - **Property 1: TypeORM DataSource API consistency**
  - **Validates: Requirements 1.3**

- [x] 3.5 Update repository pattern usage


  - Replace getRepository() with DataSource.getRepository()
  - Update all service files using repositories
  - Test all database operations
  - _Requirements: 1.3, 6.3_

- [ ]* 3.6 Write property test for database query compatibility
  - **Property 5: Database query compatibility**
  - **Validates: Requirements 6.3**

- [x] 4. Update security-critical dependencies



- [x] 4.1 Update authentication packages


  - Update bcrypt to 5.1.x
  - Update jsonwebtoken to 9.0.x
  - Update JWT signing and verification code
  - _Requirements: 4.2, 4.3_

- [ ]* 4.2 Write property test for password hashing
  - **Property 7: Password hashing strength**
  - **Validates: Requirements 4.7**

- [x] 4.3 Update Express and middleware


  - Update express to 4.19.x
  - Replace express-fileupload with multer
  - Add helmet for security headers
  - Add express-rate-limit for rate limiting
  - _Requirements: 1.4, 4.1_

- [ ]* 4.4 Write property test for file upload validation
  - **Property 6: File upload validation**
  - **Validates: Requirements 4.6**

- [x] 4.5 Update other backend dependencies


  - Update axios to 1.7.x (for any backend usage)
  - Update ws to 8.18.x
  - Update winston to 3.11.x
  - Update date-fns to 3.x
  - _Requirements: 4.4, 4.5, 5.1, 5.2_

- [x] 5. Update backend services initialization


  - Update all service imports and initialization
  - Ensure all services work with new TypeORM DataSource
  - Update middleware/logger.ts if needed
  - Update middleware/index.ts for new auth
  - _Requirements: 1.3, 4.3_

- [x] 6. Checkpoint - Backend foundation complete



  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: Database Migration

- [x] 7. Prepare PostgreSQL 16.x migration


- [x] 7.1 Set up PostgreSQL 16.x test environment

  - Install PostgreSQL 16.x in development
  - Install PostGIS 3.4.x extension
  - Test connection with new pg driver
  - _Requirements: 2.1, 2.4_

- [x] 7.2 Test existing migrations on PostgreSQL 16.x

  - Run all existing TypeORM migrations
  - Verify data integrity after migrations
  - Document any compatibility issues
  - _Requirements: 2.2, 2.5_

- [ ]* 7.3 Write property test for data migration integrity
  - **Property 2: Data migration integrity**
  - **Validates: Requirements 2.5**

- [ ]* 7.4 Write property test for database backup
  - **Property 9: Database backup before migration**
  - **Validates: Requirements 10.3**

- [x] 7.5 Create migration scripts and documentation

  - Document PostgreSQL upgrade procedure
  - Create backup scripts
  - Create restore scripts
  - Test rollback procedures
  - _Requirements: 9.3, 10.1, 10.3_

- [x] 8. Update Docker configuration for PostgreSQL 16.x


  - Update docker-compose files
  - Update PostgreSQL version in containers
  - Update PostGIS version
  - Test container startup and connections
  - _Requirements: 2.1, 2.4, 10.1_

- [x] 9. Checkpoint - Database migration complete



  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: Frontend Core Migration

- [x] 10. Set up Vite build system


- [x] 10.1 Install Vite and Vue 3 dependencies






  - Install vite, @vitejs/plugin-vue
  - Install vue@3.4.x
  - Install vue-router@4.x
  - Install pinia@2.x
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 10.2 Create Vite configuration


  - Create vite.config.js
  - Configure path aliases (@/ for src/)
  - Configure proxy for API calls
  - Configure build output directory
  - _Requirements: 3.2, 7.3_

- [x] 10.3 Migrate build scripts

  - Update package.json scripts (dev, build, preview)
  - Remove Vue CLI dependencies
  - Update .gitignore for Vite
  - Test development server startup
  - _Requirements: 3.2, 7.3_


- [x] 10.4 Update index.html for Vite


  - Move index.html to project root
  - Update script tags for Vite
  - Update asset references
  - _Requirements: 3.2_

- [x] 11. Migrate to Vue 3 core




- [x] 11.1 Update main.js to Vue 3 API



  - Replace new Vue() with createApp()
  - Update plugin registration (router, store, vuetify)
  - Update global properties registration
  - Remove Vue.use() calls
  - _Requirements: 3.1, 6.1_

- [x] 11.2 Install and configure Vue 3 compatibility build



  - Install @vue/compat
  - Configure compatibility mode in vite.config.js
  - Set up migration warnings
  - _Requirements: 3.1, 6.1_

- [x] 11.3 Migrate Vue Router to v4

  - Update router.js to use createRouter
  - Replace mode: 'history' with createWebHistory()
  - Update navigation guards syntax
  - Replace * catch-all with /:pathMatch(.*)
  - Update router.push() calls to handle Promises
  - _Requirements: 3.4, 6.4_

- [ ] 12. Migrate Vuex to Pinia
- [x] 12.1 Set up Pinia


  - Install and configure Pinia
  - Create stores directory structure
  - Create main app store (replaces root Vuex store)
  - _Requirements: 3.3_

- [x] 12.2 Migrate user store from Vuex to Pinia
  - Create stores/user.js with authentication and profile management
  - Add backward compatibility layer in helpers.js
  - Update main store to delegate user actions
  - Create comprehensive migration guide
  - _Requirements: 3.3, 6.2_

- [ ]* 12.3 Write property test for state management preservation
  - **Property 4: State management preservation**
  - **Validates: Requirements 6.2**

- [x] 12.3 Migrate notification store
  - Create stores/notification.js with notifications and UI alerts
  - Manage user notifications and read/unread state
  - Handle UI notifications (snackbar, info, warning, error)
  - Update main store and helpers for delegation
  - _Requirements: 3.3, 6.2_

- [x] 12.4 Migrate photo gallery store
  - Create stores/photoGallery.js for viewer and editor
  - Manage photos, navigation, and visibility
  - Add photo management actions
  - Update main store and helpers
  - _Requirements: 3.3, 6.2_

- [x] 12.5 Migrate AGPA store
  - Create stores/agpa.js for photo contest management
  - Manage metadata, editions, and archives
  - Add phase checking and voting/submission actions
  - Update main store and helpers
  - _Requirements: 3.3, 6.2_

- [x] 12.6 Migrate WebSocket store
  - Create stores/websocket.js for real-time messaging
  - Manage connection status and reconnection
  - Handle message sending/receiving
  - Update main store and helpers
  - _Requirements: 3.3, 6.2_

- [ ] 12.7 Remove Vuex completely
  - Remove Vuex dependency from package.json
  - Verify all components use Pinia stores
  - Remove any remaining Vuex imports
  - _Requirements: 3.3_

- [x] 13. Update core dependencies for Vue 3
  - axios already at 1.6.5 (compatible with 1.7.x)
  - WebSocket handled via custom plugin (no vue-native-websocket)
  - date-fns already at 3.0.6
  - _Requirements: 4.4, 5.1_

- [x] 14. Checkpoint - Frontend core migration complete
  - All Pinia stores created and working
  - Backward compatibility layer functional
  - Frontend loads successfully

## Phase 4: Frontend UI Migration

- [ ] 15. Migrate to Vuetify 3
- [ ] 15.1 Install Vuetify 3 and configure
  - Install vuetify@3.x
  - Install vite-plugin-vuetify
  - Create vuetify plugin configuration
  - Configure theme and icons
  - _Requirements: 3.5_

- [ ] 15.2 Update App.vue for Vuetify 3
  - Replace v-app structure if needed
  - Update navigation drawer syntax
  - Update app bar syntax
  - Update main content area
  - _Requirements: 3.5, 6.5_

- [ ] 15.3 Migrate Home view components
  - Update Home.vue for Vuetify 3
  - Fix any layout issues
  - Update card components
  - _Requirements: 3.5, 6.5_

- [ ] 15.4 Migrate Admin section components
  - Update Admin.vue and child components
  - Migrate Profile.vue
  - Migrate NewPassword.vue
  - Migrate Dashboard.vue
  - Migrate Settings.vue
  - Migrate Users.vue
  - _Requirements: 3.5, 6.1, 6.5_

- [ ] 15.5 Migrate Citations components
  - Update Citations/Browser.vue
  - Fix list and card components
  - Update dialogs and forms
  - _Requirements: 3.5, 6.1, 6.5_

- [ ] 15.6 Migrate Photos section components
  - Update Photos.vue parent component
  - Migrate Immt.vue
  - Migrate Albums.vue
  - Migrate AlbumViewer.vue
  - Migrate AlbumEditor.vue
  - Migrate Browser.vue
  - Update photo gallery component
  - _Requirements: 3.5, 6.1, 6.5_

- [ ] 15.7 Migrate Forum components
  - Update Forum.vue parent
  - Migrate Tbz.vue
  - Migrate Browser.vue
  - Migrate Read.vue
  - Update rich text editor for Vue 3
  - _Requirements: 3.5, 6.1, 6.5_

- [ ] 15.8 Migrate Agenda components
  - Update Agenda.vue parent
  - Migrate Directory.vue
  - Migrate Locations.vue
  - Migrate Events.vue
  - Migrate Trombi.vue
  - Migrate Genealogy.vue
  - Update calendar component
  - _Requirements: 3.5, 6.1, 6.5_

- [ ] 15.9 Migrate AGPA components
  - Update Agpa.vue parent
  - Migrate Edition.vue
  - Migrate Monitoring.vue
  - Migrate Rules.vue
  - Migrate ArchivesSummary.vue
  - Migrate ArchiveEdition.vue
  - Migrate ArchiveCategory.vue
  - Migrate Palmares.vue
  - Migrate CeremonyMenu.vue
  - Migrate Ceremony.vue
  - _Requirements: 3.5, 6.1, 6.5_

- [ ] 15.10 Migrate GTheque components
  - Update GTheque.vue parent
  - Migrate Theques.vue
  - Migrate Grenier.vue
  - _Requirements: 3.5, 6.1, 6.5_

- [ ] 15.11 Migrate authentication components
  - Update Login.vue
  - Update AskNewPassword.vue
  - Update error pages (E404.vue)
  - _Requirements: 3.5, 6.1, 6.5_

- [ ] 16. Update third-party UI libraries
- [ ] 16.1 Update Leaflet for Vue 3
  - Replace vue2-leaflet with @vue-leaflet/vue-leaflet
  - Update map components
  - Test map functionality
  - _Requirements: 5.4_

- [ ] 16.2 Update Highcharts for Vue 3
  - Update highcharts-vue to Vue 3 version
  - Update chart components
  - Test chart rendering
  - _Requirements: 5.3_

- [ ] 16.3 Update VueDraggable for Vue 3
  - Replace vuedraggable with @vueuse/integrations or Vue 3 compatible version
  - Update drag-and-drop components
  - Test drag functionality
  - _Requirements: 5.5_

- [ ] 16.4 Update TipTap editor for Vue 3
  - Update tiptap packages to latest
  - Update editor components
  - Test rich text editing
  - _Requirements: 5.6_

- [ ] 16.5 Update other UI libraries
  - Update cropperjs if needed
  - Update vue-silentbox or find Vue 3 alternative
  - Update emoji picker for Vue 3
  - _Requirements: 5.7_

- [ ]* 17. Write property test for Vue component backward compatibility
  - **Property 3: Vue component backward compatibility**
  - **Validates: Requirements 6.1**

- [ ] 18. Checkpoint - Frontend UI migration complete
  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: Testing & Quality Assurance

- [ ] 19. Set up modern testing infrastructure
- [ ] 19.1 Configure Vitest for backend
  - Install vitest and related packages
  - Create vitest.config.ts for backend
  - Set up test database configuration
  - _Requirements: 8.2_

- [ ] 19.2 Configure Vitest for frontend
  - Install @vue/test-utils for Vue 3
  - Create vitest.config.ts for frontend
  - Configure jsdom environment
  - Set up component test utilities
  - _Requirements: 8.3_

- [ ] 19.3 Migrate existing backend tests
  - Convert Jest tests to Vitest
  - Update test syntax if needed
  - Ensure all tests pass
  - _Requirements: 8.2, 8.5_

- [ ] 19.4 Migrate existing frontend tests
  - Convert Jest tests to Vitest
  - Update component tests for Vue 3
  - Update store tests for Pinia
  - Ensure all tests pass
  - _Requirements: 8.3, 8.5_

- [ ]* 19.5 Write property test for functional test preservation
  - **Property 8: Functional test preservation**
  - **Validates: Requirements 8.5**

- [ ] 20. Create integration tests for critical flows
- [ ] 20.1 Write authentication flow tests
  - Test login with valid credentials
  - Test login with invalid credentials
  - Test password reset flow
  - Test token refresh
  - _Requirements: 8.1, 8.4_

- [ ] 20.2 Write photo upload flow tests
  - Test photo upload with valid file
  - Test photo upload with invalid file type
  - Test photo upload with oversized file
  - Test photo metadata editing
  - _Requirements: 8.1, 8.4_

- [ ] 20.3 Write forum posting flow tests
  - Test creating new topic
  - Test posting reply
  - Test editing post
  - Test deleting post
  - _Requirements: 8.1, 8.4_

- [ ] 21. Run security audit
  - Run npm audit on backend
  - Run npm audit on frontend
  - Fix any remaining vulnerabilities
  - Document any accepted risks
  - _Requirements: 4.1, 4.5_

- [ ] 22. Performance testing
  - Benchmark API response times
  - Test frontend load times
  - Test WebSocket stability
  - Compare with pre-migration metrics
  - _Requirements: 8.4_

- [ ] 23. Manual testing checklist
  - Test all user authentication flows
  - Test photo gallery and albums
  - Test forum reading and posting
  - Test AGPA voting system
  - Test agenda and events
  - Test admin functions
  - Test on multiple browsers
  - Test responsive design
  - _Requirements: 8.1_

- [ ] 24. Checkpoint - Testing complete
  - Ensure all tests pass, ask the user if questions arise.

## Phase 6: Documentation & Deployment

- [ ] 25. Update project documentation
- [ ] 25.1 Create migration guide
  - Document all breaking changes
  - List all dependency updates
  - Provide code migration examples
  - Document new patterns (Pinia, Composition API)
  - _Requirements: 9.1, 9.2_

- [ ] 25.2 Update README files
  - Update main README.md
  - Update absg-core/README.md
  - Update absg-client/README.md
  - Update version requirements
  - _Requirements: 9.5_

- [ ] 25.3 Update developer documentation
  - Update architecture documentation
  - Update API documentation
  - Update component documentation
  - Document new development setup
  - _Requirements: 9.3, 9.4, 9.5_

- [ ] 25.4 Create deployment guide
  - Document Node.js 20.x installation
  - Document PostgreSQL 16.x setup
  - Update Docker deployment instructions
  - Update nginx configuration if needed
  - _Requirements: 9.3, 10.1_

- [ ] 26. Prepare production deployment
- [ ] 26.1 Update Docker images
  - Create Dockerfile for Node.js 20.x
  - Update docker-compose.yml
  - Test Docker build process
  - _Requirements: 10.1_

- [ ] 26.2 Create deployment scripts
  - Create backup script
  - Create deployment script
  - Create rollback script
  - Test all scripts
  - _Requirements: 10.2, 10.3_

- [ ] 26.3 Set up monitoring
  - Configure Winston logging
  - Set up PM2 monitoring
  - Configure health check endpoints
  - Set up error alerting
  - _Requirements: 10.4_

- [ ] 26.4 Prepare staging environment
  - Deploy to staging
  - Run full test suite on staging
  - Perform load testing
  - Validate all functionality
  - _Requirements: 10.5_

- [ ] 27. Production deployment
- [ ] 27.1 Create production backup
  - Backup database
  - Backup application files
  - Backup configuration
  - Verify backup integrity
  - _Requirements: 10.3_

- [ ] 27.2 Deploy to production
  - Deploy backend
  - Deploy frontend
  - Run database migrations
  - Verify deployment
  - _Requirements: 10.1, 10.5_

- [ ] 27.3 Post-deployment validation
  - Run smoke tests
  - Monitor error logs
  - Check performance metrics
  - Verify all critical features
  - _Requirements: 10.4_

- [ ] 28. Final checkpoint - Migration complete
  - Ensure all tests pass, ask the user if questions arise.
