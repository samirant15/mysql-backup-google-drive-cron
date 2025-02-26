/**
 * PM2 Configuration file:
 * ref: https://pm2.keymetrics.io/docs/usage/application-declaration/
 *
 * Can be run by executing: "pm2 start ecosystem.config.js"
 */

module.exports = {
  apps: [
    {
      name: 'mysql-backup-google-drive-cron',
      script: `${process.cwd()}/bin/app.js`,
      log_date_format: 'YYYY-MM-DD HH:mm Z', // Log timestamp format
    },
  ],
};
