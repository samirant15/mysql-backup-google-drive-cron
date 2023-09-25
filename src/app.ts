import dotenv from 'dotenv';
import cron from 'node-cron';
import path from 'path';
import fs from 'fs';
import moment from 'moment';
import { GoogleDriveService } from './services/googleDrive';
import { MySQLDumpService } from './services/mysqlDump';

dotenv.config();

const backup = async () => {
  try {
    console.log(`----- Backup at ${moment()} -----`);
    const mysqlDumpService = new MySQLDumpService();
    const googleDriveService = new GoogleDriveService();

    const fileName = `dump-${moment().format('YYYY-MM-DD')}.sql`;
    const localBackupFolder = path.resolve(__dirname, `../backups`);
    const localBackupPath = path.resolve(__dirname, `../backups/${fileName}`);

    // Create local folder if doesn't exist
    if (!fs.existsSync(localBackupFolder)){
      fs.mkdirSync(localBackupFolder, { recursive: true });
    }

    // Create a local backup
    await mysqlDumpService.dump(localBackupPath);

    // Upload backup to drive
    const res = await googleDriveService.saveFile(fileName, localBackupPath, 'text/plain', process.env.BACKUP_FOLDER as string);

    // Remove local file
    fs.unlinkSync(localBackupPath);

    // Remove old backup from drive
    await googleDriveService.deleteFile(`dump-${moment().subtract(1, 'days').format('YYYY-MM-DD')}.sql`, process.env.BACKUP_FOLDER as string);
  } catch (error) {
    console.error(error);
  }
}

console.log(`Backup service started to run in the "${process.env.CRON_EXPRESSION}" cron expression`);
cron.schedule(process.env.CRON_EXPRESSION as string, () => {
  backup();
});