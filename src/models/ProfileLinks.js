import { DataTypes, Model } from "sequelize";
import { sq } from "../db/init.js";

class ProfileLinks extends Model {}

ProfileLinks.init(
	{
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4, // This performs an auto generation of the UUIDs
		},
		member_id_url: {
			type: DataTypes.TEXT,
			allowNull: false,
			unique: true,
		},
		clean_profile_url: {
			type: DataTypes.TEXT,
			allowNull: false,
			unique: true,
		},
		name: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		connected: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		pending: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		first_fetched_on: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: new Date()
		},
		last_fetched_on: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: new Date()
		},
	},
	{
		sequelize: sq,
		modelName: "profile_links",
		timestamps: false,
	},
);

export default ProfileLinks;
