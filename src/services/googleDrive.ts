import fs from 'fs';
import { google } from 'googleapis'

export class GoogleDriveService {
  private driveClient;

  public constructor() {
    console.log(`🕒 Connecting to Google Drive`);
    this.driveClient = this.createDriveClient();
  }

  createDriveClient() {
    const client = new google.auth.OAuth2(
      process.env.GOOGLE_DRIVE_CLIENT_ID as string, 
      process.env.GOOGLE_DRIVE_CLIENT_SECRET as string, 
      process.env.GOOGLE_DRIVE_REDIRECT_URI as string, 
    );

    client.setCredentials({ refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN as string });

    return google.drive({
      version: 'v3',
      auth: client,
    });
  }

  async authenticate() {
    const client = new google.auth.OAuth2(
      process.env.GOOGLE_DRIVE_CLIENT_ID as string, 
      process.env.GOOGLE_DRIVE_CLIENT_SECRET as string, 
      process.env.GOOGLE_DRIVE_REDIRECT_URI as string, 
    );

    const authUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive.file'],
      prompt: 'consent', // Ensures a refresh token is always returned
    });

    console.log(`🔑 Follow the instructions below to authorize this app`);
    console.log(`1. Visit the following URL: ${authUrl}`);
    console.log('2. Authenticate with your Google account');
    console.log(`3. Click the gear icon ⚙️ in the top right corner`);
    console.log(`4. Check "Use your own OAuth credentials" and enter:`);
    console.log(`   - Client ID: ${process.env.GOOGLE_DRIVE_CLIENT_ID}`);
    console.log(`   - Client Secret: ${process.env.GOOGLE_DRIVE_CLIENT_SECRET}`);
    console.log(`5. Click "Exchange authorization code for tokens"`);
    console.log(`6. Copy the "Refresh token" and paste it in the .env file`);
    console.log(`7. Run the script again`);
  }

  async verifyAuthentication() {
    try {
      await this.searchFolder(process.env.BACKUP_FOLDER as string);
      return true;
    } catch (error) {
      if (error instanceof Error && error.message === "invalid_grant") {
        console.log(`❗️🔑 Refresh token expired, needs to re-authenticate`);
        await this.authenticate();
        return
      }
      throw error;
    }
  }

  async createFolder(path: string) {
    console.log(`📂🕒 Creating "${path}" folder in Drive`);
    const res = await this.driveClient.files.create({
      fields: 'id',
      requestBody: {
        name: path,
        mimeType: "application/vnd.google-apps.folder",
      }
    })
    console.log(`📂✅ Folder created in Drive!`);
    return res.data;
  }

  async searchFolder(path: string) {
    console.log(`📂🕒 Searching "${path}" folder in Drive`);
    const res = await this.driveClient.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${path}'`,
      fields: 'files(id, name)',	
    })

    if (res.data.files?.length) {
      console.log(`📂✅ Folder found in Drive!`);
      return res.data.files[0];
    } else {
      console.log(`📂⚠️ Folder not found in Drive`);
      return null;
    }
  }

  async searchFile(folderName: string, fileName: string) {
    console.log(`📂🕒 Searching "${fileName}" file in "${folderName}" folder in Drive`);
    const folder = await this.searchFolder(folderName);

    if (!folder) {
      return null;
    }

    const res = await this.driveClient.files.list({
      q: `mimeType='text/plain' and '${folder.id}' in parents and name='${fileName}' and trashed=false`,
      fields: 'files(id, name)',	
    })

    if (res.data.files?.length) {
      console.log(`📂✅ File found in Drive!`);
      return res.data.files[0];
    } else {
      console.log(`📂⚠️ File not found in Drive`);
      return null;
    }
  }

  async saveFile(fileName: string, filePath: string, fileMimeType: string, folderName: string) {

    console.log(`🗃️🕒 Uploading "${fileName}" file to "${folderName}" folder in Drive`);
    let folder = await this.searchFolder(folderName);

    if (!folder) {
      folder = await this.createFolder(folderName);
    }

    const res = await this.driveClient.files.create({
      requestBody: {
        name: fileName,
        mimeType: fileMimeType,
        parents: folder.id ? [folder.id] : [],
      },
      media: {
        mimeType: fileMimeType,
        body: fs.createReadStream(filePath),
      },
    });
    console.log(`🗃️✅ file uploaded to Drive!`);
    return res;
  }

  async deleteFile(fileName: string, folderName: string) {

    console.log(`🗑️🕒 Deleting "${fileName}" file in "${folderName}" folder in Drive`);
    const file = await this.searchFile(folderName, fileName);

    if (!file) {
      return null;
    }

    const res = this.driveClient.files.delete({
      fileId: file.id as string
    });
    console.log(`🗃️✅ file Deleted in Drive!`);
    return res;
  }
}