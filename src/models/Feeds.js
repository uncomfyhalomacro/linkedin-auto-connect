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
            unique: true
        },
		fetched_on: {
			type: DataTypes.DATE,
			allowNull: false,
            defaultValue: new Date()
		},
		interacted_on: {
			type: DataTypes.DATE,
            allowNull: false,
            defaultValue: new Date()
		},
        nonce: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
	},
	{
		sequelize: sq,
		modelName: "profile_links",
		timestamps: false
	},
);

export default Feeds;
