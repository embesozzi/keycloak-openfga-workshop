# Keycloak with the OpenFGA event publisher extension, used by docker-compose.yml.
# https://github.com/embesozzi/keycloak-openfga-event-publisher
ARG KC_VERSION=26.8.2

# Download the extension jar, checked against the release's SHA256SUMS.
FROM debian:bookworm-slim AS extension
ARG OPENFGA_PUBLISHER_VERSION=3.1.0
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /extension
RUN BASE=https://github.com/embesozzi/keycloak-openfga-event-publisher/releases/download/v${OPENFGA_PUBLISHER_VERSION} && \
    curl -fsSL --remote-name-all \
        "$BASE/keycloak-openfga-event-publisher-${OPENFGA_PUBLISHER_VERSION}.jar" \
        "$BASE/SHA256SUMS" && \
    sha256sum -c SHA256SUMS && \
    mv keycloak-openfga-event-publisher-${OPENFGA_PUBLISHER_VERSION}.jar keycloak-openfga-event-publisher.jar

FROM quay.io/keycloak/keycloak:${KC_VERSION}
COPY --from=extension /extension/keycloak-openfga-event-publisher.jar /opt/keycloak/providers/
