import { DataTypes, Model } from "sequelize";
import { sq } from "../db/init.js";

class Feeds extends Model {}

Feeds.init(
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4, // This performs an auto generation of the UUIDs
		},
		post_url: {
			type: DataTypes.TEXT,
			allowNull: false,
			unique: true,
		},
		first_fetched_on: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: new Date(),
		},
		last_interacted_on: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: new Date(),
		},
		note: {
			allowNull: true,
			type: DataTypes.TEXT,
		},
	},
	{
		sequelize: sq,
		modelName: "feeds",
		timestamps: false,
	},
);

export default Feeds;
