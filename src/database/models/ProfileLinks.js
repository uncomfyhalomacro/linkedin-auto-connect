import { DataTypes, Model } from "sequelize";
import { sq } from "../init.js";
import ScraperModel from "./ScraperModel.js";


class ProfileLinks extends Model {}

ProfileLinks.init(
    {
        id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4, // This performs an auto generation of the UUIDs
		},
        url: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
		sequelize: sq,
		modelName: "profile_links",
		timestamps: true,
		createdAt: 'fetched_at',
		updatedAt: 'updated_at'
	},

)

export default ProfileLinks;