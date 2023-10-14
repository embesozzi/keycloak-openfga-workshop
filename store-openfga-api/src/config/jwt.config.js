module.exports = {
	jwksUri: process.env.OIDC_PROVIDER_JWKS_URI || "http://localhost:8081/realms/master/protocol/openid-connect/certs",
	audience: process.env.OIDC_PROVIDER_AUDIENCE ||  "account",
	issuer: process.env.OIDC_PROVIDER_DOMAIN || "http://localhost:8081/realms/master"
}

