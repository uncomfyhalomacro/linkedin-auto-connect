import path from "node:path";
import process from "node:process";
import { Sequelize } from "sequelize";

const sqInit = () => {
	// process.loadEnvFile(path.join(path.dirname(process.argv0), ".env.database"));
	return new Sequelize(
		process.env.PGNAME,
		process.env.PGUSERNAME,
		process.env.PGPASSWORD,
		{
			host: process.env.PGHOST,
			port: process.env.PGPORT,
			dialect: "postgres",
			logging: process.env.DEV === "true",
		},
	);
};

const sq = sqInit();

export { sq };
