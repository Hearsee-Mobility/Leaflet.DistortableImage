const matchdep = require('matchdep');

module.exports = (grunt) => {
  // load npm tasks for grunt-* libs, excluding grunt-cli
  matchdep
    .filterDev('{grunt,gruntify}-*')
    .filter((pkg) => {
      return ['grunt-cli'].indexOf(pkg) < 0;
    })
    .forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    eslint: {
      src: [
        'src/**/*.js',
        'test/**/*.js',
        '!test/karma.conf.js', // Exclude old karma config
        '!test/karma.conf.cjs', // Exclude karma configs
      ],
    },

    karma: {
      development: {
        configFile: 'test/karma.conf.cjs',
      },
      test: {
        configFile: 'test/karma.conf.cjs',
      },
    },

    // Minify SVGs from svg directory, output to svg-min
    svgmin: {
      dist: {
        files: [
          {
            expand: true,
            cwd: 'assets/icons/svg',
            src: ['*.svg'],
            dest: 'assets/icons/svg-min/',
            ext: '.svg',
          },
        ],
      },
      options: {
        plugins: [
          {removeViewBox: false},
          {removeEmptyAttrs: false},
          {removeTitle: true}, // "leaflet-toolbar" lets us specify the title attribute later
          {
            removeAttrs: {
              attrs: ['xmlns', 'fill'],
            },
          },
        ],
      },
    },

    svg_sprite: {
      options: {
        // Task-specific options go here.
      },
      dist: {
        expand: true,
        cwd: 'assets/icons/svg-min/',
        src: ['*.svg'],
        dest: 'assets/icons/',
        options: {
          log: 'info',
          mode: {
            symbol: {
              sprite: 'sprite.symbol.svg',
              example: true,
            },
          },
        },
      },
    },

    watch: {
      options: {
        livereload: true,
      },
      source: {
        files: ['src/**/*.js', 'test/**/*.js', 'Gruntfile.cjs'],
        tasks: ['eslint', 'karma:development:start'],
      },
    },

    // Add shell command to run Vite build
    shell: {
      build: {
        command: 'npm run build',
      },
    },
  });

  // Load shell task for running external commands
  grunt.loadNpmTasks('grunt-shell');

  /* Run tests once. */
  grunt.registerTask('test', ['eslint', 'karma:test']);

  grunt.registerTask('build', [
    'eslint',
    'karma:development:start',
    'coverage',
    'shell:build', // Use npm run build instead of webpack
  ]);

  // recompile svg icon sprite
  grunt.registerTask('icons', ['svgmin', 'svg_sprite']);

  grunt.registerTask('coverage', 'CLI reporter for karma-coverage', () => {
    let coverageReports = grunt.file.expand('coverage/*/coverage.txt');
    let reports = {};
    let report;
    let i;
    let len;

    for (i = 0, len = coverageReports.length; i < len; i++) {
      report = grunt.file.read(coverageReports[i]);
      if (!reports[report]) {
        reports[report] = [coverageReports[i]];
      } else {
        reports[report].push(coverageReports[i]);
      }
    }

    for (report in reports) {
      if (reports.hasOwnProperty(report)) {
        for (i = 0, len = reports[report].length; i < len; i++) {
          grunt.log.writeln(reports[report][i]);
        }
        grunt.log.writeln(report);
      }
    }
  });
};
