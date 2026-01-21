import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Environment
    environment: 'happy-dom',

    // Include only unit and integration tests, exclude Playwright e2e tests
    include: ['tests/unit/**/*.test.js', 'tests/integration/**/*.test.js'],
    exclude: ['**/node_modules/**', '**/*.spec.js', 'tests/fixtures/**'],

    // Global setup
    setupFiles: ['./tests/setup/vitest.setup.js'],

    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['assets/js/**/*.js'],
      exclude: [
        'assets/js/supabase.js',        // Third-party integration
        'assets/js/dashboard-*.js',     // Admin-only
        'assets/js/logo-data.js',       // Base64 data
        'lib/**',                       // External libraries
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    },

    // Globals (enables describe/it/expect without imports)
    globals: true,

    // Watch mode
    watch: false, // CI default

    // Reporters
    reporters: ['default', 'html', 'json'],

    // Output
    outputFile: {
      json: './test-results/vitest-results.json',
      html: './test-results/vitest-report.html'
    }
  }
});
