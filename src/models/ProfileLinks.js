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
		nonce: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
	},
	{
		sequelize: sq,
		modelName: "profile_links",
		timestamps: true,
		createdAt: "fetched_at",
		updatedAt: "updated_at",
	},
);

export default ProfileLinks;
