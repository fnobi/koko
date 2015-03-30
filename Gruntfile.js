module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        release: {
            options: { }
        }
    });

    grunt.registerTask('default', []);

    grunt.loadNpmTasks('grunt-release');
};
