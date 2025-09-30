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
		nonce: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
	},
	{
		sequelize: sq,
		modelName: "scraper_profiles",
		timestamps: true,
		createdAt: "first_used",
		updatedAt: "last_used",
	},
);

export default ScraperModel;
