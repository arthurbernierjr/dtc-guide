module.exports = {
  apps: [
    {
      name: 'dtc-guide',
      script: 'server.js',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        PORT: 31803,
      },
    },
  ],
};
