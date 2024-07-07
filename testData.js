const usersData = [
	{
		firstName: "john",
		lastName: "osenhi",
		email: `johno${Date.now()}@gmail.com`,
		password: "pass123",
		phone: "2348000000000",
	},
	{
		firstName: "remi",
		lastName: "Ade",
		email: `rema${Date.now()}@gmail.com`,
		password: "pass1234",
		phone: "2348011111111",
	},
	{
		firstName: "baku",
		lastName: "sewa",
		email: `base256${Date.now()}@gmail.com`,
		password: "pass1234",
		phone: "2348022222222",
	},
];

const orgsData = [
	{ name: "Bolu", description: "This is bolu organisation" },
	{ name: "Tolk", description: "This is tolk organisation" },
	{ name: "Chike", description: "This is chike organisation" },
];

module.exports = { usersData, orgsData };
