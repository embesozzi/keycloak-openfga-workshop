#!/bin/bash
#
# Create store and authorization model in OpenFGA
# Version: 1.0.0

OPENFGA_API_URI=${OPENFGA_API_URI:-http://localhost:8080}
OPENFGA_STORE_ID=""
OPENFGA_AUTHORIZATION_MODEL_ID=""

create_store() {
    OPENFGA_STORE_ID=$(curl -X POST $OPENFGA_API_URI/stores -d @store.json | jq -r '.id')
}

create_authorization_model() {
    OPENFGA_AUTHORIZATION_MODEL_ID=$(curl -X POST $OPENFGA_API_URI/stores/$OPENFGA_STORE_ID/authorization-models -d @keycloak-authorization-model.json | jq -r '.authorization_model_id')
}


create_store
echo "OpenFGA store id: " + $OPENFGA_STORE_ID 

create_authorization_model
echo "OpenFGA authorization model id: " + $OPENFGA_AUTHORIZATION_MODEL_ID