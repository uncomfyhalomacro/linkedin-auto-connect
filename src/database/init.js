import * as path from "node:path";
import { env } from "node:process";
import { Sequelize } from "sequelize";

const projectRootDir = path.dirname(process.argv0);
// const dbPath = path.join(projectRootDir, "database", "db.sqlite");
process.loadEnvFile(path.join(projectRootDir, ".env.database"));

// const sq = new Sequelize(env["PGNAME"], env["PGUSERNAME"], env["PGPASSWORD"], {
// 	host: env["PGHOST"],
// 	port: env["PGPORT"],
// 	dialect: "postgres",
// });

const sq = new Sequelize(process.env.PGNAME, process.env.PGUSERNAME, process.env.PGPASSWORD, {
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  dialect: "postgres",
});

sq.authenticate()
	.then(async () => {
		await sequelize.sync({ alter: true }).then(() => {
			console.log("Database synchronized");
		});
		console.log("Connection has been established successfully");
	})
	.catch((err) => {
		console.error("Unable to connect to the database:", err);
	});

export { sq };
