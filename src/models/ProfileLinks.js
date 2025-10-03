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
		current_title: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		current_company: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		current_company_url: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		// Storing these as JSONB arrays to allow for more complex data structures
		// and easier querying in the future.
		// For example, education can have multiple fields like degree, institution, years, etc.
		// Experience can have title, company, duration, description, etc.
		// Skills can be a list of skill names or objects with proficiency levels.
		// Recommendations can include the recommender's name, relationship, and text.
		education: {
			type: DataTypes.ARRAY(DataTypes.JSONB),
			allowNull: false,
		},
		experience: {
			type: DataTypes.ARRAY(DataTypes.JSONB),
			allowNull: false,
		},
		volunteering: {
			type: DataTypes.ARRAY(DataTypes.JSONB),
			allowNull: false,
		},
		skills: {
			type: DataTypes.ARRAY(DataTypes.JSONB),
			allowNull: false,
		},
		recommendations: {
			type: DataTypes.ARRAY(DataTypes.JSONB),
			allowNull: false,
		},
		profile_image_url: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		location: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		headline: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		summary: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		// num_connections: {
		// 	type: DataTypes.INTEGER,
		// 	allowNull: true,
		// },
		// profile_complete_percentage: {
		// 	type: DataTypes.INTEGER,
		// 	allowNull: true,
		// },
		// last_seen: {
		// 	type: DataTypes.DATE,
		// 	allowNull: true,
		// },
		// source: {
		// 	type: DataTypes.TEXT,
		// 	allowNull: false,
		// },
		notes: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		// For now, we are commenting these out to simplify the model
		// and focus on the core functionality.
		// We can always add them back later if needed.
		// tags: {
		// 	type: DataTypes.ARRAY(DataTypes.TEXT),
		// 	allowNull: false,
		// 	defaultValue: [],
		// },
		// who_am_i: {
		// 	type: DataTypes.TEXT,
		// 	allowNull: true,
		// },
		// what_i_do: {
		// 	type: DataTypes.TEXT,
		// 	allowNull: true,
		// },
		// goals: {
		// 	type: DataTypes.TEXT,
		// 	allowNull: true,
		// },
		// reason_for_connecting: {
		// 	type: DataTypes.TEXT,
		// 	allowNull: true,
		// },
		// message_sent: {
		// 	type: DataTypes.BOOLEAN,
		// 	allowNull: false,
		// 	defaultValue: false,
		// },	
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
			defaultValue: new Date(),
		},
		last_fetched_on: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: new Date(),
		},
	},
	{
		sequelize: sq,
		modelName: "profile_links",
		timestamps: false,
	},
);

export default ProfileLinks;
