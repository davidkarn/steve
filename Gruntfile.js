module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'public/src/<%= pkg.name %>.js',
                dest: 'public/build/<%= pkg.name %>.min.js'}},
        watch: {
            rt: {
                files: [
                    'public/**/*.rt'],
                tasks: ['rt'],
                options: {
                    spawn: false}}},
        reactTemplates: {
            src: ['public/**/*.rt'],
            modules: 'amd', 
            format: 'stylish'}});

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.loadNpmTasks('grunt-react-templates');
    grunt.registerTask('rt', ['react-templates']);
    grunt.registerTask('default', ['rt']);

    grunt.registerTask('heroku',
                       ['rt', 'uglify']);
    grunt.registerTask('default', ['uglify']);

};
