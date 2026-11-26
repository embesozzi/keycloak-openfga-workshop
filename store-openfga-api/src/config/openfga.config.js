module.exports = {
	apiScheme: process.env.OPENFGA_API_SCHEME || "http",
	apiHost: process.env.OPENFGA_API_HOST || "openfga:8080",
	storeName: process.env.OPENFGA_STORE_NAME || "keycloak"
}
