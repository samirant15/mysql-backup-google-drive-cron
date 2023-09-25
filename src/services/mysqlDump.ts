import mysqldump from 'mysqldump';

export class MySQLDumpService {

  public constructor() {
    console.log(`🕒 Connecting to MySQL`);
  }

  async dump(path: string) {
    console.log(`📄🕒 Creating a MySQL dump to ${path}`);
    const res = await mysqldump({
      connection: {
          host: process.env.MYSQL_HOST as string,
          user: process.env.MYSQL_USER as string,
          password: process.env.MYSQL_PASSWORD as string,
          database: process.env.MYSQL_DATABASE as string,
      },
      dumpToFile: path,
    });
    console.log(`📄✅ MySQL dump created!`);
    return res;
  }
}