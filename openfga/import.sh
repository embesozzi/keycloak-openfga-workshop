OPENFGA_API_URI=http://localhost:8080

# Create the store
STORE_ID=$(curl -X POST $OPENFGA_API_URI/stores -d @store.json | jq -r '.id')

echo "OpenFGA Store ID" + $STORE_ID 

# Post the authorization model
AUTHORIZATION_MODEL_ID=$(curl -X POST $OPENFGA_API_URI/stores/$STORE_ID/authorization-models -d @keycloak-authorization-model.json | jq -r '.authorization_model_id')

echo "OpenFGA Authorization Model ID: " + $AUTHORIZATION_MODEL_ID