import { DataTypes, Model } from "sequelize";
import { sq } from "../init.js";


class ProfileLinks extends Model {}

ProfileLinks.init(
    {
        id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4, // This performs an auto generation of the UUIDs
		},
        memberIdUrl: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true
        },
        cleanProfileUrl: {
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