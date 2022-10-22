FROM quay.io/keycloak/keycloak:19.0.2 as builder

ENV KC_DB=postgres
ENV KC_HTTP_RELATIVE_PATH=/auth

COPY ./lib/keycloak-openfga-event-listener-1.0.0.jar /opt/keycloak/providers/keycloak-openfga-event-listener-1.0.0.jar
COPY ./initialize-poc.sh /opt/keycloak/initialize-poc.sh
RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:19.0.2

COPY --from=builder /opt/keycloak/lib/quarkus/ /opt/keycloak/lib/quarkus/
COPY --from=builder /opt/keycloak/providers/ /opt/keycloak/providers/
COPY --from=builder /opt/keycloak/initialize-poc.sh /opt/keycloak/initialize-poc.sh

ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start-dev"]