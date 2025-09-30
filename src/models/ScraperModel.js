import { DataTypes, Model } from "sequelize";
import { sq } from "../db/init.js";

class ScraperModel extends Model {}
ScraperModel.init(
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4, // This performs an auto generation of the UUIDs
		},
		secret: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		connections: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
		first_used: {
			type: DataTypes.DATE,
			defaultValue: new Date(),
			allowNull: false,
		},
		last_used: {
			type: DataTypes.DATE,
			defaultValue: new Date(),
			allowNull: false,
		},
	},
	{
		sequelize: sq,
		modelName: "scraper_profiles",
		timestamps: false
	},
);

export default ScraperModel;
