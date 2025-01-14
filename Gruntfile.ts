module.exports = function (grunt) {
    grunt.initConfig({
        ftp_push: {
            prod: {
                options: {
                    authKey: "serverA",
                    host: "95.128.74.14",
                    dest: "/13024-adidas116/admin/",
                    port: 21
                },
                files: [
                    {
                        expand: true,
                        cwd: 'dist', 
                        src: [
                            "**/*",
                            "!**/.DS_Store",
                            "!**/node_modules/**",
                            "!**/Gruntfile.ts",
                        ],
                        dot: true
                    }
                ],
            }
        },
    }); 

    grunt.registerTask("prod", ["ftp_push:prod"]);
    grunt.loadNpmTasks('grunt-ftp-push');
};