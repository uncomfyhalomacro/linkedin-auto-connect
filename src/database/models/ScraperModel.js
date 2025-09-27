import { DataTypes, Model } from "sequelize";
import { sq } from "../init.js";

class ScraperModel extends Model {}
ScraperModel.init(
	{
		id: {
			type: DataTypes.UUID,
			allowNull: false,
			primaryKey: true,
			defaultValue: DataTypes.UUID4, // This performs an auto generation of the UUIDs
		},
		url: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		first_used: {
			type: DataTypes.TIME,
			allowNull: false,
		},
		last_used: {
			type: DataTypes.TIME,
			allowNull: false,
		},
	},
	{
		sequelize: sq,
		modelName: "scraper_profiles",
	},
);

export default ScraperModel;
